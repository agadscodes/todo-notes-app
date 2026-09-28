interface SavedToastProps {
  message: string
}

export function SavedToast({ message }: SavedToastProps) {
  return (
    <div className="save-toast flex items-center" role="status" aria-live="polite">
      <span className="toast-check grid place-items-center" aria-hidden="true">✓</span>
      {message}
    </div>
  )
}
