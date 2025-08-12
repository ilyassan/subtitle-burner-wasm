export interface SubtitleEntry {
  index: number
  startTime: number
  endTime: number
  text: string
}

export interface VideoInfo {
  width: number
  height: number
  duration: number
}

export interface SubtitleStats {
  total: number
  relevant: number
  filtered: number
}

export interface GoogleFont {
  family: string
  category: string
}