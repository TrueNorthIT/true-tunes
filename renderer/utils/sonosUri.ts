export const extractTrackReference = (
  sonosUri?: string | null
): { ref: string; serviceId?: number } | null => {
  if (!sonosUri) return null;
  const decodedUri = decodeURIComponent(sonosUri);
  const trackMatch = decodedUri.match(/([a-z0-9-]+:track:[^?]+)/i);
  if (!trackMatch) return null;

  const sidMatch =
    decodedUri.match(/[?&]sid=(\d+)/i) ?? sonosUri.match(/[?&]sid=(\d+)/i);
  const serviceId = sidMatch ? Number(sidMatch[1]) : undefined;

  return { ref: trackMatch[1], serviceId };
};
