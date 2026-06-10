# premiere-api

A reference panel for the Premiere Pro UXP API. Click a button to try an API call, then find the code behind it in `src/`. Good starting point when you want to see how a specific API works before writing your own plugin.

> For setup, prerequisites, and how to load a plugin in UDT, see the [root README](../../README.md).

---

## How the code is organized

The sample has a build step because it's written in TypeScript. The key thing to understand upfront:

```
premiere-api/
├── assets/          ← preset files, transcript spec
├── dist/            ← compiled output (after npm run build)
|   └── manifest.json    ← point UDT here, not the one in public/
├── public/          ← static assets copied to dist/ (manifest, HTML, icons)
├── src/             ← one .ts file per API area
├── index.ts         ← entry point, wires src/ to buttons
├── package.json
├── tsconfig.json
├── vite.config.mjs
├── eslint.config.mjs
```

`dist/` doesn't exist until you run `npm run build` (or `npm run dev`) for the first time.

**`dist/` is what UDT loads.** If you edit `.ts` files but forget to rebuild, your changes won't show up. This is the most common first-run mistake.

Edit panel UI and manifest in `public/` (`index.html`, `manifest.json`, `icons/`). Vite copies them into `dist/` on each build.

### What's in `src/`

Each file covers one part of the API. If you're looking for a specific feature, here's where to find it:

| File | What it covers |
| :--- | :--- |
| `project.ts` | Open, save, close projects; active project; graphics white luminance |
| `sequence.ts` | Create sequences; tracks; in/out points; frame rate; sequence settings |
| `projectPanel.ts` | Project items; bins; media paths; proxy; color labels; footage interpretation |
| `markers.ts` | Create, move, and remove sequence markers; marker colors |
| `metadata.ts` | Read and write XMP metadata; project panel columns; metadata schema |
| `effects.ts` | Add, apply, and remove effects |
| `transition.ts` | Add and remove transitions at clip start and end |
| `keyframe.ts` | Set values, add keyframes, get and set interpolation |
| `sourceMonitor.ts` | Open clips, play/pause, get/set position, close clips |
| `encoderManager.ts` | Encode files and project items; toggle embedded/sidecar XMP; launch encoder |
| `export.ts` | Export sequence frames and full sequences |
| `import.ts` | Import files, sequences, and After Effects components |
| `eventManager.ts` | Listen to project and encoder events |
| `sequenceEditor.ts` | Overwrite/insert track items; insert MOGRTs; clone and remove items |
| `transcript.ts` | Export and import transcripts |
| `projectConverter.ts` | Export as AAF, Final Cut Pro XML, or OpenTimelineIO |
| `settings.ts` | Scratch disk and ingest settings |
| `appPreference.ts` | Read and write application preferences |
| `properties.ts` | Get, set, and clear sequence properties |
| `prProduction.ts` | Active production; production scratch disk settings |
| `utils.ts` | Shared logging helper used across all modules |

---

## Build

```bash
cd sample-panels/premiere-api
npm install
npm run build
```

[Vite](https://vite.dev/) compiles TypeScript into CommonJS modules under `dist/`, one `.js` file per source module. Static assets from `public/` are copied alongside the compiled output. TypeScript type-checking is handled separately by `tsc --noEmit`.

When the build finishes, point UDT at `sample-panels/premiere-api/dist/manifest.json` and click **Load**.

### Other commands

```bash
npm run dev        # watch build + typecheck (recommended while developing)
npm run typecheck  # typecheck only, no emit
npm run lint       # run ESLint (do this before committing)
npm run clean      # delete dist/
```

---

## Making changes

Your usual loop while developing:

1. Run `npm run dev` (rebuilds on save).
2. Edit files in `src/`, `index.ts`, or `public/`.
3. Click **Reload** in UDT.

If you are not running `npm run dev`, run `npm run build` after each change instead.

**Manifest or `public/` changes** always need an **Unload → Load** in UDT, not just a reload.

---

## Debugging

Click **Debug** in UDT next to the loaded plugin. That opens a Chromium DevTools window connected to your panel — you get the console, network tab, sources, and DOM inspector.

The build emits separate `.js` files under `dist/` (for example `index.js`, `src/project.js`, `src/utils.js`), each with a source map. UDT's Sources panel lists these loaded modules the same way the old multi-file `tsc` build did, so you can set breakpoints and step through the original `.ts` sources.

The panel also has a built-in console area at the top of the UI that logs the result of each button click directly in the panel, so you don't always need DevTools open.
