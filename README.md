Kalahari 4x4 Accessories - static site

What I changed:
- Accessibility: main landmark, modal, focus management
- UX: mobile nav, modal product details, gallery lightbox
- Contact: hooked to Formspree (replace form id)
- PWA: added manifest and simple service worker

To preview: open `index.html` in a browser. For SW/manifest to work, serve over http(s) (e.g., `npx http-server`).



Optional next steps:
- Replace the Formspree form ID in `index.html` with your real endpoint.
- Run Lighthouse / axe audits and fix any remaining accessibility/performance items.
- Add a build step to minify CSS/JS for production.

Troubleshooting stale styles (service worker)
- If you update `styles.css` but the page still shows the old styling, your browser may be using a cached version from the service worker. To clear it:
	1. Open DevTools (F12) → Application (or Storage) → Service Workers and click "Unregister" for the site.
	2. Hard-refresh the page (Ctrl+F5) or open in a new tab with cache disabled.
	3. Alternatively, in the browser console run `navigator.serviceWorker.getRegistrations().then(r=>r.forEach(reg=>reg.unregister()))` to remove all registered SWs for the origin.

