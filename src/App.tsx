import { useState } from 'react';
import StripReader from './components/StripReader';
import type { StripReadings } from './components/StripReader';
import DosingCalculator from './components/DosingCalculator';
import './App.css';

function App() {
  const [readings, setReadings] = useState<StripReadings | null>(null);

  return (
    <div className="app">
      <header>
        <h1>Pool pH & Chemical Dosing Calculator</h1>
        <p className="subtitle">
          Photograph a test strip, then get commercial-chemical dosing suggestions to hit your
          target pool balance.
        </p>
      </header>

      <main>
        <StripReader onReadingsChange={setReadings} />
        <DosingCalculator readings={readings} />
      </main>

      <footer>
        <p>
          Strip color matching uses on-device image sampling against reference swatch colors — no
          photos leave your browser.
        </p>
        <p className="brand-tag">Robbie's Pool Calc</p>
      </footer>
    </div>
  );
}

export default App;
