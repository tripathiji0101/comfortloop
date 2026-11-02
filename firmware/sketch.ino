/* ==============================================================================
   ComfortLoop — Occupancy- and Comfort-Aware Fan Controller
   Track 1: Fan | atomQUEST 2026
   
   Target Hardware Architecture:
     - ESP32-WROOM-32 Development Board
     - BME280 (I2C) - Temperature & Relative Humidity Sensor
     - LD2410 (UART / Out Pin) - 24GHz mmWave Human Presence Sensor
     - INA219 (I2C) - High-Side Current & Power Sensor
     - 12V 4-Pin PWM DC Fan (25 kHz Intel Specification Standard)
     - 5V Relay Module (Connected Device / Auxiliary Exhaust Fan)
     
   NOTICE & HARDWARE VALIDATION DISCLAIMER:
     This firmware provides the production-grade Arduino C++ implementation
     of the ComfortLoop control algorithms. Values in lookup tables (e.g.
     airflow speed vs PWM level) are simulation approximations and must be
     calibrated against physical anemometer and dynamometer measurements
     before clinical or mission-critical deployment.
   ============================================================================== */

#include <Arduino.h>
#include <Wire.h>
#include <math.h>

#if defined(ESP32)
  #include <esp_arduino_version.h>
#endif

// Ensure IRAM_ATTR is defined across all architectures (ESP32, AVR, etc.)
#if !defined(IRAM_ATTR)
  #define IRAM_ATTR
#endif

// Sensor & Bus Libraries:
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>
// #include <Adafruit_INA219.h>
// #include <WiFi.h>
// #include <PubSubClient.h>

/* --- Pin Assignments (ESP32) --- */
#define PIN_I2C_SDA         21  // Shared I2C SDA (BME280 + INA219)
#define PIN_I2C_SCL         22  // Shared I2C SCL (BME280 + INA219)
#define PIN_PRESENCE_IN     4   // LD2410 Out Pin (HIGH = Occupied)
#define PIN_FAN_PWM         18  // Fan 4-Pin PWM Control (GPIO 18)
#define PIN_FAN_TACH        19  // Fan Tachometer feedback (GPIO 19, Interrupt)
#define PIN_RELAY_EXHAUST   23  // Relay for auxiliary connected device
#define PIN_STATUS_LED      2   // Built-in status LED

/* --- PWM Configuration (Intel 4-Pin 25 kHz Standard) --- */
#define PWM_LEDC_CHANNEL    0      // Timer channel for legacy ESP32 Core 2.x
#define PWM_FREQ_HZ         25000  // 25 kHz standard
#define PWM_RESOLUTION_BITS 8      // 8-bit resolution (0 - 255)

/* --- Operating States --- */
enum ControlState {
  STATE_ACTIVE = 0,
  STATE_AWAY   = 1,
  STATE_SLEEP  = 2,
  STATE_FAULT  = 3
};

/* --- Comfort Classifications --- */
enum ComfortClassification {
  COMFORT_COLD = 0,
  COMFORT_COOL,
  COMFORT_COMFORTABLE,
  COMFORT_WARM,
  COMFORT_HOT
};

/* --- Configuration Parameters --- */
struct SystemConfig {
  float targetTempC = 26.0f;           // Target apparent temperature (°C)
  float hysteresisBandC = 0.5f;        // Hysteresis deadband (±0.5°C)
  unsigned long vacancyTimeoutMs = 300000UL; // 5 minutes standard vacancy delay
  unsigned long demoTimeoutMs = 5000UL;      // 5 seconds accelerated demo mode
  bool useDemoTimer = false;           // Toggle for judge demonstration
  bool sleepModeEnabled = false;       // Nighttime quiet mode
  uint8_t sleepStartHour = 22;         // 10:00 PM
  uint8_t sleepEndHour = 6;            // 06:00 AM
  uint8_t sleepMaxLevel = 2;           // Max speed in sleep mode
  unsigned long minSpeedChangeIntervalMs = 5000UL; // Anti-hunting rate limiter
  uint8_t faultFallbackLevel = 2;      // Failsafe fan speed in fault condition
  bool benchSimulationMode = false;    // Explicit bench-testing toggle (false = read physical BME280)
};

