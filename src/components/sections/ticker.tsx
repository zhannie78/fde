const words = [
  "WORKFLOW AUTOMATION",
  "AI AGENTS",
  "CUSTOMIZED BUILDS TO YOUR EXISTING PROCESSES",
  "AI-NATIVE TRANSFORMATION",
] as const;

function TickerGroup() {
  return (
    <span className="ticker-group">
      {words.map((word) => (
        <span key={word}>
          <b>{word}</b>
          <span className="sep">·</span>
        </span>
      ))}
    </span>
  );
}

/**
 * Skills ticker — endless marquee, ported verbatim from the Phase 6 sketch.
 * Two identical `.ticker-group` copies animated exactly -50% per cycle so
 * it loops seamlessly (see globals.css for the seam-gap fix rationale).
 */
export function Ticker() {
  return (
    <div className="ticker">
      <div className="ticker-track">
        <TickerGroup />
        <TickerGroup />
      </div>
    </div>
  );
}
