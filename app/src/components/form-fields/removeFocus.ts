export function focusAfterRemove(container: HTMLElement | null, index: number) {
  requestAnimationFrame(() => {
    if (!container) {
      return
    }
    const inScope = (el: HTMLElement) =>
      el.closest('[data-remove-scope]') === container
    const removeButtons = Array.from(
      container.querySelectorAll<HTMLElement>('[data-remove-button]'),
    ).filter(inScope)
    const target =
      removeButtons[Math.min(index, removeButtons.length - 1)] ??
      Array.from(
        container.querySelectorAll<HTMLElement>(
          '[data-add-button], input, button',
        ),
      ).find(inScope)
    target?.focus()
  })
}
