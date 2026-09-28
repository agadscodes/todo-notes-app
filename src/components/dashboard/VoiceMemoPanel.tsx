import type { AppCopy } from '../../app/copy'
import type { VoiceNoteMeta } from '../../types'
import { CustomAudioPlayer } from '../audio/CustomAudioPlayer'

function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

interface VoiceMemoPanelProps {
  memo: VoiceNoteMeta | null
  title: string
  isRecording: boolean
  recordingSeconds: number
  isSaved: boolean
  audioUrl: string | null
  audioPreviewId: string | null
  copy: AppCopy
  onTitleChange: (title: string) => void
  onRecord: () => void
  onStop: () => void
  onPreview: (memo: VoiceNoteMeta) => void
  onSave: () => void
  onDelete: (memo: VoiceNoteMeta) => void
}

export function VoiceMemoPanel({
  memo,
  title,
  isRecording,
  recordingSeconds,
  isSaved,
  audioUrl,
  audioPreviewId,
  copy,
  onTitleChange,
  onRecord,
  onStop,
  onPreview,
  onSave,
  onDelete,
}: VoiceMemoPanelProps) {
  return (
    <section className="panel flex min-h-0 flex-col">
      <div className="panel-header flex items-center justify-between">
        <h3>{copy.voiceMemo}</h3>
        <button
          type="button"
          className={isRecording ? 'record-button active' : 'record-button'}
          onClick={isRecording ? onStop : onRecord}
        >
          <span className="record-dot" aria-hidden="true" />
          {isRecording ? `${copy.stop} · ${formatSeconds(recordingSeconds)}` : copy.record}
        </button>
      </div>

      <div className="voice-card grid">
        <p className="eyebrow">{copy.attachment}</p>
        {memo ? (
          <>
            <div className="voice-meta-row flex items-center justify-between">
              <span>{formatSeconds(memo.durationSeconds)}</span>
              <span>{memo.mimeType}</span>
            </div>
            <input
              value={title}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder={copy.memoName}
              aria-label={copy.memoName}
              disabled={isSaved}
            />
            <div className="voice-actions flex">
              <button type="button" className="secondary-button" onClick={() => onPreview(memo)}>
                {copy.play}
              </button>
              <button type="button" className="primary-button compact" onClick={onSave} disabled={isSaved}>
                {copy.saveMemo}
              </button>
              <button type="button" className="ghost-button" onClick={() => onDelete(memo)}>
                {copy.remove}
              </button>
            </div>
          </>
        ) : (
          <p className="empty-copy">{copy.noVoiceMemo}</p>
        )}
        {audioUrl && memo && audioPreviewId === memo.audioId && (
          <CustomAudioPlayer src={audioUrl} playLabel={copy.play} pauseLabel={copy.pause} />
        )}
      </div>
    </section>
  )
}
