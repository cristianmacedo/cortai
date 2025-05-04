import { NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import OpenAI from "openai";
import { writeFile } from "fs/promises";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

interface ClipSuggestion {
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  confidence: number;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ClipSuggestionSchema = z.object({
  startTime: z.string(),
  endTime: z.string(),
  title: z.string(),
  description: z.string(),
  confidence: z.number(),
});
const ClipsSchema = z.object({
  clips: z.array(ClipSuggestionSchema),
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    // Extract video ID from URL
    const videoId = extractVideoId(url);
    if (!videoId) {
      return NextResponse.json(
        { error: "Invalid YouTube URL" },
        { status: 400 }
      );
    }

    // Get video transcript
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    // Format transcript for AI analysis (compact)
    const compactTranscript = transcript.map(
      (segment) => `[${formatTimestamp(segment.offset)}] ${segment.text}`
    );
    // .slice(0, 100); // Limit to first 50 segments to stay within token limits

    // Analyze transcript with OpenAI
    const suggestions = await analyzeTranscriptWithAI(compactTranscript);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Error analyzing video:", error);
    return NextResponse.json(
      { error: "Failed to analyze video" },
      { status: 500 }
    );
  }
}

function extractVideoId(url: string): string | null {
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

async function analyzeTranscriptWithAI(
  transcript: string[]
): Promise<ClipSuggestion[]> {
  const prompt = `Given this video transcript with timestamps, identify the 3-5 most interesting or important moments that would make good clips. For each moment, provide:
1. The start timestamp (when the interesting moment begins)
2. The end timestamp (when the interesting moment ends)
3. A catchy title
4. A brief description of why this moment is interesting
5. A confidence score between 0 and 1 (where 1 is very confident and 0 is not confident at all) for how suitable this moment is as a clip.

Ideally, each clip should be between 30-120 seconds long and should capture a complete thought or moment. In case of doubt, prefer a longer clip.
You may make the clips as long as you want, as long as they are interesting and capture a complete thought or moment.

Format the response as a JSON object with a 'clips' property, which is an array of objects with these properties:
{
  "startTime": "HH:MM:SS",
  "endTime": "HH:MM:SS",
  "title": "Catchy Title",
  "description": "Brief description",
  "confidence": 0.95
}

Here's the transcript:
${transcript.join("\n")}`;

  const response = await openai.responses.parse({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content:
          "You are a helpful assistant that analyzes video transcripts to find the most interesting moments for creating clips. Focus on moments that are engaging, informative, or emotionally impactful. Each clip should capture a complete thought or moment, typically between 15-60 seconds long.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    text: {
      format: zodTextFormat(ClipsSchema, "clips"),
    },
  });

  // Log the request and response
  const logData = {
    timestamp: new Date().toISOString(),
    prompt,
    transcript,
    openaiResponse: response,
  };
  const logFileName = `src/app/api/analyze/logs/openai-log-${Date.now()}.json`;
  writeFile(logFileName, JSON.stringify(logData, null, 2)).catch(() => {});

  if (!response.output_parsed || !response.output_parsed.clips) {
    return [];
  }
  return response.output_parsed.clips;
}

function formatTimestamp(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  const milliseconds = Math.round((seconds - Math.floor(seconds)) * 1000);

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds
    .toString()
    .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
}
