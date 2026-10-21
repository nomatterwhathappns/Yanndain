# Yanndain — Beneath the surface

A bilingual portfolio concept with a continuous underwater journey and 900 animated fish. The visual direction is a natural, cinematic ocean. Personal details, real project records, articles, contact links, and CV files remain to be supplied.

## Open the portable preview

### Download from GitHub

1. Open `https://github.com/nomatterwhathappns/Yanndain`.
2. Select **Code → Download ZIP**, then extract the ZIP on your computer.
3. Open `yanndain-ocean-v4.html` from the extracted folder in Chrome or another modern browser. This is the complete portable preview; no installation or terminal is needed.

The ZIP also includes the editable source code, assets, package lockfile, build configuration, documentation, and browser tests. To develop locally, install Node.js 22.12 or newer, open a terminal in the extracted project folder, and run `npm ci` followed by `npm run dev`. Open the local URL printed by that terminal. The source `index.html` is the Vite entry point and should be opened through this development server.

Open **`yanndain-ocean-v4.html`** from the workspace's files/outputs. It contains the application, Three.js, styles, fonts, and procedural fish in one file. It needs no server or external assets. The portable build uses hash routes so its pages work without server routing. The preview includes continuous swimming, distinct manta and shark models, a distributed mobile scene, and English headings. Version 4 gives the smaller fish fuller bodies and smoother shading, with eyes and fins attached to the revised surface. `yanndain-preview.html` is an identical copy retained for existing links.

The cloud machine's `localhost` is not the user's computer. A localhost link from chat is not a public preview. Use the portable HTML file or the screenshots in `artifacts/v2` when the UI cannot proxy the cloud server.

Some embedded viewers restrict browser history. In that case the portable application still navigates between pages in memory. A normal browser preserves deep links and browser history.

Regenerate the file after changes:

```sh
npm run build:preview
```

The intermediate build goes into `artifacts/portable`; the final HTML is copied to the project root. This never empties the source directory.

## Develop

Requires Node.js 22.12 or newer; validated with Node.js 24.19.

```sh
cd Yanndain-main
npm ci
npm run dev -- --port 5173 --strictPort
```

Production build and internal preview:

```sh
npm run build
npm run preview -- --port 4173 --strictPort
```

Normal builds use `/id`, `/en`, `/id/about`, `/id/projects`, `/id/journal`, and localized detail routes. A production host must rewrite these routes to `index.html`. The standalone HTML uses `#/id/...` and needs no such rewrite.

## Experience

- The header contains the logo, language switch, and compact menu. Home section buttons lead to separate pages.
- About, Projects, Project Detail, Journal, and Article Detail have their own views. Contact remains on Home.
- All headings stay in English, including cards, articles and section headings. Indonesian/English switching changes the supporting copy and preserves the current page. Home language switching preserves scroll position.
- The ocean uses six instanced fish populations: 700 sardines, 120 jack fish, 50 reef fish, 24 lanternfish, two manta rays, and four sharks.
- Fish are procedural 3D geometry with body shape, fins, gills, eyes, and animated tails. Sharks have a dedicated long body, pectoral fins, two dorsal fins, and an asymmetric tail. Mantas have broad wings, a continuous tail and cephalic fins; the wing surface and its lighting deform together.
- Schools travel continuously along closed routes, turn in depth and return without teleporting. Body orientation follows the route tangent. Motion uses elapsed seconds rather than frame count. A spatial hash supplies local separation and pointer avoidance is subtle.
- 500 sardines circulate around “Stay curious.”, then disperse. At “Keep exploring.”, 620 swim through two corridor streams toward distant light and return along their outer edges. Scroll reversal reverses the formation transition; swimming continues without scroll input.
- Water, light shafts, fog, suspended particles, camera movement, and fish layers create depth. The open water no longer has a visible seafloor. All assets are bundled or generated locally.
- Mobile uses simpler geometry and a lower pixel ratio. Schools occupy upper, middle and lower layers. Fish passing behind the hero copy move farther away along the view ray, keeping their screen position while reducing visual weight. Slow devices reduce render resolution while retaining the full 900-fish population.
- Reduced motion freezes continuous swimming and removes CSS animation. Scroll still selects a static formation. Hidden tabs pause rendering.
- If WebGL is unavailable, the static ocean and all readable content/navigation remain usable.

## Real content and CV

Edit `src/content.ts`. The visible examples are marked **Pratinjau / Preview**. No sample is presented as a completed project or a published write-up.

The profile object has optional `cv.id`, `cv.en`, `email`, `github`, and `linkedin` fields. CV buttons appear in Hero and About only after a genuine PDF URL is configured. They open in a new tab and follow the active language; if only one language is available, both use that PDF. For a standalone HTML preview, use an accessible HTTPS PDF URL or distribute the actual PDF alongside the HTML with a suitable relative path.

## Validation

```sh
npm run build
npm run build:preview
npm run test:e2e
```

The browser suite uses `/usr/bin/chromium`, or `CHROMIUM_PATH` when set. It checks the actual instanced population counts, WebGL rendering, live fish/manta/shark transforms without scroll or pointer input, both formation transitions and reversal, separate pages, filters, English heading stability with translated descriptions, mobile navigation, motion settings, fallback, self-contained preview loading, and embedding in an opaque iframe.

Software rendering is used by the automated browser. Its frame rate is not a hardware GPU performance benchmark.

## Files

- `src/main.ts`: page rendering, routing, menu, localization, scroll-to-scene state.
- `src/content.ts`: profile configuration, translated copy, preview project/article layouts.
- `src/ocean.ts`: fish population, schooling, formations, camera, water, lighting, performance and lifecycle handling.
- `src/fish-models.ts`: procedural fish, shark and manta geometry.
- `src/swimming.ts`: continuous swimming routes and mobile distribution.
- `src/style.css`: layout, reading surfaces, responsive and motion styles.
- `vite.preview.config.ts`: self-contained HTML export.
- `docs/DECISIONS.md`: agreed design and behavior.

Cloud tasks already run in isolated environments. Use the existing checkout; do not create a Git worktree unless explicitly requested.
