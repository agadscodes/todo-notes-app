import type { RefObject } from 'react'
import type { AppCopy } from '../../app/copy'
import type { Priority, Todo, VoiceNoteMeta } from '../../types'
import type { TodoFilter } from '../../app/filters'
import { TodoPanel } from './TodoPanel'
import { VoiceMemoPanel } from './VoiceMemoPanel'

interface DashboardViewProps {
  todos: Todo[]
  visibleTodos: Todo[]
  notesCount: number
  voiceMemoCount: number
  completedCount: number
  todoFilter: TodoFilter
  todoTitle: string
  todoPriority: Priority
  editingTodoId: string | null
  todoInputRef: RefObject<HTMLInputElement | null>
  voiceMemo: VoiceNoteMeta | null
  voiceMemoTitle: string
  isRecording: boolean
  recordingSeconds: number
  isVoiceMemoSaved: boolean
  audioUrl: string | null
  audioPreviewId: string | null
  copy: AppCopy
  onTodoTitleChange: (title: string) => void
  onTodoPriorityChange: (priority: Priority) => void
  onTodoFilterChange: (filter: TodoFilter) => void
  onCreateTodo: (event: React.FormEvent<HTMLFormElement>) => void
  onToggleTodo: (todoId: string) => void
  onEditTodo: (todo: Todo) => void
  onCancelEditTodo: () => void
  onDeleteTodo: (todoId: string) => void
  onVoiceMemoTitleChange: (title: string) => void
  onStartRecording: () => void
  onStopRecording: () => void
  onPreviewVoiceMemo: (memo: VoiceNoteMeta) => void
  onSaveVoiceMemo: () => void
  onDeleteVoiceMemo: (memo: VoiceNoteMeta) => void
}

export function DashboardView({
  todos,
  visibleTodos,
  notesCount,
  voiceMemoCount,
  completedCount,
  todoFilter,
  todoTitle,
  todoPriority,
  editingTodoId,
  todoInputRef,
  voiceMemo,
  voiceMemoTitle,
  isRecording,
  recordingSeconds,
  isVoiceMemoSaved,
  audioUrl,
  audioPreviewId,
  copy,
  onTodoTitleChange,
  onTodoPriorityChange,
  onTodoFilterChange,
  onCreateTodo,
  onToggleTodo,
  onEditTodo,
  onCancelEditTodo,
  onDeleteTodo,
  onVoiceMemoTitleChange,
  onStartRecording,
  onStopRecording,
  onPreviewVoiceMemo,
  onSaveVoiceMemo,
  onDeleteVoiceMemo,
}: DashboardViewProps) {
  return (
    <>
      <section className="stats-grid grid">
        <article className="stat-card flex flex-col">
          <span>{copy.totalTasks}</span>
          <strong>{todos.length}</strong>
        </article>
        <article className="stat-card flex flex-col">
          <span>{copy.completed}</span>
          <strong>{completedCount}</strong>
        </article>
        <article className="stat-card flex flex-col">
          <span>{copy.notes}</span>
          <strong>{notesCount}</strong>
        </article>
        <article className="stat-card flex flex-col">
          <span>{copy.voiceMemos}</span>
          <strong>{voiceMemoCount}</strong>
        </article>
      </section>

      <div className="content-grid grid min-h-0">
        <TodoPanel
          todos={visibleTodos}
          filter={todoFilter}
          title={todoTitle}
          priority={todoPriority}
          editingTodoId={editingTodoId}
          inputRef={todoInputRef}
          copy={copy}
          onTitleChange={onTodoTitleChange}
          onPriorityChange={onTodoPriorityChange}
          onFilterChange={onTodoFilterChange}
          onSubmit={onCreateTodo}
          onToggle={onToggleTodo}
          onEdit={onEditTodo}
          onCancelEdit={onCancelEditTodo}
          onDelete={onDeleteTodo}
        />
        <VoiceMemoPanel
          memo={voiceMemo}
          title={voiceMemoTitle}
          isRecording={isRecording}
          recordingSeconds={recordingSeconds}
          isSaved={isVoiceMemoSaved}
          audioUrl={audioUrl}
          audioPreviewId={audioPreviewId}
          copy={copy}
          onTitleChange={onVoiceMemoTitleChange}
          onRecord={onStartRecording}
          onStop={onStopRecording}
          onPreview={onPreviewVoiceMemo}
          onSave={onSaveVoiceMemo}
          onDelete={onDeleteVoiceMemo}
        />
      </div>
    </>
  )
}
