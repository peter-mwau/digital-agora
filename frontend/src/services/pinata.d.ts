export function uploadFileToPinata(file: File | Blob): Promise<string>;
export function uploadMetadataToIPFS(metadata: unknown): Promise<string | null>;
export function getFromIPFS(ipfsHash: string): Promise<unknown>;
export function getPinnedData(): Promise<unknown[]>;
