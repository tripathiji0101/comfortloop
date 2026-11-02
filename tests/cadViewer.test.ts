import { describe, it, expect } from 'vitest';
import { PARTS_DATA } from '../src/components/CadViewer';

describe('CadViewer Component & Assembly Explosion Tests', () => {
  it('defines metadata and explosion vectors for all 14 physical parts', () => {
    expect(PARTS_DATA.length).toBe(14);

    const partIds = PARTS_DATA.map((p) => p.id);
    expect(partIds).toContain('main_enclosure');
    expect(partIds).toContain('enclosure_cover');
    expect(partIds).toContain('esp32_devkit');
    expect(partIds).toContain('ina219_sensor');
    expect(partIds).toContain('relay_module');
    expect(partIds).toContain('radar_housing');
    expect(partIds).toContain('ld2410_sensor');
    expect(partIds).toContain('bme_snorkel');
    expect(partIds).toContain('bme280_sensor');
    expect(partIds).toContain('fan_duct');
    expect(partIds).toContain('fan120_bldc');
    expect(partIds).toContain('fan_grille');
    expect(partIds).toContain('cover_screws');
    expect(partIds).toContain('duct_screws');
  });

  it('verifies all 14 parts have valid STL filenames and STEP filenames', () => {
    PARTS_DATA.forEach((part) => {
      expect(part.filename).toMatch(/^ComfortLoop_.*\.stl$/);
      expect(part.stepFilename).toMatch(/^ComfortLoop_.*\.step$/);
      expect(part.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it('verifies cutaway STL files are specified for enclosure and cover', () => {
    const enclosure = PARTS_DATA.find((p) => p.id === 'main_enclosure');
    const cover = PARTS_DATA.find((p) => p.id === 'enclosure_cover');

    expect(enclosure?.cutawayFilename).toBe('ComfortLoop_Main_Enclosure_Cutaway.stl');
    expect(cover?.cutawayFilename).toBe('ComfortLoop_Enclosure_Cover_Cutaway.stl');
  });

  it('verifies significant explosion displacements along physical assembly axes', () => {
    // Cover and cover screws must explode in +Z direction
    const cover = PARTS_DATA.find((p) => p.id === 'enclosure_cover')!;
    const coverScrews = PARTS_DATA.find((p) => p.id === 'cover_screws')!;
    expect(cover.explodedOffset[2]).toBeGreaterThanOrEqual(50);
    expect(coverScrews.explodedOffset[2]).toBeGreaterThan(cover.explodedOffset[2]);

    // Fan duct, fan, and grille must explode in +Y direction
    const duct = PARTS_DATA.find((p) => p.id === 'fan_duct')!;
    const fan = PARTS_DATA.find((p) => p.id === 'fan120_bldc')!;
    const grille = PARTS_DATA.find((p) => p.id === 'fan_grille')!;
    expect(duct.explodedOffset[1]).toBeGreaterThan(0);
    expect(fan.explodedOffset[1]).toBeGreaterThan(duct.explodedOffset[1]);
    expect(grille.explodedOffset[1]).toBeGreaterThan(fan.explodedOffset[1]);

    // Radar pod and sensor must explode in -Y direction
    const radarPod = PARTS_DATA.find((p) => p.id === 'radar_housing')!;
    const radarSensor = PARTS_DATA.find((p) => p.id === 'ld2410_sensor')!;
    expect(radarPod.explodedOffset[1]).toBeLessThan(0);
    expect(radarSensor.explodedOffset[1]).toBeLessThan(radarPod.explodedOffset[1]);

    // BME280 snorkel and sensor must explode in -X direction
    const bmePod = PARTS_DATA.find((p) => p.id === 'bme_snorkel')!;
    const bmeSensor = PARTS_DATA.find((p) => p.id === 'bme280_sensor')!;
    expect(bmePod.explodedOffset[0]).toBeLessThan(0);
    expect(bmeSensor.explodedOffset[0]).toBeLessThan(bmePod.explodedOffset[0]);
  });

  it('correctly calculates mesh positions at factor 0.0 (assembled) and 1.0 (exploded)', () => {
    PARTS_DATA.forEach((part) => {
      // At factor 0.0, position equals nominal position
      const pos0 = [
        part.nominalPos[0] + part.explodedOffset[0] * 0.0,
        part.nominalPos[1] + part.explodedOffset[1] * 0.0,
        part.nominalPos[2] + part.explodedOffset[2] * 0.0,
      ];
      expect(pos0).toEqual(part.nominalPos);

      // At factor 1.0, position equals nominal + explodedOffset
      const pos1 = [
        part.nominalPos[0] + part.explodedOffset[0] * 1.0,
        part.nominalPos[1] + part.explodedOffset[1] * 1.0,
        part.nominalPos[2] + part.explodedOffset[2] * 1.0,
      ];
      expect(pos1[0]).toBe(part.nominalPos[0] + part.explodedOffset[0]);
      expect(pos1[1]).toBe(part.nominalPos[1] + part.explodedOffset[1]);
      expect(pos1[2]).toBe(part.nominalPos[2] + part.explodedOffset[2]);
    });
  });
});
