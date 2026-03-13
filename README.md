# Sample UXP plugins for Premiere

The Premiere Pro UXP API documentation is available here: <https://developer.adobe.com/premiere-pro/uxp/>.

## Tools

- Premiere or Premiere Beta 25.4 or greater
- UXP Developer Tools 2.2 or greater

### Premiere API

The flagship sample, which exercises the Premiere UXP APIs.

We also provide:

#### Metadata Handler

Port of a popular CEP panel developed specifically for film turnovers; the [plugin](https://adobe.com/go/cc_plugins_discover_plugin?pluginId=1836f173&workflow=share) can be installed (free) via Creative Cloud Desktop.

#### OAuth workflow example

Here's everything we know about OAuth workflows in Premiere, which is not much.

## Build

From a command prompt in `sample-panels/premiere-api/html`:

```bash
npm i
npm run build
```

The built plugin is in  `/premiere-api/build-html` .

## Load and debug

- Launch Premiere (or Premiere Beta).
- Launch UXP Developer Tools (UDT).
- Select **Add Plugin**, and navigate to `/premiere-api/build-html/manifest.json`.

![UXP Developer Tool UDT](payloads/UDT_load_panel.png)

Here's `premiere-api` in Premiere:

![UXP Sample Panel](payloads/UXP-sample-panel-loaded.png)

## Adding TypeScript Definitions in Visual Studio Code

Copy the included `types.d.ts` to the root of the `html` directory.

Add this line to the top of `index.js`:

`/// <reference path="./types.d.ts" />`

You can now see and use TypeScript definitions for Premiere Pro's UXP APIs, in Visual Studio Code.

![UXP typescript autocomplete](payloads/ts_def_demo.png)

## Transcript definition

We have included [Premiere Pro's transcript JSON definition](./sample-panels/premiere-api/html/assets/transcript_format_spec.json), in the `assets` directory, within the `premiere-api` sample plugin.
