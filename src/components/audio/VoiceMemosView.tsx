import type { AppCopy } from '../../app/copy'
import type { SavedVoiceMemo, VoiceNoteMeta } from '../../types'
import { CustomAudioPlayer } from './CustomAudioPlayer'

interface VoiceMemosViewProps {
  memos: SavedVoiceMemo[]
  audioUrl: string | null
  audioPreviewId: string | null
  copy: AppCopy
  onPreview: (memo: VoiceNoteMeta) => void
  onDelete: (memo: VoiceNoteMeta) => void
}

export function VoiceMemosView({
  memos,
  audioUrl,
  audioPreviewId,
  copy,
  onPreview,
  onDelete,
}: VoiceMemosViewProps) {
  return (
    <section className="panel voice-library-panel min-h-0 overflow-auto">
      <div className="panel-header flex items-center justify-between">
        <h3>{copy.voiceLibrary}</h3>
      </div>
      <div className="voice-library-list grid">
        {memos.map((memo) => (
          <article key={memo.audioId} className="voice-library-item grid items-center">
            <div>
              <h4>{memo.title}</h4>
              <p>{formatSeconds(memo.durationSeconds)} · {memo.mimeType}</p>
            </div>
            <button type="button" className="secondary-button" onClick={() => onPreview(memo)}>
              {copy.listen}
            </button>
            <button type="button" className="ghost-button" onClick={() => onDelete(memo)}>
              {copy.remove}
            </button>
            {audioUrl && audioPreviewId === memo.audioId && (
              <CustomAudioPlayer src={audioUrl} playLabel={copy.play} pauseLabel={copy.pause} />
            )}
          </article>
        ))}
        {memos.length === 0 && <p className="empty-copy">{copy.noSavedMemos}</p>}
      </div>
    </section>
  )
}

function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}
