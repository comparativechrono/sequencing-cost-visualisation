import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ── Platform data: [year, cost_per_Gb] ──
// Best (cheapest) available configuration at each platform launch year
const platformData = {
  Sanger: {
    color: "#8B8682",
    points: [[2002, 2307692]],
  },
  "454/Roche": {
    color: "#B8860B",
    points: [
      [2005, 80000],
      [2008, 15500],
      [2011, 9538],
    ],
  },
  Illumina: {
    color: "#3B82F6",
    points: [
      [2007, 210],
      [2009, 97.5],
      [2010, 45],
      [2012, 29.9],
      [2014, 7.08],
      [2017, 5.27],
      [2020, 20],
      [2023, 0.46],
    ],
  },
  "Ion Torrent": {
    color: "#EF4444",
    points: [
      [2011, 460],
      [2012, 81.6],
      [2015, 50],
      [2018, 40],
    ],
  },
  PacBio: {
    color: "#10B981",
    points: [
      [2011, 1111],
      [2013, 1111],
      [2015, 200],
      [2019, 32.5],
      [2023, 7.9],
      [2025, 18.3],
    ],
  },
  "Oxford Nanopore": {
    color: "#8B5CF6",
    points: [
      [2015, 1000],
      [2017, 37.5],
      [2019, 4.5],
      [2022, 4.5],
    ],
  },
  Element: {
    color: "#F97316",
    points: [[2022, 3.6]],
  },
  Ultima: {
    color: "#06B6D4",
    points: [[2024, 0.67]],
  },
  MGI: {
    color: "#EC4899",
    points: [
      [2018, 8],
      [2019, 5],
      [2023, 1.5],
    ],
  },
};

// ── NHGRI tracked data — separate series for cost/Mb and cost/genome ──
const nhgriCostPerMb = [
  [2001, 5292],[2002, 3898],[2003, 1136],[2004, 809],[2005, 523],
  [2006, 475],[2007, 364],[2008, 15.3],[2009, 3.91],[2010, 1.40],
  [2011, 0.245],[2012, 0.098],[2013, 0.058],[2014, 0.025],
  [2015, 0.014],[2016, 0.012],[2017, 0.011],[2018, 0.010],
  [2019, 0.009],[2020, 0.008],[2021, 0.007],[2022, 0.006],
];

const nhgriCostPerGenome = [
  [2001, 95263072],[2002, 70175437],[2003, 20442576],[2004, 14570807],
  [2005, 9413940],[2006, 8549122],[2007, 6547572],[2008, 342502],
  [2009, 108065],[2010, 54191],[2011, 10497],[2012, 7666],
  [2013, 5671],[2014, 4905],[2015, 1245],[2016, 1110],
  [2017, 1100],[2018, 1050],[2019, 942],[2020, 689],
  [2021, 562],[2022, 525],
];

function mooresLaw(year, baseline, start) {
  return baseline * Math.pow(0.5, (year - start) / 2);
}

const GENOME_GB = 90;
const years = Array.from({ length: 26 }, (_, i) => 2001 + i);

function buildData(metric) {
  const nhgri = metric === "mb" ? nhgriCostPerMb : nhgriCostPerGenome;
  const mooreBase = metric === "mb" ? 5292 : 95263072;

  return years.map((y) => {
    const row = { year: y };
    row["Moore's Law"] = mooresLaw(y, mooreBase, 2001);
    const nhgriPt = nhgri.find((d) => d[0] === y);
    if (nhgriPt) row["NHGRI Tracked"] = nhgriPt[1];
    Object.entries(platformData).forEach(([name, { points }]) => {
      const pt = points.find((p) => p[0] === y);
      if (pt) {
        row[name] = metric === "mb" ? pt[1] / 1000 : pt[1] * GENOME_GB;
      }
    });
    return row;
  });
}

const platformKeys = Object.keys(platformData);
const allKeys = ["Moore's Law", "NHGRI Tracked", ...platformKeys];

const COLORS = {
  "Moore's Law": "#475569",
  "NHGRI Tracked": "#FBBF24",
  ...Object.fromEntries(Object.entries(platformData).map(([k, v]) => [k, v.color])),
};

