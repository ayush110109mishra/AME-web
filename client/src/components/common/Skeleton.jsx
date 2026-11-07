export default function Skeleton({ className = '', width, height, rounded = 'rounded-lg' }) {
  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`skeleton-box ${rounded} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
