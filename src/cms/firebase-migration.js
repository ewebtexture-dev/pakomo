export function firebaseObjectKey(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.hostname !== 'firebasestorage.googleapis.com') return null;
    const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/);
    return match ? decodeURIComponent(match[1]) + '/' + decodeURIComponent(match[2]) : null;
  } catch { return null; }
}

export function rewriteFirebaseReferences(value, urls) {
  if (typeof value === 'string') {
    if (!/[\s"'<>]/.test(value) && urls.has(firebaseObjectKey(value))) return urls.get(firebaseObjectKey(value));
    return value.replace(/https:\/\/firebasestorage\.googleapis\.com\/v0\/b\/[^/\s"'<>]+\/o\/[^\s"'<>]+/g,
      url => urls.get(firebaseObjectKey(url.replace(/&amp;/g, '&'))) || url);
  }
  if (Array.isArray(value)) return value.map(item => rewriteFirebaseReferences(item, urls));
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewriteFirebaseReferences(item, urls)]));
  return value;
}
