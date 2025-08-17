import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"
import { 
  SubtitleEntry, 
  VideoInfo, 
  SubtitleStats, 
  GoogleFont, 
  SubtitleStyle, 
  ProcessingOptions, 
  PerformanceMetrics
} from "@/types/types"
import { ProgressManager, progressManager } from "./ProgressManager"

interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

// Extend Window interface for gc function
declare global {
  interface Window {
    gc?: () => void
  }
}

export class SubtitleProcessor {
  private ffmpeg: FFmpeg
  private loadedFonts: Set<string> = new Set()
  private performanceMetrics: PerformanceMetrics[] = []
  private memoryUsage: number = 0
  private tempFileCounter: number = 0
  private diskCacheEnabled: boolean = true
  private memoryLimit: number = 500 // MB default
  private isFFmpegLoaded: boolean = false
  private isFFmpegLoading: boolean = false
  constructor(ffmpeg: FFmpeg) {
    this.ffmpeg = ffmpeg
  }

  async loadFFmpeg({ onLog, onProgress }: { onLog: (message: string) => void; onProgress: (progress: number) => void }) {
    // Guard against multiple initialization
    if (this.isFFmpegLoaded) {
      onLog("FFmpeg already loaded")
      return
    }

    if (this.isFFmpegLoading) {
      onLog("FFmpeg loading in progress")
      return
    }

    this.isFFmpegLoading = true

    // Initialize progress manager (singleton)
    progressManager.reset()
    progressManager.onLog(onLog)
    progressManager.onProgress((update) => onProgress(update.phaseProgress / 100))

    try {
      progressManager.setPhase('parsing-subtitles', "Loading FFmpeg...")

      // Set up FFmpeg log handler for progress tracking during processing
      this.ffmpeg.on("log", ({ message }) => {
        onLog(message)
      })
      this.ffmpeg.on("progress", ({ progress }) => {
        progressManager.updatePhase(progress * 100, "Loading FFmpeg core...")
      })
      
      progressManager.updatePhase(10, "Loading FFmpeg core...")
      await this.ffmpeg.load({
        coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
        wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm"
      })
      
      progressManager.complete("FFmpeg loaded successfully")
      this.isFFmpegLoaded = true
    } catch (error) {
      progressManager.error(`FFmpeg loading failed: ${error}`, error instanceof Error ? error : new Error(String(error)))
      throw error
    } finally {
      this.isFFmpegLoading = false
    }
  }

