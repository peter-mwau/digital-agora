import { useState } from "react";
import {
  Heart,
  MessageSquare,
  ArrowUp,
  LinkIcon,
  ChevronDown,
  ChevronUp,
  CornerUpLeft,
  X,
  Bot, // Add this import for bot icon
} from "lucide-react";

// Update your Discussion type to include agent fields
type Discussion = {
  id: string;
  title?: string; // Make title optional since agent responses might not have titles
  content: string;
  author: string | Author;
  authorId?: string; // Add authorId
  createdAt: number | string;
  tags?: string[];
  likes?: number;
  replies?: Reply[];
  aiAssist?: boolean; // Add this field
};

// Define types
type Author = {
  name?: string;
  address?: string;
};

type Reply = {
  id: string;
  content: string;
  author: string | Author;
  createdAt: number | string;
  postId: string;
  parentId?: string;
  quotedText?: string;
  replies?: Reply[];
};

type DiscussionFeedProps = {
  discussions: Discussion[];
  loading?: boolean;
};

// Recursive Reply component for nested replies
function ReplyItem({
  reply,
  onReply,
  level = 0,
}: {
  reply: Reply;
  onReply: (parentId: string, content: string, quotedText?: string) => void;
  level: number;
}) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const authorStr =
    typeof reply.author === "string"
      ? reply.author
      : reply.author?.name || reply.author?.address || "unknown";

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(reply.id, replyContent);
      setReplyContent("");
      setIsReplying(false);
    }
  };

  return (
    <div
      className={`mt-3 ${
        level > 0 ? "pl-6 border-l border-gray-200 dark:border-gray-700" : ""
      }`}
    >
      <div className="flex">
        <div className="flex-shrink-0 mr-3">
          <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-white flex items-center justify-center font-medium text-xs">
            {authorStr.slice(0, 2).toUpperCase()}
          </div>
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {authorStr}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            {new Date(reply.createdAt).toLocaleDateString()}
          </div>

          {reply.quotedText && (
            <div className="mb-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-2 rounded">
              <div className="flex items-center">
                <CornerUpLeft className="h-3 w-3 mr-1" />
                Replying to
              </div>
              <blockquote className="ml-4 pl-2 border-l border-gray-300 dark:border-gray-600 italic">
                "{reply.quotedText}"
              </blockquote>
            </div>
          )}

          <div className="text-sm text-gray-700 dark:text-gray-300">
            {reply.content}
          </div>

          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={() => setIsReplying(!isReplying)}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Reply
            </button>
            <a
              href={`#post-${reply.postId}`}
              className="text-xs text-gray-500 dark:text-gray-400 hover:underline"
              title="Jump to original post"
            >
              Jump to post
            </a>
          </div>

          {isReplying && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write your reply..."
                className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                rows={2}
              />
              <div className="mt-2 flex justify-end gap-2">
                <button
                  onClick={() => setIsReplying(false)}
                  className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 rounded-md border border-gray-300 dark:border-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyContent.trim()}
                  className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Post Reply
                </button>
              </div>
            </div>
          )}

          {reply.replies && reply.replies.length > 0 && (
            <div className="mt-3">
              {reply.replies.map((nestedReply) => (
                <ReplyItem
                  key={nestedReply.id}
                  reply={nestedReply}
                  onReply={onReply}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Add this helper function at the top of your component
const isAgentResponse = (discussion: Discussion): boolean => {
  return (
    discussion.authorId === "ai_agent_002" ||
    discussion.aiAssist === true ||
    discussion.author === "AI Agent" ||
    (typeof discussion.author === "string" &&
      discussion.author.includes("Agent"))
  );
};

// Update the main discussion rendering section (around line 310-400)
export default function DiscussionFeed({
  discussions,
  loading,
}: DiscussionFeedProps) {
  const [replies, setReplies] = useState<Record<string, Reply[]>>({});
  const [expandedReplies, setExpandedReplies] = useState<
    Record<string, boolean>
  >({});
  const [activeReply, setActiveReply] = useState<Record<string, boolean>>({});
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [selectedText, setSelectedText] = useState<{
    postId: string;
    text: string;
  } | null>(null);

  const handleTextSelection = (postId: string) => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      setSelectedText({ postId, text: selection.toString() });
      setReplyText((prev) => ({
        ...prev,
        [postId]: `> ${selection.toString()}\n\n`,
      }));
      setActiveReply((prev) => ({ ...prev, [postId]: true }));
    }
  };

  const handleReply = (postId: string, parentId?: string) => {
    if (!replyText[postId] || replyText[postId].trim().length === 0) return;

    const newReply: Reply = {
      id: Date.now().toString(),
      content: replyText[postId],
      author: "Current User",
      createdAt: Date.now(),
      postId: postId,
      parentId: parentId,
      quotedText:
        selectedText?.postId === postId ? selectedText.text : undefined,
    };

    setReplies((prev) => {
      if (parentId) {
        // For nested replies, we need to update the parent reply
        const updatedReplies = { ...prev };
        const addReplyToParent = (repliesList: Reply[]): Reply[] => {
          return repliesList.map((reply) => {
            if (reply.id === parentId) {
              return {
                ...reply,
                replies: [...(reply.replies || []), newReply],
              };
            }
            if (reply.replies) {
              return {
                ...reply,
                replies: addReplyToParent(reply.replies),
              };
            }
            return reply;
          });
        };

        return {
          ...prev,
          [postId]: addReplyToParent(prev[postId] || []),
        };
      } else {
        // For top-level replies
        return {
          ...prev,
          [postId]: [...(prev[postId] || []), newReply],
        };
      }
    });

    // Reset form
    setReplyText((prev) => ({ ...prev, [postId]: "" }));
    setSelectedText(null);
    setActiveReply((prev) => ({ ...prev, [postId]: false }));

    // Auto-expand replies if not already expanded
    if (!expandedReplies[postId]) {
      setExpandedReplies((prev) => ({ ...prev, [postId]: true }));
    }
  };

  const toggleReplies = (postId: string) => {
    setExpandedReplies((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  const toggleReplyForm = (postId: string) => {
    setActiveReply((prev) => ({ ...prev, [postId]: !prev[postId] }));
    setSelectedText(null);
  };

  if (loading) return <div className="py-6 text-center">Loading...</div>;
  if (!discussions || discussions.length === 0)
    return (
      <div className="py-6 text-center text-gray-500">No discussions yet.</div>
    );

  return (
    <div className="space-y-4">
      {discussions.map((d) => {
        const authorStr =
          typeof d.author === "string"
            ? d.author
            : d.author?.name || d.author?.address || "unknown";

        // Check if this is an agent response
        const isAgent = isAgentResponse(d);

        const initials = isAgent
          ? "🤖" // Use robot emoji for agent
          : typeof d.author === "string"
          ? d.author.slice(0, 2).toUpperCase()
          : d.author?.name
          ? d.author.name
              .split(" ")
              .map((s) => s[0])
              .join("")
          : (d.author?.address || "U").slice(0, 2).toUpperCase();

        let createdDate;
        if (typeof d.createdAt === "number") {
          createdDate = new Date(d.createdAt);
        } else if (d.createdAt) {
          createdDate = new Date(d.createdAt);
        } else {
          createdDate = new Date();
        }

        const month = createdDate.toLocaleString("default", { month: "short" });
        const year = createdDate.getFullYear();
        const postReplies = replies[d.id] || [];
        const isExpanded = expandedReplies[d.id];
        const isReplying = activeReply[d.id];

        return (
          <div
            key={d.id}
            id={`post-${d.id}`}
            className={`p-4 rounded-lg shadow-sm transition-all duration-300 ${
              isAgent
                ? "bg-gradient-to-r from-blue-50 via-cyan-50 to-blue-50 dark:from-blue-900/20 dark:via-cyan-900/20 dark:to-blue-900/20 border-l-4 border-blue-500"
                : "bg-white dark:bg-gray-800"
            }`}
          >
            {/* Agent Response Header */}
            {isAgent && (
              <div className="flex items-center mb-3 pb-2 border-b border-blue-200 dark:border-blue-700/50">
                <div className="flex items-center">
                  <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    AI Agent Response
                  </span>
                  <div className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 text-xs rounded-full font-medium">
                    AI
                  </div>
                </div>
                <div className="ml-auto">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}

            <div className="flex items-start space-x-4">
              <div
                className={`h-10 w-10 rounded-full flex items-center justify-center font-medium ${
                  isAgent
                    ? "bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg"
                    : "bg-indigo-100 dark:bg-indigo-700 text-indigo-700 dark:text-white"
                }`}
              >
                {initials}
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    {d.title && (
                      <div
                        className={`text-sm font-semibold ${
                          isAgent
                            ? "text-blue-900 dark:text-blue-100"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {d.title}
                      </div>
                    )}
                    <div
                      className={`text-xs ${
                        isAgent
                          ? "text-blue-700 dark:text-blue-300 font-medium"
                          : "text-gray-500 dark:text-gray-300"
                      }`}
                    >
                      {authorStr}
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className="text-xs text-gray-400 mr-2 uppercase">
                      {month} {year}
                    </div>
                  </div>
                </div>

                <div
                  className={`mt-2 text-sm prose prose-sm max-w-none selectable ${
                    isAgent
                      ? "text-blue-900 dark:text-blue-100 bg-white/50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-700/50"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                  onMouseUp={() => handleTextSelection(d.id)}
                >
                  {d.content}
                </div>

                {selectedText?.postId === d.id && (
                  <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-xs">
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-medium">
                        Replying to selected text:
                      </div>
                      <button
                        onClick={() => setSelectedText(null)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <blockquote className="border-l-2 border-blue-400 pl-2 italic">
                      "{selectedText.text}"
                    </blockquote>
                  </div>
                )}

                {d.tags && d.tags.length > 0 && (
                  <div className="mt-2 flex gap-2">
                    {d.tags.map((t) => (
                      <span
                        key={t}
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          isAgent
                            ? "bg-blue-100 dark:bg-blue-800/50 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-600"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <div className="items-start flex flex-row gap-4">
                    <button
                      className={`flex items-center text-sm hover:text-red-500 dark:hover:text-red-400 ${
                        isAgent
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500"
                      }`}
                    >
                      <Heart className="h-4 w-4 mr-1" />
                      {d.likes || 0}
                    </button>
                    <button
                      className={`flex items-center text-sm hover:text-blue-500 dark:hover:text-blue-400 ${
                        isAgent
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500"
                      }`}
                      onClick={() => toggleReplyForm(d.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Reply
                    </button>
                    <button
                      className={`flex items-center text-sm hover:text-green-500 dark:hover:text-green-400 ${
                        isAgent
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-gray-500"
                      }`}
                    >
                      <ArrowUp className="h-4 w-4 mr-1" />
                      Upvote
                    </button>
                    {postReplies.length > 0 && (
                      <button
                        className={`flex items-center text-sm hover:text-purple-500 dark:hover:text-purple-400 ${
                          isAgent
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-gray-500"
                        }`}
                        onClick={() => toggleReplies(d.id)}
                      >
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 mr-1" />
                        ) : (
                          <ChevronDown className="h-4 w-4 mr-1" />
                        )}
                        {postReplies.length}{" "}
                        {postReplies.length === 1 ? "Reply" : "Replies"}
                      </button>
                    )}
                  </div>
                  <div className="items-end">
                    <button
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}#post-${d.id}`
                        );
                      }}
                      title="Copy link to this post"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Reply input - only shown when reply button is clicked */}
                {isReplying && (
                  <div className="mt-4">
                    <textarea
                      value={replyText[d.id] || ""}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [d.id]: e.target.value,
                        }))
                      }
                      placeholder="Write your reply..."
                      className="w-full p-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none"
                      rows={3}
                    />
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setActiveReply((prev) => ({
                            ...prev,
                            [d.id]: false,
                          }));
                          setSelectedText(null);
                        }}
                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-300 rounded-md border border-gray-300 dark:border-gray-600"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(d.id)}
                        disabled={
                          !replyText[d.id] ||
                          replyText[d.id].trim().length === 0
                        }
                        className="px-3 py-1 bg-indigo-600 text-white text-sm rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Post Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies section */}
                {postReplies.length > 0 && isExpanded && (
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                      Replies
                    </h4>

                    <div className="space-y-4">
                      {postReplies.map((reply) => (
                        <ReplyItem
                          key={reply.id}
                          reply={reply}
                          onReply={(parentId, content) => {
                            setReplyText((prev) => ({
                              ...prev,
                              [d.id]: content,
                            }));
                            handleReply(d.id, parentId);
                          }}
                          level={0}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
