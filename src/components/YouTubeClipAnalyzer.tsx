"use client";

import { useState } from "react";
import { useYouTubeAnalysis } from "@/hooks/useYouTubeAnalysis";

function parseVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

function timeToSeconds(time: string): number {
  const [h, m, s] = time.split(":").map(Number);
  return h * 3600 + m * 60 + s;
}

export default function YouTubeClipAnalyzer() {
  const [url, setUrl] = useState("");
  const { mutate, data, isPending, error } = useYouTubeAnalysis();
  const videoId = parseVideoId(url);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(url);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1
        className="text-3xl font-bold mb-8 text-center"
        style={{ color: "var(--foreground)" }}
      >
        YouTube Clip Analyzer
      </h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="flex-1 p-3 border border-gray-700 bg-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-[var(--foreground)] placeholder-gray-400"
            required
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isPending ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 mb-6 bg-red-900 text-red-100 rounded-lg border border-red-700">
          {error instanceof Error
            ? error.message
            : "Failed to analyze video. Please try again."}
        </div>
      )}

      {data?.suggestions && data.suggestions.length > 0 && (
        <div className="space-y-4">
          <h2
            className="text-2xl font-semibold mb-4"
            style={{ color: "var(--foreground)" }}
          >
            Suggested Clips
          </h2>
          {data.suggestions.map((suggestion, index) => {
            const startSeconds = timeToSeconds(suggestion.startTime);
            const endSeconds = timeToSeconds(suggestion.endTime);
            const embedUrl =
              videoId && startSeconds >= 0 && endSeconds > startSeconds
                ? `https://www.youtube.com/embed/${videoId}?start=${startSeconds}&end=${endSeconds}&autoplay=1`
                : null;
            return (
              <div
                key={index}
                className="p-4 border border-gray-700 bg-[var(--background)] rounded-lg hover:border-blue-500 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-gray-800 text-gray-100 rounded-full text-sm font-medium">
                    {suggestion.startTime} - {suggestion.endTime}
                  </span>
                  <h3
                    className="text-lg font-medium"
                    style={{ color: "var(--foreground)" }}
                  >
                    {suggestion.title}
                  </h3>
                  <span className="ml-auto text-sm text-blue-300">
                    Confidence: {(suggestion.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-2 text-gray-300">{suggestion.description}</p>
                {embedUrl && (
                  <a
                    href={embedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-blue-400 underline hover:text-blue-200"
                  >
                    ▶ Watch this clip
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
