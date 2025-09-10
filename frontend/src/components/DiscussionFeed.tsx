import { Heart } from "lucide-react";
import type { Discussion as DiscussionType } from "../types";

type Props = {
  discussions: DiscussionType[];
  loading?: boolean;
};

export default function DiscussionFeed({ discussions, loading }: Props) {
  if (loading) return <div className="py-6 text-center">Loading...</div>;
  if (!discussions || discussions.length === 0)
    return (
      <div className="py-6 text-center text-gray-500">No discussions yet.</div>
    );

  return (
    <div className="space-y-4">
      {discussions.map((d) => {
        // author can be a string (username) or an object
        const authorStr =
          typeof d.author === "string"
            ? d.author
            : d.author?.name || d.author?.address || "unknown";
        const initials =
          typeof d.author === "string"
            ? d.author.slice(0, 2).toUpperCase()
            : d.author?.name
            ? d.author.name
                .split(" ")
                .map((s) => s[0])
                .join("")
            : (d.author?.address || "U").slice(0, 2).toUpperCase();
        const created =
          typeof d.createdAt === "number"
            ? new Date(d.createdAt).toLocaleString()
            : d.createdAt || "";

        return (
          <div
            key={d.id}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
          >
            <div className="flex items-start space-x-4">
              <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-white flex items-center justify-center font-medium">
                {initials}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {d.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">
                      {authorStr}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">{created}</div>
                </div>

                <div className="mt-2 text-sm text-gray-700 dark:text-gray-200">
                  {d.content}
                </div>

                {d.tags && d.tags.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {d.tags.map((t) => (
                      <span
                        key={t}
                        className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-full"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 flex items-center gap-3">
                  <button className="flex items-center text-sm text-gray-500 hover:text-red-500">
                    <Heart className="h-4 w-4 mr-1" /> Like
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
