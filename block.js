import { el, text } from "./dom-utils.js";

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

function programBlock(node) {
  return [
    [text("program")],
    [
      el(
        "div",
        { "data-name": "statements" },
        node.statements.map(nodeToBlock)
      ),
    ],
  ];
}

function repeatBlock(node) {
  return [
    [text("repeat"), el("input", { type: "number", value: node.value })],
    node.statements.map(nodeToBlock),
  ];
}

function leftBlock(node) {
  return [
    [
      text("left"),
      el("input", { type: "number", value: node.value }),
      text(node.type),
    ],
  ];
}

function forwardBlock(node) {
  return [
    [
      text("forward"),
      el("input", { type: "number", value: node.value }),
      text(node.type),
    ],
  ];
}

function defVarBlock(node) {
  return [
    [
      text("def"),
      el("input", { type: "text", value: node.name }),
      text("="),
      el("input", { type: "number", value: node.value }),
    ],
  ];
}
function op2Block(node) {
  return [
    [
      text("do"),
      el("input", { type: "text", value: node.op1 }),
      text(node.operator),
      el("input", { type: "text", value: node.op2 }),
    ],
  ];
}

function ifBlock(node) {
  const condition = nodeToBlock(node.condition);
  const thens = el(
    "div",
    { "data-name": "then" },
    node.thenStatements.map(nodeToBlock)
  );
  const elses = el(
    "div",
    { "data-name": "else" },
    node.elseStatements.map(nodeToBlock)
  );

  return [
    [text("if"), condition],
    [text("then"), thens, text("else"), elses],
  ];
}

function comparisonBlock(node) {
  return [
    [
      el("input", { type: "text", value: node.op1 }),
      text(node.operator),
      el("input", { type: "text", value: node.op2 }),
    ],
  ];
}
const registry = {
  program: programBlock,
  repeat: repeatBlock,
  left: leftBlock,
  defVar: defVarBlock,
  op2: op2Block,
  if: ifBlock,
  comparison: comparisonBlock,
  forward: forwardBlock,
};

export function nodeToBlock(node) {
  const action = node.action;
  const [configuration, childBlocks] = registry[action](node);

  const block = el(
    "div",
    { draggable: true, "data-name": action },
    configuration
  );

  if (Array.isArray(childBlocks)) {
    block.appendChild(el("div", { class: "container" }, childBlocks));
  }
  return block;
}
