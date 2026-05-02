/**
 * Converts various IPFS URI formats into a reliable gateway URL.
 * Handles ipfs:// protocol, CID-only strings, and existing gateway URLs.
 */
export const getIPFSUrl = (url) => {
    if (!url) return "";
    
    // If it's already a gateway URL, prioritize Cloudflare for speed
    if (url.includes("gateway.pinata.cloud")) {
        return url.replace("gateway.pinata.cloud", "cloudflare-ipfs.com");
    }
    
    if (url.includes("ipfs.io")) {
        return url.replace("ipfs.io", "cloudflare-ipfs.com");
    }

    // Handle ipfs:// protocol
    if (url.startsWith("ipfs://")) {
        return `https://cloudflare-ipfs.com/ipfs/${url.split("ipfs://")[1]}`;
    }

    // Handle CID-only strings
    if (url.startsWith("Qm") || url.startsWith("ba")) {
        return `https://cloudflare-ipfs.com/ipfs/${url}`;
    }

    return url;
};
