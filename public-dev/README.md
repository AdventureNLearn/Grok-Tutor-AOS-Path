# public-dev (Vite serve only)

Slim static root for local test server. **Does not include** multi-million-file `public/corpus`
(that tree OOMs Vite file watching). Production builds still use `public/` via vite.config.

- `soak/` → junction to `public/soak` (observe logs)
- Corpus lessons for product ship: READY-PUBLIC + offline samples in `src/` — not served as raw 5M static files
