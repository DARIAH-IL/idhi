import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

type UsePasteImageOptions = {
  maxSizeBytes: number
  onPaste: (image: Blob) => Promise<void> | void
}

export function usePasteImage({ maxSizeBytes, onPaste }: UsePasteImageOptions) {
  const { t } = useTranslation()

  return async function pasteImage() {
    try {
      const items = await navigator.clipboard.read()
      const item = items.find((clipboardItem) =>
        clipboardItem.types.some((type) => type.startsWith('image/')),
      )
      const imageType = item?.types.find((type) => type.startsWith('image/'))

      if (!item || !imageType) {
        toast.warning(t('entity.form.paste_image_error'))
        return
      }

      const image = await item.getType(imageType)
      if (!image.type.startsWith('image/') || image.size === 0) {
        toast.warning(t('entity.form.paste_image_error'))
        return
      }
      if (image.size > maxSizeBytes) {
        toast.warning(
          t('entity.form.paste_image_size_error', {
            maxSizeMb: maxSizeBytes / (1024 * 1024),
          }),
        )
        return
      }

      await onPaste(image)
    } catch {
      toast.warning(t('entity.form.paste_image_error'))
    }
  }
}
