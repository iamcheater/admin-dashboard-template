export function CustomSkeleton({
  variant = "text",
  animation = "wave",
  className,
}: {
  variant?: "text" | "rectangular" | "rounded" | "circular";
  animation?: "pulse" | "wave" | false;
  className?: string;
}) {
  const animationClass = animation ? ` custom-skeleton--${animation}` : "";

  return (
    <span
      aria-hidden
      className={`custom-skeleton custom-skeleton--${variant}${animationClass}${className ? ` ${className}` : ""}`}
    />
  );
}
