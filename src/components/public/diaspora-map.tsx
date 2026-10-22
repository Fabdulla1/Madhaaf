"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import landPaths from "@/lib/diaspora-land.json";
import { diasporaMapStages, diasporaPlaces, type DiasporaRoute } from "@/lib/diaspora-map";

function subscribeMotion(callback: () => void) {
  const query = window.matchMedia("(prefers-reduced-motion: reduce)");
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function motionSnapshot() { return window.matchMedia("(prefers-reduced-motion: reduce)").matches; }
function routePath(route: DiasporaRoute) {
  const a = diasporaPlaces[route.from], b = diasporaPlaces[route.to];
  const ax = a.lon * 10, ay = -a.lat * 10, bx = b.lon * 10, by = -b.lat * 10;
  return `M${ax},${ay} Q${(ax + bx) / 2 + route.bend},${(ay + by) / 2} ${bx},${by}`;
}

export function DiasporaMap() {
  const [stageIndex, setStageIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduceMotion = useSyncExternalStore(subscribeMotion, motionSnapshot, () => false);
  const isPlaying = playing && !reduceMotion;
  const stage = diasporaMapStages[stageIndex];
  const places = [...new Set(stage.routes.flatMap((route) => [route.from, route.to]))];
  const global = stageIndex === 3;

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => {
      if (stageIndex === diasporaMapStages.length - 1) setPlaying(false);
      else setStageIndex(stageIndex + 1);
    }, 6500);
    return () => window.clearTimeout(timer);
  }, [isPlaying, stageIndex]);

  function selectStage(index: number) { setPlaying(false); setStageIndex(index); }

  return (
    <section className="diaspora-map" aria-labelledby="migration-map-title">
      <div className="diaspora-map__intro">
        <div><p className="eyebrow">Read the routes</p><h2 id="migration-map-title">An ocean of connections</h2></div>
        <p>Choose a period or play the sequence. Lines show selected connections, with evidence and limits below. On small screens, scroll the map sideways.</p>
      </div>
      <div className="diaspora-map__controls" role="group" aria-label="Map periods">
        {diasporaMapStages.map((item, index) => (
          <button key={item.title} type="button" aria-pressed={index === stageIndex} onClick={() => selectStage(index)}>
            <span>{String(index + 1).padStart(2, "0")}</span>{item.period}
          </button>
        ))}
      </div>
      <div className="diaspora-map__playback">
        <button type="button" disabled={reduceMotion} onClick={() => {
          if (!playing && stageIndex === diasporaMapStages.length - 1) setStageIndex(0);
          setPlaying(!playing);
        }}>{isPlaying ? "Pause sequence" : "Play migration sequence"}</button>
        <span>{reduceMotion ? "Reduced motion enabled. Select periods manually." : "Each period remains visible for 6.5 seconds. Playback stops at the end."}</span>
      </div>
      <noscript><p className="diaspora-map__note">Map controls need JavaScript. The initial map and the complete text transcript below remain available.</p></noscript>
      <div className="diaspora-map__canvas" role="region" aria-label="Migration map; scroll horizontally on a small screen" tabIndex={0}>
        <svg viewBox={global ? "-120 -610 940 750" : "280 -330 520 450"} width="1000" height="700" role="img" aria-labelledby="diaspora-svg-title diaspora-svg-desc">
          <title id="diaspora-svg-title">{`${stage.title}: ${stage.period}`}</title>
          <desc id="diaspora-svg-desc">{`${stage.description} A text description and the source for every connection follow the map. Lines indicate connections, not exact tracks or migration numbers.`}</desc>
          <defs>
            <marker id="diaspora-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#a34e33" /></marker>
            <marker id="diaspora-context-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#235d56" /></marker>
          </defs>
          <rect x="-1800" y="-900" width="3600" height="1800" fill="#e1eeeb" />
          <g className="diaspora-map__grid" aria-hidden="true">
            {Array.from({ length: 11 }, (_, i) => -100 + i * 100).map((x) => <line key={`x${x}`} x1={x} y1={-650} x2={x} y2={150} />)}
            {Array.from({ length: 9 }, (_, i) => -650 + i * 100).map((y) => <line key={`y${y}`} x1={-150} y1={y} x2={850} y2={y} />)}
          </g>
          <g className="diaspora-map__land" aria-hidden="true">{landPaths.map((path, i) => <path key={i} d={path} />)}</g>
          <g className={`diaspora-map__geography${global ? " diaspora-map__geography--global" : ""}`} aria-hidden="true">
            <text x="742" y="-150">INDIA</text><text x="552" y="-200">OMAN</text>
            <text x="460" y="-165">YEMEN</text><text x="360" y="-60">ETHIOPIA</text>
            <text x="333" y="-12">KENYA</text><text x="315" y="83">TANZANIA</text>
            <text x="533" y="30" className="diaspora-map__ocean">Indian Ocean</text>
            {global && <text x="90" y="-480">EUROPE</text>}
          </g>
          <g key={`${stageIndex}-${isPlaying}`} className={isPlaying ? "diaspora-map__routes is-playing" : "diaspora-map__routes"}>
            {stage.routes.map((route) => <path key={`${route.from}-${route.to}`} d={routePath(route)} pathLength={100}
              className={`diaspora-map__route diaspora-map__route--${route.kind}`}
              markerEnd={(route.to === "mombasa" || route.to === "britain" || (stageIndex === 2 && route.from === "mumbai")) ? `url(#${route.kind === "context" ? "diaspora-context-arrow" : "diaspora-arrow"})` : undefined}>
              <title>{`${route.label}. ${route.note}`}</title>
            </path>)}
          </g>
          <g className={global ? "diaspora-map__places diaspora-map__places--global" : "diaspora-map__places"}>
            {places.map((id) => {
              const place = diasporaPlaces[id];
              return <g key={id} transform={`translate(${place.lon * 10} ${-place.lat * 10})`}>
                <circle r={global ? 4 : 2.7} /><text x={place.dx} y={place.dy} textAnchor={place.anchor ?? "start"}>{place.label}</text>
              </g>;
            })}
          </g>
        </svg>
      </div>
      <div className="diaspora-map__legend"><span><i />Kutchi-specific connection</span><span><i className="is-context" />Wider historical context</span></div>
      <div className="diaspora-map__reading" aria-live="polite" aria-atomic="true">
        <p className="eyebrow">{stage.period}</p><h3>{stage.title}</h3><p>{stage.description}</p>
        <ol>{stage.routes.map((route) => <li key={route.label}><strong>{route.label}.</strong> {route.note} <span className="diaspora-citations">{route.refs.map((ref) => <a key={ref} href={`#source-${ref}`} aria-label={`Map source ${ref}`}>[{ref}]</a>)}</span></li>)}</ol>
      </div>
      <p className="diaspora-map__note">Schematic connections, not exact voyages, railway alignments or measured flows. The periods overlap. Place names and coastlines use modern reference geography. London represents Britain; Mandvi sometimes represents Kutch. Equal line widths carry no population meaning. Coastline: <a href="https://www.naturalearthdata.com/about/terms-of-use/" rel="noopener noreferrer">Natural Earth, public domain</a>, 1:110m land, simplified for display. No historical borders are implied.</p>
    </section>
  );
}
