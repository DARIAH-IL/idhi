export const formatDate = (epoch: number, lang: string) => {
  return new Intl.DateTimeFormat(lang, {
    timeZone: 'Asia/Jerusalem',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(epoch))
}
