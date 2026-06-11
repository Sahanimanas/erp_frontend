# public/

Static assets served at the site root by Vite (e.g. `public/logo.png` → `/logo.png`).

## Brand logo

Save the Global School Mitra logo here as **`logo.png`** (a square PNG works best,
e.g. 256×256). It is used automatically by:

- the sidebar brand mark (`src/components/sidebar/Sidebar.jsx`)
- the browser tab icon / favicon (`index.html`)

Until `logo.png` exists, the sidebar falls back to the graduation-cap icon, so the
app keeps working with or without the file.
