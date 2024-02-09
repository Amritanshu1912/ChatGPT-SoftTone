// ==UserScript==
// @name         GPTChat SoftTone
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Change the text color of specified elements
// @author       You
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const MAIN_SECTION_SELECTOR =
    "#__next > div.relative.z-0.flex.h-full.w-full.overflow-hidden";
  const CODE_ELEMENTS_SELECTOR =
    "code.hljs, code[class*=language-], pre[class*=language-]";
  const TEXT_COLOR_TO_APPLY = "rgba(230, 230, 230, 0.9)";

  // Function to set text color
  function setTextColor(element, isCodeBlock) {
    if (isCodeBlock || !element.closest("pre")) {
      element.style.color = TEXT_COLOR_TO_APPLY;
    }
  }

  // Function to traverse and apply text color
  function traverseAndApplyColor(element, isCodeBlock) {
    setTextColor(element, isCodeBlock);
    Array.from(element.children).forEach((child) => {
      traverseAndApplyColor(child, isCodeBlock);
    });
  }

  // Observer callback function
  function observerCallback(mutations, isCodeBlock) {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          if (isCodeBlock) {
            // Check if the added node matches the specified selectors
            if (node.matches(CODE_ELEMENTS_SELECTOR)) {
              setTextColor(node, isCodeBlock);
            } else {
              // Check if any descendants match the selectors
              const matchingDescendants = node.querySelectorAll(
                CODE_ELEMENTS_SELECTOR
              );
              matchingDescendants.forEach((descendant) => {
                setTextColor(descendant, isCodeBlock);
              });
            }
          } else {
            traverseAndApplyColor(node, isCodeBlock);
          }
        }
      });
    });
  }

  // Set up the observer for the main section
  const mainSecElement = document.querySelector(MAIN_SECTION_SELECTOR);

  if (mainSecElement) {
    const mainSecObserver = new MutationObserver((mutations) =>
      observerCallback(mutations, false)
    );
    mainSecObserver.observe(mainSecElement, { subtree: true, childList: true });
  } else {
    console.error("Target element not found");
  }

  // Set up the observer for the code section
  const codeObserver = new MutationObserver((mutations) =>
    observerCallback(mutations, true)
  );
  codeObserver.observe(mainSecElement, { subtree: true, childList: true });

  // Set the "color" style for existing elements of code section
  const elementsToChangeColor = document.querySelectorAll(
    CODE_ELEMENTS_SELECTOR
  );
  elementsToChangeColor.forEach((element) => {
    setTextColor(element, true);
  });
})();
