# premiere-api

A reference panel for the Premiere Pro UXP API. Click a button to try an API call, then find the code behind it in `html/src/`. Good starting point when you want to see how a specific API works before writing your own plugin.

> For setup, prerequisites, and how to load a plugin in UDT, see the [root README](../../README.md).

---

## How the code is organized

The sample has a build step because it's written in TypeScript. The key thing to understand upfront:

```
premiere-api/
├── html/                ← source files, edit here
│   ├── src/             ← one .ts file per API area
│   ├── assets/          ← preset files, transcript spec
│   ├── scripts/         ← fix-imports.js (post-build)
│   ├── index.ts         ← entry point, wires src/ to buttons
│   ├── index.html       ← panel UI
│   ├── manifest.json
│   ├── package.json
│   ├── tsconfig.json
│   └── eslint.config.mjs
└── build-html/          ← compiled output (after npm run build)
    └── manifest.json    ← point UDT here, not the one above
```

`build-html/` doesn't exist until you run `npm run build` for the first time.

**`build-html/` is what UDT loads.** If you edit files in `html/` but forget to rebuild, your changes won't show up. This is the most common first-run mistake.

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
cd sample-panels/premiere-api/html
npm install
npm run build
```

`npm run build` does four things in order:

1. Deletes the old `build-html/` folder.
2. Copies all source files from `html/` into `build-html/`.
3. Compiles the TypeScript into JavaScript.
4. Runs a small post-build fix (see [below](#why-the-fix-imports-step-exists)).

When the build finishes, point UDT at `sample-panels/premiere-api/build-html/manifest.json` and click **Load**.

### Other commands

```bash
npm run lint    # run ESLint (do this before committing)
npm run clean   # delete build-html/
npm run copy    # copy source to build-html/ without compiling (useful for HTML-only edits)
```

---

## Making changes

UDT's **Watch** mode won't auto-reload TypeScript changes because a build step is needed first. Your usual loop while developing:

1. Edit files in `html/src/` or `html/index.html`.
2. Run `npm run build`.
3. Click **Reload** in UDT.

**Shortcut:** If you only changed `index.html` and didn't touch any `.ts` files, `npm run copy` + reload is faster than a full build.

**Manifest changes** always need an **Unload → Load** in UDT, not just a reload.

---

## Debugging

Click **Debug** in UDT next to the loaded plugin. That opens a Chromium DevTools window connected to your panel — you get the console, network tab, sources, and DOM inspector.

The panel also has a built-in console area at the top of the UI that logs the result of each button click directly in the panel, so you don't always need DevTools open.

---

## Why the `fix-imports` step exists

When TypeScript compiles `index.ts` to CommonJS, it adds this line to `index.js`:

```js
Object.defineProperty(exports, "__esModule", { value: true });
```

`index.js` has no exports at all, so this line doesn't belong there and can break the panel at runtime in UXP. The `scripts/fix-imports.js` post-build script strips it out automatically — you don't need to do anything. But if you ever see a blank panel after a clean build, this is the first thing to check.
