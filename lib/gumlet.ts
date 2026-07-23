const gumletWorkspaceId = "6a30a6e756ebf5bb1c25e2f3";
const defaultThumbnail = "/images/taekwondo-hero.png";

export function extractGumletAssetId(value: string) {
  const input = value.trim();
  if (!input) return "";

  try {
    const url = new URL(input);
    const parts = url.pathname.split("/").filter(Boolean);

    if (url.hostname.includes("play.gumlet.io") && parts[0] === "embed" && parts[1]) {
      return parts[1];
    }

    if (url.hostname.includes("gumlet.tv") && parts[0] === "watch" && parts[1]) {
      return parts[1];
    }

    if (url.hostname.includes("video.gumlet.io") && parts.length >= 2) {
      return parts[1];
    }
  } catch {
    // Raw Gumlet asset IDs are handled below.
  }

  return input.replace(/^embed\//, "").replace(/\/$/, "");
}

export function getGumletEmbedUrl(value?: string | null) {
  const assetId = extractGumletAssetId(value ?? "");
  return assetId ? `https://play.gumlet.io/embed/${assetId}` : undefined;
}

export function getGumletHlsUrl(value?: string | null) {
  const input = (value ?? "").trim();
  if (!input) return undefined;
  if (input.endsWith(".m3u8")) return input;

  const assetId = extractGumletAssetId(input);
  return assetId ? `https://video.gumlet.io/${gumletWorkspaceId}/${assetId}/main.m3u8` : undefined;
}

export function getGumletThumbnailUrl(value?: string | null) {
  const assetId = extractGumletAssetId(value ?? "");
  return assetId
    ? `https://video.gumlet.io/${gumletWorkspaceId}/${assetId}/thumbnail-1-0.png?time=1&width=960&height=540`
    : undefined;
}

export function normalizeCourseThumbnailUrl(value?: string | null, videoValue?: string | null) {
  const input = (value ?? "").trim();
  if (!input) return getGumletThumbnailUrl(videoValue) ?? defaultThumbnail;

  const embeddedUrl = input.match(/(?:src|href)=["']([^"']+)["']/i)?.[1];
  const candidate = (embeddedUrl ?? input).replaceAll("&amp;", "&").trim();

  try {
    const url = new URL(candidate);
    const isGumletVideoHost =
      url.hostname === "video.gumlet.io" ||
      url.hostname === "play.gumlet.io" ||
      url.hostname === "gumlet.tv" ||
      url.hostname === "www.gumlet.tv";
    const isImagePath = /\.(?:avif|gif|jpe?g|png|webp)$/i.test(url.pathname);

    if (isGumletVideoHost && !isImagePath) {
      return getGumletThumbnailUrl(candidate) ?? defaultThumbnail;
    }

    return url.toString();
  } catch {
    return /^[a-f0-9]{20,}$/i.test(candidate)
      ? getGumletThumbnailUrl(candidate) ?? defaultThumbnail
      : defaultThumbnail;
  }
}
