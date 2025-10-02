import React, { useState } from "react";
import { generateTagsFromBackend } from "../services/gemini";

interface CreateDiscussionProps {
  onCreated?: (payload: {
    body: string;
    mediaFile?: File | null;
    link?: string;
    tags?: string[];
    aiAssist?: boolean;
  }) => void;
  onClose?: () => void;
  currentUser?: { id: string; username: string; avatar?: string } | null;
}

const CreateDiscussion: React.FC<CreateDiscussionProps> = ({
  onCreated,
  onClose,
  currentUser = { id: "0", username: "You", avatar: undefined },
}) => {
  const [body, setBody] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [aiAssist, setAiAssist] = useState(false);
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim()) return;

    setIsPosting(true);
    let generatedTags: string[] = [];

    try {
      // Generate tags if AI Assist is enabled
      if (aiAssist && body.trim()) {
        try {
          generatedTags = await generateTagsFromBackend(
            body.trim(),
            currentUser?.id,
            currentUser?.username
          );
        } catch (error) {
          console.error("Failed to generate tags:", error);
          // Continue with posting even if tag generation fails
        }
      }

      // Emit payload with generated tags
      onCreated?.({
        body: body.trim(),
        mediaFile: media || undefined,
        link: link || undefined,
        tags: generatedTags.length ? generatedTags : undefined,
        aiAssist,
      });

      // Reset form locally
      setBody("");
      setMedia(null);
      setLink("");
      setAiAssist(false);
      onClose?.();
    } catch (error) {
      console.error("Failed to post discussion:", error);
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-cyan-900 rounded-lg shadow p-4"
    >
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 bg-gray-200 dark:bg-cyan-800 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-100">
          {currentUser?.avatar ? (
            <img
              src={currentUser.avatar}
              alt="avatar"
              className="w-12 h-12 rounded-full"
            />
          ) : (
            currentUser?.username?.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1">
          <label className="block text-sm text-cyan-900 dark:text-cyan-100 font-semibold mb-1">
            Discussion
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share details about your discussion..."
            rows={4}
            className="w-full rounded-md border border-cyan-300 dark:border-cyan-700 p-2 bg-cyan-50 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-100"
          />

          {/* AI Assist status indicator */}
          {aiAssist && (
            <div className="mt-2">
              <p className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                AI will generate tags when you post
              </p>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setMedia(e.target.files?.[0] || null)}
                />
                <span className="px-2 py-1 bg-cyan-200 dark:bg-cyan-800 rounded text-cyan-900 dark:text-cyan-100">
                  Media
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="Add link"
                  className="px-2 py-1 rounded border border-cyan-300 dark:border-cyan-700 bg-white dark:bg-cyan-950 text-sm"
                />
              </label>
              <button
                type="button"
                onClick={() => setAiAssist((s) => !s)}
                className={`px-2 py-1 rounded ${
                  aiAssist
                    ? "bg-yellow-400 text-black"
                    : "bg-cyan-200 dark:bg-cyan-800 text-cyan-900 dark:text-cyan-100"
                }`}
              >
                AI Assist
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 rounded bg-cyan-600/30 hover:bg-cyan-700/40 text-cyan-100"
                disabled={isPosting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!body.trim() || isPosting}
                className="px-3 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isPosting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {aiAssist ? "Generating & Posting..." : "Posting..."}
                  </>
                ) : (
                  "Post"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateDiscussion;
