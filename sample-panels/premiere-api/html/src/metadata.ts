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

import type { premierepro, Project, ProjectItem } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

// Gets the project items, returns undefined if there are no project items
export async function getProjectItems(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const projectRootItem = await project.getRootItem();
  const projectItems = await projectRootItem.getItems();

  if (!projectItems.length) {
    log("No project items found", "red");
  }
  return projectItems;
}

// Returns Project metadata
export async function getProjectMetadata(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  let projectItems = await getProjectItems(project);
  let metadata = await ppro.Metadata.getProjectMetadata(projectItems[0]);
  return metadata;
}

// Returns XMP metadata of projectitems.
export async function getXMPMetadata(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  let projectItems: Array<ProjectItem> = await getProjectItems(project);
  let xmpMetadata = await ppro.Metadata.getXMPMetadata(projectItems[0]);
  return xmpMetadata;
}

// Gets Project Column metadata
export async function getProjectColumnsMetadata(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  const projectItems: Array<ProjectItem> = await getProjectItems(project);
  const metadata = await ppro.Metadata.getProjectColumnsMetadata(
    projectItems[0]
  );
  return metadata;
}

// Gets Project Panel metadata
export async function getProjectPanelMetadata() {
  const metadata = await ppro.Metadata.getProjectPanelMetadata();
  return metadata;
}

// Sets xmp metadata of one project item to another
export async function setXMPMetadata(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  let projectItems: Array<ProjectItem> = await getProjectItems(project);

  if (!(projectItems.length >= 2)) {
    log("Required at least two projectitems", "red");
  }
  let replacedXmpMetadata = await ppro.Metadata.getXMPMetadata(projectItems[0]);
  let projectItem = projectItems[1];
  let setXMPMetadataAction = await ppro.Metadata.createSetXMPMetadataAction(
    projectItem,
    replacedXmpMetadata
  );

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        compoundAction.addAction(setXMPMetadataAction);
      }, "createSetXMPMetadataAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

// Sets project metadata
export async function setProjectMetadata(project: Project) {
  if (!project) {
    log(`No project found.`, "red");
    return;
  }
  let projectItems: Array<ProjectItem> = await getProjectItems(project);
  let projectItem1 = projectItems[0];

  const metadata =
    '<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?><x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 9.0-c001 152.deb9585, 2024/02/06-08:36:10 "><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about="" xmlns:premierePrivateProjectMetaData="http://ns.adobe.com/premierePrivateProjectMetaData/1.0/"><premierePrivateProjectMetaData:Column.Intrinsic.Name>Name changed</premierePrivateProjectMetaData:Column.Intrinsic.Name><premierePrivateProjectMetaData:Column.PropertyBool.Hide>True</premierePrivateProjectMetaData:Column.PropertyBool.Hide></rdf:Description></rdf:RDF></x:xmpmeta><?xpacket end="w"?>';
  let updatedFields = ["Column.Intrinsic.Name"];
  let setProjectMetadataAction =
    await ppro.Metadata.createSetProjectMetadataAction(
      projectItem1,
      metadata,
      updatedFields
    );

  let success = false;
  try {
    project.lockedAccess(() => {
      success = project.executeTransaction((compoundAction) => {
        compoundAction.addAction(setProjectMetadataAction);
      }, "createSetProjectMetadataAction");
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }

  return success;
}

// Sets project panel metadata
export async function setProjectPanelMetadata() {
  const metadata =
    "<?xml version='1.0'?><md.paths version='1.0'><metadata_path><internal>true</internal><namespace>http://ns.adobe.com/exif/1.0/</namespace><description>ColorSpace</description><entry_name>ColorSpace</entry_name><parent_id>http://ns.adobe.com/exif/1.0/</parent_id></metadata_path><metadata_path><internal>false</internal><namespace>http://amwa.tv/mxf/as/11/core/</namespace><description>audioTrackLayout</description><entry_name>audioTrackLayout</entry_name><parent_id>http://amwa.tv/mxf/as/11/core/</parent_id></metadata_path><metadata_path><internal>false</internal><namespace>http://ns.useplus.org/ldf/xmp/1.0/</namespace><description>ImageCreator</description><entry_name>ImageCreator</entry_name><parent_id>http://ns.useplus.org/ldf/xmp/1.0/</parent_id></metadata_path></md.paths>";
  const success = await ppro.Metadata.setProjectPanelMetadata(metadata);
  return success;
}

// Adds property to project metadata schema
export async function addPropertiesToMetadataSchema() {
  let success = await ppro.Metadata.addPropertyToProjectMetadataSchema(
    "name",
    "value",
    ppro.Constants.MetadataType.TEXT
  );
  return success;
}