/* --- Hardware Sensor Instances --- */
Adafruit_BME280 bme;
bool bmeInitialized = false;

/* --- Sensor Telemetry Structure --- */
struct SensorData {
  float temperatureC;
  float humidityPct;
  bool occupied;
  bool valid;
};

/* --- Calibration & Model Lookup Tables --- */
// PWM values for discrete levels 0 (OFF) through 5 (MAX)
const uint8_t PWM_LOOKUP[6]     = { 0, 80, 120, 160, 210, 255 };

// Uncalibrated simulation assumption: Airspeed ws (m/s) per fan level
const float AIRFLOW_LOOKUP[6]   = { 0.0f, 0.3f, 0.7f, 1.2f, 1.8f, 2.5f };

// Assumed fan power consumption (Watts) at 12V
const float POWER_LOOKUP[6]     = { 0.0f, 1.8f, 3.2f, 5.5f, 8.4f, 12.0f };

/* --- Global Runtime State --- */
SystemConfig config;
ControlState currentState = STATE_ACTIVE;
uint8_t currentFanLevel = 0;
unsigned long lastSpeedChangeMs = 0;
unsigned long vacancyStartMs = 0;
bool isOccupied = true;
bool faultActive = false;
String faultReason = "";
unsigned long speedChangeCount = 0;
volatile unsigned long tachPulseCount = 0;

/* --- Interrupt Service Routine for Fan Tachometer --- */
void IRAM_ATTR onTachPulse() {
  tachPulseCount++;
}

/* ==============================================================================
   COMFORT MODEL & MATHEMATICAL FUNCTIONS
   Formula:
     AT = T + 0.33 * e - 0.70 * ws - 4.00
     e  = (RH / 100.0) * 6.105 * exp(17.27 * T / (237.7 + T))
   ============================================================================== */

/**
 * Computes water-vapour pressure e in hPa.
 */
float computeVapourPressure(float tempC, float rhPct) {
  return (rhPct / 100.0f) * 6.105f * expf((17.27f * tempC) / (237.7f + tempC));
}

/**
 * Computes apparent temperature in °C based on ambient temperature, humidity,
 * and assumed fan airspeed from the lookup table.
 */
float computeApparentTemperature(float tempC, float rhPct, float airspeedMs) {
  float e = computeVapourPressure(tempC, rhPct);
  return tempC + (0.33f * e) - (0.70f * airspeedMs) - 4.00f;
}

/**
 * Classifies apparent temperature against target and hysteresis.
 */
ComfortClassification classifyComfort(float apparentTemp, float target, float hysteresis) {
  float diff = apparentTemp - target;
  if (diff < -(hysteresis + 3.0f)) return COMFORT_COLD;
  if (diff < -hysteresis)          return COMFORT_COOL;
  if (diff <= hysteresis)          return COMFORT_COMFORTABLE;
  if (diff <= (hysteresis + 3.0f)) return COMFORT_WARM;
  return COMFORT_HOT;
}

/**
 * Selects the target fan level according to apparent temperature deviation.
 * Retains current level inside hysteresis deadband to prevent hunting.
 */
uint8_t calculateDesiredLevel(float apparentTemp, float target, float hysteresis, uint8_t currentLevel) {
  float diff = apparentTemp - target;

  // Too cool: turn fan off
  if (diff < -hysteresis) {
    return 0;
  }
  // Inside hysteresis band: maintain current speed
  if (diff >= -hysteresis && diff <= hysteresis) {
    return currentLevel;
  }
  // Above comfortable target: graduated response
  if (diff <= 1.5f) return 1;
  if (diff <= 3.0f) return 2;
  if (diff <= 4.5f) return 3;
  if (diff <= 6.0f) return 4;
  return 5;
}

/* ==============================================================================
   ACTUATOR OUTPUT FUNCTIONS
   ============================================================================== */

void setFanPwmLevel(uint8_t level) {
  if (level > 5) level = 5;
  uint8_t pwmValue = PWM_LOOKUP[level];

#if defined(ESP32)
  #if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    // ESP32 Arduino Core 3.x: ledcWrite targets the GPIO pin directly
    ledcWrite(PIN_FAN_PWM, pwmValue);
  #else
    // ESP32 Arduino Core 2.x legacy: ledcWrite targets the configured timer channel
    ledcWrite(PWM_LEDC_CHANNEL, pwmValue);
  #endif
#else
  analogWrite(PIN_FAN_PWM, pwmValue);
#endif

  currentFanLevel = level;
}