  async fetchGoogleFonts(): Promise<GoogleFont[]> {
    // For this example, we'll use a curated list of popular Google Fonts to avoid API key dependency
    // In a production app, you might want to fetch from https://www.googleapis.com/webfonts/v1/webfonts?key=YOUR-API-KEY
    const popularFonts: GoogleFont[] = [
      { family: "Roboto", category: "sans-serif" },
      { family: "Open Sans", category: "sans-serif" },
      { family: "Lato", category: "sans-serif" },
      { family: "Montserrat", category: "sans-serif" },
      { family: "Noto Sans", category: "sans-serif" },
      { family: "Source Sans Pro", category: "sans-serif" },
      { family: "Poppins", category: "sans-serif" },
      { family: "Raleway", category: "sans-serif" },
      { family: "Merriweather", category: "serif" },
      { family: "Playfair Display", category: "serif" }
    ]

    // Dynamically load font stylesheets
    for (const font of popularFonts) {
      if (!this.loadedFonts.has(font.family)) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}`
        document.head.appendChild(link)
        this.loadedFonts.add(font.family)
      }
    }

    return popularFonts
  }

  async getVideoInfo(file: File): Promise<VideoInfo> {
    const video = document.createElement('video')
    video.src = URL.createObjectURL(file)

    return new Promise((resolve, reject) => {
      video.onloadedmetadata = () => {
        const info: VideoInfo = {
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration,
          size: file.size,
          fps: 30 // Default, can be enhanced with FFprobe later
        }
        URL.revokeObjectURL(video.src)
        resolve(info)
      }
      video.onerror = () => reject(new Error("Could not get video info"))
    })
  }

  filterSubtitlesByDuration(subtitles: SubtitleEntry[], videoDuration: number): { filteredSubtitles: SubtitleEntry[], stats: SubtitleStats } {
    const filteredSubtitles = subtitles
      .filter(sub => sub.startTime < videoDuration)
      .map(sub => ({
        ...sub,
        endTime: Math.min(sub.endTime, videoDuration)
      }))

    const totalSubtitleDuration = filteredSubtitles.reduce((sum, sub) => sum + (sub.endTime - sub.startTime), 0)
    const avgDuration = filteredSubtitles.length > 0 ? totalSubtitleDuration / filteredSubtitles.length : 0

    const stats: SubtitleStats = {
      total: subtitles.length,
      relevant: filteredSubtitles.length,
      filtered: subtitles.length - filteredSubtitles.length,
      avgDuration,
      totalDuration: totalSubtitleDuration
    }

    return { filteredSubtitles, stats }
  }

  async parseSubtitleFile(file: File): Promise<SubtitleEntry[]> {
    let content = await file.text()
    const ext = file.name.split(".").pop()?.toLowerCase() || "srt"

    if (["ass", "ssa"].includes(ext)) {
      content = this.convertAssToSrt(content)
    } else if (ext === "vtt") {
      content = this.convertVttToSrt(content)
    }

    return this.parseSrtFile(content)
  }

  private parseSrtFile(srtContent: string): SubtitleEntry[] {
    const subtitles: SubtitleEntry[] = []
    const blocks = srtContent.trim().split(/\n\s*\n/)

    for (const block of blocks) {
      const lines = block.trim().split('\n')
      if (lines.length >= 3) {
        const index = parseInt(lines[0])
        const timeMatch = lines[1].match(/(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/)

        if (timeMatch && !isNaN(index)) {
          const startTime =
            parseInt(timeMatch[1]) * 3600 +
            parseInt(timeMatch[2]) * 60 +
            parseInt(timeMatch[3]) +
            parseInt(timeMatch[4]) / 1000

          const endTime =
            parseInt(timeMatch[5]) * 3600 +
            parseInt(timeMatch[6]) * 60 +
            parseInt(timeMatch[7]) +
            parseInt(timeMatch[8]) / 1000

          const text = lines.slice(2).join(' ')
            .replace(/\r?\n/g, ' ')
            .replace(/[<>]/g, '')
            .replace(/\{[^}]*\}/g, '')
            .replace(/[^\w\s.,!?;:()\-]/g, '')
            .trim()

          if (text && startTime < endTime && text.length > 0) {
            subtitles.push({
              index,
              startTime,
              endTime,
              text: text.substring(0, 100)
            })
          }
        }
      }
    }

    return subtitles.sort((a, b) => a.startTime - b.startTime)
  }

  private async createSubtitleImages(
    subtitles: SubtitleEntry[],
    width: number,
    height: number,
    fontSize: string,
    fontColor: string,
    fontFamily: string,
    onProgress: (progress: number) => void,
    onLog: (message: string) => void
  ): Promise<{[key: string]: Uint8Array}> {
    const subtitleImages: {[key: string]: Uint8Array} = {}
    onLog(`🖼️ Creating ${subtitles.length} subtitle images with font ${fontFamily}`)

    // Process in small batches to keep UI responsive
    const batchSize = 5
    
    for (let batchStart = 0; batchStart < subtitles.length; batchStart += batchSize) {
      const batch = subtitles.slice(batchStart, batchStart + batchSize)
      
      for (const subtitle of batch) {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!

        ctx.clearRect(0, 0, width, height)
        ctx.font = `${fontSize}px '${fontFamily}', sans-serif`
        ctx.fillStyle = fontColor
        ctx.textAlign = 'center'
        ctx.textBaseline = 'bottom'
        ctx.strokeStyle = '#000000'
        ctx.lineWidth = 2

        const x = width / 2
        const y = height - 50

        ctx.strokeText(subtitle.text, x, y)
        ctx.fillText(subtitle.text, x, y)

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png')
        })

        const arrayBuffer = await blob.arrayBuffer()
        subtitleImages[`subtitle_${subtitle.index}.png`] = new Uint8Array(arrayBuffer)
      }
      
      const progress = Math.round((batchStart + batch.length) / subtitles.length * 30)
      onProgress(progress)
      
      // Allow UI to update between batches
      await new Promise(resolve => setTimeout(resolve, 0))
      
      onLog(`✅ Created ${Math.min(batchStart + batchSize, subtitles.length)}/${subtitles.length} subtitle images`)
    }

    return subtitleImages
  }

  async processVideo({
    videoFile,
    relevantSubtitles,
    videoInfo,
    outputFormat,
    fontSize,
    fontColor,
    fontFamily,
    onLog,
    onProgress,
    processingOptions
  }: {
    videoFile: File
    relevantSubtitles: SubtitleEntry[]
    videoInfo: VideoInfo
    outputFormat: string
    fontSize: string
    fontColor: string
    fontFamily: string
    onLog: (message: string) => void
    onProgress: (progress: number, phase?: 'subtitle-generation' | 'video-processing') => void
    processingOptions?: ProcessingOptions
  }): Promise<string> {
    const defaultOptions: ProcessingOptions = {
      quality: 'balanced',
      crf: 23,
      memoryLimit: 500,
      threads: 0,
      useDiskCache: true
    }
    const options = { ...defaultOptions, ...processingOptions }

    // Initialize progress manager for this processing session
    progressManager.reset()
    progressManager.onLog(onLog)
    progressManager.onProgress((update) => {
      let phaseType: 'subtitle-generation' | 'video-processing' | undefined = undefined
      if (update.phase === 'parsing-subtitles') {
        phaseType = 'subtitle-generation'
      } else if (update.phase === 'processing-video') {
        phaseType = 'video-processing'
      }
      onProgress(update.phaseProgress, phaseType)
    })

    progressManager.setPhase('parsing-subtitles', `Starting processing for ${relevantSubtitles.length} subtitles`)

    // Use sequential processing with optimizations
    return await this.processVideoSequential(videoFile, relevantSubtitles, videoInfo, outputFormat, fontSize, fontColor, fontFamily, onLog, onProgress, options)
  }

  async processVideoSequential(
    videoFile: File,
    relevantSubtitles: SubtitleEntry[],
    videoInfo: VideoInfo,
    outputFormat: string,
    fontSize: string,
    fontColor: string,
    fontFamily: string,
    onLog: (message: string) => void,
    onProgress: (progress: number, phase?: 'subtitle-generation' | 'video-processing') => void,
    options?: ProcessingOptions
  ): Promise<string> {
    const startTime = performance.now()
    const videoFileName = "input.mp4"
    const outputFileName = `output.${outputFormat}`
    
    try {
      // Phase 1: Parsing Subtitles (0-100%)
      progressManager.updatePhase(10, "Loading video file...")
      
      await this.ffmpeg.writeFile(videoFileName, await fetchFile(videoFile))
      progressManager.updatePhase(30, "Creating subtitle images...")
      
      const subtitleImages = await this.createOptimizedSubtitleImages(
        relevantSubtitles, 
        videoInfo.width, 
        videoInfo.height, 
        fontSize, 
        fontColor, 
        fontFamily, 
        (prog) => progressManager.updatePhase(30 + (prog * 0.7), `Creating subtitle image ${Math.round(prog * relevantSubtitles.length / 100)}/${relevantSubtitles.length}`),
        onLog
      )

      // Images are already written to FFmpeg disk cache during creation for memory optimization
      if (!this.diskCacheEnabled && Object.keys(subtitleImages).length > 0) {
        await this.batchWriteFiles(subtitleImages)
      }
      
      progressManager.updatePhase(100, "All subtitle images created")

      // Phase 2: Processing Video (0-100%)
      progressManager.setPhase('processing-video', "Starting video processing...")
      await this.processWithUnifiedFilter(
        videoFileName,
        outputFileName,
        relevantSubtitles,
        outputFormat,
        (prog) => progressManager.updatePhase(prog, `Processing video: ${prog.toFixed(1)}%`),
        onLog,
        options,
        videoInfo.duration
      )

      // Read final output file and complete phase 2
      progressManager.updatePhase(100, "Reading final output file...")
      const data = await this.ffmpeg.readFile(outputFileName)

      if (!data || (data as Uint8Array).length === 0) {
        throw new Error("Final output file is empty")
      }

      // Cleanup
      await this.cleanupSequentialFiles(videoFileName, outputFileName, relevantSubtitles)
      
      progressManager.updatePhase(100, "Processing completed successfully")
      const processingTime = performance.now() - startTime
      progressManager.complete(`Processing completed in ${(processingTime/1000).toFixed(1)}s`)

      // Record performance metrics
      this.recordPerformanceMetrics({
        startTime,
        endTime: performance.now(),
        totalDuration: videoInfo.duration,
        processingTime,
        subtitlesProcessed: relevantSubtitles.length,
        strategy: 'optimized_sequential',
        avgTimePerSubtitle: processingTime / relevantSubtitles.length
      })

      const mimeType = outputFormat === "mp4" ? "video/mp4" : "video/webm"
      return URL.createObjectURL(new Blob([typeof data === 'string' ? data : new Uint8Array(data)], { type: mimeType }))

    } catch (error) {
      progressManager.error(`Processing failed: ${error}`, error instanceof Error ? error : new Error(String(error)))
      // Comprehensive cleanup on error/cancellation
      await this.cleanupSequentialFiles(videoFileName, outputFileName, relevantSubtitles)
      await this.forceCleanup(relevantSubtitles)
      throw error
    } finally {
      // Always ensure comprehensive cleanup when processing ends
      await this.forceCleanup(relevantSubtitles)
    }
  }

  private async createOptimizedSubtitleImages(
    subtitles: SubtitleEntry[],
    width: number,
    height: number,
    fontSize: string,
    fontColor: string,
    fontFamily: string,
    onProgress: (progress: number) => void,
    onLog: (message: string) => void
  ): Promise<{[key: string]: Uint8Array}> {
    const subtitleImages: {[key: string]: Uint8Array} = {}
    
    // Dynamic batch size based on available memory and subtitle count
    const memoryUsageMB = this.getMemoryUsage() / (1024 * 1024)
    const availableMemoryMB = this.memoryLimit - memoryUsageMB
    
    // Calculate optimal batch size for memory management
    let batchSize: number
    if (subtitles.length > 100) {
      batchSize = Math.max(2, Math.min(5, Math.floor(availableMemoryMB / 10))) // Conservative for large subtitle sets
    } else if (subtitles.length > 50) {
      batchSize = Math.max(3, Math.min(8, Math.floor(availableMemoryMB / 8)))
    } else {
      batchSize = Math.max(5, Math.min(10, Math.floor(availableMemoryMB / 5)))
    }
    
    onLog(`🖼️ Creating ${subtitles.length} subtitle images in memory-optimized batches of ${batchSize}`)
    onLog(`💾 Available memory: ${availableMemoryMB.toFixed(1)}MB / ${this.memoryLimit}MB`)

    // Pre-create canvas for reuse
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')!
    
    // Pre-configure canvas context
    ctx.font = `${fontSize}px '${fontFamily}', Arial, sans-serif`
    ctx.fillStyle = fontColor
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2

    const x = width / 2
    const y = height - 50
    
    for (let batchStart = 0; batchStart < subtitles.length; batchStart += batchSize) {
      // Check memory pressure before each batch
      const currentMemoryMB = this.getMemoryUsage() / (1024 * 1024)
      if (currentMemoryMB > this.memoryLimit * 0.9) {
        onLog(`⚠️ High memory usage detected (${currentMemoryMB.toFixed(1)}MB), forcing garbage collection...`)
        // Force garbage collection if available
        if (window.gc) {
          window.gc()
        }
        // Small delay to allow memory cleanup
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      
      const batch = subtitles.slice(batchStart, batchStart + batchSize)
      
      // Process batch sequentially to minimize memory spikes
      for (let i = 0; i < batch.length; i++) {
        const subtitle = batch[i]
        
        // Clear and draw
        ctx.clearRect(0, 0, width, height)
        ctx.strokeText(subtitle.text, x, y)
        ctx.fillText(subtitle.text, x, y)

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((blob) => resolve(blob!), 'image/png', 0.8)
        })

        const arrayBuffer = await blob.arrayBuffer()
        const filename = `subtitle_${subtitle.index}.png`
        subtitleImages[filename] = new Uint8Array(arrayBuffer)
        
        // Immediately write to FFmpeg to free up memory
        if (this.diskCacheEnabled) {
          await this.ffmpeg.writeFile(filename, subtitleImages[filename])
          delete subtitleImages[filename] // Remove from memory after writing to disk
        }

        // Update progress for individual subtitle within batch
        const individualProgress = Math.round(((batchStart + i + 1) / subtitles.length) * 100)
        onProgress(individualProgress)
      }
      
      // Yield control to prevent UI blocking and allow memory cleanup
      await new Promise(resolve => setTimeout(resolve, 5))
      
      const completedCount = Math.min(batchStart + batchSize, subtitles.length)
      onLog(`✅ Created ${completedCount}/${subtitles.length} subtitle images`)
    }

    return subtitleImages
  }

  private async batchWriteFiles(
    subtitleImages: {[key: string]: Uint8Array}
  ): Promise<void> {
    const filenames = Object.keys(subtitleImages)
    const batchSize = 5 // Write files in small batches to prevent memory spikes
    
    for (let i = 0; i < filenames.length; i += batchSize) {
      const batch = filenames.slice(i, i + batchSize)
      const writePromises = batch.map(filename => 
        this.ffmpeg.writeFile(filename, subtitleImages[filename])
      )
      
      await Promise.all(writePromises)
      
      // Small delay to prevent overwhelming the system
      if (i + batchSize < filenames.length) {
        await new Promise(resolve => setTimeout(resolve, 1))
      }
    }
  }

  private parseFFmpegTime(timeStr: string): number {
    // Parse FFmpeg time format: HH:MM:SS.SS or HH:MM:SS,SS or MM:SS.SS or SS.SS
    try {
      // Normalize comma to dot for decimal separator
      const normalizedTime = timeStr.replace(',', '.')
      const parts = normalizedTime.split(':').map(p => parseFloat(p))
      
      if (parts.length === 3) {
        // HH:MM:SS.SS format
        return parts[0] * 3600 + parts[1] * 60 + parts[2]
      } else if (parts.length === 2) {
        // MM:SS.SS format
        return parts[0] * 60 + parts[1]
      } else if (parts.length === 1) {
        // SS.SS format
        return parts[0]
      }
      return 0
    } catch {
      return 0 // Fallback for any parsing errors
    }
  }

  private async processWithUnifiedFilter(
    inputFileName: string,
    outputFileName: string,
    subtitles: SubtitleEntry[],
    outputFormat: string,
    onProgress: (progress: number) => void,
    onLog: (message: string) => void,
    options?: ProcessingOptions,
    videoDuration?: number
  ): Promise<void> {

    // Phase 2 starts at 0% - Building optimized filter complex
    progressManager.updatePhase(0, "Building optimized filter complex...")
    
    // Build optimized filter complex for all subtitles at once
    const filterComplex = this.buildOptimizedFilterComplex(subtitles)
    
    // Small progress increment for setup tasks
    progressManager.updatePhase(2, "Preparing FFmpeg configuration...")
    
    // Determine optimal settings based on options with more aggressive differences
    const preset = options?.quality === 'fast' ? 'ultrafast' : 
                  options?.quality === 'high' ? 'slow' : 'medium'
    const crf = options?.crf || (options?.quality === 'fast' ? 28 : 
                                options?.quality === 'high' ? 18 : 23)
    const threads = options?.threads || 0 // 0 means auto (all available)
    
    // Additional quality-based optimizations
    const tune = options?.quality === 'fast' ? 'fastdecode' : 
                options?.quality === 'high' ? 'film' : 'fastdecode'
    const bframes = options?.quality === 'fast' ? '0' : 
                   options?.quality === 'high' ? '3' : '2'
    const refs = options?.quality === 'fast' ? '1' : 
                options?.quality === 'high' ? '5' : '3'
    
    // Calculate memory limit for FFmpeg (in bytes)
    const memoryLimitBytes = (options?.memoryLimit || 500) * 1024 * 1024
    const memoryLimitKB = Math.floor(memoryLimitBytes / 1024)
    
    // Prepare FFmpeg arguments with optimized settings for maximum performance
    const ffmpegArgs = [
      '-i', inputFileName,
      // Add all subtitle images as inputs
      ...subtitles.flatMap(sub => ['-i', `subtitle_${sub.index}.png`]),
      '-filter_complex', filterComplex,
      '-map', '[final_output]',
      '-map', '0:a?', // Include audio if present
      '-c:v', 'libx264',
      '-preset', preset, // Use dynamic preset based on quality setting
      '-crf', crf.toString(), // Dynamic CRF based on quality
      '-c:a', 'copy', // Copy audio without re-encoding
      '-movflags', '+faststart', // Web optimization for progressive download
      '-avoid_negative_ts', 'make_zero', // Handle negative timestamps
      '-threads', threads.toString(), // Use specified thread count
      '-tune', tune, // Dynamic tune based on quality
      '-bf', bframes, // Dynamic B-frames based on quality
      '-refs', refs, // Dynamic reference frames based on quality
      '-g', options?.quality === 'fast' ? '120' : '250', // Shorter GOP for fast mode
      '-bufsize', `${memoryLimitKB}k`, // Apply memory limit to FFmpeg buffer
      '-maxrate', `${Math.floor(memoryLimitKB / 4)}k`, // Set max bitrate based on memory
      '-pix_fmt', 'yuv420p', // Ensure compatibility
      ...(options?.quality === 'fast' ? ['-flags', '+cgop'] : []), // Fast encoding flags
      '-y', outputFileName
    ]
    
    // Log the applied settings for user visibility
    onLog(`🎯 Quality Mode: ${options?.quality?.toUpperCase() || 'BALANCED'}`)
    onLog(`⚙️ FFmpeg Preset: ${preset} | CRF: ${crf} | Threads: ${threads === 0 ? 'auto' : threads}`)
    onLog(`🔧 Advanced: tune=${tune}, b-frames=${bframes}, refs=${refs}`)
    onLog(`💾 Memory: ${options?.memoryLimit || 500}MB limit | Buffer: ${memoryLimitKB}KB`)
    
    // Setup complete - now starting the heavy video encoding work
    progressManager.updatePhase(0, `Starting video encoding with ${threads === 0 ? 'all available' : threads} threads (preset: ${preset}, CRF: ${crf})`)
    
    // Enhanced progress tracking using the progress manager
    const progressAwareLogHandler = ({ message }: { message: string }) => {
      // Always log the message first
      onLog(message)
      
      // Let the progress manager handle FFmpeg log parsing for progress tracking
      // This will automatically update progress from ~5% to ~95% based on video encoding progress
      progressManager.parseFFmpegLog(message, videoDuration)
    }
    
    // Add temporary progress tracking
    this.ffmpeg.on("log", progressAwareLogHandler)
    
    try {
      await this.ffmpeg.exec(ffmpegArgs)
      // FFmpeg completed - finish the phase at 100%
      progressManager.updatePhase(100, "Video encoding completed successfully")
    } catch (error) {
      throw error
    } finally {
      // Remove the progress handler to prevent memory leaks
      this.ffmpeg.off("log", progressAwareLogHandler)
    }
  }

  private buildOptimizedFilterComplex(subtitles: SubtitleEntry[]): string {
    if (subtitles.length === 0) {
      return '[0:v]copy[final_output]'
    }
    
    // Build efficient filter complex with all overlays
    let filterComplex = '[0:v]'
    
    subtitles.forEach((subtitle, index) => {
      const inputIndex = index + 1 // Subtitle images start from input index 1
      const outputLabel = index === subtitles.length - 1 ? 'final_output' : `overlay${index}`
      
      if (index === 0) {
        // First overlay: overlay onto the original video
        filterComplex += `[${inputIndex}:v]overlay=0:0:enable='between(t,${subtitle.startTime.toFixed(3)},${subtitle.endTime.toFixed(3)})'[${outputLabel}]`
      } else {
        // Subsequent overlays: overlay onto the previous result
        filterComplex += `;[overlay${index-1}][${inputIndex}:v]overlay=0:0:enable='between(t,${subtitle.startTime.toFixed(3)},${subtitle.endTime.toFixed(3)})'[${outputLabel}]`
      }
    })
    
    return filterComplex
  }

  private async cleanupSequentialFiles(
    videoFileName: string, 
    outputFileName: string, 
    subtitles: SubtitleEntry[]
  ): Promise<void> {
    const cleanupPromises: Promise<void>[] = []
    
    // Cleanup main files
    cleanupPromises.push(
      this.ffmpeg.deleteFile(videoFileName).catch(() => {}).then(() => {}),
      this.ffmpeg.deleteFile(outputFileName).catch(() => {}).then(() => {})
    )
    
    // Cleanup subtitle images
    for (const subtitle of subtitles) {
      cleanupPromises.push(
        this.ffmpeg.deleteFile(`subtitle_${subtitle.index}.png`).catch(() => {}).then(() => {})
      )
    }
    
    await Promise.all(cleanupPromises)
  }

  private convertVttToSrt(vttContent: string): string {
    const lines = vttContent.split('\n')
    let srtContent = ''
    let counter = 1
    let inCue = false
    let startTime = ''
    let endTime = ''
    let text = ''

    for (const line of lines) {
      if (line.includes('-->')) {
        const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/)
        if (timeMatch) {
          startTime = timeMatch[1].replace('.', ',')
          endTime = timeMatch[2].replace('.', ',')
          inCue = true
          text = ''
        }
      } else if (inCue && line.trim() === '') {
        if (text.trim()) {
          srtContent += `${counter}\n${startTime} --> ${endTime}\n${text.trim()}\n\n`
          counter++
        }
        inCue = false
      } else if (inCue && line.trim() !== '' && !line.startsWith('NOTE')) {
        text += line + '\n'
      }
    }

    return srtContent
  }

  private convertAssToSrt(assContent: string): string {
    const lines = assContent.split('\n')
    let srtContent = ''
    let counter = 1

    for (const line of lines) {
      if (line.startsWith('Dialogue:')) {
        const parts = line.split(',')
        if (parts.length >= 10) {
          const start = parts[1].trim()
          const end = parts[2].trim()
          const text = parts.slice(9).join(',').replace(/\{[^}]*\}/g, '').replace(/\\N/g, ' ')

          const startSrt = this.convertAssTimeToSrt(start)
          const endSrt = this.convertAssTimeToSrt(end)

          if (text.trim()) {
            srtContent += `${counter}\n${startSrt} --> ${endSrt}\n${text.trim()}\n\n`
            counter++
          }
        }
      }
    }

    return srtContent
  }

  private convertAssTimeToSrt(assTime: string): string {
    const parts = assTime.split(':')
    if (parts.length === 3) {
      const hours = parts[0].padStart(2, '0')
      const minutes = parts[1]
      const secondsParts = parts[2].split('.')
      const seconds = secondsParts[0]
      const centiseconds = secondsParts[1] || '00'
      const milliseconds = (parseInt(centiseconds) * 10).toString().padStart(3, '0')
      return `${hours}:${minutes}:${seconds},${milliseconds}`
    }
    return assTime
  }












  private async cleanupSegmentFiles(segmentFiles: string[]) {
    for (const file of segmentFiles) {
      try {
        await this.ffmpeg.deleteFile(file)
      } catch {}
    }
    try {
      await this.ffmpeg.deleteFile('concat_list.txt')
      await this.ffmpeg.deleteFile('input.mp4')
    } catch {}
  }

  /**
   * Comprehensive cleanup of all FFmpeg memory and files
   * Call this on both cancellation and completion to ensure clean state
   */
  async forceCleanup(relevantSubtitles?: SubtitleEntry[]): Promise<void> {
    try {
      // Remove all event listeners to prevent memory leaks
      // Note: FFmpeg event handlers are removed in specific contexts where they're added
      
      // Clean up all video and output files
      const filesToClean = [
        'input.mp4',
        'output.mp4',
        'output.webm',
        'output.mkv',
        'output.avi',
        'concat_list.txt'
      ]
      
      // Clean up subtitle image files if provided
      if (relevantSubtitles) {
        for (const subtitle of relevantSubtitles) {
          filesToClean.push(`subtitle_${subtitle.index}.png`)
        }
      } else {
        // Clean up common subtitle files (fallback)
        for (let i = 0; i < 1000; i++) {
          filesToClean.push(`subtitle_${i}.png`)
        }
      }
      
      // Execute cleanup in parallel for performance
      const cleanupPromises = filesToClean.map(async (file) => {
        try {
          await this.ffmpeg.deleteFile(file)
        } catch {}
      })
      
      await Promise.all(cleanupPromises)
      
      // Reset progress manager
      progressManager.reset()
      
      console.log('🧹 FFmpeg cleanup completed - all files and memory freed')
      
    } catch (error) {
      console.warn('Warning during FFmpeg cleanup:', error)
    }
  }

  private recordPerformanceMetrics(metrics: PerformanceMetrics) {
    this.performanceMetrics.push(metrics)
    // Keep only last 10 measurements
    if (this.performanceMetrics.length > 10) {
      this.performanceMetrics.shift()
    }
  }

  getPerformanceMetrics(): PerformanceMetrics[] {
    return [...this.performanceMetrics]
  }

  getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance.memory as unknown as PerformanceMemory)
      return memory.usedJSHeapSize || 0
    }
    // Fallback estimation based on processed subtitles and video size
    return Math.max(50 * 1024 * 1024, this.performanceMetrics.length * 10 * 1024 * 1024)
  }

  isUsingWorkers(): boolean {
    return false // Always false since we removed workers
  }

  resetFFmpegState(): void {
    this.isFFmpegLoaded = false
    this.isFFmpegLoading = false
  }

  getFFmpegLoadingState(): { loaded: boolean, loading: boolean } {
    return {
      loaded: this.isFFmpegLoaded,
      loading: this.isFFmpegLoading
    }
  }

  getProgressManager(): ProgressManager {
    return progressManager
  }

  /**
   * Properly cancel processing using FFmpeg WASM terminate method
   * This will stop all ongoing operations and require reinitialization
   */
  async cancelProcessing(): Promise<void> {
    try {
      // Terminate all FFmpeg operations - this will throw an error by design
      this.ffmpeg.terminate()
    } catch (error) {
      // FFmpeg.terminate() always throws "Error: called FFmpeg.terminate()" by design
      // This is expected behavior, not an actual error
      if (error instanceof Error && error.message === 'called FFmpeg.terminate()') {
        console.log('🛑 FFmpeg processing terminated successfully')
      } else {
        console.warn('Unexpected error during FFmpeg termination:', error)
      }
    }
    
    // Reset FFmpeg state
    this.isFFmpegLoaded = false
    this.isFFmpegLoading = false
    
    // Reset progress manager
    progressManager.reset()
  }

  // Batch Processing Capabilities

  async processBatchSubtitles(
    videoFile: File,
    subtitleFiles: File[],
    videoInfo: VideoInfo,
    style: SubtitleStyle,
    options: ProcessingOptions,
    onLog: (message: string) => void,
    onProgress: (progress: number) => void
  ): Promise<{ url: string; filename: string }[]> {
    onLog(`Starting batch processing: ${subtitleFiles.length} subtitle files`)
    const results: { url: string; filename: string }[] = []

    for (let i = 0; i < subtitleFiles.length; i++) {
      const subtitleFile = subtitleFiles[i]
      const batchProgress = (i / subtitleFiles.length) * 100
      
      onLog(`Processing subtitle file ${i + 1}/${subtitleFiles.length}: ${subtitleFile.name}`)
      onProgress(batchProgress)

      try {
        // Parse subtitle file
        const subtitles = await this.parseSubtitleFile(subtitleFile)
        const { filteredSubtitles } = this.filterSubtitlesByDuration(subtitles, videoInfo.duration)

        // Process video with current subtitle file
        const outputUrl = await this.processVideoWithStrategy(
          videoFile,
          filteredSubtitles,
          videoInfo,
          style,
          options,
          (msg) => onLog(`[${subtitleFile.name}] ${msg}`),
          (prog) => onProgress(batchProgress + (prog / subtitleFiles.length))
        )

        results.push({
          url: outputUrl,
          filename: `${videoFile.name.split('.')[0]}_${subtitleFile.name.split('.')[0]}.mp4`
        })

      } catch (error) {
        onLog(`Error processing ${subtitleFile.name}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    onProgress(100)
    onLog(`Batch processing completed: ${results.length}/${subtitleFiles.length} files processed successfully`)
    return results
  }

