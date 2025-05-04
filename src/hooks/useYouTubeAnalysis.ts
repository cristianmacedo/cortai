import { useMutation } from "@tanstack/react-query";

interface ClipSuggestion {
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  confidence: number;
}

interface AnalysisResponse {
  suggestions: ClipSuggestion[];
}

interface AnalysisError {
  error: string;
}

async function analyzeYouTubeVideo(url: string): Promise<AnalysisResponse> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error: AnalysisError = await response.json();
    throw new Error(error.error || "Failed to analyze video");
  }

  return response.json();
}

export function useYouTubeAnalysis() {
  return useMutation({
    mutationFn: analyzeYouTubeVideo,
  });
}
