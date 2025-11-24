export default function getImageUrl(src?: string | null) {
  if (!src) return undefined;
  // already absolute
  if (/^https?:\/\//i.test(src)) return src;
  // protocol-relative //example.com/path
  if (/^\/\//.test(src)) return window.location.protocol + src;
  const backend = process.env.NEXT_PUBLIC_BACKEND_URL || "";
  if (!backend) return src;
  // ensure no double slashes
  if (src.startsWith("/")) return `${backend.replace(/\/$/, "")}${src}`;
  return `${backend.replace(/\/$/, "")}/${src}`;
}