const fmtTick = (v) => {
  if (v >= 1e9) return "$" + (v / 1e9).toFixed(0) + "B";
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(0) + "M";
  if (v >= 1e3) return "$" + (v / 1e3).toFixed(0) + "K";
  if (v >= 1) return "$" + v.toFixed(0);
  if (v >= 0.01) return "$" + v.toFixed(2);
  if (v >= 0.001) return "$" + v.toFixed(3);
  return "$" + v.toExponential(0);
};

const fmtVal = (v) => {
  if (v >= 1e6) return "$" + (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return "$" + (v / 1e3).toFixed(1) + "K";
  if (v >= 1) return "$" + v.toFixed(2);
  if (v >= 0.001) return "$" + v.toFixed(4);
  return "$" + v.toExponential(2);
};

const Tip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const sorted = payload.filter((p) => p.value != null).sort((a, b) => a.value - b.value);
  return (
    <div style={{
      background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
      padding: "10px 14px", fontSize: 11, color: "#e2e8f0",
      fontFamily: "'JetBrains Mono',monospace", maxWidth: 300, boxShadow: "0 8px 32px rgba(0,0,0,0.5)"
    }}>
      <div style={{ fontWeight: 700, color: "#94a3b8", borderBottom: "1px solid #1e293b", paddingBottom: 4, marginBottom: 4, fontSize: 12 }}>
        {sorted[0]?.payload?.year}
      </div>
      {sorted.map((e, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 14, padding: "2px 0" }}>
          <span style={{ color: e.color, whiteSpace: "nowrap" }}>{e.name}</span>
          <span style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{fmtVal(e.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function SequencingCostChart({ initialMetric = "mb", height = 460, maxWidth = 960 }) {
  const [metric, setMetric] = useState(initialMetric);
  const [hidden, setHidden] = useState({});
  const data = useMemo(() => buildData(metric), [metric]);
  const toggle = (k) => setHidden((p) => ({ ...p, [k]: !p[k] }));

  const isMb = metric === "mb";
  const title = isMb ? "Cost per Megabase of DNA Sequencing" : "Cost per Human Genome (30\u00d7 WGS)";
  const yLabel = isMb ? "$/Mb" : "$/genome";
  const yDomain = isMb ? [0.0001, 100000] : [50, 1e9];

  return (
    <div style={{
      background: "linear-gradient(180deg,#0c1222 0%,#151d33 100%)",
      padding: "28px 20px", width: "100%", boxSizing: "border-box",
      fontFamily: "'Instrument Sans','DM Sans',-apple-system,BlinkMacSystemFont,sans-serif", color: "#e2e8f0",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet"/>

      <div style={{ maxWidth, margin: "0 auto" }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{
            fontSize: 10, letterSpacing: 2.5, textTransform: "uppercase",
            color: "#475569", fontFamily: "'JetBrains Mono',monospace", marginBottom: 6
          }}>
            DNA Sequencing Economics · 2001–2026
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#f1f5f9" }}>{title}</h1>
          <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0", lineHeight: 1.5 }}>
            Reagent-only costs by platform family versus Moore's Law (dashed). Gold line: NHGRI production tracking (ended May 2022). Click legend to toggle series.
          </p>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          {[["mb", "Cost / Megabase"], ["genome", "Cost / Genome"]].map(([k, l]) => (
            <button key={k} onClick={() => setMetric(k)} style={{
              padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: metric === k ? "1px solid #3b82f6" : "1px solid #1e293b",
              background: metric === k ? "rgba(59,130,246,0.12)" : "rgba(15,23,42,0.5)",
              color: metric === k ? "#93c5fd" : "#64748b",
              fontFamily: "'Instrument Sans',sans-serif", transition: "all 0.15s",
            }}>{l}</button>
          ))}
        </div>

        <div style={{ background: "rgba(15,23,42,0.5)", borderRadius: 12, border: "1px solid #1e293b", padding: "16px 8px 8px 0" }}>
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 8, right: 24, left: 16, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.2)" vertical={false} />
              <XAxis
                dataKey="year" type="number" domain={[2001, 2026]}
                ticks={[2001,2004,2007,2010,2013,2016,2019,2022,2025]}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickLine={{ stroke: "#334155" }} axisLine={{ stroke: "#334155" }}
              />
              <YAxis
                scale="log" domain={yDomain} allowDataOverflow
                tick={{ fill: "#64748b", fontSize: 10 }}
                tickFormatter={fmtTick}
                tickLine={{ stroke: "#334155" }} axisLine={{ stroke: "#334155" }}
                label={{ value: yLabel, angle: -90, position: "insideLeft", offset: -4, fill: "#475569", fontSize: 11, fontFamily: "'JetBrains Mono',monospace" }}
              />
              <Tooltip content={<Tip />} />

              {!hidden["Moore's Law"] && (
                <Line type="monotone" dataKey="Moore's Law" stroke="#475569" strokeWidth={2} strokeDasharray="8 4" dot={false} connectNulls isAnimationActive={false} />
              )}
              {!hidden["NHGRI Tracked"] && (
                <Line type="monotone" dataKey="NHGRI Tracked" stroke="#FBBF24" strokeWidth={2.5}
                  dot={{ r: 2, fill: "#FBBF24", strokeWidth: 0 }} connectNulls isAnimationActive={false} />
              )}
              {platformKeys.map((k) => !hidden[k] && (
                <Line key={k} type="monotone" dataKey={k} stroke={COLORS[k]} strokeWidth={2}
                  dot={{ r: 4, fill: COLORS[k], strokeWidth: 0 }} connectNulls isAnimationActive={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={{
          display: "flex", flexWrap: "wrap", gap: "5px 10px", marginTop: 12,
          background: "rgba(15,23,42,0.35)", borderRadius: 10, border: "1px solid #1e293b", padding: "10px 14px",
        }}>
          {allKeys.map((k) => (
            <button key={k} onClick={() => toggle(k)} style={{
              display: "flex", alignItems: "center", gap: 5, padding: "3px 8px",
              borderRadius: 4, border: "none", cursor: "pointer",
              background: hidden[k] ? "transparent" : "rgba(71,85,105,0.2)",
              opacity: hidden[k] ? 0.3 : 1, transition: "all 0.15s",
            }}>
              <span style={{
                width: k === "Moore's Law" ? 14 : 9, height: k === "Moore's Law" ? 0 : 9,
                borderRadius: k === "Moore's Law" ? 0 : "50%",
                background: k === "Moore's Law" ? "none" : COLORS[k],
                borderTop: k === "Moore's Law" ? "2px dashed " + COLORS[k] : "none",
                display: "inline-block",
              }} />
              <span style={{
                fontSize: 11, fontWeight: 600,
                color: hidden[k] ? "#334155" : "#cbd5e1",
                fontFamily: "'Instrument Sans',sans-serif",
              }}>{k}</span>
            </button>
          ))}
        </div>

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
          {[
            { yr: "2008", t: "NGS Transition", d: "Illumina GA drops cost/Mb 24\u00d7 in one year, decoupling from Moore's Law", c: "#3B82F6" },
            { yr: "2014", t: "$1,000 Genome", d: "HiSeq X Ten achieves ~$7/Gb, crossing the symbolic threshold", c: "#3B82F6" },
            { yr: "2022\u201324", t: "Sub-$1/Gb Era", d: "NovaSeq X, Ultima, MGI, and Element converge below $4/Gb", c: "#06B6D4" },
          ].map(({ yr, t, d, c }) => (
            <div key={yr} style={{
              background: "rgba(15,23,42,0.4)", border: "1px solid #1e293b",
              borderLeft: "3px solid " + c, borderRadius: 8, padding: "10px 12px",
            }}>
              <div style={{ fontSize: 9, color: c, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", fontFamily: "'JetBrains Mono',monospace" }}>{yr}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", margin: "3px 0 2px" }}>{t}</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4 }}>{d}</div>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 18, paddingTop: 10, borderTop: "1px solid #1e293b",
          fontSize: 9, color: "#334155", lineHeight: 1.6,
          fontFamily: "'JetBrains Mono',monospace",
        }}>
          Sources: NHGRI Genome Sequencing Program (genome.gov, Sep 2001–May 2022), manufacturer spec sheets, academic core-facility rate cards (UCONN, TAMU, TCAG).
          Reagent costs only — no library prep, instrument depreciation, labor, or compute. Cost/genome assumes 30× coverage of 3 Gb reference (~90 Gb raw data).
          Moore's Law: halving every 24 months from Sep 2001 NHGRI baseline. Platform points use best available configuration at launch.
        </div>
      </div>
    </div>
  );
}
