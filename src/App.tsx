import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import { useLocalStorage } from './hooks/useLocalStorage'
import { deleteAudioRecord, getAudioRecord, saveAudioRecord } from './services/idbStorage'
import type { Note, Priority, SavedVoiceMemo, Todo, VoiceNoteMeta } from './types'

const initialTodos: Todo[] = [
  {
    id: 'todo-1',
    title: 'Plan the week',
    description: 'Outline the next sprint and key deliverables.',
    isCompleted: false,
    priority: 'high',
    dueDate: '2026-09-30',
    createdAt: Date.now(),
  },
  {
    id: 'todo-2',
    title: 'Review design notes',
    description: 'Capture improvements to the dashboard layout.',
    isCompleted: true,
    priority: 'medium',
    dueDate: '2026-09-29',
    createdAt: Date.now() - 1000 * 60 * 15,
  },
]

const initialNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Productive rituals',
    content: 'Keep the first hour of the day free for the work that matters most and avoid context switching.',
    tags: ['focus', 'habits'],
    pinned: true,
    createdAt: Date.now() - 1000 * 60 * 30,
    updatedAt: Date.now() - 1000 * 60 * 10,
  },
  {
    id: 'note-2',
    title: 'Launch ideas',
    content: 'Collect quick prototypes, beta feedback, and customer quotes into a single review folder.',
    tags: ['ideas', 'growth'],
    pinned: false,
    createdAt: Date.now() - 1000 * 60 * 90,
    updatedAt: Date.now() - 1000 * 60 * 45,
  },
]

const filters = ['all', 'active', 'completed'] as const

type TodoFilter = (typeof filters)[number]
type Language = 'en' | 'es'
type AppView = 'dashboard' | 'notes' | 'voiceMemos'

const copy = {
  en: {
    workspace: 'workspace',
    settings: 'Settings',
    language: 'Language',
    appearance: 'Appearance',
    lightMode: 'Light mode',
    dashboard: 'Dashboard',
    mondayDashboard: 'Monday dashboard',
    commandCenter: 'Daily command center',
    newTask: 'New task',
    totalTasks: 'Total tasks',
    completed: 'Completed',
    notes: 'Notes',
    voiceMemos: 'Voice memos',
    todoQueue: 'Todo queue',
    all: 'All',
    active: 'Active',
    addQuickTask: 'Add a quick task',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    add: 'Add',
    priority: 'Priority',
    remove: 'Remove',
    voiceMemo: 'Voice memo',
    stop: 'Stop',
    record: 'Record',
    attachment: 'Attachment',
    noVoiceMemo: 'No voice memo attached yet.',
    play: 'Play',
    pause: 'Pause',
    noteTitle: 'Note title',
    writeNote: 'Write a quick thought, summary, or plan...',
    tags: 'Tags separated by commas',
    saveNote: 'Save note',
    listen: 'Listen',
    delete: 'Delete',
    voiceLibrary: 'Saved voice memos',
    noSavedMemos: 'Your saved voice memos will appear here.',
    memoName: 'Name this voice memo',
    saveMemo: 'Save to library',
    memoSaved: 'Voice memo saved to your library.',
  },
  es: {
    workspace: 'espacio de trabajo',
    settings: 'Ajustes',
    language: 'Idioma',
    appearance: 'Apariencia',
    lightMode: 'Modo claro',
    dashboard: 'Inicio',
    mondayDashboard: 'Panel del lunes',
    commandCenter: 'Centro de actividad',
    newTask: 'Nueva tarea',
    totalTasks: 'Tareas totales',
    completed: 'Completadas',
    notes: 'Notas',
    voiceMemos: 'Notas de voz',
    todoQueue: 'Lista de tareas',
    all: 'Todas',
    active: 'Activas',
    addQuickTask: 'Añadir una tarea',
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    add: 'Añadir',
    priority: 'Prioridad',
    remove: 'Quitar',
    voiceMemo: 'Nota de voz',
    stop: 'Detener',
    record: 'Grabar',
    attachment: 'Adjunto',
    noVoiceMemo: 'Todavía no hay ninguna nota de voz.',
    play: 'Reproducir',
    pause: 'Pausar',
    noteTitle: 'Título de la nota',
    writeNote: 'Escribe una idea, resumen o plan...',
    tags: 'Etiquetas separadas por comas',
    saveNote: 'Guardar nota',
    listen: 'Escuchar',
    delete: 'Eliminar',
    voiceLibrary: 'Notas de voz guardadas',
    noSavedMemos: 'Tus notas de voz guardadas aparecerán aquí.',
    memoName: 'Ponle nombre a esta nota de voz',
    saveMemo: 'Guardar en la biblioteca',
    memoSaved: 'Nota de voz guardada en tu biblioteca.',
  },
} satisfies Record<Language, Record<string, string>>