  private async processVideoWithStrategy(
    videoFile: File,
    subtitles: SubtitleEntry[],
    videoInfo: VideoInfo,
    style: SubtitleStyle,
    options: ProcessingOptions,
    onLog: (message: string) => void,
    onProgress: (progress: number) => void
  ): Promise<string> {
    // Always use optimized sequential processing
    return await this.processVideoSequential(videoFile, subtitles, videoInfo, 'mp4', 
      style.fontSize.toString(), style.fontColor, style.fontFamily, onLog, onProgress, options)
  }

  // Subtitle Merging and Language Support

  async mergeSubtitleLanguages(
    subtitleFiles: { file: File; language: string; position: 'top' | 'bottom' }[],
    onLog: (message: string) => void
  ): Promise<SubtitleEntry[]> {
    const mergedSubtitles: SubtitleEntry[] = []
    let indexCounter = 1

    onLog(`Merging ${subtitleFiles.length} subtitle languages`)

    for (const { file, language, position } of subtitleFiles) {
      const subtitles = await this.parseSubtitleFile(file)
      
      for (const subtitle of subtitles) {
        mergedSubtitles.push({
          ...subtitle,
          index: indexCounter++,
          text: `[${language}] ${subtitle.text}`,
          style: {
            fontSize: 24,
            fontColor: position === 'top' ? '#FFFF00' : '#FFFFFF',
            fontFamily: 'Arial',
            position,
            alignment: 'center'
          }
        })
      }

      onLog(`Added ${subtitles.length} subtitles for ${language} (${position})`)
    }

    // Sort by start time
    mergedSubtitles.sort((a, b) => a.startTime - b.startTime)
    onLog(`Merged total: ${mergedSubtitles.length} subtitle entries`)

    return mergedSubtitles
  }
}