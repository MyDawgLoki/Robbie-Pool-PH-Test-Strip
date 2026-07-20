# Pool pH & Chemical Dosing Calculator

A mobile-friendly web app that reads a pool test strip photo and recommends
dosing amounts of commercially sold pool chemicals to hit target pH, total
alkalinity, and calcium hardness.

## How it works

1. **Photo capture** — take or upload a photo of a test strip.
2. **On-device color matching** — drag markers onto the pH, alkalinity, and
   hardness pads; each pad's sampled color is compared (in CIE Lab space)
   against reference swatch colors and interpolated to a reading. All
   processing happens in the browser — no photo is uploaded anywhere.
3. **Dosing calculator** — enter pool volume and target levels; the app
   computes how much pH increaser/decreaser, alkalinity increaser, and
   calcium hardness increaser to add, based on commonly published commercial
   product label rates (editable under "Adjust product strength").

Readings and dosing rates are estimates. Reference swatch colors vary by
strip brand and lighting, so always allow manual correction of the readings,
and follow your specific product's label instructions.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
