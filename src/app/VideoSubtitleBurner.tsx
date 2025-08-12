"use client"

import React, { useState, useRef, useEffect, useCallback, memo } from "react"
import Script from "next/script"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UploadCloud, FileVideo, FileText, Download, AlertCircle, Eye, Clock } from 'lucide-react'
import { FixedSizeList as List } from "react-window"
import debounce from "lodash/debounce"
import { FFmpeg } from "@ffmpeg/ffmpeg"
import { SubtitleProcessor } from "@/lib/SubtitleProcessor"
import { SubtitleEntry, VideoInfo, SubtitleStats, GoogleFont } from "@/types/types"

const VideoSubtitleBurner = memo(() => {
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [subtitleFile, setSubtitleFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ffmpegLoaded, setFffmpegLoaded] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)
  const [fontSize, setFontSize] = useState("24")
  const [fontColor, setFontColor] = useState("#FFFFFF")
  const [outputFormat, setOutputFormat] = useState("mp4")
  const [parsedSubtitles, setParsedSubtitles] = useState<SubtitleEntry[]>([])
  const [relevantSubtitles, setRelevantSubtitles] = useState<SubtitleEntry[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [subtitleStats, setSubtitleStats] = useState<SubtitleStats | null>(null)
  const [fonts, setFonts] = useState<GoogleFont[]>([])
  const [selectedFont, setSelectedFont] = useState<string>("Roboto")

  const ffmpegRef = useRef<FFmpeg>(new FFmpeg())
  const processorRef = useRef(new SubtitleProcessor(ffmpegRef.current))

  useEffect(() => {
    const loadFffmpeg = async () => {
      if (!scriptLoaded) {
        setLogs((prevLogs) => [...prevLogs, "Waiting for ffmpeg-core.js to load"])
        return
      }

      try {
        await processorRef.current.loadFFmpeg({
          onLog: (message) => setLogs((prevLogs) => [...prevLogs, message]),
          onProgress: (progress) => setProgress(Math.round(progress * 100))
        })
        setFffmpegLoaded(true)
        setLogs((prevLogs) => [...prevLogs, "FFmpeg loaded successfully"])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err)
        setError(`Failed to load FFmpeg: ${errorMessage}`)
        setLogs((prevLogs) => [...prevLogs, `FFmpeg load error: ${errorMessage}`])
      }
    }

    const loadFonts = async () => {
      try {
        const fontList = await processorRef.current.fetchGoogleFonts()
        setFonts(fontList)
        setLogs((prevLogs) => [...prevLogs, `Loaded ${fontList.length} Google Fonts`])
      } catch (err) {
        setError(`Failed to load Google Fonts: ${err instanceof Error ? err.message : String(err)}`)
        setLogs((prevLogs) => [...prevLogs, `Google Fonts load error: ${err instanceof Error ? err.message : String(err)}`])
      }
    }

    loadFffmpeg()
    loadFonts()
  }, [scriptLoaded])

  useEffect(() => {
    return () => {
      if (downloadUrl) URL.revokeObjectURL(downloadUrl)
    }
  }, [downloadUrl])

  const handleVideoFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debounce(async () => {
        const file = e.target.files?.[0]
        if (file) {
          setVideoFile(file)
          setError(null)

          try {
            const info = await processorRef.current.getVideoInfo(file)
            setVideoInfo(info)
            setLogs((prevLogs) => [...prevLogs, `Video info: ${info.width}x${info.height}, ${info.duration.toFixed(2)}s`])

            if (parsedSubtitles.length > 0) {
              const { filteredSubtitles, stats } = processorRef.current.filterSubtitlesByDuration(parsedSubtitles, info.duration)
              setRelevantSubtitles(filteredSubtitles)
              setSubtitleStats(stats)
              setLogs((prevLogs) => [...prevLogs, `Subtitle optimization: ${stats.relevant}/${stats.total} subtitles are relevant for ${info.duration.toFixed(1)}s video (${stats.filtered} filtered out)`])
            }
          } catch {
            setLogs((prevLogs) => [...prevLogs, "Could not get video info"])
          }
        }
      }, 300)()
    },
    [parsedSubtitles]
  )

  const handleSubtitleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      debounce(async () => {
        const file = e.target.files?.[0]
        if (file) {
          setSubtitleFile(file)
          setError(null)

          try {
            const parsed = await processorRef.current.parseSubtitleFile(file)
            setParsedSubtitles(parsed)
            setLogs((prevLogs) => [...prevLogs, `Parsed ${parsed.length} subtitle entries from ${file.name}`])

            if (videoInfo) {
              const { filteredSubtitles, stats } = processorRef.current.filterSubtitlesByDuration(parsed, videoInfo.duration)
              setRelevantSubtitles(filteredSubtitles)
              setSubtitleStats(stats)
              setLogs((prevLogs) => [...prevLogs, `Subtitle optimization: ${stats.relevant}/${stats.total} subtitles are relevant for ${videoInfo.duration.toFixed(1)}s video (${stats.filtered} filtered out)`])
            } else {
              setRelevantSubtitles(parsed)
              setSubtitleStats({ total: parsed.length, relevant: parsed.length, filtered: 0 })
            }
          } catch (err) {
            setError(`Failed to parse subtitle file: ${err instanceof Error ? err.message : String(err)}`)
          }
        }
      }, 300)()
    },
    [videoInfo]
  )

  const processVideo = useCallback(async () => {
    if (!videoFile || !subtitleFile || relevantSubtitles.length === 0 || !videoInfo) {
      setError("Please upload both video and subtitle files, and ensure video info is loaded.")
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setLogs([])
    setDownloadUrl(null)
    setError(null)

    try {
      const url = await processorRef.current.processVideo({
        videoFile,
        relevantSubtitles,
        videoInfo,
        outputFormat,
        fontSize,
        fontColor,
        fontFamily: selectedFont,
        onLog: (message) => setLogs((prevLogs) => [...prevLogs, message]),
        onProgress: (progress) => setProgress(progress)
      })
      setDownloadUrl(url)
      setProgress(100)
      setLogs((prevLogs) => [...prevLogs, "✅ Processing completed successfully!"])
      if (subtitleStats?.filtered) {
        setLogs((prevLogs) => [...prevLogs, `Optimization saved significant processing time by filtering ${subtitleStats.filtered} irrelevant subtitles`])
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err)
      setError(`Processing failed: ${errorMessage}`)
      setLogs((prevLogs) => [...prevLogs, `Processing error: ${errorMessage}`])
    } finally {
      setIsProcessing(false)
    }
  }, [videoFile, subtitleFile, relevantSubtitles, videoInfo, outputFormat, fontSize, fontColor, selectedFont, subtitleStats])

  const LogRow = ({ index, style }: { index: number; style: React.CSSProperties }) => (
    <div style={style} className="p-1 text-xs">
      {logs[index]}
    </div>
  )

  const SubtitlePreviewRow = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const sub = relevantSubtitles[index]
    return (
      <div style={style} className="p-2 border-b text-sm">
        <div className="font-mono text-xs text-muted-foreground">
          {Math.floor(sub.startTime / 60)}:{(sub.startTime % 60).toFixed(1)}s → {Math.floor(sub.endTime / 60)}:{(sub.endTime % 60).toFixed(1)}s
        </div>
        <div className="mt-1" style={{ fontFamily: `'${selectedFont}', sans-serif`, color: fontColor, fontSize: `${parseInt(fontSize) * 0.6}px` }}>
          {sub.text}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Script
        src="https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js"
        strategy="afterInteractive"
        onLoad={() => {
          setScriptLoaded(true)
          setLogs((prevLogs) => [...prevLogs, "ffmpeg-core.js loaded"])
        }}
        onError={(e: Error) => {
          setError(`Failed to load ffmpeg-core.js: ${e.message}`)
          setLogs((prevLogs) => [...prevLogs, `ffmpeg-core.js load error: ${e.message}`])
        }}
      />

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold">Video Subtitle Burner</h1>
        <p className="text-muted-foreground">Smart subtitle processing with customizable Google Fonts</p>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Alert className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Smart Processing:</strong> Automatically filters subtitles to only process those within your video duration, saving time and resources.
        </AlertDescription>
      </Alert>

      {subtitleStats && subtitleStats.filtered > 0 && (
        <Alert className="mb-4">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            <strong>Optimization Active:</strong> {subtitleStats.filtered} subtitles filtered out (only processing {subtitleStats.relevant}/{subtitleStats.total} relevant subtitles)
          </AlertDescription>
        </Alert>
      )}

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Customize the appearance of your subtitles.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="font-family">Font Family</Label>
              <Select value={selectedFont} onValueChange={setSelectedFont}>
                <SelectTrigger id="font-family">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((font) => (
                    <SelectItem
                      key={font.family}
                      value={font.family}
                      style={{ fontFamily: `'${font.family}', ${font.category}` }}
                    >
                      {font.family}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <Input
                id="font-size"
                type="number"
                value={fontSize}
                onChange={(e) => setFontSize(e.target.value)}
                min="10"
                max="72"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="font-color">Font Color</Label>
              <Input
                id="font-color"
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="output-format">Output Format</Label>
              <Select value={outputFormat} onValueChange={setOutputFormat}>
                <SelectTrigger id="output-format">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mp4">MP4 (H.264)</SelectItem>
                  <SelectItem value="webm">WebM (VP9)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Video File</CardTitle>
            <CardDescription>Select the video file you want to process.</CardDescription>
          </CardHeader>
          <CardContent>
            <Label
              htmlFor="video-upload"
              className="cursor-pointer border-2 border-dashed border-muted rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50"
            >
              <FileVideo className="w-12 h-12 text-muted-foreground" />
              <span className="mt-2 text-muted-foreground">
                {videoFile ? videoFile.name : "Click to upload or drag and drop"}
              </span>
              {videoInfo && (
                <span className="text-xs text-muted-foreground mt-1">
                  {videoInfo.width}×{videoInfo.height}, {videoInfo.duration.toFixed(1)}s
                </span>
              )}
              <Input
                id="video-upload"
                type="file"
                className="hidden"
                accept="video/mp4,video/x-m4v,video/*"
                onChange={handleVideoFileChange}
              />
            </Label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subtitle File</CardTitle>
            <CardDescription>Select the subtitle file (.srt, .vtt, .ass, .ssa).</CardDescription>
          </CardHeader>
          <CardContent>
            <Label
              htmlFor="subtitle-upload"
              className="cursor-pointer border-2 border-dashed border-muted rounded-lg p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50"
            >
              <FileText className="w-12 h-12 text-muted-foreground" />
              <span className="mt-2 text-muted-foreground">
                {subtitleFile ? subtitleFile.name : "Click to upload or drag and drop"}
              </span>
              {subtitleStats && (
                <span className="text-xs text-muted-foreground mt-1">
                  {subtitleStats.relevant}/{subtitleStats.total} subtitles relevant
                </span>
              )}
              <Input
                id="subtitle-upload"
                type="file"
                className="hidden"
                accept=".srt,.vtt,.ass,.ssa"
                onChange={handleSubtitleFileChange}
              />
            </Label>
          </CardContent>
        </Card>
      </div>

      {relevantSubtitles.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Relevant Subtitles ({relevantSubtitles.length} entries)
              {subtitleStats && subtitleStats.filtered > 0 && (
                <span className="text-sm text-muted-foreground">
                  ({subtitleStats.filtered} filtered out)
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </CardTitle>
          </CardHeader>
          {showPreview && (
            <CardContent>
              <div className="border rounded-lg h-64 overflow-hidden">
                <List height={256} itemCount={relevantSubtitles.length} itemSize={60} width="100%">
                  {SubtitlePreviewRow}
                </List>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      <div className="text-center mb-8">
        <Button
          onClick={processVideo}
          disabled={!videoFile || !subtitleFile || relevantSubtitles.length === 0 || !videoInfo || isProcessing || !ffmpegLoaded}
          size="lg"
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          {isProcessing ? "Processing..." : ffmpegLoaded ? `Burn ${relevantSubtitles.length} Subtitles` : "Loading FFmpeg..."}
        </Button>
      </div>

      {isProcessing && (
        <div className="mb-8">
          <Progress value={progress} className="w-full" />
          <p className="text-center text-muted-foreground mt-2">{progress}%</p>
        </div>
      )}

      {logs.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Processing Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted text-muted-foreground p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
              <List height={256} itemCount={logs.length} itemSize={20} width="100%">
                {LogRow}
              </List>
            </div>
          </CardContent>
        </Card>
      )}

      {downloadUrl && (
        <Card>
          <CardHeader>
            <CardTitle>Preview & Download</CardTitle>
            <CardDescription>Your video with burned subtitles is ready!</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <video
              src={downloadUrl}
              controls
              className="w-full max-w-2xl mb-4 rounded-lg mx-auto"
              style={{ maxHeight: "400px" }}
            />
            <a href={downloadUrl} download={`video_with_subtitles.${outputFormat}`}>
              <Button size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download Video
              </Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
})

VideoSubtitleBurner.displayName = "VideoSubtitleBurner"

export default VideoSubtitleBurner