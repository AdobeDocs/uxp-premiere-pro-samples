/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 * Copyright 2024 Adobe
 * All Rights Reserved.
 *
 * NOTICE: Adobe permits you to use, modify, and distribute this file in
 * accordance with the terms of the Adobe license agreement accompanying
 * it. If you have received this file from a source other than Adobe,
 * then your use, modification, or distribution of it requires the prior
 * written permission of Adobe.
 **************************************************************************/

import type { premierepro, Sequence } from "@adobe/premierepro";
import { log } from "./utils";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const ppro = require("premierepro") as premierepro;

export async function exportAAF(sequence: Sequence, outputFilePath: string) {
  try {
    return await ppro.ProjectConverter.exportAAF(sequence, outputFilePath, new ppro.AAFExportOptions());
  } catch (e) {
    log(`Error exporting as AAF: ${e}`, "red");
    return false;
  }
}

/**
 * Export a sequence as Final Cut Pro XML to a user-selected output directory.
 */
export async function exportAsFinalCutProXML(sequence: Sequence, outputFilePath: string) {
  try {
    return await ppro.ProjectConverter.exportAsFinalCutProXML(
      sequence,
      outputFilePath,
      true // suppressUI
    );
  } catch (e) {
    log(`Error exporting as Final Cut Pro XML: ${e}`, "red");
    return false;
  }
}

/**
 * Export a sequence as OpenTimelineIO to a user-selected output directory.
 */
export async function exportAsOpenTimelineIO(sequence: Sequence, outputFilePath: string) {
  try {
    return await ppro.ProjectConverter.exportAsOpenTimelineIO(
      sequence,
      outputFilePath,
      true // suppressUI
    );
  } catch (e) {
    log(`Error exporting as OpenTimelineIO: ${e}`, "red");
    return false;
  }
}
