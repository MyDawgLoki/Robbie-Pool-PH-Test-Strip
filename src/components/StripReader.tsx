import { useCallback, useEffect, useRef, useState } from 'react';
import type { RGB } from '../lib/color';
import { averageColor, rgbToCss } from '../lib/color';
import { PAD_DEFINITIONS, matchSwatch } from '../lib/stripChart';
import type { PadId } from '../lib/stripChart';

interface Marker {
  id: PadId;
  x: number; // fraction of canvas width, 0-1
  y: number; // fraction of canvas height, 0-1
}

const DEFAULT_MARKERS: Marker[] = [
  { id: 'ph', x: 0.5, y: 0.25 },
  { id: 'alkalinity', x: 0.5, y: 0.45 },
  { id: 'hardness', x: 0.5, y: 0.65 },
];

export interface StripReadings {
  ph: number;
  alkalinity: number;
  hardness: number;
}

interface Props {
  onReadingsChange: (readings: StripReadings) => void;
}

export default function StripReader({ onReadingsChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [markers, setMarkers] = useState<Marker[]>(DEFAULT_MARKERS);
  const [dragging, setDragging] = useState<PadId | null>(null);
  const [sampledColors, setSampledColors] = useState<Record<PadId, RGB> | null>(null);

  const handleFile = useCallback((file: File) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const maxWidth = 480;
      const scale = Math.min(1, maxWidth / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      setImageLoaded(true);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, []);

  const sample = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const radius = Math.max(4, Math.round(canvas.width * 0.03));
    const colors: Record<PadId, RGB> = {} as Record<PadId, RGB>;
    for (const m of markers) {
      colors[m.id] = averageColor(ctx, m.x * canvas.width, m.y * canvas.height, radius);
    }
    setSampledColors(colors);

    const readings: StripReadings = {
      ph: matchSwatch(PAD_DEFINITIONS.find((p) => p.id === 'ph')!, colors.ph),
      alkalinity: matchSwatch(PAD_DEFINITIONS.find((p) => p.id === 'alkalinity')!, colors.alkalinity),
      hardness: matchSwatch(PAD_DEFINITIONS.find((p) => p.id === 'hardness')!, colors.hardness),
    };
    onReadingsChange(readings);
  }, [markers, onReadingsChange]);

  useEffect(() => {
    if (imageLoaded) sample();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageLoaded]);

  const handlePointerDown = (id: PadId) => (e: React.PointerEvent) => {
    e.preventDefault();
    setDragging(id);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    setMarkers((prev) => prev.map((m) => (m.id === dragging ? { ...m, x, y } : m)));
  };

  const handlePointerUp = () => {
    if (dragging) {
      setDragging(null);
      sample();
    }
  };

  return (
    <div className="strip-reader">
      <div className="capture-controls">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
          style={{ display: 'none' }}
        />
        <button type="button" onClick={() => fileInputRef.current?.click()}>
          {imageLoaded ? 'Retake / Choose Photo' : 'Take or Upload Strip Photo'}
        </button>
      </div>

      {imageLoaded && (
        <p className="hint">
          Drag each marker onto the matching pad on your test strip, then tap "Re-sample".
        </p>
      )}

      <div
        className="canvas-wrap"
        style={{ display: imageLoaded ? undefined : 'none' }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <canvas ref={canvasRef} />
        {imageLoaded &&
          markers.map((m) => (
            <div
              key={m.id}
              className={`marker marker-${m.id}`}
              style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%` }}
              onPointerDown={handlePointerDown(m.id)}
            >
              {PAD_DEFINITIONS.find((p) => p.id === m.id)?.label}
            </div>
          ))}
      </div>

      {imageLoaded && (
        <button type="button" onClick={sample}>
          Re-sample
        </button>
      )}

      {sampledColors && (
        <div className="swatch-preview">
          {PAD_DEFINITIONS.map((pad) => (
            <div key={pad.id} className="swatch-row">
              <span
                className="swatch-chip"
                style={{ backgroundColor: rgbToCss(sampledColors[pad.id]) }}
              />
              <span>{pad.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
