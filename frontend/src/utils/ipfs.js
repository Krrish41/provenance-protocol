const gateways = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

/**
 * Resolves IPFS URIs into reliable HTTP gateway URLs.
 * Priority: Pinata -> IPFS.io -> Cloudflare
 */
export const resolveIPFS = (url) => {
  if (!url) return '';
  
  // Handle ipfs:// protocol
  if (url.startsWith('ipfs://')) {
    const path = url.replace('ipfs://', '');
    return `${gateways[0]}${path}`;
  }

  // Handle CID-only strings
  if (url.startsWith('Qm') || url.startsWith('ba')) {
    return `${gateways[0]}${url}`;
  }

  // If it's already a gateway URL but from a slow provider, we keep it as is 
  // or could optionally redirect it to our primary gateway.
  // For now, following user's exact logic:
  return url; 
};

// For backward compatibility if any file still uses getIPFSUrl
export const getIPFSUrl = resolveIPFS;
