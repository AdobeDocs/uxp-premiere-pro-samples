/*
 * Copyright 2026 Adobe. All rights reserved.
 *
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import { premierepro } from "@adobe/premierepro";

import { log } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;

/**
 * Gets the current list of workspaces and adds them to the `workspaces`
 * `<select>` element as options to pick from.
 *
 * If the workspace names cannot be loaded, an empty option is used
 * instead (this is most likely due to the API not being available in the
 * opened version of Premiere).
 */
export async function setupWorkspaces() {
  const select = document.getElementById("workspaces") as HTMLSelectElement;

  try {
    const workspaces = await getAvailableWorkspaceNames();

    const placeholder = document.createElement("option");
    placeholder.innerText = "Choose a Workspace";
    placeholder.value = "";
    placeholder.disabled = true;
    placeholder.selected = true;
    select.appendChild(placeholder);

    for (const workspace of workspaces) {
      const option = document.createElement("option");
      option.innerText = workspace;
      option.value = workspace;
      select.appendChild(option);
    }
  } catch {
    log(`Loading workspaces failed, skipping...`, "red");

    const option = document.createElement("option");
    option.innerText = "Unavailable";
    option.value = "";
    option.disabled = true;
    option.selected = true;
    select.appendChild(option);
  }
}

/**
 * Gets the current list available workspace names.
 *
 * The values here match the same workspace options available in Premiere's
 * top level menu.
 * @returns
 */
export async function getAvailableWorkspaceNames(): Promise<string[]> {
  // @ts-expect-error - WorkspacesManager is not typed yet
  const manager = ppro.WorkspacesManager?.getManager();
  return manager ? await manager.getWorkspaceIDs() : [];
}

/**
 * Sets the active workspace to the one matching the given name
 *
 * Setting the workspace also fires a `WorkspaceEvent` that can be listened
 * for; see the `eventManager.ts` file for examples.
 *
 * NOTE: Changing the workspace may cause the panel for this plugin to
 * hide, requiring manually showing the plugin again either via Premiere's top
 * level menu or doing so programmatically.
 *
 * @param workspaceName
 * @returns true if the workspace was successfully loaded
 * @see https://developer.adobe.com/uxp/uxp-api/reference-js/modules/uxp/plugin-manager/plugin#showpanelpanelid
 */
export function setWorkspace(workspaceName: string): Promise<boolean> {
  // @ts-expect-error - WorkspacesManager is not typed yet
  const manager = ppro.WorkspacesManager.getManager();

  try {
    return manager.loadWorkspace(workspaceName);
  } catch (err) {
    log(`Failed to set the workspace to "${workspaceName}": "${err}"`, "red");
    return Promise.resolve(false);
  }
}
