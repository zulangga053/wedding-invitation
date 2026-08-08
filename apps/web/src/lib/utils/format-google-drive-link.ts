export function formatGoogleDriveLink(url: string): string {
  if (!url || !url.includes('drive.google.com')) {
    return url;
  }
  const match = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (match?.[1]) {
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }
  return url;
}
