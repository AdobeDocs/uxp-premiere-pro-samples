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

import type { premierepro, Project, Sequence } from "../types.d.ts";
const ppro = require("premierepro") as premierepro;
import { log } from "./utils";

const NEW_PROPERTY_NAME = "Sample";

/**
 * Get input sequence's property object
 * @return [Property Object] PPro property object
 */
export async function getSequenceProperty(sequence: Sequence) {
  return ppro.Properties.getProperties(sequence);
}

/**
 * Get input sequence's sample property value if it is defined
 * @return [string] value of "Sample" property
 */
export async function getSequenceSampleProperty(sequence: Sequence) {
  try {
    const properties = await getSequenceProperty(sequence);
    let value = properties.getValue(NEW_PROPERTY_NAME);
    return value;
  } catch (err) {
    log(`No value has been defined for property "${NEW_PROPERTY_NAME}"`);
    throw err;
  }
}

/**
 * Set a example new property to input sequencev
 * @return [Boolean] if operation succeed
 */
export async function setSampleSequenceProperty(
  sequence: Sequence,
  project: Project
) {
  const properties = await getSequenceProperty(sequence);
  let newPropertyValue = 88;

  let succeed = false;
  try {
    project.lockedAccess(() => {
      let setValueAction = properties.createSetValueAction(
        NEW_PROPERTY_NAME,
        newPropertyValue,
        ppro.Constants.PropertyType.NON_PERSISTENT
      );

      project.lockedAccess(() => {
        succeed = project.executeTransaction((compoundAction) => {
          compoundAction.addAction(setValueAction);
        });
      });
    });
  } catch (err) {
    log(`Error: ${err}`, "red");
    return false;
  }
  return succeed;
}

/**
 * Clear the added sequence property
 * @return [Bool] if operation succeed
 */
export async function clearSampleSequenceProperty(
  sequence: Sequence,
  project: Project
) {
  // check if property exist and log error message as needed
  let value = await getSequenceSampleProperty(sequence);
  let succeed;
  if (value) {
    const properties = await getSequenceProperty(sequence);
    log(`Removing property "${NEW_PROPERTY_NAME}"..`);
    try {
      project.lockedAccess(() => {
        succeed = project.executeTransaction((compoundAction) => {
          let clearValueAction =
            properties.createClearValueAction(NEW_PROPERTY_NAME);
          compoundAction.addAction(clearValueAction);
        });
      });
    } catch (err) {
      log(`Error: ${err}`, "red");
      return false;
    }
  }
  return succeed;
}
