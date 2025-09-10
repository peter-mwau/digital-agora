import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { Discussion } from "../types";
import {
  getPinnedData,
  getFromIPFS,
  uploadMetadataToIPFS,
} from "../services/pinata";

type DiscussionsContextValue = {
  discussions: Discussion[];
  loading: boolean;
  refresh: () => Promise<void>;
  addDiscussion: (
    d: Omit<Discussion, "id" | "createdAt">
  ) => Promise<Discussion>;
  insertDiscussion: (d: Discussion) => void;
};

export const DiscussionsContext = createContext<
  DiscussionsContextValue | undefined
>(undefined);

export function DiscussionsProvider({ children }: { children: ReactNode }) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadPinned() {
    setLoading(true);
    try {
      const rows = await getPinnedData();
      // rows are Pinata rows; map them to Discussion by fetching pinned JSON from gateway
      const items = await Promise.all(
        (rows || []).map(async (r: unknown) => {
          try {
            const row = r as Record<string, unknown>;
            const hash =
              (row?.ipfs_pin_hash as string) ||
              (row?.ipfsHash as string) ||
              (row?.ipfs &&
                ((row.ipfs as unknown as Record<string, unknown>)
                  ?.hash as string)) ||
              null;
            if (!hash) return null;
            const j = await getFromIPFS(String(hash)).catch(() => null);
            if (
              j &&
              typeof j === "object" &&
              "title" in (j as object) &&
              "content" in (j as object)
            ) {
              return j as Discussion;
            }
            return null;
          } catch (err) {
            console.warn("map pinned row failed", err);
            return null;
          }
        })
      );

      const filtered = (items.filter(Boolean) as Discussion[]) || [];
      setDiscussions(filtered.reverse());
    } catch (e) {
      console.warn("loadPinned failed", e);
      setDiscussions([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPinned();
  }, []);

  async function addDiscussion(d: Omit<Discussion, "id" | "createdAt">) {
    const toSave: Discussion = {
      ...d,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    } as Discussion;

    // attempt to pin metadata via client-side helper; if it fails we still add locally
    try {
      const res = await uploadMetadataToIPFS(
        JSON.parse(JSON.stringify(toSave))
      );
      const resUnknown = res as unknown;
      let maybeHash: string | null = null;
      if (typeof resUnknown === "string") maybeHash = resUnknown;
      else if (typeof resUnknown === "object" && resUnknown !== null) {
        const asObj = resUnknown as Record<string, unknown>;
        if (typeof asObj.IpfsHash === "string")
          maybeHash = asObj.IpfsHash as string;
        else if (typeof asObj.ipfsHash === "string")
          maybeHash = asObj.ipfsHash as string;
      }
      if (maybeHash) toSave.metadataIpfs = `ipfs://${maybeHash}`;
    } catch (err) {
      console.warn("uploadMetadataToIPFS failed in addDiscussion", err);
    }

    setDiscussions((prev) => [toSave, ...prev]);
    return toSave;
  }

  function insertDiscussion(d: Discussion) {
    setDiscussions((prev) => [d, ...prev]);
  }

  return (
    <DiscussionsContext.Provider
      value={{
        discussions,
        loading,
        refresh: loadPinned,
        addDiscussion,
        insertDiscussion,
      }}
    >
      {children}
    </DiscussionsContext.Provider>
  );
}

export default DiscussionsProvider;
