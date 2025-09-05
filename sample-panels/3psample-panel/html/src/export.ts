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

import type { premierepro, Sequence } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
const uxp = require("uxp") as typeof import("uxp");

import { log } from "./utils";
/**
 * Export current active sequence's current frame as PNG file
 */
export async function exportSequenceFrame(sequence: Sequence) {
  // @ts-ignore
  const folder = await uxp.storage.localFileSystem.getFolder();
  let folderDir = await folder.nativePath;

  let playerPos = await sequence.getPlayerPosition(); // ticktime obj
  const exportName = "output.png";

  log("Exporting output.png.png *(We do double extension)*");

  return ppro.Exporter.exportSequenceFrame(
    sequence,
    playerPos,
    exportName,
    folderDir,
    600, // width
    500 // height
  );
}

/**
 * Export current active sequence as MEPG2 file
 */
export async function exportSequence(sequence: Sequence) {
  // let user select preset file
  let presetFile;
  log("Please select a preset file for export");
  // @ts-ignore
  const file = await uxp.storage.localFileSystem.getFileForOpening({
    types: ["epr"],
  });
  if (file?.isFile && file.nativePath) {
    presetFile = file.nativePath;
  } else {
    log("Selection of preset file failed. Please try again");
    return false;
  }

  log("Please select folder for export");
  // @ts-ignore
  // let user choose dir for export output mpg file into
  const folder = await uxp.storage.localFileSystem.getFolder();
  let folderDir = await folder.nativePath;
  if (!folderDir) {
    log("Selection of folder for export failed. Please try again");
    return false;
  }

  let exportPath = folderDir + path.sep + "output.mpg"; // export to MPEG2
  let encoder = await ppro.EncoderManager.getManager();
  return encoder.exportSequence(
    sequence,
    ppro.Constants.ExportType.IMMEDIATELY, // export in Premiere Pro
    exportPath, // file path to export to
    presetFile // preset file
  );
}

/**
 * Get Export File Extension based on preset and sequence
 */
export async function getExportFileExtension(sequence, presetFile) {
  return ppro.EncoderManager.getExportFileExtension(sequence, presetFile);
}
