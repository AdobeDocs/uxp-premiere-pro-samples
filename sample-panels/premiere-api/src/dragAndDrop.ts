/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2026 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. If you have received this file from a source other than Adobe,
 * then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 **************************************************************************/

import { log } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const uxp = require("uxp") as typeof import("uxp");

/**
 * 3rd-party drag and drop.
 *
 * A UXP panel can let users drag media into Premiere Pro's Project panel or
 * Timeline. On `dragstart` the panel attaches
 * a small JSON payload (as plain text) describing the items; when the user drops
 * onto a supported target, Premiere Pro imports the referenced files.
 *
 * Third-party panels reference LOCAL files only (file:// URIs).
 */

// The plugin id from manifest.json. Sent as the drag payload "source".
const DRAG_SOURCE = "com.adobe.ppro.samples";

// Content types Premiere Pro accepts for drag-and-drop import, keyed by file
// extension. Files whose type is not listed here are skipped by the host.
const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  mp4: "video/mp4",
  mov: "video/quicktime",
  wmv: "video/x-ms-wmv",
  mpg: "video/mpeg",
  mpeg: "video/mpeg",
  wav: "audio/wav",
  mp3: "audio/mpeg",
  aac: "audio/aac",
  m4a: "audio/m4a",
  aif: "audio/aif",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  bmp: "image/bmp",
  tif: "image/tiff",
  tiff: "image/tiff",
  webp: "image/webp",
  svg: "image/svg+xml",
};

interface DragFile {
  name: string;
  nativePath: string;
}

// Shape of a file returned by the UXP file picker (loosely typed).
interface PickedFile {
  name: string;
  nativePath?: string;
}

// Local files the user has added, and the current selection (by index).
const dragFiles: DragFile[] = [];
const selectedIndices = new Set<number>();

function extensionOf(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot + 1).toLowerCase();
}

function contentTypeOf(fileName: string): string | undefined {
  return CONTENT_TYPE_BY_EXTENSION[extensionOf(fileName)];
}

// Convert a local filesystem path to a percent-encoded file:// URI.
function pathToFileUri(path: string): string {
  let normalized = path;
  // Windows absolute path (C:\Users\...) -> /C:/Users/...
  if (/^[A-Za-z]:\\/.test(path)) {
    normalized = "/" + path.replace(/\\/g, "/");
  }
  // encodeURI percent-encodes spaces and unicode while preserving "/" and ":".
  return "file://" + encodeURI(normalized);
}

// Build the JSON payload Premiere Pro expects. 3P panels send LOCAL files only.
function buildDragPayload(files: DragFile[]): string {
  return JSON.stringify({
    version: "1.0.0",
    source: DRAG_SOURCE,
    items: files.map((file) => ({
      name: file.name,
      content_type: contentTypeOf(file.name),
      uri: pathToFileUri(file.nativePath),
    })),
  });
}

// Open the file picker and add the chosen local files to the drag list.
export async function addDragAndDropFiles(): Promise<void> {
  log("Add Local Files clicked — opening file picker…");
  try {
    // @ts-expect-error - uxp.storage.localFileSystem is not typed correctly
    const result = await uxp.storage.localFileSystem.getFileForOpening({
      allowMultiple: true,
    });
    const picked = (Array.isArray(result) ? result : [result]).filter(
      Boolean
    ) as PickedFile[];

    if (picked.length === 0) {
      log("No files selected for drag and drop");
      return;
    }

    let added = 0;
    for (const file of picked) {
      if (!file.nativePath) continue;
      if (!contentTypeOf(file.name)) {
        log(`Skipping "${file.name}": unsupported media type`, "orange");
        continue;
      }
      dragFiles.push({ name: file.name, nativePath: file.nativePath });
      added += 1;
    }

    renderDragAndDropList();
    if (added > 0) {
      log(`Added ${added} file(s). Drag them into the Project panel or Timeline.`);
    }
  } catch (error) {
    log(`Failed to add files: ${error}`, "red");
  }
}

// Remove all added files and clear the selection.
export function clearDragAndDropFiles(): void {
  dragFiles.length = 0;
  selectedIndices.clear();
  renderDragAndDropList();
  log("Cleared drag and drop files");
}

// Render the draggable items into the #dnd-items container.
export function renderDragAndDropList(): void {
  const container = document.getElementById("dnd-items");
  if (!container) return;

  container.innerHTML = "";
  if (dragFiles.length === 0) {
    const empty = document.createElement("em");
    empty.textContent = "No files added yet.";
    container.appendChild(empty);
    return;
  }

  dragFiles.forEach((file, index) => {
    const item = document.createElement("div");
    item.className = "dnd-item";
    item.setAttribute("draggable", "true");
    if (selectedIndices.has(index)) {
      item.classList.add("selected");
    }

    // pointer-events:none on the child so drag events fire on the item itself.
    const label = document.createElement("span");
    label.style.pointerEvents = "none";
    label.textContent = file.name;
    item.appendChild(label);

    // Click selects; Shift/Cmd/Ctrl-click adds to (or toggles) the selection.
    item.addEventListener("click", (event) => {
      const additive = event.shiftKey || event.metaKey || event.ctrlKey;
      if (!additive) {
        selectedIndices.clear();
        selectedIndices.add(index);
      } else if (selectedIndices.has(index)) {
        selectedIndices.delete(index);
      } else {
        selectedIndices.add(index);
      }
      renderDragAndDropList();
    });

    // dragstart attaches the JSON payload as plain text. If the item is part of
    // the current selection, drag the whole selection; otherwise just this item.
    item.addEventListener("dragstart", (event) => {
      const filesToDrag =
        selectedIndices.has(index) && selectedIndices.size > 0
          ? Array.from(selectedIndices).map((i) => dragFiles[i])
          : [file];
      const payload = buildDragPayload(filesToDrag);
      const dataTransfer = event.dataTransfer;
      if (!dataTransfer) return;
      dataTransfer.setData("text/plain", payload);
      dataTransfer.setData("text", payload); // some hosts read "text"
      dataTransfer.effectAllowed = "copyMove";
      dataTransfer.dropEffect = "copy";
      log(`Dragging ${filesToDrag.length} item(s)…`);
    });

    container.appendChild(item);
  });
}
