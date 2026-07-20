import type { RGB } from './color';
import { labDistance } from './color';

export type PadId = 'ph' | 'alkalinity' | 'hardness';

export interface Swatch {
  value: number;
  color: RGB;
}

export interface PadDefinition {
  id: PadId;
  label: string;
  unit: string;
  // Reference swatches, low -> high value. Colors are approximate averages
  // for common 6-way pool/spa test strips (e.g. AquaChek-style charts).
  // Real strips vary by brand/lighting, so these are defaults the user can
  // recalibrate by entering a manual reading instead.
  swatches: Swatch[];
}

export const PAD_DEFINITIONS: PadDefinition[] = [
  {
    id: 'ph',
    label: 'pH',
    unit: '',
    swatches: [
      { value: 6.2, color: { r: 246, g: 208, b: 90 } },
      { value: 6.8, color: { r: 240, g: 170, b: 90 } },
      { value: 7.2, color: { r: 232, g: 128, b: 92 } },
      { value: 7.8, color: { r: 214, g: 90, b: 96 } },
      { value: 8.4, color: { r: 178, g: 60, b: 110 } },
    ],
  },
  {
    id: 'alkalinity',
    label: 'Total Alkalinity',
    unit: 'ppm',
    swatches: [
      { value: 0, color: { r: 246, g: 220, b: 90 } },
      { value: 40, color: { r: 210, g: 210, b: 90 } },
      { value: 80, color: { r: 150, g: 200, b: 110 } },
      { value: 120, color: { r: 90, g: 180, b: 140 } },
      { value: 180, color: { r: 60, g: 150, b: 160 } },
      { value: 240, color: { r: 40, g: 110, b: 170 } },
    ],
  },
  {
    id: 'hardness',
    label: 'Calcium Hardness',
    unit: 'ppm',
    swatches: [
      { value: 0, color: { r: 220, g: 120, b: 160 } },
      { value: 25, color: { r: 200, g: 110, b: 175 } },
      { value: 50, color: { r: 170, g: 100, b: 185 } },
      { value: 120, color: { r: 130, g: 95, b: 190 } },
      { value: 250, color: { r: 90, g: 90, b: 190 } },
      { value: 425, color: { r: 55, g: 85, b: 180 } },
    ],
  },
];

/**
 * Match a sampled color against a pad's reference swatches. Finds the two
 * closest-by-value neighbors bounding the nearest match and linearly
 * interpolates between them for a smoother estimate than snapping to the
 * nearest swatch alone.
 */
export function matchSwatch(pad: PadDefinition, sample: RGB): number {
  const distances = pad.swatches.map((s) => labDistance(sample, s.color));
  let bestIdx = 0;
  for (let i = 1; i < distances.length; i++) {
    if (distances[i] < distances[bestIdx]) bestIdx = i;
  }

  const neighborIdx =
    bestIdx === 0
      ? 1
      : bestIdx === pad.swatches.length - 1
        ? pad.swatches.length - 2
        : distances[bestIdx - 1] < distances[bestIdx + 1]
          ? bestIdx - 1
          : bestIdx + 1;

  const a = pad.swatches[bestIdx];
  const b = pad.swatches[neighborIdx];
  const dA = distances[bestIdx];
  const dB = distances[neighborIdx];
  const total = dA + dB;
  if (total === 0) return a.value;

  // Weight inversely by distance so a closer swatch pulls the estimate
  // toward its value.
  const weightB = dA / total;
  return a.value + (b.value - a.value) * weightB;
}
