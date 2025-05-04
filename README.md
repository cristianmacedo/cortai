# YouTube Clip Analyzer

A Next.js application that analyzes YouTube videos and suggests the best moments to clip. The app uses the YouTube transcript API to analyze video content and identify interesting segments that would make good clips.

## Features

- Input any YouTube video URL
- Automatic analysis of video content
- Suggests clipable moments with timestamps
- Clean and modern UI with Tailwind CSS
- Real-time feedback and error handling

## Prerequisites

- Node.js 18.18.0 or higher
- npm or yarn package manager

## Getting Started

1. Clone the repository:

```bash
git clone <repository-url>
cd youtube-clip-analyzer
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## How It Works

1. The user inputs a YouTube video URL
2. The application extracts the video ID and fetches the video transcript
3. The transcript is analyzed to find interesting segments based on:
   - Segment duration (between 30 and 120 seconds)
   - Content length and quality
4. The app returns a list of suggested clips with timestamps and descriptions

## Technologies Used

- Next.js 14
- React
- TypeScript
- Tailwind CSS
- YouTube Transcript API

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
