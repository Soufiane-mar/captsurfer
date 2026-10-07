import { socialLinks } from '../config/social-links.js'
import { socialIcons } from './socialIcons.js'

const NETWORKS = [
  { key: 'instagram', label: 'Instagram' },
  { key: 'tiktok', label: 'TikTok' },
  { key: 'pinterest', label: 'Pinterest' },
]

const SVG_NS = 'http://www.w3.org/2000/svg'

export function renderSocialLinks(list) {
  NETWORKS.forEach(({ key, label }) => {
    const svg = document.createElementNS(SVG_NS, 'svg')
    svg.setAttribute('viewBox', '0 0 24 24')
    svg.setAttribute('aria-hidden', 'true')
    const path = document.createElementNS(SVG_NS, 'path')
    path.setAttribute('d', socialIcons[key])
    svg.append(path)

    const link = document.createElement('a')
    link.href = socialLinks[key]
    link.setAttribute('aria-label', label)
    if (socialLinks[key] !== '#') {
      link.target = '_blank'
      link.rel = 'noopener noreferrer'
    }
    link.append(svg)

    const item = document.createElement('li')
    item.append(link)
    list.append(item)
  })
}
