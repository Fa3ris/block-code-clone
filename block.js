import { el, addEl } from "./dom-utils.js";

/**
 * @typedef {[String, ...Element[]]} BlockConfig
 */
/**
 * @typedef {[BlockConfig, ChildBlockConfig[]?]} ChildBlockConfig
 */

/**
 *
 * @param {BlockConfig} configuration
 * @param {ChildBlockConfig[]?} childBlocks
 */
export function createBlock(configuration, childBlocks) {
  const name = configuration[0];
  const block = el(
    "div",
    { draggable: true, "data-name": name },
    configuration
  );

  if (Array.isArray(childBlocks)) {
    block.appendChild(
      el(
        "div",
        { class: "container" },
        childBlocks.map(function (block) {
          return createBlock.apply(null, block);
        })
      )
    );
  }

  return block;
}
