import type { AppCopy, AppView } from '../../app/copy'

interface PageHeaderProps {
  view: AppView
  copy: AppCopy
  onNewTask: () => void
}

export function PageHeader({ view, copy, onNewTask }: PageHeaderProps) {
  const title = view === 'dashboard'
    ? copy.commandCenter
    : view === 'notes'
      ? copy.notes
      : copy.voiceMemos

  return (
    <header className="topbar flex items-center justify-between">
      <div>
        <p className="eyebrow">{view === 'dashboard' ? copy.mondayDashboard : copy.workspace}</p>
        <h2>{title}</h2>
      </div>
      {view === 'dashboard' && (
        <button type="button" className="primary-button" onClick={onNewTask}>
          {copy.newTask}
        </button>
      )}
    </header>
  )
}
