/** Turns a real number series into a filled sparkline path scaled to a
    160x76 box, plus the endpoint for a dot marker. Shared by the homepage
    card and the blog index so both render the exact same shape for the
    same post. */
export function blogSparkPath(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => {
    const x = (index / (values.length - 1)) * 160;
    const y = 58 - ((value - min) / span) * 50;
    return { x, y };
  });
  const line = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const fill = `${line} L160,76 L0,76 Z`;
  const last = points[points.length - 1];
  return { line, fill, last };
}
