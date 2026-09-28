import type { AppCopy, AppView, Language } from '../../app/copy'

interface SidebarProps {
  activeView: AppView
  language: Language
  lightMode: boolean
  copy: AppCopy
  onChangeView: (view: AppView) => void
  onChangeLanguage: (language: Language) => void
  onToggleLightMode: (lightMode: boolean) => void
}

export function Sidebar({
  activeView,
  language,
  lightMode,
  copy,
  onChangeView,
  onChangeLanguage,
  onToggleLightMode,
}: SidebarProps) {
  return (
    <aside className="sidebar flex h-full flex-col">
      <div className="brand-wrap flex items-center">
        <div className="brand-mark grid place-items-center">N</div>
        <div>
          <p className="eyebrow">{copy.workspace}</p>
          <h1>Northstar</h1>
        </div>
      </div>

      <nav className="sidebar-navigation grid" aria-label="Main navigation">
        <button
          type="button"
          className={activeView === 'dashboard' ? 'sidebar-link active' : 'sidebar-link'}
          aria-current={activeView === 'dashboard' ? 'page' : undefined}
          onClick={() => onChangeView('dashboard')}
        >
          {copy.dashboard}
        </button>
        <button
          type="button"
          className={activeView === 'notes' ? 'sidebar-link active' : 'sidebar-link'}
          aria-current={activeView === 'notes' ? 'page' : undefined}
          onClick={() => onChangeView('notes')}
        >
          {copy.notes}
        </button>
        <button
          type="button"
          className={activeView === 'voiceMemos' ? 'sidebar-link active' : 'sidebar-link'}
          aria-current={activeView === 'voiceMemos' ? 'page' : undefined}
          onClick={() => onChangeView('voiceMemos')}
        >
          {copy.voiceMemos}
        </button>
      </nav>

      <section className="settings-panel grid" aria-labelledby="settings-title">
        <h2 id="settings-title">{copy.settings}</h2>
        <label className="setting-control flex items-center justify-between">
          <span>{copy.language}</span>
          <select
            value={language}
            onChange={(event) => onChangeLanguage(event.target.value as Language)}
          >
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </label>
        <label className="setting-toggle flex items-center justify-between">
          <span>{copy.lightMode}</span>
          <input
            type="checkbox"
            checked={lightMode}
            onChange={(event) => onToggleLightMode(event.target.checked)}
          />
        </label>
      </section>
    </aside>
  )
}
