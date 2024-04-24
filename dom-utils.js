console.log("hello DOM");

/**
 *
 * @param {string} name
 * @param {Record<string, any>} attrs
 * @param {Element[]} children
 * @returns {HTMLElement}
 */
export function el(name, attrs, children) {
  attrs = attrs || {};
  children = children || [];
  const e = document.createElement(name);
  Object.entries(attrs).forEach(function ([key, value]) {
    e.setAttribute(key, value);
  });
  children.forEach(function (child) {
    if (typeof child === "string") {
      child = document.createTextNode(child);
    }
    e.appendChild(child);
  });
  return e;
}

export function addEl(el) {
  document.body.append(el);
}

export const foo = "foo";

export {};
