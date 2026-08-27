interface Props {
  title: string
  subtitle?: string
  identifier: string
}

export function AutocompleteSuggestionContent({
  title,
  subtitle,
  identifier,
}: Props) {
  return (
    <>
      <span className="block truncate text-sm font-medium">{title}</span>
      {subtitle && (
        <span className="block truncate text-xs text-muted-foreground">
          {subtitle}
        </span>
      )}
      <span className="block truncate font-mono text-[10px] text-muted-foreground">
        {identifier}
      </span>
    </>
  )
}