const createId = () => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)

function formatSeconds(totalSeconds: number) {
  const mins = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

function CustomAudioPlayer({
  src,
  playLabel,
  pauseLabel,
}: {
  src: string
  playLabel: string
  pauseLabel: string
}) {
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
    <div className="custom-audio-player">
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
        className="audio-toggle"
        onClick={togglePlayback}
        aria-label={isPlaying ? pauseLabel : playLabel}
        title={isPlaying ? pauseLabel : playLabel}
      >
        {isPlaying ? 'Ⅱ' : '▶'}
      </button>
      <span className="audio-time">{formatSeconds(Math.floor(currentTime))}</span>
      <input
        className="audio-seek"
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
      <span className="audio-time">{formatSeconds(Math.floor(duration))}</span>
    </div>
  )
}

function App() {
  const [todos, setTodos] = useLocalStorage<Todo[]>('todo-notes-app-todos', initialTodos)
  const [notes, setNotes] = useLocalStorage<Note[]>('todo-notes-app-notes', initialNotes)
  const [savedVoiceMemos, setSavedVoiceMemos] = useLocalStorage<SavedVoiceMemo[]>(
    'todo-notes-app-saved-voice-memos',
    [],
  )
  const [language, setLanguage] = useLocalStorage<Language>('todo-notes-app-language', 'en')
  const [lightMode, setLightMode] = useLocalStorage('todo-notes-app-light-mode', false)
  const [activeView, setActiveView] = useState<AppView>('dashboard')
  const [todoTitle, setTodoTitle] = useState('')
  const [todoPriority, setTodoPriority] = useState<Priority>('medium')
  const [todoFilter, setTodoFilter] = useState<TodoFilter>('all')
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteTags, setNoteTags] = useState('')
  const [voiceMemo, setVoiceMemo] = useState<VoiceNoteMeta | null>(null)
  const [voiceMemoTitle, setVoiceMemoTitle] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [audioPreviewId, setAudioPreviewId] = useState<string | null>(null)
  const [showSavedToast, setShowSavedToast] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const intervalRef = useRef<number | null>(null)
  const todoInputRef = useRef<HTMLInputElement>(null)
  const t = copy[language]

  const visibleTodos = useMemo(
    () =>
      todos.filter((todo) => {
        if (todoFilter === 'active') return !todo.isCompleted
        if (todoFilter === 'completed') return todo.isCompleted
        return true
      }),
    [todoFilter, todos],
  )

  const pinnedNotes = useMemo(
    () => [...notes].sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt - a.updatedAt),
    [notes],
  )

  const voiceMemoLibrary = useMemo(() => {
    const library = new Map(savedVoiceMemos.map((memo) => [memo.audioId, memo]))

    notes.forEach((note) => {
      if (note.voiceNote && !library.has(note.voiceNote.audioId)) {
        library.set(note.voiceNote.audioId, {
          ...note.voiceNote,
          title: note.title,
          savedAt: note.updatedAt,
        })
      }
    })

    return [...library.values()].sort((a, b) => b.savedAt - a.savedAt)
  }, [notes, savedVoiceMemos])

  useEffect(() => {
    if (!isRecording) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = window.setInterval(() => {
      setRecordingSeconds((value) => value + 1)
    }, 1000)

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRecording])

  useEffect(() => {
    if (!showSavedToast) return
    const timeout = window.setTimeout(() => setShowSavedToast(false), 2800)
    return () => window.clearTimeout(timeout)
  }, [showSavedToast])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl)
      }
    }
  }, [audioUrl])

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const handleStopRecording = async () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) {
      stopStream()
      setIsRecording(false)
      return
    }

    if (recorder.state !== 'inactive') {
      recorder.stop()
    }

    stopStream()
    setIsRecording(false)
    setRecordingSeconds(0)
  }

  const handleStartRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      window.alert('Microphone access is not supported in this browser.')
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined)
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: mimeType || 'audio/webm',
        })
        const audioId = createId()

        try {
          await saveAudioRecord(audioId, blob)
          setVoiceMemo({
            audioId,
            durationSeconds: recordingSeconds || Math.max(1, Math.ceil(blob.size / 16000)),
            mimeType: blob.type || mimeType,
          })
          setVoiceMemoTitle('')
        } catch {
          window.alert('Unable to save the voice memo. Please try again.')
        }
      }

      recorder.start()
      setRecordingSeconds(0)
      setIsRecording(true)
    } catch {
      window.alert('Microphone permission was denied. Please allow mic access to record voice notes.')
    }
  }

  const createTodo = (event: React.FormEvent) => {
    event.preventDefault()
    const title = todoTitle.trim()

    if (!title) {
      return
    }

    const nextTodo: Todo = {
      id: createId(),
      title,
      description: `Priority: ${todoPriority}`,
      isCompleted: false,
      priority: todoPriority,
      createdAt: Date.now(),
    }

    setTodos((currentTodos) => [nextTodo, ...currentTodos])
    setTodoTitle('')
    setTodoPriority('medium')
  }

  const toggleTodo = (todoId: string) => {
    setTodos((currentTodos) =>
      currentTodos.map((todo) =>
        todo.id === todoId ? { ...todo, isCompleted: !todo.isCompleted } : todo,
      ),
    )
  }

  const deleteTodo = (todoId: string) => {
    setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== todoId))
  }

  const addNote = (event: React.FormEvent) => {
    event.preventDefault()
    const title = noteTitle.trim()
    const content = noteContent.trim()

    if (!title && !content) {
      return
    }

    const nextNote: Note = {
      id: createId(),
      title: title || 'Untitled note',
      content: content || 'Voice memo attached',
      tags: noteTags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      pinned: false,
      voiceNote: voiceMemo ?? undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    setNotes((currentNotes) => [nextNote, ...currentNotes])
    setNoteTitle('')
    setNoteContent('')
    setNoteTags('')
    setVoiceMemo(null)
  }

  const toggleNotePin = (noteId: string) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === noteId ? { ...note, pinned: !note.pinned, updatedAt: Date.now() } : note,
      ),
    )
  }

  const deleteNote = (noteId: string) => {
    setNotes((currentNotes) => currentNotes.filter((note) => note.id !== noteId))
  }

  const handlePreview = async (meta: VoiceNoteMeta) => {
    try {
      const blob = await getAudioRecord(meta.audioId)
      if (!blob) {
        return
      }

      const nextUrl = URL.createObjectURL(blob)
      setAudioUrl((currentUrl) => {
        if (currentUrl) {
          URL.revokeObjectURL(currentUrl)
        }
        return nextUrl
      })
      setAudioPreviewId(meta.audioId)
    } catch {
      window.alert('This voice clip could not be loaded.')
    }
  }

  const handleDeleteVoiceMemo = async (meta: VoiceNoteMeta) => {
    try {
      await deleteAudioRecord(meta.audioId)
      setAudioUrl(null)
      setAudioPreviewId(null)
      setVoiceMemo((currentMemo) => currentMemo?.audioId === meta.audioId ? null : currentMemo)
      setVoiceMemoTitle('')
      setSavedVoiceMemos((currentMemos) =>
        currentMemos.filter((memo) => memo.audioId !== meta.audioId),
      )
      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.voiceNote?.audioId === meta.audioId ? { ...note, voiceNote: undefined, updatedAt: Date.now() } : note,
        ),
      )
    } catch {
      window.alert('Unable to remove this voice memo.')
    }
  }

  const saveVoiceMemo = () => {
    if (!voiceMemo) {
      return
    }

    setSavedVoiceMemos((currentMemos) => {
      if (currentMemos.some((memo) => memo.audioId === voiceMemo.audioId)) {
        return currentMemos
      }

      return [
        {
          ...voiceMemo,
          title: voiceMemoTitle.trim() || `${t.voiceMemo} ${new Date().toLocaleDateString()}`,
          savedAt: Date.now(),
        },
        ...currentMemos,
      ]
    })
    setShowSavedToast(true)
  }

  return (
    <div className={lightMode ? 'app-shell light-mode' : 'app-shell'}>
      <aside className="sidebar">
        <div>
          <div className="brand-wrap">
            <div className="brand-mark">N</div>
            <div>
              <p className="eyebrow">{t.workspace}</p>
              <h1>Northstar</h1>
            </div>
          </div>
        </div>

        <nav className="sidebar-navigation" aria-label="Main navigation">
          <button
            type="button"
            className={activeView === 'dashboard' ? 'sidebar-link active' : 'sidebar-link'}
            onClick={() => setActiveView('dashboard')}
          >
            {t.dashboard}
          </button>
          <button
            type="button"
            className={activeView === 'notes' ? 'sidebar-link active' : 'sidebar-link'}
            onClick={() => setActiveView('notes')}
          >
            {t.notes}
          </button>
          <button
            type="button"
            className={activeView === 'voiceMemos' ? 'sidebar-link active' : 'sidebar-link'}
            onClick={() => setActiveView('voiceMemos')}
          >
            {t.voiceMemos}
          </button>
        </nav>

        <section className="settings-panel" aria-labelledby="settings-title">
          <h2 id="settings-title">{t.settings}</h2>
          <label className="setting-control">
            <span>{t.language}</span>
            <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
          <label className="setting-toggle">
            <span>{t.lightMode}</span>
            <input
              type="checkbox"
              checked={lightMode}
              onChange={(event) => setLightMode(event.target.checked)}
            />
          </label>
        </section>
      </aside>

      <main className={`main-panel ${activeView}-view`}>
        <header className="topbar">
          <div>
            <p className="eyebrow">{activeView === 'dashboard' ? t.mondayDashboard : t.workspace}</p>
            <h2>
              {activeView === 'dashboard' && t.commandCenter}
              {activeView === 'notes' && t.notes}
              {activeView === 'voiceMemos' && t.voiceMemos}
            </h2>
          </div>
          {activeView === 'dashboard' && (
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                todoInputRef.current?.focus()
                todoInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
              }}
            >
              {t.newTask}
            </button>
          )}
        </header>

        {activeView === 'dashboard' && <>
        <section className="stats-grid">
          <article className="stat-card">
            <span>{t.totalTasks}</span>
            <strong>{todos.length}</strong>
          </article>
          <article className="stat-card">
            <span>{t.completed}</span>
            <strong>{todos.filter((todo) => todo.isCompleted).length}</strong>
          </article>
          <article className="stat-card">
            <span>{t.notes}</span>
            <strong>{notes.length}</strong>
          </article>
          <article className="stat-card">
            <span>{t.voiceMemos}</span>
            <strong>{notes.filter((note) => note.voiceNote).length}</strong>
          </article>
        </section>

        <div className="content-grid">
          <section className="panel">
            <div className="panel-header">
              <h3>{t.todoQueue}</h3>
              <div className="filter-row" role="tablist" aria-label="Filter todos">
                {filters.map((filter) => (
                  <button
                    key={filter}
                    type="button"
                    className={filter === todoFilter ? 'filter-button active' : 'filter-button'}
                    onClick={() => setTodoFilter(filter)}
                  >
                    {t[filter]}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={createTodo} className="composer-row">
              <input
                ref={todoInputRef}
                value={todoTitle}
                onChange={(event) => setTodoTitle(event.target.value)}
                placeholder={t.addQuickTask}
                aria-label="New todo title"
              />
              <select value={todoPriority} onChange={(event) => setTodoPriority(event.target.value as Priority)}>
                <option value="low">{t.low}</option>
                <option value="medium">{t.medium}</option>
                <option value="high">{t.high}</option>
              </select>
              <button type="submit" className="primary-button compact">
                {t.add}
              </button>
            </form>

            <ul className="todo-list">
              {visibleTodos.map((todo) => (
                <li key={todo.id} className={todo.isCompleted ? 'todo-item completed' : 'todo-item'}>
                  <button type="button" className="check-button" onClick={() => toggleTodo(todo.id)} aria-label={`Toggle ${todo.title}`}>
                    {todo.isCompleted ? '✓' : ''}
                  </button>
                  <div className="todo-copy">
                    <strong>{todo.title}</strong>
                    {todo.description && <span>{todo.description}</span>}
                  </div>
                  <span className={`priority-pill ${todo.priority}`}>{todo.priority}</span>
                  <button type="button" className="ghost-button" onClick={() => deleteTodo(todo.id)}>
                    {t.remove}
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <div className="panel-header">
              <h3>{t.voiceMemo}</h3>
              <button
                type="button"
                className={isRecording ? 'record-button active' : 'record-button'}
                onClick={isRecording ? handleStopRecording : handleStartRecording}
              >
                <span className="record-dot" aria-hidden="true" />
                {isRecording ? `${t.stop} · ${formatSeconds(recordingSeconds)}` : t.record}
              </button>
            </div>

            <div className="voice-card">
              <p className="eyebrow">{t.attachment}</p>
              {voiceMemo ? (
                <>
                  <div className="voice-meta-row">
                    <span>{formatSeconds(voiceMemo.durationSeconds)}</span>
                    <span>{voiceMemo.mimeType}</span>
                  </div>
                  <div className="voice-actions">
                    <button type="button" className="secondary-button" onClick={() => handlePreview(voiceMemo)}>
                      {t.play}
                    </button>
                    <button
                      type="button"
                      className="primary-button compact"
                      onClick={saveVoiceMemo}
                      disabled={savedVoiceMemos.some((memo) => memo.audioId === voiceMemo.audioId)}
                    >
                      {t.saveMemo}
                    </button>
                    <button type="button" className="ghost-button" onClick={() => handleDeleteVoiceMemo(voiceMemo)}>
                      {t.remove}
                    </button>
                  </div>
                  <input
                    value={voiceMemoTitle}
                    onChange={(event) => setVoiceMemoTitle(event.target.value)}
                    placeholder={t.memoName}
                    aria-label={t.memoName}
                    disabled={savedVoiceMemos.some((memo) => memo.audioId === voiceMemo.audioId)}
                  />
                </>
              ) : (
                <p className="empty-copy">{t.noVoiceMemo}</p>
              )}
              {audioUrl && audioPreviewId === voiceMemo?.audioId && (
                <CustomAudioPlayer src={audioUrl} playLabel={t.play} pauseLabel={t.pause} />
              )}
            </div>
          </section>
        </div>

        </>}

        {activeView === 'notes' && <section className="panel notes-panel">
          <div className="panel-header">
          <h3>{t.notes}</h3>
          </div>

          <form onSubmit={addNote} className="note-form">
            <input
              value={noteTitle}
              onChange={(event) => setNoteTitle(event.target.value)}
              placeholder={t.noteTitle}
              aria-label="New note title"
            />
            <textarea
              value={noteContent}
              onChange={(event) => setNoteContent(event.target.value)}
              placeholder={t.writeNote}
              aria-label="New note content"
            />
            <input
              value={noteTags}
              onChange={(event) => setNoteTags(event.target.value)}
              placeholder={t.tags}
              aria-label="Note tags"
            />
            <button type="submit" className="primary-button">
              {t.saveNote}
            </button>
          </form>

          <div className="notes-grid">
            {pinnedNotes.map((note) => (
              <article key={note.id} className={note.pinned ? 'note-card pinned' : 'note-card'}>
                <div className="note-topline">
                  <h4>{note.title}</h4>
                  <button type="button" className="pin-button" onClick={() => toggleNotePin(note.id)}>
                    {note.pinned ? '📌' : '📍'}
                  </button>
                </div>
                <p>{note.content}</p>
                <div className="tag-row">
                  {note.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
                {note.voiceNote && (
                  <div className="note-audio-row">
                    <span>{formatSeconds(note.voiceNote.durationSeconds)}</span>
                    <button type="button" className="secondary-button" onClick={() => handlePreview(note.voiceNote!)}>
                      {t.listen}
                    </button>
                    {audioUrl && audioPreviewId === note.voiceNote.audioId && (
                      <CustomAudioPlayer src={audioUrl} playLabel={t.play} pauseLabel={t.pause} />
                    )}
                  </div>
                )}
                <button type="button" className="ghost-button delete-note" onClick={() => deleteNote(note.id)}>
                  {t.delete}
                </button>
              </article>
            ))}
          </div>
        </section>}

        {activeView === 'voiceMemos' && <section className="panel voice-library-panel">
          <div className="panel-header">
            <h3>{t.voiceLibrary}</h3>
          </div>
          <div className="voice-library-list">
            {voiceMemoLibrary.map((memo) => (
              <article key={memo.audioId} className="voice-library-item">
                <div>
                  <h4>{memo.title}</h4>
                  <p>{formatSeconds(memo.durationSeconds)} · {memo.mimeType}</p>
                </div>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => handlePreview(memo)}
                >
                  {t.listen}
                </button>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => handleDeleteVoiceMemo(memo)}
                >
                  {t.remove}
                </button>
                {audioUrl && audioPreviewId === memo.audioId && (
                  <CustomAudioPlayer src={audioUrl} playLabel={t.play} pauseLabel={t.pause} />
                )}
              </article>
            ))}
            {voiceMemoLibrary.length === 0 && (
              <p className="empty-copy">{t.noSavedMemos}</p>
            )}
          </div>
        </section>}
      </main>
      {showSavedToast && (
        <div className="save-toast" role="status" aria-live="polite">
          <span className="toast-check" aria-hidden="true">✓</span>
          {t.memoSaved}
        </div>
      )}
    </div>
  )
}

export default App
