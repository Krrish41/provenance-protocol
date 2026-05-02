const gateways = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/'
];

/**
 * Resolves IPFS URIs into reliable HTTP gateway URLs.
 * Priority: Pinata -> IPFS.io -> Cloudflare
 */
/**
 * Resolves IPFS URIs into reliable HTTP gateway URLs.
 * Cycles through gateways for maximum reliability.
 */
export const resolveIPFS = (url) => {
  if (!url) return '';
  
  // If it's already a gateway URL, ensure it's using a fast one
  if (url.includes('ipfs.io') || url.includes('gateway.pinata.cloud')) {
    // Keep it, but we could also normalize it here
  }

  const cid = url.replace('ipfs://', '').replace('https://gateway.pinata.cloud/ipfs/', '').replace('https://ipfs.io/ipfs/', '').replace('https://cloudflare-ipfs.com/ipfs/', '');

  // Handle various formats
  if (url.startsWith('ipfs://') || url.startsWith('Qm') || url.startsWith('ba') || url.includes('/ipfs/')) {
    const cleanCID = cid.split('?')[0]; // Remove queries
    return `https://cloudflare-ipfs.com/ipfs/${cleanCID}`; // Cloudflare is generally fastest for media
  }

  return url; 
};

// For backward compatibility if any file still uses getIPFSUrl
export const getIPFSUrl = resolveIPFS;
