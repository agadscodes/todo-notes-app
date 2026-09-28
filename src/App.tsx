import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import './App.css'
import { copy, type Language, type AppView } from './app/copy'
import type { TodoFilter } from './app/filters'
import { SavedToast } from './components/common/SavedToast'
import { DashboardView } from './components/dashboard/DashboardView'
import { VoiceMemosView } from './components/audio/VoiceMemosView'
import { NotesView } from './components/notes/NotesView'
import { PageHeader } from './components/layout/PageHeader'
import { Sidebar } from './components/layout/Sidebar'
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

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`

const getTimestamp = () => Date.now()

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
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
  const [noteTitle, setNoteTitle] = useState('')
  const [noteContent, setNoteContent] = useState('')
  const [noteTags, setNoteTags] = useState('')
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
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
      streamRef.current?.getTracks().forEach((track) => track.stop())
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
  }

  const handleStopRecording = () => {
    const recorder = mediaRecorderRef.current
    if (!recorder) {
      stopStream()
      setIsRecording(false)
      return
    }

    if (recorder.state !== 'inactive') recorder.stop()
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
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || 'audio/webm' })
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

  const createTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = todoTitle.trim()
    if (!title) return

    if (editingTodoId) {
      setTodos((currentTodos) =>
        currentTodos.map((todo) => todo.id === editingTodoId
          ? { ...todo, title, description: `Priority: ${todoPriority}`, priority: todoPriority }
          : todo),
      )
      setEditingTodoId(null)
    } else {
      const nextTodo: Todo = {
        id: createId(),
        title,
        description: `Priority: ${todoPriority}`,
        isCompleted: false,
        priority: todoPriority,
        createdAt: Date.now(),
      }
      setTodos((currentTodos) => [nextTodo, ...currentTodos])
    }

    setTodoTitle('')
    setTodoPriority('medium')
  }

  const editTodo = (todo: Todo) => {
    setEditingTodoId(todo.id)
    setTodoTitle(todo.title)
    setTodoPriority(todo.priority)
    requestAnimationFrame(() => todoInputRef.current?.focus())
  }

  const cancelTodoEdit = () => {
    setEditingTodoId(null)
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
    if (editingTodoId === todoId) cancelTodoEdit()
  }

  const addNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const title = noteTitle.trim()
    const content = noteContent.trim()
    if (!title && !content) return

    const now = getTimestamp()
    const noteFields = {
      title: title || 'Untitled note',
      content: content || 'Voice memo attached',
      tags: noteTags.split(',').map((tag) => tag.trim()).filter(Boolean),
      updatedAt: now,
    }

    if (editingNoteId) {
      setNotes((currentNotes) => currentNotes.map((note) => note.id === editingNoteId
        ? { ...note, ...noteFields, voiceNote: voiceMemo ?? note.voiceNote }
        : note))
      setEditingNoteId(null)
    } else {
      const nextNote: Note = {
        id: createId(),
        ...noteFields,
        pinned: false,
        voiceNote: voiceMemo ?? undefined,
        createdAt: now,
      }
      setNotes((currentNotes) => [nextNote, ...currentNotes])
    }

    cancelNoteEdit()
  }

  const editNote = (note: Note) => {
    setEditingNoteId(note.id)
    setNoteTitle(note.title)
    setNoteContent(note.content)
    setNoteTags(note.tags.join(', '))
  }

  const cancelNoteEdit = () => {
    setEditingNoteId(null)
    setNoteTitle('')
    setNoteContent('')
    setNoteTags('')
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
    if (editingNoteId === noteId) cancelNoteEdit()
  }

  const handlePreview = async (meta: VoiceNoteMeta) => {
    try {
      const blob = await getAudioRecord(meta.audioId)
      if (!blob) return

      const nextUrl = URL.createObjectURL(blob)
      setAudioUrl((currentUrl) => {
        if (currentUrl) URL.revokeObjectURL(currentUrl)
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
          note.voiceNote?.audioId === meta.audioId
            ? { ...note, voiceNote: undefined, updatedAt: Date.now() }
            : note,
        ),
      )
    } catch {
      window.alert('Unable to remove this voice memo.')
    }
  }

  const saveVoiceMemo = () => {
    if (!voiceMemo) return

    setSavedVoiceMemos((currentMemos) => {
      if (currentMemos.some((memo) => memo.audioId === voiceMemo.audioId)) return currentMemos
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

  const focusTodoComposer = () => {
    todoInputRef.current?.focus()
    todoInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className={lightMode ? 'app-shell light-mode' : 'app-shell'}>
      <Sidebar
        activeView={activeView}
        language={language}
        lightMode={lightMode}
        copy={t}
        onChangeView={setActiveView}
        onChangeLanguage={setLanguage}
        onToggleLightMode={setLightMode}
      />

      <main className={`main-panel ${activeView}-view`}>
        <PageHeader view={activeView} copy={t} onNewTask={focusTodoComposer} />

        {activeView === 'dashboard' && (
          <DashboardView
            todos={todos}
            visibleTodos={visibleTodos}
            notesCount={notes.length}
            voiceMemoCount={voiceMemoLibrary.length}
            completedCount={todos.filter((todo) => todo.isCompleted).length}
            todoFilter={todoFilter}
            todoTitle={todoTitle}
            todoPriority={todoPriority}
            editingTodoId={editingTodoId}
            todoInputRef={todoInputRef}
            voiceMemo={voiceMemo}
            voiceMemoTitle={voiceMemoTitle}
            isRecording={isRecording}
            recordingSeconds={recordingSeconds}
            isVoiceMemoSaved={Boolean(voiceMemo && savedVoiceMemos.some((memo) => memo.audioId === voiceMemo.audioId))}
            audioUrl={audioUrl}
            audioPreviewId={audioPreviewId}
            copy={t}
            onTodoTitleChange={setTodoTitle}
            onTodoPriorityChange={setTodoPriority}
            onTodoFilterChange={setTodoFilter}
            onCreateTodo={createTodo}
            onToggleTodo={toggleTodo}
            onEditTodo={editTodo}
            onCancelEditTodo={cancelTodoEdit}
            onDeleteTodo={deleteTodo}
            onVoiceMemoTitleChange={setVoiceMemoTitle}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
            onPreviewVoiceMemo={handlePreview}
            onSaveVoiceMemo={saveVoiceMemo}
            onDeleteVoiceMemo={handleDeleteVoiceMemo}
          />
        )}

        {activeView === 'notes' && (
          <NotesView
            notes={pinnedNotes}
            title={noteTitle}
            content={noteContent}
            tags={noteTags}
            isEditing={editingNoteId !== null}
            audioUrl={audioUrl}
            audioPreviewId={audioPreviewId}
            copy={t}
            onTitleChange={setNoteTitle}
            onContentChange={setNoteContent}
            onTagsChange={setNoteTags}
            onEdit={editNote}
            onCancelEdit={cancelNoteEdit}
            onSubmit={addNote}
            onTogglePin={toggleNotePin}
            onDelete={deleteNote}
            onPreview={handlePreview}
          />
        )}

        {activeView === 'voiceMemos' && (
          <VoiceMemosView
            memos={voiceMemoLibrary}
            audioUrl={audioUrl}
            audioPreviewId={audioPreviewId}
            copy={t}
            onPreview={handlePreview}
            onDelete={handleDeleteVoiceMemo}
          />
        )}
      </main>

      {showSavedToast && <SavedToast message={t.memoSaved} />}
    </div>
  )
}

export default App
