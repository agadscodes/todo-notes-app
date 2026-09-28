import type { FormEventHandler } from 'react'
import type { AppCopy } from '../../app/copy'
import type { Note, VoiceNoteMeta } from '../../types'
import { CustomAudioPlayer } from '../audio/CustomAudioPlayer'

interface NotesViewProps {
  notes: Note[]
  title: string
  content: string
  tags: string
  isEditing: boolean
  audioUrl: string | null
  audioPreviewId: string | null
  copy: AppCopy
  onTitleChange: (title: string) => void
  onContentChange: (content: string) => void
  onTagsChange: (tags: string) => void
  onEdit: (note: Note) => void
  onCancelEdit: () => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onTogglePin: (noteId: string) => void
  onDelete: (noteId: string) => void
  onPreview: (memo: VoiceNoteMeta) => void
}

export function NotesView({
  notes,
  title,
  content,
  tags,
  isEditing,
  audioUrl,
  audioPreviewId,
  copy,
  onTitleChange,
  onContentChange,
  onTagsChange,
  onEdit,
  onCancelEdit,
  onSubmit,
  onTogglePin,
  onDelete,
  onPreview,
}: NotesViewProps) {
  return (
    <section className="panel notes-panel flex min-h-0 flex-col overflow-hidden">
      <div className="panel-header flex items-center justify-between">
        <h3>{copy.notes}</h3>
      </div>

      <form onSubmit={onSubmit} className="note-form grid">
        <input
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={copy.noteTitle}
          aria-label="New note title"
        />
        <textarea
          value={content}
          onChange={(event) => onContentChange(event.target.value)}
          placeholder={copy.writeNote}
          aria-label="New note content"
        />
        <input
          value={tags}
          onChange={(event) => onTagsChange(event.target.value)}
          placeholder={copy.tags}
          aria-label="Note tags"
        />
        <button type="submit" className="primary-button justify-self-start">
          {isEditing ? copy.saveChanges : copy.saveNote}
        </button>
        {isEditing && (
          <button type="button" className="ghost-button justify-self-start" onClick={onCancelEdit}>
            {copy.cancel}
          </button>
        )}
      </form>

      <div className="notes-grid grid min-h-0">
        {notes.map((note) => (
          <article key={note.id} className={note.pinned ? 'note-card pinned flex flex-col' : 'note-card flex flex-col'}>
            <div className="note-topline flex items-center justify-between">
              <h4>{note.title}</h4>
              <button
                type="button"
                className="pin-button"
                onClick={() => onTogglePin(note.id)}
                aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
              >
                {note.pinned ? '📌' : '📍'}
              </button>
            </div>
            <p>{note.content}</p>
            <div className="tag-row flex flex-wrap">
              {note.tags.map((tag) => (
                <span key={tag} className="tag-pill">#{tag}</span>
              ))}
            </div>
            {note.voiceNote && (
              <div className="note-audio-row flex flex-wrap items-center">
                <span>{formatSeconds(note.voiceNote.durationSeconds)}</span>
                <button type="button" className="secondary-button" onClick={() => onPreview(note.voiceNote!)}>
                  {copy.listen}
                </button>
                {audioUrl && audioPreviewId === note.voiceNote.audioId && (
                  <CustomAudioPlayer src={audioUrl} playLabel={copy.play} pauseLabel={copy.pause} />
                )}
              </div>
            )}
            <div className="note-actions flex">
              <button type="button" className="secondary-button" onClick={() => onEdit(note)}>
                {copy.edit}
              </button>
              <button type="button" className="ghost-button delete-note mt-auto" onClick={() => onDelete(note.id)}>
                {copy.delete}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}
