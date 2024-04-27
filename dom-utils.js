/**
 *
 * @param {string} name
 * @param {Record<string, any>} attrs
 * @param {Element[]?} children
 * @returns {HTMLElement}
 */
export function el(name, attrs, children) {
  attrs = attrs || {};
  children = children || [];
  const e = document.createElement(name);
  Object.entries(attrs).forEach(function ([key, value]) {
    e.setAttribute(key, value);
  });
  children &&
    children.forEach(function (child) {
      if (typeof child === "string") {
        child = document.createTextNode(child);
      }
      e.appendChild(child);
    });
  return e;
}

/**
 *
 * @param {string} content
 * @returns a text node
 */
export function text(content) {
  return document.createTextNode(content);
}

export function addEl(el, parentSelector = document.body) {
  if (typeof parentSelector === "string") {
    parentSelector = document.body.querySelector(parentSelector);
  }
  parentSelector.append(el);
}
