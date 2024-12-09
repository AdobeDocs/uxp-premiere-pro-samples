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

const log = (msg, color) => {
  const console = document.querySelector("#plugin-body");
  console.innerHTML += color
    ? `<span style='color:${color}'>${msg}</span><br />`
    : `${msg}<br />`;

  console.scrollTop = console.scrollHeight;
};

const clearLog = () => (document.querySelector("#plugin-body").innerHTML = "");

const registerClick = (id, cb) =>
  document.querySelector(`#${id}`).addEventListener("click", cb);

module.exports = { log, clearLog, registerClick };
