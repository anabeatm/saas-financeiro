// Draws a pixel-art grid as crisp SVG squares. `muted` shows it in grey (e.g. a locked badge).
export default function PixelSprite({
  grid,
  palette,
  size = 48,
  muted = false,
  title,
  className = "",
}) {
  const width = grid[0].length;
  const height = grid.length;

  const pixels = [];
  grid.forEach((line, y) => {
    line.split("").forEach((ch, x) => {
      const color = palette[ch];
      if (color) pixels.push(<rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={color} />);
    });
  });

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width={size}
      height={(size * height) / width}
      shapeRendering="crispEdges"
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      className={`shrink-0 ${muted ? "opacity-40 grayscale" : ""} ${className}`}
    >
      {pixels}
    </svg>
  );
}
