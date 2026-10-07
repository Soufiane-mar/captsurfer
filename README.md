# CaptSurfer

One-page showcase for a surf photographer: a cartoon-style 3D camera assembles itself as you scroll, the view dives into the lens, and the portfolio appears inside it.

Built with Vite, Three.js, GSAP ScrollTrigger and Lenis.

## Run it locally

Requires Node.js 20.19+ (or 22.12+).

```bash
npm install
npm run dev
```

Then open http://localhost:5173/captsurfer/.

Other commands:

- `npm run build`: production build into `dist/`
- `npm run preview`: serve the production build at http://localhost:4173/captsurfer/
- `npm test`: unit tests

## Replace the photos

All portfolio photos live in one file: `src/data/photos.js`. It holds 12 entries; each one looks like this:

```js
{
  url: 'https://images.unsplash.com/photo-...',
  alt: 'Short description of the photo',
  photographer: 'Photographer name',
  profileUrl: 'https://unsplash.com/@username',
}
```

- `url`: the image address, without any `?query` part. The site adds the sizes it needs.
- `alt`: a short description, read by screen readers.
- `photographer` and `profileUrl`: shown in the credit line on each photo ("Photo by ... on Unsplash").

To use your own photos, replace the entries. Keep the 12 entries so the lens ring stays balanced.

## Fill in the social links

The footer icons (Instagram, TikTok, Pinterest) read their links from `src/config/social-links.js`. Replace each `'#'` with your profile URL:

```js
export const socialLinks = {
  instagram: 'https://www.instagram.com/your-account',
  tiktok: 'https://www.tiktok.com/@your-account',
  pinterest: 'https://www.pinterest.com/your-account',
}
```

## Deployment

Every push to `main` builds the site and publishes it to GitHub Pages (see `.github/workflows/deploy.yml`). In the repository settings, under **Pages**, the source must be set to **GitHub Actions**.

## Credits

- Photos: [Unsplash](https://unsplash.com/?utm_source=captsurfer&utm_medium=referral), credited on each photo.
- Social icons: [Simple Icons](https://simpleicons.org/) (CC0).
