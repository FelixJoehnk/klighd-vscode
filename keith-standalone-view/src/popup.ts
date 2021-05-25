/*
 * KIELER - Kiel Integrated Environment for Layout Eclipse RichClient
 *
 * http://rtsys.informatik.uni-kiel.de/kieler
 *
 * Copyright 2021 by
 * + Kiel University
 *   + Department of Computer Science
 *     + Real-Time and Embedded Systems Group
 *
 * This code is provided under the terms of the Eclipse Public License (EPL).
 */

import "./styles/popup.css";

/**
 * Creates a popup message to notify the user about an important event.
 * The popup is automatically removed after 10 seconds.
 */
export function showPopup(title: string, message: string) {
    const container = document.querySelector("#popup-container");
    if (!container) throw new Error("No Popup Container found in current DOM!");

    const popupEle = createErrorPopup(title, message);
    container.appendChild(popupEle);

    // Hide the Popup after 10 seconds
    setTimeout(() => container.removeChild(popupEle), 10000);
}

function createErrorPopup(title: string, message: string) {
    const containerEle = document.createElement("div");
    containerEle.classList.add("popup", "popup--error");

    const titleEle = document.createElement("h4");
    titleEle.classList.add("popup__title");
    titleEle.innerText = title;
    containerEle.appendChild(titleEle);

    const msgEle = document.createElement("p");
    msgEle.classList.add("popup__message");
    msgEle.innerText = message;
    containerEle.appendChild(msgEle);

    return containerEle;
}