void setRelayState(bool turnOn) {
  digitalWrite(PIN_RELAY_EXHAUST, turnOn ? HIGH : LOW);
}

/* ==============================================================================
   SENSOR ACQUISITION (BME280 I2C & LD2410 Presence)
   ============================================================================== */

SensorData readSensors() {
  SensorData data;
  data.occupied = (digitalRead(PIN_PRESENCE_IN) == HIGH);

  // 1. Explicit bench simulation mode for offline / testbed operation
  if (config.benchSimulationMode) {
    data.temperatureC = 28.5f;
    data.humidityPct = 60.0f;
    data.valid = true;
    return data;
  }

  // 2. Physical hardware reading from BME280 over I2C
  if (!bmeInitialized) {
    // Attempt automatic re-initialization if the sensor was plugged in or reconnected
    if (bme.begin(0x76, &Wire) || bme.begin(0x77, &Wire)) {
      bmeInitialized = true;
      Serial.println(F("[RECOVERY] BME280 sensor I2C connection re-established."));
    } else {
      // During physical operation, never substitute synthetic values on failure
      data.temperatureC = NAN;
      data.humidityPct = NAN;
      data.valid = false;
      return data;
    }
  }

  float temp = bme.readTemperature();
  float hum = bme.readHumidity();

  data.temperatureC = temp;
  data.humidityPct = hum;

  // Validate sensor integrity against physical constraints
  // BME280 valid range: -40°C to +85°C, 0% to 100% RH
  if (isnan(temp) || temp < -40.0f || temp > 85.0f ||
      isnan(hum)  || hum < 0.0f    || hum > 100.0f) {
    data.valid = false;
  } else {
    data.valid = true;
  }

  return data;
}

/* ==============================================================================
   CORE STATE MACHINE & CONTROL LOOP
   ============================================================================== */

