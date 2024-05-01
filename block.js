import { el, text } from "./dom-utils.js";

const CONTAINER = "container";
const DRAGGED_INTO = "dragged-into";
const INSERT_BEFORE = "insert-before";
/**
 * @typedef {[String, ...Element[]]} BlockConfig
 */
/**
 * @typedef {[BlockConfig, ChildBlockConfig[]?]} ChildBlockConfig
 */

function programBlock(node) {
  return [[text("program")], node.statements.map(nodeToBlock)];
}

function repeatBlock(node = {}) {
  const value = node.value || 1;
  const statements = node.statements || [];
  return [
    [
      flexContainer([
        text("repeat"),
        nonDroppable(el("input", { type: "number", value })),
      ]),
    ],
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
        nonDroppable(el("input", { type: "number", value })),
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
        nonDroppable(el("input", { type: "number", value: value })),
        text(type),
      ]),
    ],
  ];
}

function defVarBlock(node = {}) {
  const varId = node.name || "";
  const value = node.value || 0;
  return [
    [
      flexContainer([
        text("def"),
        nonDroppable(el("input", { type: "text", value: varId })),
        text("="),
        nonDroppable(el("input", { type: "number", value })),
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
        nonDroppable(el("input", { type: "text", value: op1 })),
        nonDroppable(
          el("input", { type: "text", value: operator, class: "operator" })
        ),
        nonDroppable(el("input", { type: "text", value: op2 })),
      ]),
    ],
  ];
}

function ifBlock(node = {}) {
  const thenStatements = node.thenStatements || [];
  const elseStatements = node.elseStatements || [];
  const thens = el(
    "div",
    { "data-name": "then", class: CONTAINER },
    thenStatements.map(nodeToBlock)
  );
  const elses = el(
    "div",
    { "data-name": "else", class: CONTAINER },
    elseStatements.map(nodeToBlock)
  );

  const condition = node.condition || {};
  const op1 = condition.op1 || "";
  const operator = condition.operator || "<";
  const op2 = condition.op2 || "0";
  return [
    [
      flexContainer([
        text("if"),
        nonDroppable(el("input", { type: "text", value: op1 })),
        nonDroppable(
          el("input", { type: "text", value: operator, class: "operator" })
        ),
        nonDroppable(el("input", { type: "text", value: op2 })),
      ]),
      el("div", { class: "container-like" }, [
        text("then"),
        thens,
        text("else"),
        elses,
      ]),
    ],
    ,
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
    const containerBlock = el("div", { class: CONTAINER }, childBlocks);
    block.appendChild(containerBlock);
  }
  return block;
}

export function attachListeners(pgBlock, menuBlock, triggerRun) {
  let dragged;

  let childNode;

  menuBlock.addEventListener("dragstart", (evt) => {
    dragged = evt.target;
    evt.dataTransfer.effectAllowed = "copy";
  });

  menuBlock.addEventListener("dragend", () => {
    dragged = null;
  });

  pgBlock.addEventListener("dragstart", (evt) => {
    dragged = evt.target;
    evt.dataTransfer.effectAllowed = "move";
  });

  pgBlock.addEventListener("dragend", (evt) => {
    dragged = null;
    if (evt.dataTransfer.dropEffect === "move") {
      evt.target.remove();
    }
  });

  function handleDropZone(evt) {
    if (childNode) {
      childNode.classList.remove(INSERT_BEFORE);
    }

    childNode = null;

    if (!evt.target.classList.contains(CONTAINER)) {
      evt.dataTransfer.dropEffect = "none";
      return;
    }

    if (dragged.contains(evt.target)) {
      evt.dataTransfer.dropEffect = "none";
      return;
    }

    if (evt.target.children.length) {
      for (const child of evt.target.children) {
        if (dragged !== child && evt.y < child.getBoundingClientRect().y) {
          childNode = child;
          childNode.classList.add(INSERT_BEFORE);
          break;
        }
      }
    }

    evt.preventDefault();
    evt.dataTransfer.dropEffect = evt.dataTransfer.effectAllowed;
    evt.target.classList.add(DRAGGED_INTO);
  }

  pgBlock.addEventListener("dragenter", handleDropZone);

  pgBlock.addEventListener("dragover", handleDropZone);

  pgBlock.addEventListener("dragleave", (evt) => {
    if (!evt.target.classList.contains(CONTAINER)) {
      return;
    }
    evt.target.classList.remove(DRAGGED_INTO);
  });

  pgBlock.addEventListener("drop", (evt) => {
    if (!evt.target.classList.contains(CONTAINER)) {
      return;
    }
    evt.preventDefault();
    if (childNode) {
      evt.target.insertBefore(dragged.cloneNode(true), childNode);
      childNode.classList.remove(INSERT_BEFORE);
      childNode = null;
    } else {
      evt.target.append(dragged.cloneNode(true));
    }
    evt.target.classList.remove(DRAGGED_INTO);
  });

  pgBlock.addEventListener("input", () => triggerRun(pgBlock));
}

function flexContainer(children) {
  return el("div", { class: "flex-row" }, children);
}

/**
 *
 * @param {HTMLElement} el
 * @returns
 */
function nonDroppable(el) {
  el.addEventListener("dragenter", (evt) => {
    evt.dataTransfer.dropEffect = "none";
    evt.preventDefault();
  });

  el.addEventListener("dragover", (evt) => {
    evt.dataTransfer.dropEffect = "none";
    evt.preventDefault();
  });
  return el;
}