export function FieldError({ error }: { error?: string }) {
  if (!error) return null
  return (
    <p className="text-xs text-destructive" role="alert">
      {error}
    </p>
  )
}