void executeControlLoop(unsigned long currentMillis) {
  SensorData sensors = readSensors();

  // 1. Fault verification
  if (!sensors.valid) {
    if (!faultActive) {
      faultActive = true;
      if (!bmeInitialized && !config.benchSimulationMode) {
        faultReason = "BME280 sensor offline / not detected on I2C (0x76/0x77)";
      } else {
        faultReason = "BME280 telemetry out of valid physical range or NaN";
      }
      Serial.print(F("[FAULT] "));
      Serial.println(faultReason);
      Serial.println(F("[FAULT] Entering FAULT fallback mode (Failsafe Level 2)."));
    }
  } else {
    // If fault was caused by sensor failure and valid telemetry is restored, auto-recover
    if (faultActive && faultReason.startsWith("BME280")) {
      faultActive = false;
      faultReason = "";
      Serial.println(F("[FAULT] BME280 valid telemetry restored. Resuming automatic control."));
    }
  }

  if (faultActive) {
    currentState = STATE_FAULT;
    if (currentFanLevel != config.faultFallbackLevel) {
      setFanPwmLevel(config.faultFallbackLevel);
      speedChangeCount++;
      lastSpeedChangeMs = currentMillis;
    }
    setRelayState(false);
    return;
  }

  // 2. Presence and Vacancy Tracking
  isOccupied = sensors.occupied;
  unsigned long activeVacancyDelay = config.useDemoTimer ? config.demoTimeoutMs : config.vacancyTimeoutMs;

  if (isOccupied) {
    if (vacancyStartMs != 0) {
      Serial.println(F("[OCCUPANCY] Presence confirmed. Vacancy countdown cancelled."));
      vacancyStartMs = 0;
    }
  } else {
    if (vacancyStartMs == 0) {
      vacancyStartMs = currentMillis;
      Serial.print(F("[OCCUPANCY] Room unoccupied. Vacancy countdown started (delay: "));
      Serial.print(activeVacancyDelay / 1000);
      Serial.println(F("s)."));
    }
  }

  unsigned long vacantElapsed = (vacancyStartMs == 0) ? 0 : (currentMillis - vacancyStartMs);
  bool isVacancyTimeoutExpired = (!isOccupied && vacantElapsed >= activeVacancyDelay);

  // 3. Operating State Transition
  ControlState nextState;
  if (isVacancyTimeoutExpired) {
    nextState = STATE_AWAY;
  } else if (config.sleepModeEnabled && isOccupied) {
    nextState = STATE_SLEEP;
  } else {
    nextState = STATE_ACTIVE;
  }

  if (nextState != currentState) {
    Serial.print(F("[STATE] Transition: "));
    Serial.print(currentState);
    Serial.print(F(" -> "));
    Serial.println(nextState);
    currentState = nextState;
  }

  // 4. Compute Comfort & Determine Desired Speed
  float currentAirflow = AIRFLOW_LOOKUP[currentFanLevel];
  float apparentTemp = computeApparentTemperature(sensors.temperatureC, sensors.humidityPct, currentAirflow);
  ComfortClassification comfort = classifyComfort(apparentTemp, config.targetTempC, config.hysteresisBandC);

  uint8_t desiredLevel = calculateDesiredLevel(apparentTemp, config.targetTempC, config.hysteresisBandC, currentFanLevel);

  // State-specific overrides
  if (currentState == STATE_AWAY) {
    desiredLevel = 0; // Turn fan completely off when unoccupied
  } else if (currentState == STATE_SLEEP) {
    if (desiredLevel > config.sleepMaxLevel) {
      desiredLevel = config.sleepMaxLevel; // Enforce nighttime quiet cap
    }
  }

  // 5. Anti-Hunting Rate Limiter & Gradual Adjustment
  if (desiredLevel != currentFanLevel && (currentMillis - lastSpeedChangeMs >= config.minSpeedChangeIntervalMs)) {
    // In sleep mode, enforce gradual ±1 step changes
    if (currentState == STATE_SLEEP) {
      if (desiredLevel > currentFanLevel) desiredLevel = currentFanLevel + 1;
      else if (desiredLevel < currentFanLevel) desiredLevel = currentFanLevel - 1;
    }

    Serial.print(F("[FAN] Speed adjusted: Level "));
    Serial.print(currentFanLevel);
    Serial.print(F(" -> Level "));
    Serial.print(desiredLevel);
    Serial.print(F(" (PWM: "));
    Serial.print(PWM_LOOKUP[desiredLevel]);
    Serial.println(F(")"));

    setFanPwmLevel(desiredLevel);
    speedChangeCount++;
    lastSpeedChangeMs = currentMillis;
  }

  // 6. Connected Device Trigger (Exhaust / AC Aux)
  // Trigger auxiliary exhaust when room is hot, humid, and occupied
  if (isOccupied && comfort == COMFORT_HOT && sensors.humidityPct > 60.0f) {
    setRelayState(true);
  } else {
    setRelayState(false);
  }

  // 7. Telemetry Output (JSON formatted for serial or simulated MQTT)
  Serial.print(F("{\"state\":"));
  Serial.print(currentState);
  Serial.print(F(",\"fanLevel\":"));
  Serial.print(currentFanLevel);
  Serial.print(F(",\"pwm\":"));
  Serial.print(PWM_LOOKUP[currentFanLevel]);
  Serial.print(F(",\"temp\":"));
  if (isnan(sensors.temperatureC)) Serial.print(F("null"));
  else Serial.print(sensors.temperatureC, 2);
  Serial.print(F(",\"humidity\":"));
  if (isnan(sensors.humidityPct)) Serial.print(F("null"));
  else Serial.print(sensors.humidityPct, 1);
  Serial.print(F(",\"apparentTemp\":"));
  if (isnan(apparentTemp)) Serial.print(F("null"));
  else Serial.print(apparentTemp, 2);
  Serial.print(F(",\"occupied\":"));
  Serial.print(isOccupied ? "true" : "false");
  Serial.print(F(",\"simPowerW\":"));
  Serial.print(POWER_LOOKUP[currentFanLevel], 1);
  Serial.print(F(",\"benchSim\":"));
  Serial.print(config.benchSimulationMode ? "true" : "false");
  Serial.print(F(",\"bmeOk\":"));
  Serial.print(bmeInitialized ? "true" : "false");
  Serial.println(F("}"));
}

/* ==============================================================================
   ARDUINO ENTRY POINTS
   ============================================================================== */

