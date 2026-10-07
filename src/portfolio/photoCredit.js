const UTM = 'utm_source=captsurfer&utm_medium=referral'

function externalLink(href, text) {
  const a = document.createElement('a')
  a.href = href
  a.textContent = text
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  return a
}

// "Photo by [Name] on Unsplash", linking to the photographer and to Unsplash.
export function createCredit(photo) {
  const caption = document.createElement('figcaption')
  caption.className = 'photo-credit'
  caption.append(
    'Photo by ',
    externalLink(`${photo.profileUrl}?${UTM}`, photo.photographer),
    ' on ',
    externalLink(`https://unsplash.com/?${UTM}`, 'Unsplash'),
  )
  return caption
}
