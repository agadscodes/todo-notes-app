import { useEffect, useRef, useState } from 'react'

function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

interface CustomAudioPlayerProps {
  src: string
  playLabel: string
  pauseLabel: string
}

export function CustomAudioPlayer({ src, playLabel, pauseLabel }: CustomAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
    audio.load()
    setCurrentTime(0)
    setDuration(0)
    setIsPlaying(false)
  }, [src])

  const togglePlayback = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (audio.paused) {
      try {
        await audio.play()
        setIsPlaying(true)
      } catch {
        setIsPlaying(false)
      }
      return
    }

    audio.pause()
    setIsPlaying(false)
  }

  return (
    <div className="custom-audio-player grid w-full items-center">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />
      <button
        type="button"
        className="audio-toggle grid place-items-center rounded-full"
        onClick={togglePlayback}
        aria-label={isPlaying ? pauseLabel : playLabel}
        title={isPlaying ? pauseLabel : playLabel}
      >
        {isPlaying ? 'Ⅱ' : '▶'}
      </button>
      <span className="audio-time tabular-nums">{formatSeconds(Math.floor(currentTime))}</span>
      <input
        className="audio-seek w-full accent-amber-400"
        type="range"
        min="0"
        max={duration || 1}
        step="0.1"
        value={Math.min(currentTime, duration || 1)}
        onChange={(event) => {
          const nextTime = Number(event.target.value)
          if (audioRef.current) audioRef.current.currentTime = nextTime
          setCurrentTime(nextTime)
        }}
        aria-label="Seek audio"
      />
      <span className="audio-time tabular-nums">{formatSeconds(Math.floor(duration))}</span>
    </div>
  )
}
