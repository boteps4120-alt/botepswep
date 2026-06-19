const gumletWorkspaceId = "6a30a6e756ebf5bb1c25e2f3";

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
