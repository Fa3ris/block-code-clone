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

function repeatBlock(node = {}) {
  const value = node.value || 0;
  const statements = node.statements || [];
  return [
    [flexContainer([text("repeat"), el("input", { type: "number", value })])],
    statements.map(nodeToBlock),
  ];
}

function leftBlock(node = {}) {
  const value = node.value || 0;
  const type = node.type || "degrees";
  return [
    [
      flexContainer([
        text("left"),
        el("input", { type: "number", value }),
        text(type),
      ]),
    ],
  ];
}

function forwardBlock(node = {}) {
  const value = node.value || 0;
  const type = node.type || "steps";
  return [
    [
      flexContainer([
        text("forward"),
        el("input", { type: "number", value: value }),
        text(type),
      ]),
    ],
  ];
}

function flexContainer(children) {
  return el("div", { class: "flex-row" }, children);
}

function defVarBlock(node = {}) {
  const varId = node.name || "";
  const value = node.value || 0;
  return [
    [
      flexContainer([
        text("def"),
        el("input", { type: "text", value: varId }),
        text("="),
        el("input", { type: "number", value }),
      ]),
    ],
  ];
}
function op2Block(node = {}) {
  const op1 = node.op1 || "";
  const operator = node.operator || "+";
  const op2 = node.op2 || "";
  return [
    [
      flexContainer([
        text("do"),
        el("input", { type: "text", value: op1 }),
        el("input", { type: "text", value: operator }),
        // text(operator),
        el("input", { type: "text", value: op2 }),
      ]),
    ],
  ];
}

function ifBlock(node = {}) {
  const thenStatements = node.thenStatements || [];
  const elseStatements = node.elseStatements || [];
  const thens = el(
    "div",
    { "data-name": "then", class: "container" },
    thenStatements.map(nodeToBlock)
  );
  const elses = el(
    "div",
    { "data-name": "else", class: "container" },
    elseStatements.map(nodeToBlock)
  );

  const condition = node.condition || {};
  const op1 = condition.op1 || "";
  const operator = condition.operator || "<";
  const op2 = condition.op2 || "";
  return [
    [
      flexContainer([
        text("if"),
        el("input", { type: "text", value: op1 }),
        el("input", { type: "text", value: operator }),
        el("input", { type: "text", value: op2 }),
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
  forward: forwardBlock,
  defVar: defVarBlock,
  op2: op2Block,
  if: ifBlock,
};

/**
 *
 * @param {object | string} node
 * @returns
 */
export function nodeToBlock(node) {
  const action = typeof node === "string" ? node : node.action;
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
