export type Priority = 'low' | 'medium' | 'high'

export interface Todo {
  id: string
  title: string
  description?: string
  isCompleted: boolean
  priority: Priority
  dueDate?: string | null
  createdAt: number
}

export interface VoiceNoteMeta {
  audioId: string
  durationSeconds: number
  mimeType: string
}

export interface SavedVoiceMemo extends VoiceNoteMeta {
  title: string
  savedAt: number
}

export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  pinned: boolean
  voiceNote?: VoiceNoteMeta
  createdAt: number
  updatedAt: number
}
