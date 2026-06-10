#!/bin/sh

# ROMs are now fetched per-user at runtime from the `x-rom-paste` request
# header (see README). An optional PASTE_URL env var can still be set as a
# fallback ROM for requests that omit that header.

exec node server.js
