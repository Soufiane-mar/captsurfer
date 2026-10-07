// Fixed navigation: each link scrolls to its section; on small screens the links
// live in a panel opened by the hamburger button.
export function setupNav({ resolveTarget, scrollTo }) {
  const header = document.querySelector('.site-nav')
  const toggle = header.querySelector('.site-nav__toggle')

  const setOpen = (open) => {
    header.classList.toggle('is-open', open)
    toggle.setAttribute('aria-expanded', String(open))
  }

  toggle.addEventListener('click', () => setOpen(!header.classList.contains('is-open')))
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false)
  })

  header.querySelectorAll('[data-nav]').forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault()
      setOpen(false)
      scrollTo(resolveTarget(link.dataset.nav))
    })
  })
}
