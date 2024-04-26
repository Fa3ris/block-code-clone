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
  return [[text("program")], node.statements.map(nodeToBlock)];
}

function repeatBlock(node) {
  return [
    [
      flexContainer([
        text("repeat"),
        el("input", { type: "number", value: node.value }),
      ]),
    ],
    node.statements.map(nodeToBlock),
  ];
}

function leftBlock(node) {
  return [
    [
      flexContainer([
        text("left"),
        el("input", { type: "number", value: node.value }),
        text(node.type),
      ]),
    ],
  ];
}

function forwardBlock(node) {
  return [
    [
      flexContainer([
        text("forward"),
        el("input", { type: "number", value: node.value }),
        text(node.type),
      ]),
    ],
  ];
}

function flexContainer(children) {
  return el("div", { class: "flex-row" }, children);
}

function defVarBlock(node) {
  return [
    [
      flexContainer([
        text("def"),
        el("input", { type: "text", value: node.name }),
        text("="),
        el("input", { type: "number", value: node.value }),
      ]),
    ],
  ];
}
function op2Block(node) {
  return [
    [
      flexContainer([
        text("do"),
        el("input", { type: "text", value: node.op1 }),
        text(node.operator),
        el("input", { type: "text", value: node.op2 }),
      ]),
    ],
  ];
}

function ifBlock(node) {
  const thens = el(
    "div",
    { "data-name": "then", class: "container" },
    node.thenStatements.map(nodeToBlock)
  );
  const elses = el(
    "div",
    { "data-name": "else", class: "container" },
    node.elseStatements.map(nodeToBlock)
  );

  return [
    [
      flexContainer([
        text("if"),
        el("input", { type: "text", value: node.condition.op1 }),
        text(node.condition.operator),
        el("input", { type: "text", value: node.condition.op2 }),
      ]),
    ],
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
    { draggable: true, "data-name": action, class: "block" },
    configuration
  );

  if (Array.isArray(childBlocks)) {
    block.appendChild(el("div", { class: "container" }, childBlocks));
  }
  return block;
}
