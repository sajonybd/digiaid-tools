# SEO Tools Access Bridge (Chrome Extension)

This extension listens for access requests from the dashboard tool page and applies login data before opening the tool site.

Behavior on each launch:
- Clears existing site data for the target tool domain:
  - cookies
  - localStorage/sessionStorage
  - IndexedDB (when browser supports database listing)
- Applies new login payload from admin config
- Reloads the tool tab

## Install (unpacked)

1. Open `chrome://extensions`.
2. Enable `Developer mode`.
3. Click `Load unpacked`.
4. Select this folder:
   - `browser-extension/tool-access-extension`

## Supported Admin Login Methods

## `cookies`

Use either:

```json
[
  {
    "name": "session",
    "value": "abc123",
    "domain": ".example.com",
    "path": "/",
    "secure": true,
    "httpOnly": false
  }
]
```

or:

```json
{
  "cookies": [
    {
      "name": "session",
      "value": "abc123",
      "domain": ".example.com",
      "path": "/",
      "secure": true
    }
  ]
}
```

## `localstorage`

Use object form:

```json
{
  "token": "abc123",
  "user": {
    "id": 1,
    "role": "user"
  }
}
```

or array form:

```json
[
  { "key": "token", "value": "abc123" },
  { "key": "user", "value": { "id": 1, "role": "user" } }
]
```

## `indexeddb`

```json
{
  "databases": [
    {
      "name": "app-db",
      "version": 1,
      "stores": [
        {
          "name": "auth",
          "keyPath": "id",
          "records": [
            {
              "value": {
                "id": "session",
                "token": "abc123"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

Notes:
- `indexeddb` stores must exist in `stores`.
- For non-`keyPath` stores, use `{ "key": "...", "value": ... }` in each record.
