import axios from 'axios';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

export const uploadFileToIPFS = async (file) => {
    try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
            }
        });
        return `https://salmon-blank-leopon-846.mypinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading file to Pinata:", error);
        throw error;
    }
}

export const uploadJSONToIPFS = async (JSONBody) => {
    try {
        const res = await axios.post("https://api.pinata.cloud/pinning/pinJSONToIPFS", JSONBody, {
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
                'Content-Type': 'application/json'
            }
        });
        return `https://salmon-blank-leopon-846.mypinata.cloud/ipfs/${res.data.IpfsHash}`;
    } catch (error) {
        console.error("Error uploading JSON to Pinata:", error);
        throw error;
    }
}

export const unpinFromIPFS = async (hashOrUrl) => {
    if (!hashOrUrl) return;
    try {
        // Extract hash from URL if necessary
        const hash = hashOrUrl.includes('ipfs/') ? hashOrUrl.split('ipfs/').pop() : hashOrUrl;
        
        await axios.delete(`https://api.pinata.cloud/pinning/unpin/${hash}`, {
            headers: {
                'Authorization': `Bearer ${PINATA_JWT}`,
            }
        });
        console.log(`Successfully unpinned: ${hash}`);
    } catch (error) {
        console.error("Error unpinning from Pinata:", error);
    }
}
