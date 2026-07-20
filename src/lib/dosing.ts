export interface ReadingInputs {
  poolGallons: number;
  ph: number;
  alkalinity: number;
  hardness: number;
  targetPh: number;
  targetAlkalinity: number;
  targetHardness: number;
}

export interface ProductRates {
  // oz of dry soda ash (sodium carbonate) per 10,000 gal to raise pH by 0.2
  phIncreaserOzPer02: number;
  // oz of dry sodium bisulfate per 10,000 gal to lower pH by 0.2
  phDecreaserOzPer02: number;
  // lb of sodium bicarbonate per 10,000 gal to raise TA by 10 ppm
  alkalinityIncreaserLbPer10ppm: number;
  // lb of calcium chloride per 10,000 gal to raise CH by 10 ppm
  hardnessIncreaserLbPer10ppm: number;
}

// Commonly published rule-of-thumb rates from commercial product labels.
// Actual concentration varies by brand, so these are editable defaults.
export const DEFAULT_RATES: ProductRates = {
  phIncreaserOzPer02: 6,
  phDecreaserOzPer02: 12,
  alkalinityIncreaserLbPer10ppm: 1.5,
  hardnessIncreaserLbPer10ppm: 1.25,
};

export interface DoseResult {
  label: string;
  amount: number;
  unit: string;
  note?: string;
}

export function calculateDoses(
  inputs: ReadingInputs,
  rates: ProductRates = DEFAULT_RATES
): DoseResult[] {
  const scale = inputs.poolGallons / 10000;
  const results: DoseResult[] = [];

  const phDelta = inputs.targetPh - inputs.ph;
  if (Math.abs(phDelta) >= 0.05) {
    if (phDelta > 0) {
      const oz = (phDelta / 0.2) * rates.phIncreaserOzPer02 * scale;
      results.push({
        label: 'pH Increaser (soda ash)',
        amount: round(oz),
        unit: 'oz',
        note: `Raises pH from ${inputs.ph.toFixed(1)} to ${inputs.targetPh.toFixed(1)}`,
      });
    } else {
      const oz = (Math.abs(phDelta) / 0.2) * rates.phDecreaserOzPer02 * scale;
      results.push({
        label: 'pH Decreaser (sodium bisulfate)',
        amount: round(oz),
        unit: 'oz',
        note: `Lowers pH from ${inputs.ph.toFixed(1)} to ${inputs.targetPh.toFixed(1)}`,
      });
    }
  }

  const alkDelta = inputs.targetAlkalinity - inputs.alkalinity;
  if (alkDelta >= 2) {
    const lb = (alkDelta / 10) * rates.alkalinityIncreaserLbPer10ppm * scale;
    results.push({
      label: 'Alkalinity Increaser (sodium bicarbonate)',
      amount: round(lb),
      unit: 'lb',
      note: `Raises TA from ${Math.round(inputs.alkalinity)} to ${Math.round(inputs.targetAlkalinity)} ppm`,
    });
  }

  const hardDelta = inputs.targetHardness - inputs.hardness;
  if (hardDelta >= 5) {
    const lb = (hardDelta / 10) * rates.hardnessIncreaserLbPer10ppm * scale;
    results.push({
      label: 'Calcium Hardness Increaser (calcium chloride)',
      amount: round(lb),
      unit: 'lb',
      note: `Raises CH from ${Math.round(inputs.hardness)} to ${Math.round(inputs.targetHardness)} ppm`,
    });
  }

  if (results.length === 0) {
    results.push({
      label: 'No adjustment needed',
      amount: 0,
      unit: '',
      note: 'All readings are at or near target.',
    });
  }

  return results;
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}
