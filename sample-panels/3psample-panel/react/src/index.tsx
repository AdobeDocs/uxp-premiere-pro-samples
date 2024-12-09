/*************************************************************************
 * ADOBE CONFIDENTIAL
 * ___________________
 *
 *  Copyright 2023 Adobe
 *  All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Adobe and its suppliers, if any. The intellectual
 * and technical concepts contained herein are proprietary to Adobe
 * and its suppliers and are protected by all applicable intellectual
 * property laws, including trade secret and copyright laws.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Adobe.
 **************************************************************************/
import ReactDOM from "react-dom";
import Container from "./container";
import "./index.css";

// init appServices to register UXPViewTracker callbacks

let isRendered = false;
const render = (dom) => {
  if (isRendered) {
    return;
  }
  let existing = document.getElementById("root");
  let parent = existing || document.createElement("div");
  parent.setAttribute("id", "root");
  if (!existing) {
    dom.appendChild(parent);
  }
  ReactDOM.render(<Container />, parent);
  isRendered = true;
};

function show(event) {
  render(event.node);
  if (event.panel.panelId !== "mainPanel") {
    logCustomEntrypoint(event);
  }
}

function logCustomEntrypoint(event) {
  console.log("Custom entry point received", event);
}

document.body.addEventListener("uxpshowpanel", (event) => show(event));

if (true) {
  render(document.body);
}
