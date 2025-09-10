import React, { useState } from "react";
import { analyzeForTags } from "../services/gemini";

interface CreateDiscussionProps {
  onCreated?: (payload: {
    topic: string;
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
  const [topic, setTopic] = useState("");
  const [body, setBody] = useState("");
  const [media, setMedia] = useState<File | null>(null);
  const [link, setLink] = useState("");
  const [aiAssist, setAiAssist] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [acceptedTags, setAcceptedTags] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || !body.trim()) return;

    // Emit raw payload to parent so the parent can upload media/metadata
    onCreated?.({
      topic: topic.trim(),
      body: body.trim(),
      mediaFile: media || undefined,
      link: link || undefined,
      tags: acceptedTags.length ? acceptedTags : undefined,
      aiAssist,
    });

    // reset form locally
    setTopic("");
    setBody("");
    setMedia(null);
    setLink("");
    setAiAssist(false);
    onClose?.();
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
            Discussion topic
          </label>
          <input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What is your discussion about?"
            className="w-full rounded-md border border-cyan-300 dark:border-cyan-700 p-2 bg-cyan-50 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-100 mb-2"
          />

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

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm">
              <button
                type="button"
                onClick={async () => {
                  try {
                    const tags = await analyzeForTags(`${topic}\n\n${body}`);
                    setSuggestedTags(
                      tags.map((t) => (t.startsWith("#") ? t : `#${t}`))
                    );
                    setAcceptedTags([]);
                  } catch (e) {
                    console.warn("Tag suggestion failed", e);
                  }
                }}
                className="px-2 py-1 bg-cyan-200 dark:bg-cyan-800 rounded text-sm"
              >
                Suggest tags
              </button>
              {suggestedTags.length > 0 && (
                <div className="flex items-center gap-2">
                  {suggestedTags.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() =>
                        setAcceptedTags((s) =>
                          s.includes(t) ? s.filter((x) => x !== t) : [...s, t]
                        )
                      }
                      className={`px-2 py-1 rounded text-sm ${
                        acceptedTags.includes(t)
                          ? "bg-yellow-400 text-black"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}
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
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-semibold"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default CreateDiscussion;
