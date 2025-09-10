// Client-side Pinata helpers (note: embedding Pinata keys in the frontend exposes them to users).
// To use, set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_API_KEY in your frontend env (.env.local).
const PINATA_BASE = 'https://api.pinata.cloud';
const API_KEY = import.meta.env.VITE_PINATA_API_KEY;
const SECRET = import.meta.env.VITE_PINATA_SECRET_KEY;

console.log('PINATA API_KEY:', API_KEY ? 'set' : 'NOT SET');
console.log('PINATA SECRET:', SECRET ? 'set' : 'NOT SET');


function ensureKeys() {
    if (!API_KEY || !SECRET) {
        console.warn('VITE_PINATA_API_KEY or VITE_PINATA_SECRET_API_KEY is not set. Pinata calls will fail.');
    }
}

export async function uploadFileToPinata(file) {
    ensureKeys();
    if (!file) throw new Error('file required');

    const fd = new FormData();
    fd.append('file', file, file.name || 'upload');

    const res = await fetch(`${PINATA_BASE}/pinning/pinFileToIPFS`, {
        method: 'POST',
        headers: {
            // Pinata uses these headers; note this exposes keys to the browser
            pinata_api_key: API_KEY || '',
            pinata_secret_api_key: SECRET || '',
        },
        body: fd,
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`pinFileToIPFS failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    return json; // contains IpfsHash
}

export async function uploadMetadataToIPFS(metadata) {
    ensureKeys();
    const res = await fetch(`${PINATA_BASE}/pinning/pinJSONToIPFS`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            pinata_api_key: API_KEY || '',
            pinata_secret_api_key: SECRET || '',
        },
        body: JSON.stringify(metadata),
    });

    if (!res.ok) {
        const text = await res.text();
        throw new Error(`pinJSONToIPFS failed: ${res.status} ${text}`);
    }

    const json = await res.json();
    return json; // contains IpfsHash
}

export async function getPinnedData() {
    ensureKeys();
    const url = `${PINATA_BASE}/data/pinList?status=pinned`;
    const res = await fetch(url, {
        headers: {
            pinata_api_key: API_KEY || '',
            pinata_secret_api_key: SECRET || '',
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`pinList failed: ${res.status} ${text}`);
    }
    const json = await res.json();
    return json.rows || json;
}

export async function getFromIPFS(ipfsHash) {
    const url = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch from IPFS gateway');
    return res.json();
}

export default { uploadFileToPinata, uploadMetadataToIPFS, getPinnedData, getFromIPFS };