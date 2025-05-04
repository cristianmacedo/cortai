import YouTubeClipAnalyzer from "@/components/YouTubeClipAnalyzer";

export default function Home() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <YouTubeClipAnalyzer />
    </main>
  );
}
