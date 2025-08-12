import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile } from "@ffmpeg/util"
import { SubtitleEntry, VideoInfo, SubtitleStats, GoogleFont } from "@/types/types"

export class SubtitleProcessor {
  private ffmpeg: FFmpeg
  private loadedFonts: Set<string> = new Set()

  constructor(ffmpeg: FFmpeg) {
    this.ffmpeg = ffmpeg
  }

  async loadFFmpeg({ onLog, onProgress }: { onLog: (message: string) => void; onProgress: (progress: number) => void }) {
    this.ffmpeg.on("log", ({ message }) => onLog(message))
    this.ffmpeg.on("progress", ({ progress }) => onProgress(progress))

    await this.ffmpeg.load({
      coreURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js",
      wasmURL: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm",
    })
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
        const info = {
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration
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

    const stats = {
      total: subtitles.length,
      relevant: filteredSubtitles.length,
      filtered: subtitles.length - filteredSubtitles.length
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
    onLog(`Creating ${subtitles.length} subtitle images with font ${fontFamily}`)

    for (let i = 0; i < subtitles.length; i++) {
      const subtitle = subtitles[i]
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

      const imageProgress = Math.round((i + 1) / subtitles.length * 30)
      onProgress(imageProgress)

      if (i % 5 === 0 || i === subtitles.length - 1) {
        onLog(`Created ${i + 1}/${subtitles.length} subtitle images`)
      }
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
    onProgress
  }: {
    videoFile: File
    relevantSubtitles: SubtitleEntry[]
    videoInfo: VideoInfo
    outputFormat: string
    fontSize: string
    fontColor: string
    fontFamily: string
    onLog: (message: string) => void
    onProgress: (progress: number) => void
  }): Promise<string> {
    const videoFileName = "input.mp4"
    const outputFileName = `output.${outputFormat}`

    onLog(`Starting optimized processing: ${relevantSubtitles.length} relevant subtitles for ${videoInfo.duration.toFixed(1)}s video`)
    onLog(`Writing video file: ${videoFileName}`)
    await this.ffmpeg.writeFile(videoFileName, await fetchFile(videoFile))

    const subtitleImages = await this.createSubtitleImages(relevantSubtitles, videoInfo.width, videoInfo.height, fontSize, fontColor, fontFamily, onProgress, onLog)

    onLog("Writing subtitle images to FFmpeg")
    for (const [filename, data] of Object.entries(subtitleImages)) {
      await this.ffmpeg.writeFile(filename, data)
    }
    onProgress(40)

    onLog("Creating video with subtitle overlays")

    if (relevantSubtitles.length <= 20) {
      try {
        let filterComplex = '[0:v]'
        let overlayCount = 0

        for (const subtitle of relevantSubtitles) {
          const inputIndex = overlayCount + 1

          if (overlayCount === 0) {
            filterComplex += `[${inputIndex}:v]overlay=0:0:enable='between(t,${subtitle.startTime.toFixed(3)},${subtitle.endTime.toFixed(3)})'[v${overlayCount}]`
          } else {
            filterComplex += `;[v${overlayCount-1}][${inputIndex}:v]overlay=0:0:enable='between(t,${subtitle.startTime.toFixed(3)},${subtitle.endTime.toFixed(3)})'[v${overlayCount}]`
          }
          overlayCount++
        }

        const inputs = ['-i', videoFileName]
        for (const subtitle of relevantSubtitles) {
          inputs.push('-i', `subtitle_${subtitle.index}.png`)
        }

        const args = [
          ...inputs,
          '-filter_complex', filterComplex,
          '-map', `[v${overlayCount-1}]`,
          '-map', '0:a',
          '-c:v', outputFormat === "mp4" ? "libx264" : "libvpx-vp9",
          '-preset', 'ultrafast',
          '-crf', '28',
          '-c:a', 'copy',
          '-y', outputFileName
        ]

        onLog(`Executing complex overlay for ${relevantSubtitles.length} subtitles`)
        await this.ffmpeg.exec(args)
        onLog("✅ Complex overlay method successful")
      } catch (complexError) {
        onLog(`Complex overlay failed, using sequential method: ${complexError}`)
        throw complexError
      }
    } else {
      onLog(`Using sequential processing for ${relevantSubtitles.length} subtitles`)

      let currentInput = videoFileName
      let tempCounter = 0

      for (let i = 0; i < relevantSubtitles.length; i++) {
        const subtitle = relevantSubtitles[i]
        const isLast = i === relevantSubtitles.length - 1
        const tempOutput = isLast ? outputFileName : `temp_${tempCounter}.mp4`
        const subtitleImage = `subtitle_${subtitle.index}.png`

        const simpleArgs = [
          '-i', currentInput,
          '-i', subtitleImage,
          '-filter_complex', `[0:v][1:v]overlay=0:0:enable='between(t,${subtitle.startTime.toFixed(3)},${subtitle.endTime.toFixed(3)})'`,
          '-c:v', 'libx264',
          '-preset', 'ultrafast',
          '-crf', '28',
          '-c:a', 'copy',
          '-y', tempOutput
        ]

        const sequentialProgress = 40 + Math.round((i + 1) / relevantSubtitles.length * 50)
        onProgress(sequentialProgress)

        onLog(`Processing subtitle ${i + 1}/${relevantSubtitles.length} (${subtitle.startTime.toFixed(1)}s-${subtitle.endTime.toFixed(1)}s)`)
        await this.ffmpeg.exec(simpleArgs)

        if (currentInput !== videoFileName) {
          try {
            await this.ffmpeg.deleteFile(currentInput)
          } catch {
            // Ignore cleanup errors
          }
        }

        currentInput = tempOutput
        tempCounter++
      }
    }

    onProgress(95)
    onLog(`Reading final output file: ${outputFileName}`)
    const data = await this.ffmpeg.readFile(outputFileName)

    if (!data || (data as Uint8Array).length === 0) {
      throw new Error("Final output file is empty")
    }

    const mimeType = outputFormat === "mp4" ? "video/mp4" : "video/webm"
    const url = URL.createObjectURL(new Blob([typeof data === 'string' ? data : new Uint8Array(data)], { type: mimeType }))

    onLog("Cleaning up temporary files")
    try {
      await this.ffmpeg.deleteFile(videoFileName)
      await this.ffmpeg.deleteFile(outputFileName)
      for (const subtitle of relevantSubtitles) {
        try {
          await this.ffmpeg.deleteFile(`subtitle_${subtitle.index}.png`)
        } catch {
          // Ignore cleanup errors
        }
      }
    } catch {
      onLog("Note: Some files couldn't be cleaned up (this is normal)")
    }

    return url
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
}