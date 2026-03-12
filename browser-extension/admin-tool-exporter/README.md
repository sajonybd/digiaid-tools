# SEO Tool Session Exporter (Admin)

Use this extension to capture login/session data from a target tool website, then paste it into your Admin Tool config.

## Install (Chrome)

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select folder:
   - `browser-extension/admin-tool-exporter`

## Admin workflow

1. Open target tool site and make sure you are logged in.
2. Click extension icon: `SEO Tool Session Exporter`.
3. Choose:
   - `Export Cookies`
   - `Export LocalStorage`
   - `Export IndexedDB`
4. Click `Copy JSON`.
5. In your website admin (`/admin/tools`), set:
   - `Login Method` = matching type
   - `Login Data JSON` = pasted JSON

## Mapping

- Admin `Login Method = cookies`:
  - Paste JSON from `Export Cookies`
- Admin `Login Method = localstorage`:
  - Paste JSON from `Export LocalStorage`
- Admin `Login Method = indexeddb`:
  - Paste JSON from `Export IndexedDB`

## Notes

- `Export All` is for inspection/debugging only; it returns combined data.
- For best results, export from the exact domain users will be redirected to.
