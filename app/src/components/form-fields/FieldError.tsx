export function FieldError({ error, id }: { error?: string; id?: string }) {
  if (!error) {
    return null
  }
  return (
    <p id={id} className="text-xs text-destructive" role="alert">
      {error}
    </p>
  )
}
