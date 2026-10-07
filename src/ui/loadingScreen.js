export function hideLoadingScreen() {
  const el = document.getElementById('loading-screen')
  if (!el) return
  el.classList.add('loading-screen--hidden')
  el.addEventListener('transitionend', () => el.remove(), { once: true })
}
