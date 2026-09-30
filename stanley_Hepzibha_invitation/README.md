# Stanley & Hephzibah — Wedding Invitation

Split from a single `index.html` into a standard multi-file structure.

```
my-project/
├── index.html              # Markup only
├── css/
│   └── style.css           # All styles (was the inline <style> block)
├── js/
│   └── script.js           # All behavior (was the inline <script> block)
└── src/
    ├── audio/
    │   └── wedding-song.mp3   # Placeholder — replace with the real song
    ├── images/
    │   └── images.jpg         # Placeholder — replace with real photos
    └── config/
        └── constants.json     # Wedding date/venue, Google Maps link, image list
```

## How it works

- `js/script.js` fetches `src/config/constants.json` on load, builds the
  `WEDDING` object (date, ceremony/reception times, venue, Google Maps link)
  from it, and uses it to power the countdown, calendar export, directions
  button, and gallery.
- The three "View on Google Maps" links get their `href` set at runtime from
  `constants.json` (elements tagged with the `js-maps-link` class), so the
  URL only needs to live in one place.
- All photo/audio references in the HTML and in `constants.json` point at
  the local placeholder files under `src/images/` and `src/audio/`. Swap
  those files for your real photos and song — you don't need to touch the
  HTML, CSS, or JS to do it. If you use more than one image, add extra
  files to `src/images/` and update the paths in `constants.json`
  (`heroImage`, `timelineImages`, `galleryImages`, etc.) to match.

## Running it

Because `script.js` loads `constants.json` via `fetch()`, opening
`index.html` directly from the filesystem (`file://`) will be blocked by
the browser's CORS rules. Serve the folder over HTTP instead, e.g.:

```bash
cd my-project
python3 -m http.server 8000
# then open http://localhost:8000
```
