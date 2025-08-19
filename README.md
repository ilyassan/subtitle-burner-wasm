# SubtitleBurner: Professional Subtitle Burning, In Your Browser

[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

SubtitleBurner is a powerful, privacy-focused web application for burning subtitles directly into your videos. All processing is done 100% in your browser using WebAssembly, meaning your files never leave your computer.

**[➡️ Live Demo](https://ilyassan.github.io/subtitle-burner-wasm/)**

![SubtitleBurner Screenshot](https://ilyassan.github.io/subtitle-burner-wasm/hero-image.png)

## ✨ Key Features

*   **🔒 100% Private & Secure:** All video and subtitle processing happens locally in your browser. No uploads, no servers, no privacy concerns.
*   **🚀 High-Performance Processing:** Powered by FFmpeg compiled to WebAssembly for near-native speed.
*   **💡 Smart Optimization:** Automatically filters subtitles to match your video's duration, saving significant processing time.
*   **🎨 Advanced Styling & Control:**
    *   **Quick Start Mode:** For fast and easy subtitle burning.
    *   **Advanced Mode:** Fine-tune font size, color, position, outline, and more.
    *   Live preview of subtitle styles.
*   **⚙️ Professional Processing Options:** Control quality, compression (CRF), and processing threads for optimized output.
*   ** M Universal Compatibility:** Supports all major video formats and subtitle formats (SRT, VTT, ASS, SSA).
*   **📊 Performance Monitoring:** Keep an eye on memory usage during processing.

## 🛠️ How It Works

SubtitleBurner leverages the power of **FFmpeg**, the leading multimedia framework, compiled to **WebAssembly (WASM)**. This allows us to run complex video operations, which are traditionally server-side tasks, directly within your web browser.

The process is as follows:
1.  The Next.js application loads the FFmpeg.wasm core.
2.  You select your video and subtitle files.
3.  The application analyzes the video to get its duration and dimensions.
4.  Subtitles are parsed and optimized (filtered based on video duration).
5.  FFmpeg runs in a web worker to burn the subtitles into the video without blocking the UI.
6.  Once complete, you can preview and download the final video.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18 or later)
*   npm, yarn, or pnpm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/ilyassan/subtitle-burner-wasm.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Run the development server
    ```sh
    npm run dev
    ```
4.  Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

This project follows a feature-based architecture for scalability and maintainability.

```
src/
├── app/                # Next.js App Router pages
├── components/         # Shared UI components (built with shadcn/ui)
├── features/           # Feature-based modules (e.g., video-processing, ui)
│   └── video-processing/
│       ├── components/ # Components specific to video processing
│       ├── hooks/      # React hooks for the feature
│       ├── providers/  # Context providers for state management
│       └── types/      # TypeScript types for the feature
├── hooks/              # Global React hooks
├── lib/                # Utility functions and libraries
├── services/           # Core business logic (e.g., VideoProcessingService)
├── stores/             # Global state management with Zustand
└── types/              # Global TypeScript types
```

## 💻 Technologies Used

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Video Processing:** [FFmpeg.wasm](https://ffmpegwasm.netlify.app/)
*   **UI:** [React](https://reactjs.org/), [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the Apache License 2.0. See `LICENSE` for more information.