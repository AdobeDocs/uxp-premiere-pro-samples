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
};

// Shape of a file returned by the UXP file picker. UXP doesn't type this well
// (see the @ts-expect-error at the picker call), so this is a minimal local shim.
interface PickedFile {
  name: string;
  nativePath?: string;
}

// A PickedFile that passed validation: a real local path plus a resolved,
// supported content type. Produced by addDragAndDropFiles().
interface DragFile extends PickedFile {
  nativePath: string;
  contentType: string;
}

// Local files the user has added, and the current selection (by index).
const dragFiles: DragFile[] = [];
const selectedIndices = new Set<number>();
let lastAnchorIndex = -1;

function contentTypeOf(fileName: string): string | undefined {
   return CONTENT_TYPE_BY_EXTENSION[path.extname(fileName).slice(1).toLowerCase()];
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

// Shape of a single item in the drag payload (one local file).
interface DragPayloadItem {
  name: string;
  content_type: string;
  uri: string;
}

// The payload Premiere Pro reads from the drag's text/plain data. 3P panels send
// LOCAL files only (file:// URIs). The caller serializes this with JSON.stringify().
interface DragPayload {
  version: "1.0.0";
  items: DragPayloadItem[];
}

// Build the structured drag payload. Serialization is left to the caller.
function buildDragPayload(files: DragFile[]): DragPayload {
  return {
    version: "1.0.0",
    items: files.map((file) => ({
      name: file.name,
      content_type: file.contentType,
      uri: pathToFileUri(file.nativePath),
    })),
  };
}

// Open the file picker and add the chosen local files to the drag list.
export async function addDragAndDropFiles(): Promise<void> {
  log("Add Local Files clicked — opening file picker…");
  try {
    // @ts-expect-error - uxp.storage.localFileSystem is not typed correctly
    const result = await uxp.storage.localFileSystem.getFileForOpening({
      allowMultiple: true,
    });

    const picked = (Array.isArray(result) ? result : []) as PickedFile[];

    if (picked.length === 0) {
      log("No files selected for drag and drop");
      return;
    }

    let added = 0;
    for (const file of picked) {
      if (!file.nativePath)  {
          continue;
        }
      const contentType = contentTypeOf(file.name);
      if (!contentType) {
        log(`Skipping "${file.name}": unsupported media type`, "orange");
        continue;
      }
      if (dragFiles.some((f) => f.nativePath === file.nativePath)) {
        log(`Skipping "${file.name}": already added`, "orange");
        continue;
      }
      dragFiles.push({ name: file.name, nativePath: file.nativePath, contentType });
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
  lastAnchorIndex = -1;
  renderDragAndDropList();
  log("Cleared drag and drop files");
}

// Render the draggable items into the #dnd-items container.
export function renderDragAndDropList(): void {
  const container = document.getElementById("dnd-items");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (dragFiles.length === 0) {
    const empty = document.createElement("em");
    empty.className = "dnd-empty";
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

    // Drag events fire on the row itself (the span has pointer-events:none via CSS).
    const label = document.createElement("span");
    label.textContent = file.name;
    item.appendChild(label);

    // Plain click selects a single item; Cmd/Ctrl-click toggles one item in or
    // out of the selection; Shift-click selects the contiguous range from the
    // anchor (the last item clicked without Shift) to the clicked item.
    item.addEventListener("click", (event) => {
      if (event.shiftKey && lastAnchorIndex >= 0) {
        selectedIndices.clear();
        const lo = Math.min(lastAnchorIndex, index);
        const hi = Math.max(lastAnchorIndex, index);
        for (let i = lo; i <= hi; i++) {
          selectedIndices.add(i);
        }
      } else if (event.metaKey || event.ctrlKey) {
        if (selectedIndices.has(index)) {
          selectedIndices.delete(index);
        } else {
          selectedIndices.add(index);
        }
        lastAnchorIndex = index;
      } else {
        selectedIndices.clear();
        selectedIndices.add(index);
        lastAnchorIndex = index;
      }
      renderDragAndDropList();
    });

    
    item.addEventListener("mousedown", (event) => {
      // Only when dragging an existing multi-selection. A plain click to select must not
      // relabel or cover the row — doing so on every mousedown caused the text overlap.
      if (event.button !== 0 ||selectedIndices.size <= 1 || !selectedIndices.has(index)) {
        return;
      }
      const rect = item.getBoundingClientRect();
      const cover = item.cloneNode(true) as HTMLElement;
      cover.setAttribute("draggable", "false");
      cover.classList.add("dnd-drag-cover");
      cover.style.left = `${rect.left}px`;
      cover.style.top = `${rect.top}px`;
      cover.style.width = `${rect.width}px`;
      cover.style.height = `${rect.height}px`;
      document.body.appendChild(cover);
      // Relabel the row to the count so UXP's default drag snapshot shows
      // "N items". The cover hides the change from the user.
      label.textContent = `${selectedIndices.size} items`;
      const restore = () => {
        label.textContent = file.name;
        cover.remove();
        item.removeEventListener("drag", restore);
        item.removeEventListener("dragend", restore);
        document.removeEventListener("mouseup", restore);
      };

      item.addEventListener("drag", restore);
      item.addEventListener("dragend", restore);
      document.addEventListener("mouseup", restore);
    });

    item.addEventListener("dragstart", (event) => {
      if (!selectedIndices.has(index)) {
        selectedIndices.clear();
        selectedIndices.add(index);
        lastAnchorIndex = index;
        container
          .querySelectorAll(".dnd-item.selected")
          .forEach((el) => el.classList.remove("selected"));
        item.classList.add("selected");
      }

      // Drag in list order, not selection (click) order.
      const filesToDrag = Array.from(selectedIndices)
        .sort((a, b) => a - b)
        .map((i) => dragFiles[i]);
      const payload = JSON.stringify(buildDragPayload(filesToDrag));
      const dataTransfer = event.dataTransfer;
      if (!dataTransfer) {
        return;
      }
      dataTransfer.setData("text/plain", payload);
      dataTransfer.effectAllowed = "copyMove";
      dataTransfer.dropEffect = "copy";


      log(`Dragging ${filesToDrag.length} item(s)…`);
    });

    container.appendChild(item);
  });
}
