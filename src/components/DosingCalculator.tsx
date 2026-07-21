import { useMemo, useState } from 'react';
import type { ProductRates, ReadingInputs } from '../lib/dosing';
import { DEFAULT_RATES, calculateDoses } from '../lib/dosing';

interface Props {
  readings: { ph: number; alkalinity: number; hardness: number } | null;
}

const toNum = (s: string) => (s.trim() === '' ? 0 : Number(s));

export default function DosingCalculator({ readings }: Props) {
  const [poolGallons, setPoolGallons] = useState('15000');
  const [ph, setPh] = useState('7.2');
  const [alkalinity, setAlkalinity] = useState('80');
  const [hardness, setHardness] = useState('200');
  const [targetPh, setTargetPh] = useState('7.4');
  const [targetAlkalinity, setTargetAlkalinity] = useState('90');
  const [targetHardness, setTargetHardness] = useState('250');
  const [rates, setRates] = useState({
    phIncreaserOzPer02: String(DEFAULT_RATES.phIncreaserOzPer02),
    phDecreaserOzPer02: String(DEFAULT_RATES.phDecreaserOzPer02),
    alkalinityIncreaserLbPer10ppm: String(DEFAULT_RATES.alkalinityIncreaserLbPer10ppm),
    hardnessIncreaserLbPer10ppm: String(DEFAULT_RATES.hardnessIncreaserLbPer10ppm),
  });
  const [showRates, setShowRates] = useState(false);

  const effectivePh = readings ? String(readings.ph) : ph;
  const effectiveAlk = readings ? String(readings.alkalinity) : alkalinity;
  const effectiveHard = readings ? String(readings.hardness) : hardness;

  const inputs: ReadingInputs = {
    poolGallons: toNum(poolGallons),
    ph: toNum(effectivePh),
    alkalinity: toNum(effectiveAlk),
    hardness: toNum(effectiveHard),
    targetPh: toNum(targetPh),
    targetAlkalinity: toNum(targetAlkalinity),
    targetHardness: toNum(targetHardness),
  };

  const numericRates: ProductRates = {
    phIncreaserOzPer02: toNum(rates.phIncreaserOzPer02),
    phDecreaserOzPer02: toNum(rates.phDecreaserOzPer02),
    alkalinityIncreaserLbPer10ppm: toNum(rates.alkalinityIncreaserLbPer10ppm),
    hardnessIncreaserLbPer10ppm: toNum(rates.hardnessIncreaserLbPer10ppm),
  };

  const doses = useMemo(() => calculateDoses(inputs, numericRates), [inputs, numericRates]);

  const selectOnFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

  return (
    <div className="dosing-calculator">
      <h2>Pool Details</h2>
      <label>
        Pool volume (gallons)
        <input
          type="number"
          value={poolGallons}
          min={0}
          onFocus={selectOnFocus}
          onChange={(e) => setPoolGallons(e.target.value)}
        />
      </label>

      <h2>Current Readings</h2>
      {readings && <p className="hint">Auto-filled from strip photo — you can still adjust below.</p>}
      <div className="reading-grid">
        <label>
          pH
          <input
            type="number"
            step="0.1"
            value={effectivePh}
            onFocus={selectOnFocus}
            onChange={(e) => setPh(e.target.value)}
          />
        </label>
        <label>
          Total Alkalinity (ppm)
          <input
            type="number"
            value={effectiveAlk}
            onFocus={selectOnFocus}
            onChange={(e) => setAlkalinity(e.target.value)}
          />
        </label>
        <label>
          Calcium Hardness (ppm)
          <input
            type="number"
            value={effectiveHard}
            onFocus={selectOnFocus}
            onChange={(e) => setHardness(e.target.value)}
          />
        </label>
      </div>

      <h2>Target Levels</h2>
      <div className="reading-grid">
        <label>
          pH
          <input
            type="number"
            step="0.1"
            value={targetPh}
            onFocus={selectOnFocus}
            onChange={(e) => setTargetPh(e.target.value)}
          />
        </label>
        <label>
          Total Alkalinity (ppm)
          <input
            type="number"
            value={targetAlkalinity}
            onFocus={selectOnFocus}
            onChange={(e) => setTargetAlkalinity(e.target.value)}
          />
        </label>
        <label>
          Calcium Hardness (ppm)
          <input
            type="number"
            value={targetHardness}
            onFocus={selectOnFocus}
            onChange={(e) => setTargetHardness(e.target.value)}
          />
        </label>
      </div>

      <button type="button" className="link-button" onClick={() => setShowRates((s) => !s)}>
        {showRates ? 'Hide' : 'Adjust'} product strength (advanced)
      </button>
      {showRates && (
        <div className="reading-grid rates-grid">
          <label>
            pH increaser oz / 10k gal per +0.2
            <input
              type="number"
              value={rates.phIncreaserOzPer02}
              onFocus={selectOnFocus}
              onChange={(e) => setRates({ ...rates, phIncreaserOzPer02: e.target.value })}
            />
          </label>
          <label>
            pH decreaser oz / 10k gal per -0.2
            <input
              type="number"
              value={rates.phDecreaserOzPer02}
              onFocus={selectOnFocus}
              onChange={(e) => setRates({ ...rates, phDecreaserOzPer02: e.target.value })}
            />
          </label>
          <label>
            Alkalinity increaser lb / 10k gal per +10ppm
            <input
              type="number"
              value={rates.alkalinityIncreaserLbPer10ppm}
              onFocus={selectOnFocus}
              onChange={(e) => setRates({ ...rates, alkalinityIncreaserLbPer10ppm: e.target.value })}
            />
          </label>
          <label>
            Hardness increaser lb / 10k gal per +10ppm
            <input
              type="number"
              value={rates.hardnessIncreaserLbPer10ppm}
              onFocus={selectOnFocus}
              onChange={(e) => setRates({ ...rates, hardnessIncreaserLbPer10ppm: e.target.value })}
            />
          </label>
        </div>
      )}

      <h2>Recommended Doses</h2>
      <ul className="dose-list">
        {doses.map((d) => (
          <li key={d.label}>
            <strong>{d.label}</strong>
            {d.amount > 0 && (
              <span className="dose-amount">
                {d.amount} {d.unit}
              </span>
            )}
            {d.note && <div className="dose-note">{d.note}</div>}
          </li>
        ))}
      </ul>
      <p className="disclaimer">
        Estimates only, based on common commercial product label rates (editable above). Always
        follow the actual product's label instructions, add chemicals gradually, and retest after
        each addition. Adjust alkalinity before fine-tuning pH, since raising alkalinity also
        raises pH.
      </p>
    </div>
  );
}
