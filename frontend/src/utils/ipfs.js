const gateways = [
  'https://salmon-blank-leopon-846.mypinata.cloud/ipfs/'
];

/**
 * Resolves IPFS URIs into reliable HTTP gateway URLs.
 * Returns a single URL (primary) or can be used to get all fallbacks.
 */
export const resolveIPFS = (url) => {
  if (!url || typeof url !== 'string') return '';
  
  // Clean the CID/Path
  const path = url.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '');
  
  // If it's already an HTTP URL but contains /ipfs/, we might want to swap gateways
  if (url.startsWith('http') && url.includes('/ipfs/')) {
    const httpPath = url.split('/ipfs/')[1];
    return `${gateways[0]}${httpPath}`;
  }

  if (url.startsWith('Qm') || url.startsWith('ba') || url.includes('ipfs')) {
    return `${gateways[0]}${path}`;
  }
  
  return url;
};

export const getAllIPFSGateways = (url) => {
  if (!url || typeof url !== 'string') return [];
  const path = url.replace(/^ipfs:\/\//, '').replace(/^\/ipfs\//, '');
  return gateways.map(g => `${g}${path}`);
};

export const getIPFSUrl = resolveIPFS;
