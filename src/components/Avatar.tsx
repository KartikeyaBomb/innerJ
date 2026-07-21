import { initials } from "@/lib/utils";

export function Avatar({
  name,
  image,
  size = "md"
}: {
  name: string;
  image?: string | null;
  size?: "sm" | "md" | "lg";
}) {
  if (image) {
    return (
      <span
        className={`avatar avatar-${size} avatar-image`}
        role="img"
        aria-label={`${name} avatar`}
        style={{ backgroundImage: `url(${JSON.stringify(image).slice(1, -1)})` }}
      />
    );
  }

  return (
    <span className={`avatar avatar-${size} avatar-fallback`} aria-label={name}>
      {initials(name)}
    </span>
  );
}
