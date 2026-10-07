// Demo only: nothing is sent. The browser's own validation (required fields, email
// format) runs first; the submit event only fires once every field is valid.
export function setupContactForm(form) {
  const confirmation = form.querySelector('.contact__confirmation')

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    form.reset()
    confirmation.hidden = false
  })

  form.addEventListener('input', () => {
    confirmation.hidden = true
  })
}