void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println(F("=================================================="));
  Serial.println(F("ComfortLoop - Smart Fan Controller Firmware v1.0"));
  Serial.println(F("Track 1: Fan | atomQUEST 2026 Virtual Prototype"));
  Serial.println(F("=================================================="));

  pinMode(PIN_PRESENCE_IN, INPUT);
  pinMode(PIN_RELAY_EXHAUST, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_FAN_TACH, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_FAN_TACH), onTachPulse, FALLING);

  // Initialize I2C with explicit pin assignments (GPIO 21 SDA, GPIO 22 SCL)
  Wire.begin(PIN_I2C_SDA, PIN_I2C_SCL);

  // Probe BME280 sensor (standard module address 0x76, fallback 0x77)
  Serial.print(F("[INIT] Probing BME280 sensor on I2C (SDA="));
  Serial.print(PIN_I2C_SDA);
  Serial.print(F(", SCL="));
  Serial.print(PIN_I2C_SCL);
  Serial.println(F(")..."));

  if (bme.begin(0x76, &Wire)) {
    bmeInitialized = true;
    Serial.println(F("[INIT] BME280 detected and initialized successfully at address 0x76."));
  } else if (bme.begin(0x77, &Wire)) {
    bmeInitialized = true;
    Serial.println(F("[INIT] BME280 detected and initialized successfully at address 0x77."));
  } else {
    bmeInitialized = false;
    Serial.println(F("[ERROR] BME280 initialization FAILED! No device responded at 0x76 or 0x77."));
    if (!config.benchSimulationMode) {
      Serial.println(F("[WARNING] Physical operation active: System will enter FAULT fallback until sensor is detected."));
    }
  }

#if defined(ESP32)
  #if defined(ESP_ARDUINO_VERSION_MAJOR) && (ESP_ARDUINO_VERSION_MAJOR >= 3)
    // ESP32 Arduino Core 3.x API: ledcAttach(pin, frequency, resolution)
    ledcAttach(PIN_FAN_PWM, PWM_FREQ_HZ, PWM_RESOLUTION_BITS);
  #else
    // ESP32 Arduino Core 2.x Legacy API: ledcSetup(channel, frequency, resolution) + ledcAttachPin(pin, channel)
    ledcSetup(PWM_LEDC_CHANNEL, PWM_FREQ_HZ, PWM_RESOLUTION_BITS);
    ledcAttachPin(PIN_FAN_PWM, PWM_LEDC_CHANNEL);
  #endif
#else
  pinMode(PIN_FAN_PWM, OUTPUT);
#endif

  setFanPwmLevel(0);
  setRelayState(false);
  digitalWrite(PIN_STATUS_LED, HIGH);

  Serial.println(F("Peripherals initialized. Starting control loop."));
}

void loop() {
  unsigned long now = millis();
  static unsigned long lastLoopMs = 0;

  // Run control loop every 1000ms
  if (now - lastLoopMs >= 1000UL) {
    lastLoopMs = now;
    executeControlLoop(now);
  }

  // Process optional serial commands for interactive testing
  if (Serial.available()) {
    char cmd = Serial.read();
    if (cmd == 'd') {
      config.useDemoTimer = !config.useDemoTimer;
      Serial.print(F("Demo vacancy timer toggled: "));
      Serial.println(config.useDemoTimer ? F("5 SECONDS") : F("5 MINUTES"));
    } else if (cmd == 's') {
      config.sleepModeEnabled = !config.sleepModeEnabled;
      Serial.print(F("Sleep mode toggled: "));
      Serial.println(config.sleepModeEnabled ? F("ENABLED") : F("DISABLED"));
    } else if (cmd == 'b') {
      config.benchSimulationMode = !config.benchSimulationMode;
      Serial.print(F("Bench simulation mode: "));
      Serial.println(config.benchSimulationMode ? F("ENABLED (Synthetic data)") : F("DISABLED (Physical BME280)"));
    } else if (cmd == 'f') {
      faultActive = !faultActive;
      faultReason = faultActive ? "Injected test fault via Serial" : "";
      Serial.print(F("Fault state toggled: "));
      Serial.println(faultActive ? F("FAULT ACTIVE") : F("CLEARED"));
    }
  }
}
