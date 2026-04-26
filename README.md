# Sequencing cost chart

This package turns the supplied `sequencing_cost_chart.jsx` into a deployable React/Vite page and includes static paper-ready exports.

## Website use

### As a standalone static page

```bash
npm install
npm run dev
```

Open the local URL shown by Vite.

For deployment:

```bash
npm run build
```

Upload the generated `dist/` directory to a static host such as GitHub Pages, Netlify, Vercel, Cloudflare Pages, or your institution's web server.

### Inside an existing React site

Copy `src/SequencingCostChart.jsx` into your project, install Recharts, and render it:

```bash
npm install recharts
```

```jsx
import SequencingCostChart from "./SequencingCostChart.jsx";

export default function Page() {
  return <SequencingCostChart initialMetric="mb" height={460} maxWidth={960} />;
}
```

The component uses inline styles and Recharts, so it should not require global CSS. The font link is in `index.html`; move it to your own site `<head>` if you embed the component elsewhere.

## Paper figure use

Use the vector files in `paper_figures/` for manuscript submission when possible:

- `sequencing_cost_paper_figure.pdf` - two-panel vector figure.
- `sequencing_cost_paper_figure.svg` - editable vector figure.
- `sequencing_cost_paper_figure.png` - 600 dpi raster fallback.
- Single-panel versions are also included for each chart state.

The paper figure is a print-friendly static reconstruction from the values in the JSX file. Before submission, verify the data values and cite the original data sources in the manuscript caption or methods.
