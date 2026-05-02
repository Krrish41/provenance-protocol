const gateways = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

/**
 * Resolves IPFS URIs into reliable HTTP gateway URLs.
 */
export const resolveIPFS = (url) => {
  if (!url || typeof url !== 'string') return '';
  if (url.startsWith('ipfs://')) {
    const path = url.replace('ipfs://', '');
    return `${gateways[0]}${path}`; // Use primary, then can iterate through gateways for fallback
  }
  return url; // Assume standard HTTP/HTTPS otherwise
};

// For backward compatibility if any file still uses getIPFSUrl
export const getIPFSUrl = resolveIPFS;
