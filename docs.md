# FFmpeg WASM Complete Documentation
**The Ultimate AI Agent Reference for FFmpeg WASM v0.12.x**

## Table of Contents
1. [Project Overview](#project-overview)
2. [Current Version Used](#current-version-used)
3. [Project Structure & Packages](#project-structure--packages)
4. [Installation & Setup](#installation--setup)
5. [Architecture & How It Works](#architecture--how-it-works)
6. [Complete API Documentation](#complete-api-documentation)
7. [Performance Characteristics](#performance-characteristics)
8. [Usage Patterns & Examples](#usage-patterns--examples)
9. [Framework Examples](#framework-examples)
10. [Release History & Changelog](#release-history--changelog)
11. [Common Issues & Solutions](#common-issues--solutions)
12. [Migration Guide](#migration-guide)
13. [Best Practices](#best-practices)
14. [Development & Contribution](#development--contribution)
15. [Troubleshooting](#troubleshooting)
16. [Supported Codecs & Libraries](#supported-codecs--libraries)
17. [Community & Resources](#community--resources)

## Project Overview

FFmpeg WASM is a WebAssembly/JavaScript port of FFmpeg that enables video and audio processing directly in web browsers. It's a transpiled version of the original FFmpeg C source code using Emscripten, providing powerful multimedia processing capabilities without requiring server-side processing.

### Key Advantages
- **Security**: Data remains in the user's browser, never sent to remote servers
- **Client-side Computing**: Offloads multimedia processing from servers to clients
- **Browser Native**: Runs entirely inside web browsers without plugins
- **TypeScript Support**: Written in TypeScript for excellent developer experience
- **No Backend Required**: Eliminates the need for server-side video processing

### Limitations
- **Performance**: Significantly slower than native FFmpeg (0.04x to 0.08x speed)
- **Memory Constraints**: Maximum input file size is 2GB
- **Browser Only**: No Node.js support since version 0.12.0
- **Limited Network Support**: RTSP support is constrained due to WebAssembly socket limitations

## Current Version Used

This project uses the following FFmpeg WASM packages:

```json
{
  "@ffmpeg/core": "^0.12.6",
  "@ffmpeg/ffmpeg": "^0.12.10", 
  "@ffmpeg/util": "^0.12.1"
}
```

### CDN URLs Used
```javascript
coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js"
wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
```

## Project Structure & Packages

The FFmpeg WASM project is organized as a monorepo with the following packages:

### Core Packages
1. **@ffmpeg/core** - Single-thread WebAssembly core
2. **@ffmpeg/core-mt** - Multi-thread WebAssembly core  
3. **@ffmpeg/ffmpeg** - Main JavaScript/TypeScript API
4. **@ffmpeg/util** - Utility functions for file handling
5. **@ffmpeg/types** - TypeScript type definitions

### Repository Structure
```
packages/
├── core/           # Single-thread WASM core
├── core-mt/        # Multi-thread WASM core
├── ffmpeg/         # Main API package
├── util/           # Utility functions
└── types/          # TypeScript definitions

apps/               # Example applications
├── angular/        # Angular example
├── nextjs/         # Next.js example
├── react-vite/     # React + Vite example
├── solidstart/     # SolidStart example
├── sveltekit/      # SvelteKit example
├── vanilla/        # Vanilla JavaScript example
├── vue-vite/       # Vue + Vite example
└── website/        # Documentation website
```

### Project Statistics (as of v0.12.0)
- **16.2k+ GitHub Stars**
- **72+ Contributors** 
- **4.1k+ Projects Using It**
- **2.3M+ Downloads**
- **600+ Forks**

## Installation & Setup

### Package Installation

Install via npm or yarn:

```bash
npm install @ffmpeg/ffmpeg @ffmpeg/util
# or
yarn add @ffmpeg/ffmpeg @ffmpeg/util
```

### Important Notes
- **Browser Only**: FFmpeg WASM only supports running in browsers
- **No CDN Import**: Cannot be imported directly from CDN due to web worker constraints
- **Self-Hosting Recommended**: Download and host files on your own server for production

### Basic Setup

```javascript
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const ffmpeg = new FFmpeg()

// Load FFmpeg core
await ffmpeg.load({
  coreURL: await toBlobURL('/core/ffmpeg-core.js', 'text/javascript'),
  wasmURL: await toBlobURL('/core/ffmpeg-core.wasm', 'application/wasm')
})
```

## Architecture & How It Works

### Core Components

1. **@ffmpeg/ffmpeg**: Main package providing the FFmpeg class and API
2. **@ffmpeg/core**: Single-thread WebAssembly core
3. **@ffmpeg/core-mt**: Multi-thread WebAssembly core (optional)
4. **@ffmpeg/util**: Utility functions for file handling

### Processing Flow

1. **Initialization**: Load WebAssembly core into memory
2. **File Management**: Write input files to virtual file system
3. **Processing**: Execute FFmpeg commands via `exec()`
4. **Output**: Read processed files from virtual file system
5. **Cleanup**: Manage memory and dispose of resources

### Virtual File System

FFmpeg WASM uses a virtual file system to manage files:

```javascript
// Write file to virtual FS
await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))

// Execute FFmpeg command
await ffmpeg.exec(['-i', 'input.mp4', 'output.webm'])

// Read output file
const data = await ffmpeg.readFile('output.webm')
```

## Complete API Documentation

### FFmpeg Class (Source Code Analysis)

Based on the actual source code from `packages/ffmpeg/src/classes.ts`, the FFmpeg class provides a comprehensive WebAssembly-based interface:

#### Key Methods Overview
1. **`load()`** - Initializes the FFmpeg WebAssembly core
2. **`exec()`** - Runs FFmpeg commands  
3. **`ffprobe()`** - Executes FFprobe commands
4. **File System Methods**:
   - `writeFile()` - Write data to virtual FS
   - `readFile()` - Read data from virtual FS
   - `deleteFile()` - Delete files from virtual FS
   - `createDir()` - Create directories
   - `listDir()` - List directory contents
   - `deleteDir()` - Delete directories
5. **Event System**: `on()` and `off()` methods for logs and progress
6. **Advanced Features**:
   - Transferable file operations
   - Abort signal support
   - Worker-based asynchronous processing

### FFmpeg Class (Detailed)

#### Constructor
```javascript
const ffmpeg = new FFmpeg()
```

#### Core Methods

##### `load(options?)`
Loads the FFmpeg WebAssembly core.

```javascript
await ffmpeg.load({
  coreURL: string,
  wasmURL: string,
  workerURL?: string
})
```

##### `exec(args)`
Executes FFmpeg commands.

```javascript
await ffmpeg.exec(['-i', 'input.mp4', '-c:v', 'libx264', 'output.mp4'])
```

##### `writeFile(path, data)`
Writes data to the virtual file system.

```javascript
await ffmpeg.writeFile('input.mp4', new Uint8Array(buffer))
```

##### `readFile(path)`
Reads data from the virtual file system.

```javascript
const data = await ffmpeg.readFile('output.mp4') // Returns Uint8Array
```

##### `deleteFile(path)`
Deletes a file from the virtual file system.

```javascript
await ffmpeg.deleteFile('temp.mp4')
```

##### `terminate()`
Terminates the FFmpeg instance and cleans up resources.

```javascript
ffmpeg.terminate()
```

#### Event System

##### Log Events
```javascript
ffmpeg.on('log', ({ type, message }) => {
  console.log(`[${type}] ${message}`)
})
```

##### Progress Events
```javascript
ffmpeg.on('progress', ({ progress, time }) => {
  console.log(`Progress: ${progress * 100}%`)
})
```

### Utility Functions (@ffmpeg/util)

##### `fetchFile(input)`
Converts various input types to Uint8Array.

```javascript
const data = await fetchFile('https://example.com/video.mp4')
const data = await fetchFile(fileObject)
const data = await fetchFile(blob)
```

##### `toBlobURL(url, mimeType)`
Downloads and converts to blob URL for CORS handling.

```javascript
const blobURL = await toBlobURL('/path/to/file.js', 'text/javascript')
```

## Performance Characteristics

### Benchmark Results
Based on official testing (11th Gen Intel Core i5, 15.6 GiB RAM, Manjaro Linux, Chrome):

| Version | Average Time | Relative Speed |
|---------|-------------|----------------|
| Native FFmpeg | 5.2 seconds | 1.0x (baseline) |
| ffmpeg.wasm (single-thread) | 128.8 seconds | 0.04x |
| ffmpeg.wasm (multi-thread) | 60.4 seconds | 0.08x |

### Performance Considerations

1. **Multi-threading**: Provides ~2x performance improvement but uses more resources
2. **Memory Usage**: Monitor and manage memory consumption carefully
3. **File Size**: Larger files exponentially increase processing time
4. **Browser Variations**: Performance varies across different browsers

### Optimization Tips

1. **Use Multi-thread Core** when possible for better performance
2. **Process in Chunks** for large files to avoid memory issues
3. **Cleanup Regularly** to prevent memory leaks
4. **Use Appropriate Codecs** - some are faster than others in WASM
5. **Reduce Quality Settings** for faster processing when quality isn't critical

## Usage Patterns & Examples

### Basic Video Conversion

```javascript
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

const ffmpeg = new FFmpeg()

// Setup logging
ffmpeg.on('log', ({ message }) => {
  console.log(message)
})

// Setup progress tracking
ffmpeg.on('progress', ({ progress }) => {
  console.log(`Progress: ${Math.round(progress * 100)}%`)
})

// Load FFmpeg
await ffmpeg.load()

// Write input file
await ffmpeg.writeFile('input.webm', await fetchFile(videoFile))

// Convert video
await ffmpeg.exec(['-i', 'input.webm', 'output.mp4'])

// Read output
const data = await ffmpeg.readFile('output.mp4')
const url = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
```

## Framework Examples

The FFmpeg WASM project provides comprehensive examples for all major web frameworks:

### Available Framework Examples

1. **Vanilla JavaScript** - Pure JS implementation
2. **React + Vite** - React with Vite bundler (multithread)
3. **Vue + Vite** - Vue.js with Vite bundler (multithread) 
4. **Angular** - Angular framework (multithread)
5. **Next.js** - Next.js React framework (single thread)
6. **SvelteKit + Vite** - Svelte with SvelteKit (multithread)
7. **SolidStart + Vite** - SolidJS with SolidStart (multithread)

### Framework-Specific Considerations

#### Next.js Implementation
```javascript
// Next.js specific setup (single-thread)
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

const ffmpeg = new FFmpeg()

// Single-thread core for Next.js compatibility
await ffmpeg.load({
  coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
  wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm')
})
```

#### Vite-based Frameworks (React, Vue, Svelte, Solid)
```javascript
// Multi-thread setup for Vite-based frameworks
await ffmpeg.load({
  coreURL: await toBlobURL('/ffmpeg-core.js', 'text/javascript'),
  wasmURL: await toBlobURL('/ffmpeg-core.wasm', 'application/wasm'),
  workerURL: await toBlobURL('/ffmpeg-core.worker.js', 'text/javascript')
})
```

### Important Build Notes
- Always run `npm run build` in the root repository before trying examples
- Multi-thread examples require proper CORS headers
- Some frameworks may require additional webpack configuration

## Release History & Changelog

### Version 0.12.0 Release (July 26, 2023) - Major Release

**Project Maintainer**: Jerome Wu

#### Major Improvements in v0.12.0:
- **Emscripten Upgrade**: Updated to 3.1.40
- **FFmpeg Upgrade**: Updated to n5.1.3
- **TypeScript Rewrite**: Complete library rewrite in TypeScript
- **Web Worker Support**: Official Web Worker integration
- **Multi-thread Support**: Official multi-threading capabilities
- **Monorepo Structure**: Merged repositories into single monorepo
- **Enhanced Documentation**: Comprehensive documentation overhaul

#### Breaking Changes in v0.12.0:
- **Not backward compatible** with 0.11.x
- Complete API redesign (see Migration Guide)
- New import structure and method names
- Event handling system changes

### Recent Releases (v0.12.1 - v0.12.15)

#### Version 0.12.15 (January 7, 2024)
- Exports worker from ffmpeg package
- Added SolidStart/Vite app example
- Fixed SvelteKit example URL
- Exported types within @ffmpeg/ffmpeg

#### Key Features Added Since v0.12.0:
- **ffprobe Support**: Exposed `ffprobe` functionality
- **Node.js Import**: Added support for Node.js import
- **libzimg**: Enabled libzimg library
- **Abort Signal**: Added abort signal functionality
- **WORKERFS Support**: Added WORKERFS support
- **Framework Examples**: Multiple framework implementations

### Version Compatibility Matrix

| Version | FFmpeg | Emscripten | Node.js Support | Breaking Changes |
|---------|--------|------------|----------------|------------------|
| 0.11.x | n4.4.0 | 2.x | ✅ Yes | - |
| 0.12.0 | n5.1.3 | 3.1.40 | ❌ No | Major API rewrite |
| 0.12.1+ | n5.1.3 | 3.1.40 | ❌ No | Minor improvements |

### Future Roadmap (from v0.12.0 release notes)
- **RTSP Protocol Support**: Working towards RTSP streaming
- **Performance Optimization**: Continued performance improvements  
- **Additional Libraries**: Integration of more multimedia libraries
- **Production-Grade Stability**: Moving towards production readiness

### Adding Subtitles to Video

```javascript
// Write video and subtitle files
await ffmpeg.writeFile('video.mp4', await fetchFile(videoFile))
await ffmpeg.writeFile('subtitles.srt', await fetchFile(subtitleFile))

// Burn subtitles into video
await ffmpeg.exec([
  '-i', 'video.mp4',
  '-vf', `subtitles=subtitles.srt:force_style='FontSize=24,PrimaryColour=&Hffffff'`,
  '-c:a', 'copy',
  'output.mp4'
])

const output = await ffmpeg.readFile('output.mp4')
```

### Video Transcoding with Quality Settings

```javascript
// High quality encoding
await ffmpeg.exec([
  '-i', 'input.mp4',
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '18',
  '-c:a', 'copy',
  'output_high.mp4'
])

// Fast encoding (lower quality)
await ffmpeg.exec([
  '-i', 'input.mp4',
  '-c:v', 'libx264',
  '-preset', 'ultrafast',
  '-crf', '28',
  '-c:a', 'copy',
  'output_fast.mp4'
])
```

### Multi-threaded Processing

```javascript
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

const ffmpeg = new FFmpeg()

// Load multi-threaded core
await ffmpeg.load({
  coreURL: await toBlobURL('/core-mt/ffmpeg-core.js', 'text/javascript'),
  wasmURL: await toBlobURL('/core-mt/ffmpeg-core.wasm', 'application/wasm'),
  workerURL: await toBlobURL('/core-mt/ffmpeg-core.worker.js', 'text/javascript')
})
```

### Progress Tracking Implementation

```javascript
let currentProgress = 0

ffmpeg.on('progress', ({ progress, time }) => {
  // Progress is a value between 0 and 1
  currentProgress = Math.round(progress * 100)
  
  // Update UI
  updateProgressBar(currentProgress)
  
  // Log time information
  console.log(`Processed: ${time.toFixed(2)}s`)
})

ffmpeg.on('log', ({ type, message }) => {
  if (type === 'fferr') {
    // Parse FFmpeg stderr for additional progress info
    const timeMatch = message.match(/time=(\d{2}:\d{2}:\d{2}\.\d{2})/)
    if (timeMatch) {
      console.log(`Current time: ${timeMatch[1]}`)
    }
  }
})
```

### Memory Management

```javascript
class FFmpegProcessor {
  constructor() {
    this.ffmpeg = new FFmpeg()
    this.setupCleanup()
  }

  setupCleanup() {
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.cleanup()
    })
  }

  async processVideo(videoFile) {
    try {
      await this.ffmpeg.load()
      
      // Process video
      await this.ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      await this.ffmpeg.exec(['-i', 'input.mp4', 'output.webm'])
      
      const output = await this.ffmpeg.readFile('output.webm')
      
      // Cleanup intermediate files
      await this.ffmpeg.deleteFile('input.mp4')
      await this.ffmpeg.deleteFile('output.webm')
      
      return output
    } catch (error) {
      console.error('Processing failed:', error)
      throw error
    } finally {
      // Always cleanup
      this.cleanup()
    }
  }

  cleanup() {
    if (this.ffmpeg) {
      this.ffmpeg.terminate()
    }
  }
}
```

## Common Issues & Solutions

### 1. Cancellation and Termination Issues

**Problem**: Process hangs when trying to cancel or terminate
```javascript
// ❌ Problematic approach
ffmpeg.terminate() // May not properly clean up
```

**Solution**: Proper cancellation handling
```javascript
// ✅ Correct approach
try {
  ffmpeg.terminate()
} catch (error) {
  // terminate() always throws "Error: called FFmpeg.terminate()" by design
  if (error.message === 'called FFmpeg.terminate()') {
    console.log('FFmpeg terminated successfully')
  } else {
    console.error('Unexpected termination error:', error)
  }
}

// Reinitialize after termination
await ffmpeg.load() // Required after terminate()
```

### 2. Memory Issues and Large Files

**Problem**: Browser crashes or "out of memory" errors with large files

**Solutions**:
```javascript
// Monitor memory usage
function getMemoryUsage() {
  if (performance.memory) {
    return {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    }
  }
  return null
}

// Process in segments for large files
async function processLargeVideo(videoFile, segmentDuration = 30) {
  const videoDuration = await getVideoDuration(videoFile)
  const segments = Math.ceil(videoDuration / segmentDuration)
  const results = []

  for (let i = 0; i < segments; i++) {
    const startTime = i * segmentDuration
    const endTime = Math.min((i + 1) * segmentDuration, videoDuration)
    
    // Process segment
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-ss', startTime.toString(),
      '-t', (endTime - startTime).toString(),
      '-c', 'copy',
      `segment_${i}.mp4`
    ])
    
    const segmentData = await ffmpeg.readFile(`segment_${i}.mp4`)
    results.push(segmentData)
    
    // Cleanup immediately
    await ffmpeg.deleteFile(`segment_${i}.mp4`)
    
    // Force garbage collection if available
    if (window.gc) window.gc()
  }
  
  return results
}
```

### 3. Progress Tracking Issues

**Problem**: Inconsistent or missing progress updates

**Solution**: Comprehensive progress tracking
```javascript
class ProgressTracker {
  constructor() {
    this.videoDuration = 0
    this.currentProgress = 0
  }

  setupProgressTracking(ffmpeg, videoDuration) {
    this.videoDuration = videoDuration

    ffmpeg.on('log', ({ message }) => {
      // Parse time from FFmpeg log
      const timeMatch = message.match(/time=(\d{2}:\d{2}:\d{2}[\.,]\d{2,3})/)
      if (timeMatch) {
        const processedTime = this.parseTime(timeMatch[1])
        const progress = (processedTime / this.videoDuration) * 100
        this.updateProgress(Math.min(progress, 100))
      }
    })

    ffmpeg.on('progress', ({ progress }) => {
      // Official progress event (may not always work)
      this.updateProgress(progress * 100)
    })
  }

  parseTime(timeStr) {
    const parts = timeStr.replace(',', '.').split(':')
    return parseInt(parts[0]) * 3600 + 
           parseInt(parts[1]) * 60 + 
           parseFloat(parts[2])
  }

  updateProgress(progress) {
    this.currentProgress = progress
    // Update UI
    this.onProgressUpdate?.(progress)
  }
}
```

### 4. Multi-threading Problems

**Problem**: Multi-threaded core hangs or fails to load

**Solutions**:
```javascript
// Detect multi-threading support
function supportsMultithreading() {
  return typeof SharedArrayBuffer !== 'undefined' && 
         typeof Worker !== 'undefined'
}

// Fallback loading strategy
async function loadFFmpegWithFallback() {
  const ffmpeg = new FFmpeg()
  
  try {
    if (supportsMultithreading()) {
      // Try multi-threaded first
      await ffmpeg.load({
        coreURL: await toBlobURL('/core-mt/ffmpeg-core.js', 'text/javascript'),
        wasmURL: await toBlobURL('/core-mt/ffmpeg-core.wasm', 'application/wasm'),
        workerURL: await toBlobURL('/core-mt/ffmpeg-core.worker.js', 'text/javascript')
      })
      console.log('Loaded multi-threaded core')
    } else {
      throw new Error('Multi-threading not supported')
    }
  } catch (error) {
    console.warn('Multi-threaded core failed, falling back to single-thread:', error)
    
    // Fallback to single-threaded
    await ffmpeg.load({
      coreURL: await toBlobURL('/core/ffmpeg-core.js', 'text/javascript'),
      wasmURL: await toBlobURL('/core/ffmpeg-core.wasm', 'application/wasm')
    })
    console.log('Loaded single-threaded core')
  }
  
  return ffmpeg
}
```

### 5. File Format Compatibility

**Problem**: Certain file formats not supported or causing errors

**Solution**: Format validation and conversion
```javascript
const SUPPORTED_INPUT_FORMATS = ['mp4', 'webm', 'avi', 'mov', 'mkv', 'flv']
const SUPPORTED_OUTPUT_FORMATS = ['mp4', 'webm', 'avi']

function validateFileFormat(fileName, supportedFormats) {
  const extension = fileName.split('.').pop().toLowerCase()
  return supportedFormats.includes(extension)
}

async function convertToSupportedFormat(inputFile) {
  if (!validateFileFormat(inputFile.name, SUPPORTED_INPUT_FORMATS)) {
    throw new Error(`Unsupported input format: ${inputFile.name}`)
  }

  // Convert to MP4 if not already
  if (!inputFile.name.toLowerCase().endsWith('.mp4')) {
    await ffmpeg.writeFile('input_original', await fetchFile(inputFile))
    await ffmpeg.exec(['-i', 'input_original', '-c:v', 'libx264', '-c:a', 'aac', 'input.mp4'])
    await ffmpeg.deleteFile('input_original')
  } else {
    await ffmpeg.writeFile('input.mp4', await fetchFile(inputFile))
  }
}
```

### 6. Browser Compatibility Issues

**Problem**: Different behavior across browsers

**Solution**: Browser-specific handling
```javascript
function getBrowserInfo() {
  const userAgent = navigator.userAgent
  return {
    isChrome: /Chrome/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    isEdge: /Edg/.test(userAgent)
  }
}

function getOptimalSettings() {
  const browser = getBrowserInfo()
  
  if (browser.isFirefox) {
    return {
      preset: 'fast',
      crf: 25,
      threads: 1 // Firefox may have threading issues
    }
  } else if (browser.isSafari) {
    return {
      preset: 'medium',
      crf: 23,
      threads: 2 // Conservative threading
    }
  } else {
    return {
      preset: 'medium',
      crf: 23,
      threads: 0 // Auto-detect
    }
  }
}
```

## Migration Guide

### From Version 0.11.x to 0.12+

Version 0.12+ is **not backward compatible** with 0.11.x. Key changes:

#### Import Changes
```javascript
// ❌ Old (0.11.x)
import { createFFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/ffmpeg'

// ✅ New (0.12+)
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'
```

#### Instance Creation
```javascript
// ❌ Old
const ffmpeg = createFFmpeg({
  log: true,
  corePath: '/core/ffmpeg-core.js'
})

// ✅ New
const ffmpeg = new FFmpeg()
await ffmpeg.load({
  coreURL: '/core/ffmpeg-core.js',
  wasmURL: '/core/ffmpeg-core.wasm'
})
```

#### Method Changes
```javascript
// ❌ Old
await ffmpeg.run('-i', 'input.mp4', 'output.webm')
ffmpeg.FS.writeFile('input.mp4', data)
const output = ffmpeg.FS.readFile('output.webm')
ffmpeg.exit()

// ✅ New
await ffmpeg.exec(['-i', 'input.mp4', 'output.webm'])
await ffmpeg.writeFile('input.mp4', data)
const output = await ffmpeg.readFile('output.webv')
ffmpeg.terminate()
```

#### Event Handling
```javascript
// ❌ Old
ffmpeg.setLogger(({ type, message }) => {
  console.log(`[${type}] ${message}`)
})
ffmpeg.setProgress(({ ratio }) => {
  console.log(`Progress: ${ratio * 100}%`)
})

// ✅ New
ffmpeg.on('log', ({ type, message }) => {
  console.log(`[${type}] ${message}`)
})
ffmpeg.on('progress', ({ progress }) => {
  console.log(`Progress: ${progress * 100}%`)
})
```

### Migration Checklist

1. ✅ Update package imports
2. ✅ Change instance creation to `new FFmpeg()`
3. ✅ Move initialization options to `load()` method
4. ✅ Update all method calls (`run` → `exec`, `FS.*` → direct methods)
5. ✅ Update event handling (`setLogger`/`setProgress` → `on()`)
6. ✅ Change `exit()` to `terminate()`
7. ✅ Update utility imports to `@ffmpeg/util`

## Development & Contribution

### Building from Source

#### Prerequisites
- **Docker 23.0+** (required for builds)
- **Make** (build tool)
- **Node.js & npm** (for development)

#### Core Package Building (@ffmpeg/core)

Build times are approximately **1 hour** for each build, but subsequent builds are faster due to cached layers.

```bash
# Development builds
make dev          # Single-thread development build
make dev-mt       # Multi-thread development build

# Production builds  
make prd          # Single-thread production build
make prd-mt       # Multi-thread production build
```

**Output Locations**:
- Single-thread builds: `/packages/core`
- Multi-thread builds: `/packages/core-mt`

#### FFmpeg Package Development (@ffmpeg/ffmpeg)

```bash
cd packages/ffmpeg

# Development commands
npm run dev       # Development mode with hot reload
npm run build     # Transpile TypeScript to JavaScript
npm run lint      # Code linting
npm publish       # Publish package
```

#### Util Package Development (@ffmpeg/util)

```bash
cd packages/util

# Development commands
npm run dev       # Development mode
npm run build     # Transpile TypeScript to JavaScript  
npm run lint      # Code linting
npm publish       # Publish package
```

### Contribution Guidelines

#### Project Status
- **Seeking Maintainers**: The project is actively looking for maintainers
- **Contact**: jeromewus@gmail.com for maintainer inquiries
- **License**: MIT (open source)
- **Community**: Active Discord server and GitHub discussions

#### Package Structure
The project follows a monorepo structure with packages in `/packages/`:

```
packages/
├── core/           # WebAssembly core (single-thread)
├── core-mt/        # WebAssembly core (multi-thread)  
├── ffmpeg/         # Main API and TypeScript interface
├── util/           # Utility functions (fetchFile, toBlobURL, etc.)
└── types/          # TypeScript type definitions
```

#### Development Workflow
1. **Fork the repository** from GitHub
2. **Set up the environment** with Docker and Make
3. **Make changes** in the appropriate package
4. **Build and test** your changes
5. **Submit a pull request** with clear description

#### Testing Examples
Before contributing, run the example applications:

```bash
# Build all packages first
npm run build

# Test examples (choose framework)
cd apps/react-vite && npm run dev
cd apps/vue-vite && npm run dev  
cd apps/angular && npm run dev
cd apps/nextjs && npm run dev
```

## Best Practices

### 1. Resource Management

```javascript
class FFmpegManager {
  constructor() {
    this.ffmpeg = null
    this.isLoaded = false
  }

  async initialize() {
    if (this.isLoaded) return

    this.ffmpeg = new FFmpeg()
    await this.ffmpeg.load()
    this.isLoaded = true

    // Setup error handling
    this.ffmpeg.on('log', ({ type, message }) => {
      if (type === 'fferr') {
        console.error('FFmpeg error:', message)
      }
    })
  }

  async process(inputFile, commands) {
    if (!this.isLoaded) {
      await this.initialize()
    }

    try {
      // Process file
      await this.ffmpeg.writeFile('input', await fetchFile(inputFile))
      await this.ffmpeg.exec(commands)
      const output = await this.ffmpeg.readFile('output')
      
      return output
    } finally {
      // Always cleanup
      await this.cleanup()
    }
  }

  async cleanup() {
    if (this.ffmpeg) {
      try {
        // Clean up any remaining files
        const files = ['input', 'output', 'temp']
        for (const file of files) {
          try {
            await this.ffmpeg.deleteFile(file)
          } catch {} // Ignore errors for non-existent files
        }
      } catch (error) {
        console.warn('Cleanup error:', error)
      }
    }
  }

  dispose() {
    if (this.ffmpeg) {
      this.ffmpeg.terminate()
      this.ffmpeg = null
      this.isLoaded = false
    }
  }
}
```

### 2. Error Handling

```javascript
async function robustProcessing(ffmpeg, inputFile, commands) {
  const maxRetries = 3
  let lastError

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await ffmpeg.writeFile('input', await fetchFile(inputFile))
      await ffmpeg.exec(commands)
      return await ffmpeg.readFile('output')
    } catch (error) {
      lastError = error
      console.warn(`Attempt ${attempt} failed:`, error.message)

      if (attempt < maxRetries) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        
        // Reinitialize if needed
        if (error.message.includes('terminate')) {
          await ffmpeg.load()
        }
      }
    }
  }

  throw new Error(`Processing failed after ${maxRetries} attempts: ${lastError.message}`)
}
```

### 3. Performance Optimization

```javascript
// Optimize FFmpeg arguments based on use case
function getOptimizedArgs(inputFormat, outputFormat, quality = 'balanced') {
  const baseArgs = ['-i', 'input']
  
  // Video codec selection
  if (outputFormat === 'mp4') {
    baseArgs.push('-c:v', 'libx264')
  } else if (outputFormat === 'webm') {
    baseArgs.push('-c:v', 'libvpx-vp9')
  }

  // Quality settings
  switch (quality) {
    case 'fast':
      baseArgs.push('-preset', 'ultrafast', '-crf', '28')
      break
    case 'balanced':
      baseArgs.push('-preset', 'medium', '-crf', '23')
      break
    case 'high':
      baseArgs.push('-preset', 'slow', '-crf', '18')
      break
  }

  // Audio handling
  baseArgs.push('-c:a', 'copy') // Copy audio without re-encoding

  // Output
  baseArgs.push(`output.${outputFormat}`)

  return baseArgs
}
```

### 4. Progress Tracking

```javascript
class ProgressManager {
  constructor() {
    this.callbacks = new Set()
    this.currentProgress = 0
  }

  subscribe(callback) {
    this.callbacks.add(callback)
    return () => this.callbacks.delete(callback)
  }

  updateProgress(progress, phase, message) {
    this.currentProgress = progress
    this.callbacks.forEach(callback => {
      try {
        callback({ progress, phase, message })
      } catch (error) {
        console.error('Progress callback error:', error)
      }
    })
  }

  setupFFmpegProgress(ffmpeg, videoDuration) {
    ffmpeg.on('log', ({ message }) => {
      const timeMatch = message.match(/time=(\d{2}:\d{2}:\d{2}[\.,]\d{2,3})/)
      if (timeMatch && videoDuration > 0) {
        const currentTime = this.parseTime(timeMatch[1])
        const progress = Math.min((currentTime / videoDuration) * 100, 100)
        this.updateProgress(progress, 'processing', `${currentTime.toFixed(1)}s / ${videoDuration.toFixed(1)}s`)
      }
    })
  }

  parseTime(timeStr) {
    const parts = timeStr.replace(',', '.').split(':')
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2])
  }
}
```

## Troubleshooting

## Comprehensive Error Documentation

This section covers ALL known FFmpeg WASM errors with detailed causes and solutions based on community reports and GitHub issues.

### File System Errors

#### "ErrnoError: FS error"
**Cause**: One of the most common FFmpeg WASM errors, typically caused by incorrect command format or file system issues.

**Common Causes & Solutions**:

1. **Incorrect exec() Command Format** (Most Common)
```javascript
// ❌ Wrong - Missing square brackets
await ffmpeg.exec('-i', 'input.webm', '-c:v', 'copy', 'output.webm')

// ✅ Correct - Use array format
await ffmpeg.exec(['-i', 'input.webm', '-c:v', 'copy', 'output.webm'])
```

2. **File Format Issues**
```javascript
// ❌ Problematic - WebM format issues reported
await ffmpeg.exec(['-i', 'recorded.webv', 'output.webm'])

// ✅ Solution - Switch to MP4 format
await ffmpeg.exec(['-i', 'recorded.webm', '-c:v', 'libx264', '-c:a', 'aac', 'output.mp4'])
```

3. **File System Mounting Problems**
```javascript
// ❌ Problematic mounting
try {
  await ffmpeg.mount('WORKERFS', { files: [videoFile] }, '/mounted')
} catch (error) {
  console.error('Mount failed:', error)
  // Use alternative approach
  await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
}
```

4. **Migration-Related Issues**
```javascript
// ❌ Old v0.11.x syntax
ffmpeg.FS.writeFile('input.mp4', data)
ffmpeg.FS.readFile('output.mp4')

// ✅ New v0.12.x syntax
await ffmpeg.writeFile('input.mp4', data)
await ffmpeg.readFile('output.mp4')
```

5. **Debugging Steps**
```javascript
// Comprehensive error handling for FS errors
async function safeFFmpegOperation() {
  try {
    // Ensure FFmpeg is loaded
    if (!ffmpeg.loaded) {
      await ffmpeg.load()
    }
    
    // Verify file exists before processing
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
    
    // Use correct array format
    await ffmpeg.exec(['-i', 'input.mp4', 'output.mp4'])
    
    const output = await ffmpeg.readFile('output.mp4')
    return output
  } catch (error) {
    if (error.message.includes('FS error')) {
      console.error('File system error - check command format and file existence')
      // Try with different format or smaller file
    }
    throw error
  }
}
```

### Memory Errors

#### "ERR_OUT_OF_MEMORY" / "WebAssembly.Memory(): could not allocate memory"
**Cause**: Memory exhaustion due to large files or multiple instances.

**Solutions**:

1. **Memory Management**
```javascript
class FFmpegMemoryManager {
  constructor() {
    this.ffmpeg = null
    this.memoryLimit = 500 * 1024 * 1024 // 500MB
  }

  async processWithMemoryCheck(videoFile) {
    // Check available memory
    if (performance.memory) {
      const usage = performance.memory.usedJSHeapSize
      const limit = performance.memory.jsHeapSizeLimit
      
      if (usage > limit * 0.8) {
        throw new Error('Insufficient memory available')
      }
    }

    try {
      this.ffmpeg = new FFmpeg()
      await this.ffmpeg.load()
      
      // Process file
      await this.ffmpeg.writeFile('input', await fetchFile(videoFile))
      await this.ffmpeg.exec(['-i', 'input', 'output'])
      
      return await this.ffmpeg.readFile('output')
    } finally {
      // Critical: Always cleanup
      if (this.ffmpeg) {
        this.ffmpeg.terminate()
        this.ffmpeg = null
      }
      
      // Force garbage collection if available
      if (window.gc) window.gc()
    }
  }
}
```

2. **Chunked Processing for Large Files**
```javascript
async function processLargeFile(videoFile) {
  const maxChunkSize = 100 * 1024 * 1024 // 100MB chunks
  
  if (videoFile.size > maxChunkSize) {
    // Process in segments
    const duration = await getVideoDuration(videoFile)
    const segmentDuration = 30 // 30 seconds per segment
    const segments = Math.ceil(duration / segmentDuration)
    
    const results = []
    for (let i = 0; i < segments; i++) {
      const startTime = i * segmentDuration
      const endTime = Math.min((i + 1) * segmentDuration, duration)
      
      const ffmpeg = new FFmpeg()
      try {
        await ffmpeg.load()
        await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
        
        await ffmpeg.exec([
          '-i', 'input.mp4',
          '-ss', startTime.toString(),
          '-t', (endTime - startTime).toString(),
          '-c', 'copy',
          `segment_${i}.mp4`
        ])
        
        results.push(await ffmpeg.readFile(`segment_${i}.mp4`))
      } finally {
        ffmpeg.terminate()
      }
    }
    
    return results
  }
  
  // Process normally for smaller files
  return processNormalFile(videoFile)
}
```

3. **Mobile Device Handling**
```javascript
function detectMobileDevice() {
  return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

async function adaptiveProcessing(videoFile) {
  const isMobile = detectMobileDevice()
  
  if (isMobile) {
    // Use single-threaded core with reduced memory
    await ffmpeg.load({
      coreURL: '/core/ffmpeg-core.js',
      wasmURL: '/core/ffmpeg-core.wasm'
      // No workerURL for single-thread
    })
    
    // Use faster, lower quality settings for mobile
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-vf', 'scale=640:480', // Reduce resolution
      'output.mp4'
    ])
  } else {
    // Use full quality processing for desktop
    await ffmpeg.load({
      coreURL: '/core-mt/ffmpeg-core.js',
      wasmURL: '/core-mt/ffmpeg-core.wasm',
      workerURL: '/core-mt/ffmpeg-core.worker.js'
    })
  }
}
```

### SharedArrayBuffer and Threading Errors

#### "SharedArrayBuffer is not defined" / "ReferenceError: SharedArrayBuffer is not defined"
**Cause**: Missing cross-origin isolation headers required for SharedArrayBuffer.

**Solutions**:

1. **Server Header Configuration**
```nginx
# Nginx configuration
add_header Cross-Origin-Opener-Policy same-origin;
add_header Cross-Origin-Embedder-Policy require-corp;
```

```apache
# Apache configuration
Header always set Cross-Origin-Opener-Policy same-origin
Header always set Cross-Origin-Embedder-Policy require-corp
```

2. **Service Worker Solution (for GitHub Pages, Netlify, etc.)**
```javascript
// Install coi-serviceworker for platforms without header control
import 'coi-serviceworker'

// Or manual implementation
if (!crossOriginIsolated) {
  // Fallback to single-threaded mode
  await ffmpeg.load({
    coreURL: '/core/ffmpeg-core.js',
    wasmURL: '/core/ffmpeg-core.wasm'
    // No workerURL - single threaded
  })
} else {
  // Use multi-threaded version
  await ffmpeg.load({
    coreURL: '/core-mt/ffmpeg-core.js',
    wasmURL: '/core-mt/ffmpeg-core.wasm',
    workerURL: '/core-mt/ffmpeg-core.worker.js'
  })
}
```

3. **Progressive Enhancement**
```javascript
function getFFmpegConfig() {
  const supportsSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined'
  const supportsWorkers = typeof Worker !== 'undefined'
  const isCrossOriginIsolated = crossOriginIsolated
  
  if (supportsSharedArrayBuffer && supportsWorkers && isCrossOriginIsolated) {
    return {
      type: 'multithread',
      coreURL: '/core-mt/ffmpeg-core.js',
      wasmURL: '/core-mt/ffmpeg-core.wasm',
      workerURL: '/core-mt/ffmpeg-core.worker.js'
    }
  } else {
    return {
      type: 'singlethread',
      coreURL: '/core/ffmpeg-core.js',
      wasmURL: '/core/ffmpeg-core.wasm'
    }
  }
}
```

### Initialization Errors

#### "Module is not loaded" / "load() not called"
**Cause**: Attempting to use FFmpeg before proper initialization.

**Solutions**:

1. **Proper Initialization Pattern**
```javascript
class FFmpegManager {
  constructor() {
    this.ffmpeg = new FFmpeg()
    this.isLoaded = false
  }

  async ensureLoaded() {
    if (!this.isLoaded) {
      await this.ffmpeg.load()
      this.isLoaded = true
    }
  }

  async process(videoFile, commands) {
    await this.ensureLoaded()
    
    // Now safe to use FFmpeg
    await this.ffmpeg.writeFile('input', await fetchFile(videoFile))
    await this.ffmpeg.exec(commands)
    return await this.ffmpeg.readFile('output')
  }
}
```

2. **Async/Await Error Handling**
```javascript
async function robustFFmpegInit() {
  const ffmpeg = new FFmpeg()
  
  try {
    // Add timeout to prevent hanging
    const loadPromise = ffmpeg.load()
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('FFmpeg load timeout')), 30000)
    )
    
    await Promise.race([loadPromise, timeoutPromise])
    
    // Verify initialization
    if (!ffmpeg.loaded) {
      throw new Error('FFmpeg failed to load properly')
    }
    
    return ffmpeg
  } catch (error) {
    console.error('FFmpeg initialization failed:', error)
    throw new Error(`FFmpeg init error: ${error.message}`)
  }
}
```

### Worker and Threading Errors

#### "Failed to construct 'Worker'" / "Script cannot be accessed from origin"
**Cause**: CORS issues with worker scripts or incorrect worker paths.

**Solutions**:

1. **Self-hosted Workers**
```javascript
// Download and serve workers from your domain
const config = {
  coreURL: '/static/ffmpeg/ffmpeg-core.js',
  wasmURL: '/static/ffmpeg/ffmpeg-core.wasm',
  workerURL: '/static/ffmpeg/ffmpeg-core.worker.js'
}

await ffmpeg.load(config)
```

2. **Inline Worker Solution**
```javascript
// Create worker from blob to avoid CORS
function createInlineWorker(scriptURL) {
  return fetch(scriptURL)
    .then(response => response.text())
    .then(scriptText => {
      const blob = new Blob([scriptText], { type: 'application/javascript' })
      return new Worker(URL.createObjectURL(blob))
    })
}
```

3. **Environment Detection**
```javascript
function canUseWorkers() {
  try {
    // Test worker creation
    const testWorker = new Worker(
      URL.createObjectURL(new Blob(['self.postMessage("test")'], 
      { type: 'application/javascript' }))
    )
    testWorker.terminate()
    return true
  } catch (error) {
    return false
  }
}

// Use appropriate mode based on environment
if (canUseWorkers()) {
  // Use worker-based processing
} else {
  // Fall back to main thread
}
```

### CORS and Network Errors

#### "Failed to fetch" / "Access to fetch at ... has been blocked by CORS policy"
**Cause**: Cross-origin resource loading restrictions.

**Solutions**:

1. **Resource Self-hosting**
```javascript
// Instead of CDN
const badConfig = {
  coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js'
}

// Self-host resources
const goodConfig = {
  coreURL: '/assets/ffmpeg/ffmpeg-core.js',
  wasmURL: '/assets/ffmpeg/ffmpeg-core.wasm'
}
```

2. **Proxy Configuration**
```javascript
// Use proxy for development
const devConfig = {
  coreURL: '/api/proxy/ffmpeg-core.js',
  wasmURL: '/api/proxy/ffmpeg-core.wasm'
}

// Production config with CDN + proper headers
const prodConfig = {
  coreURL: 'https://your-cdn.com/ffmpeg-core.js',
  wasmURL: 'https://your-cdn.com/ffmpeg-core.wasm'
}
```

### Common Error Messages

#### "Error: called FFmpeg.terminate()"
This is **expected behavior** when calling `terminate()`. It's not an actual error.

```javascript
try {
  ffmpeg.terminate()
} catch (error) {
  if (error.message === 'called FFmpeg.terminate()') {
    console.log('FFmpeg terminated successfully - this is normal')
  } else {
    console.error('Unexpected termination error:', error)
  }
}

// Always reinitialize after termination
await ffmpeg.load()
```

#### "TypeError: Cannot read properties of undefined"
**Cause**: Accessing FFmpeg properties before initialization or after termination.

```javascript
// ❌ Wrong - Using FFmpeg before load()
const ffmpeg = new FFmpeg()
await ffmpeg.exec(['-i', 'input.mp4', 'output.mp4']) // Error!

// ✅ Correct - Always load first
const ffmpeg = new FFmpeg()
await ffmpeg.load()
await ffmpeg.exec(['-i', 'input.mp4', 'output.mp4'])
```

#### "bad memory" / "Pthread aborting"
**Cause**: Memory corruption or insufficient memory allocation.

```javascript
// Solution: Clean restart pattern
async function robustProcessing(videoFile) {
  let ffmpeg = null
  
  try {
    ffmpeg = new FFmpeg()
    await ffmpeg.load()
    
    // Process with memory monitoring
    const memoryBefore = performance.memory?.usedJSHeapSize || 0
    
    await ffmpeg.writeFile('input', await fetchFile(videoFile))
    await ffmpeg.exec(['-i', 'input', 'output'])
    
    const memoryAfter = performance.memory?.usedJSHeapSize || 0
    console.log(`Memory used: ${(memoryAfter - memoryBefore) / 1024 / 1024}MB`)
    
    return await ffmpeg.readFile('output')
  } catch (error) {
    if (error.message.includes('bad memory') || error.message.includes('Pthread aborting')) {
      console.warn('Memory error detected, creating fresh instance')
      // Force cleanup and retry with new instance
      if (ffmpeg) ffmpeg.terminate()
      return robustProcessing(videoFile) // Retry once
    }
    throw error
  } finally {
    if (ffmpeg) ffmpeg.terminate()
  }
}
```

### Error Troubleshooting Matrix

| Error Type | Symptoms | Primary Cause | Quick Fix | Detailed Solution |
|------------|----------|---------------|-----------|-------------------|
| **ErrnoError: FS error** | Command execution fails | Wrong exec() format | Use array: `exec(['-i', 'input'])` | [See FS Errors section](#file-system-errors) |
| **SharedArrayBuffer undefined** | Multi-threading fails | Missing CORS headers | Add COEP/COOP headers | [See Threading Errors section](#sharedarraybuffer-and-threading-errors) |
| **Memory errors** | Browser crashes, OOM | Large files/memory leaks | Use chunked processing | [See Memory Errors section](#memory-errors) |
| **Worker construction fails** | Threading errors | CORS/script path issues | Self-host worker files | [See Worker Errors section](#worker-and-threading-errors) |
| **Module not loaded** | API calls before init | Missing `await load()` | Always call `load()` first | [See Initialization Errors section](#initialization-errors) |
| **CORS fetch failures** | Network loading fails | Cross-origin restrictions | Self-host resources | [See CORS Errors section](#cors-and-network-errors) |
| **called FFmpeg.terminate()** | After cancellation | Expected behavior | Handle gracefully | [See Common Errors section](#common-error-messages) |

### Emergency Debugging Checklist

When encountering any FFmpeg WASM error, run through this checklist:

```javascript
// Comprehensive FFmpeg debugging function
async function debugFFmpegIssue() {
  console.log('🔍 FFmpeg WASM Debug Report')
  console.log('=' * 50)
  
  // 1. Environment Check
  console.log('📋 Environment:')
  console.log(`- User Agent: ${navigator.userAgent}`)
  console.log(`- SharedArrayBuffer: ${typeof SharedArrayBuffer !== 'undefined'}`)
  console.log(`- Worker: ${typeof Worker !== 'undefined'}`)
  console.log(`- Cross-Origin Isolated: ${crossOriginIsolated}`)
  console.log(`- HTTPS: ${location.protocol === 'https:'}`)
  
  // 2. Memory Check
  if (performance.memory) {
    const memory = performance.memory
    console.log('💾 Memory:')
    console.log(`- Used: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB`)
    console.log(`- Total: ${(memory.totalJSHeapSize / 1024 / 1024).toFixed(1)}MB`)
    console.log(`- Limit: ${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(1)}MB`)
  }
  
  // 3. FFmpeg Initialization Test
  console.log('🧪 FFmpeg Test:')
  try {
    const ffmpeg = new FFmpeg()
    console.log('- FFmpeg instance created ✅')
    
    const startTime = Date.now()
    await ffmpeg.load()
    const loadTime = Date.now() - startTime
    console.log(`- FFmpeg loaded in ${loadTime}ms ✅`)
    
    // Simple test command
    await ffmpeg.writeFile('test.txt', new TextEncoder().encode('Hello FFmpeg'))
    console.log('- File write test ✅')
    
    const data = await ffmpeg.readFile('test.txt')
    console.log(`- File read test ✅ (${data.length} bytes)`)
    
    ffmpeg.terminate()
    console.log('- FFmpeg terminated ✅')
    
  } catch (error) {
    console.error('❌ FFmpeg test failed:', error.message)
    console.error('- Full error:', error)
  }
  
  // 4. Worker Test
  console.log('👷 Worker Test:')
  try {
    const worker = new Worker(
      URL.createObjectURL(new Blob(['self.postMessage("worker-test")'], 
      { type: 'application/javascript' }))
    )
    worker.onmessage = () => {
      console.log('- Worker test ✅')
      worker.terminate()
    }
    worker.onerror = (error) => {
      console.error('- Worker test ❌:', error)
    }
  } catch (error) {
    console.error('- Worker creation failed ❌:', error.message)
  }
  
  console.log('🔍 Debug report complete')
}

// Run debug when needed
// debugFFmpegIssue()
```

### Performance-Related Error Prevention

```javascript
// Proactive error prevention through monitoring
class FFmpegHealthMonitor {
  constructor() {
    this.memoryThreshold = 0.8 // 80% of available memory
    this.processingTimeout = 300000 // 5 minutes
    this.retryAttempts = 3
  }

  async safeProcess(videoFile, commands) {
    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        // Pre-flight checks
        this.checkMemoryAvailability()
        this.checkFileSize(videoFile)
        
        return await this.processWithTimeout(videoFile, commands)
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error.message)
        
        if (attempt === this.retryAttempts) {
          throw new Error(`Processing failed after ${this.retryAttempts} attempts: ${error.message}`)
        }
        
        // Progressive fallback strategy
        if (error.message.includes('memory')) {
          await this.clearMemory()
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
      }
    }
  }

  checkMemoryAvailability() {
    if (performance.memory) {
      const usage = performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit
      if (usage > this.memoryThreshold) {
        throw new Error(`Memory usage too high: ${(usage * 100).toFixed(1)}%`)
      }
    }
  }

  checkFileSize(file) {
    const maxSize = 500 * 1024 * 1024 // 500MB
    if (file.size > maxSize) {
      throw new Error(`File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max: ${maxSize / 1024 / 1024}MB)`)
    }
  }

  async processWithTimeout(videoFile, commands) {
    return new Promise(async (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Processing timeout'))
      }, this.processingTimeout)

      try {
        const ffmpeg = new FFmpeg()
        await ffmpeg.load()
        
        await ffmpeg.writeFile('input', await fetchFile(videoFile))
        await ffmpeg.exec(commands)
        const result = await ffmpeg.readFile('output')
        
        ffmpeg.terminate()
        clearTimeout(timeout)
        resolve(result)
      } catch (error) {
        clearTimeout(timeout)
        reject(error)
      }
    })
  }

  async clearMemory() {
    // Force garbage collection if available
    if (window.gc) {
      window.gc()
    }
    
    // Clear any cached resources
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      )
    }
  }
}
```

This comprehensive error documentation covers every major FFmpeg WASM error with practical solutions based on real community reports and GitHub issues.

## Advanced Troubleshooting Techniques

### Performance Profiling

```javascript
// Advanced performance monitoring for FFmpeg operations
class FFmpegProfiler {
  constructor() {
    this.metrics = []
  }

  async profileOperation(operationName, operation) {
    const startTime = performance.now()
    const startMemory = performance.memory?.usedJSHeapSize || 0
    
    try {
      const result = await operation()
      
      const endTime = performance.now()
      const endMemory = performance.memory?.usedJSHeapSize || 0
      
      const metrics = {
        operation: operationName,
        duration: endTime - startTime,
        memoryDelta: endMemory - startMemory,
        memoryPeak: endMemory,
        timestamp: new Date().toISOString(),
        success: true
      }
      
      this.metrics.push(metrics)
      console.log(`✅ ${operationName}: ${metrics.duration.toFixed(2)}ms, Memory: +${(metrics.memoryDelta / 1024 / 1024).toFixed(1)}MB`)
      
      return result
    } catch (error) {
      const endTime = performance.now()
      
      const metrics = {
        operation: operationName,
        duration: endTime - startTime,
        error: error.message,
        timestamp: new Date().toISOString(),
        success: false
      }
      
      this.metrics.push(metrics)
      console.error(`❌ ${operationName} failed: ${metrics.duration.toFixed(2)}ms - ${error.message}`)
      throw error
    }
  }

  getReport() {
    return {
      totalOperations: this.metrics.length,
      successRate: this.metrics.filter(m => m.success).length / this.metrics.length,
      averageDuration: this.metrics.reduce((sum, m) => sum + (m.duration || 0), 0) / this.metrics.length,
      totalMemoryUsed: this.metrics.reduce((sum, m) => sum + (m.memoryDelta || 0), 0),
      operations: this.metrics
    }
  }
}
```

This completes the ultimate FFmpeg WASM documentation with comprehensive error handling and troubleshooting.
```

#### "SharedArrayBuffer is not defined"
Multi-threading requires specific headers. Add to your server:

```
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Opener-Policy: same-origin
```

#### "Cannot read properties of undefined"
Usually indicates FFmpeg isn't loaded properly:

```javascript
// Always check if loaded
if (!ffmpeg.loaded) {
  await ffmpeg.load()
}
```

#### Memory errors
Implement memory monitoring:

```javascript
function checkMemoryUsage() {
  if (performance.memory) {
    const usage = performance.memory.usedJSHeapSize / 1024 / 1024
    const limit = performance.memory.jsHeapSizeLimit / 1024 / 1024
    
    if (usage > limit * 0.9) {
      console.warn(`High memory usage: ${usage.toFixed(1)}MB / ${limit.toFixed(1)}MB`)
      return false
    }
  }
  return true
}
```

### Debug Mode

Enable comprehensive debugging:

```javascript
const ffmpeg = new FFmpeg()

// Enable all logging
ffmpeg.on('log', ({ type, message }) => {
  console.log(`[${type}] ${message}`)
})

// Monitor performance
const startTime = Date.now()
ffmpeg.on('progress', ({ progress }) => {
  const elapsed = (Date.now() - startTime) / 1000
  const eta = elapsed / progress * (1 - progress)
  console.log(`Progress: ${(progress * 100).toFixed(1)}% (ETA: ${eta.toFixed(1)}s)`)
})
```

## Supported Codecs & Libraries

### Video Codecs
- **x264** (H.264) - Most widely supported
- **x265** (H.265/HEVC) - Better compression
- **libvpx** (VP8/VP9) - WebM format
- **theora** - OGV format

### Audio Codecs
- **lame** (MP3) - Most compatible
- **vorbis** (OGG) - Open source
- **opus** - High quality, low latency
- **aac** - AAC audio

### Additional Libraries
- **freetype2** - Font rendering for text overlays
- **libwebp** - WebP image support
- **libass** - Advanced subtitle rendering
- **libmp3lame** - MP3 encoding
- **libfdk-aac** - High-quality AAC encoding

### Format Support Matrix

| Container | Video Codecs | Audio Codecs | Subtitle Support |
|-----------|-------------|-------------|------------------|
| MP4 | H.264, H.265 | AAC, MP3 | SRT, ASS |
| WebM | VP8, VP9 | Vorbis, Opus | WebVTT |
| AVI | H.264, XVID | MP3, AC3 | SRT |
| MOV | H.264, H.265 | AAC, MP3 | SRT, ASS |

---

## Conclusion

FFmpeg WASM provides powerful multimedia processing capabilities directly in the browser, though with performance trade-offs compared to native implementations. Understanding its architecture, limitations, and best practices is crucial for successful implementation. 

This documentation should serve as your comprehensive reference for working with FFmpeg WASM version 0.12.x in web applications, covering everything from basic usage to advanced optimization techniques and troubleshooting.

## Community & Resources

### Official Resources

#### Documentation & Websites
- **Main Website**: https://ffmpegwasm.netlify.app/
- **GitHub Repository**: https://github.com/ffmpegwasm/ffmpeg.wasm
- **NPM Package**: https://www.npmjs.com/package/@ffmpeg/ffmpeg
- **API Documentation**: https://ffmpegwasm.netlify.app/docs/api

#### Interactive Tools
- **Online Playground**: https://ffmpegwasm.netlify.app/playground
  - Try FFmpeg WASM without installation
  - Demo video: https://youtu.be/F01B0fV20QA
  - Upload files and test commands
  - Download processed results

### Community Support

#### Discord Server
- **Active Community**: Join the Discord server for real-time support
- **Maintainer Access**: Direct communication with project maintainers
- **Technical Discussions**: Get help with implementation issues
- **Feature Requests**: Discuss new features and improvements

#### Stack Overflow
- **Tag**: `ffmpeg.wasm`
- **Community Questions**: Search existing solutions
- **Expert Answers**: Get help from experienced developers

#### GitHub Issues
- **Bug Reports**: Report issues and bugs
- **Feature Requests**: Propose new features
- **Discussions**: Technical discussions and questions
- **16.2k+ Stars**: Large community of users and contributors

### Learning Resources

#### Blog Posts & Articles
- **Release Notes**: Stay updated with new versions
- **Technical Deep Dives**: Understanding WebAssembly implementation
- **Performance Guides**: Optimization techniques and best practices

#### Example Projects
- **Framework Examples**: 7 different framework implementations
- **Real-world Usage**: 4.1k+ projects using FFmpeg WASM
- **Open Source**: All examples available on GitHub

### Contributing & Support

#### Ways to Contribute
1. **Code Contributions**: Bug fixes, features, optimizations
2. **Documentation**: Improve guides and examples
3. **Testing**: Test across browsers and frameworks
4. **Community Support**: Help other users with issues
5. **Sponsorship**: Financial support for project sustainability

#### Getting Help
1. **Check Documentation**: Start with official docs
2. **Search Issues**: Look for existing solutions
3. **Ask Community**: Discord or Stack Overflow
4. **Create Issue**: Report bugs or request features

### Project Status & Future

#### Current Status
- **Experimental**: Still in experimental phase
- **Production Use**: 2.3M+ downloads, growing adoption
- **Active Development**: Regular updates and improvements
- **Seeking Maintainers**: Actively looking for maintainers

#### Future Goals
- **RTSP Support**: Streaming protocol implementation
- **Performance**: Continued optimization efforts
- **Stability**: Moving towards production-grade stability
- **Ecosystem**: Expanding framework support and examples

### Sponsorship & Sustainability

The project welcomes sponsorship to support:
- **Continued Development**: Regular updates and improvements
- **Infrastructure**: Build systems and hosting costs
- **Community Support**: Maintaining documentation and examples
- **New Features**: Advanced functionality development

**Contact for Sponsorship**: Check GitHub repository for current options

---

## Conclusion

FFmpeg WASM represents a powerful shift towards client-side media processing, enabling sophisticated video and audio manipulation directly in web browsers. While it comes with performance trade-offs compared to native implementations, its security benefits, client-side processing capabilities, and growing ecosystem make it an increasingly viable solution for web applications.

This comprehensive documentation serves as your ultimate reference for FFmpeg WASM v0.12.x, covering everything from basic usage to advanced optimization techniques, real-world issues, and community resources. Whether you're building a simple video converter or a complex media processing pipeline, this guide provides the context and examples needed for successful implementation.

For the most up-to-date information, always refer to the official FFmpeg WASM documentation at https://ffmpegwasm.netlify.app/

---

**Document Version**: 1.0 - Ultimate AI Agent Reference  
**Last Updated**: Based on FFmpeg WASM v0.12.15 (January 2024)  
**Coverage**: Complete analysis of official docs, GitHub repository, community resources, and source code