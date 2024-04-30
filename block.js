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
        { class: CONTAINER },
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

  block.addEventListener("dragstart", (evt) => {
    const template = document.createElement("template");
    template.innerHTML = evt.target.outerHTML;
    const result = template.content.firstChild;

    if (MENU_ITEM in evt.target.dataset) {
      delete result.dataset.menu_item;
      evt.dataTransfer.effectAllowed = "copy";
    } else {
      evt.dataTransfer.effectAllowed = "move";
    }
    evt.dataTransfer.setData("text/plain", result.outerHTML);
  });

  block.addEventListener("dragend", (evt) => {
    if (evt.dataTransfer.dropEffect === "move") {
      evt.target.remove();
    }
  });

  if (Array.isArray(childBlocks)) {
    const containerBlock = el("div", { class: CONTAINER }, childBlocks);
    block.appendChild(containerBlock);

    containerBlock.addEventListener("dragenter", (evt) => {
      if (MENU_ITEM in block.dataset) {
        evt.dataTransfer.dropEffect = "none";
        return;
      }
      if (!evt.target.classList.contains(CONTAINER)) {
        evt.dataTransfer.dropEffect = "none";
        return;
      }
      evt.preventDefault();
      evt.dataTransfer.dropEffect = evt.dataTransfer.effectAllowed;
      evt.target.classList.add(DRAGGED_INTO);
    });

    containerBlock.addEventListener("dragover", (evt) => {
      if (MENU_ITEM in block.dataset) {
        evt.dataTransfer.dropEffect = "none";
        return;
      }
      if (!evt.target.classList.contains(CONTAINER)) {
        evt.dataTransfer.dropEffect = "none";
        return;
      }

      evt.preventDefault();
      evt.dataTransfer.dropEffect = evt.dataTransfer.effectAllowed;
      evt.target.classList.add(DRAGGED_INTO);
    });

    containerBlock.addEventListener("dragleave", (evt) => {
      if (!evt.target.classList.contains(CONTAINER)) {
        return;
      }
      evt.target.classList.remove(DRAGGED_INTO);
    });

    containerBlock.addEventListener("drop", (evt) => {
      if (!evt.target.classList.contains(CONTAINER)) {
        return;
      }
      evt.preventDefault();
      evt.stopPropagation(); // prevent other drops from firing

      const html = evt.dataTransfer.getData("text/plain");
      const template = document.createElement("template");
      template.innerHTML = html;
      const result = template.content.children;

      evt.target.append(...result);
      evt.target.classList.remove(DRAGGED_INTO);
    });
  }
  return block;
}

const MENU_ITEM = "menu_item";
const DRAGGED_INTO = "dragged-into";
const CONTAINER = "container";

export function blockAsMenuItem(b) {
  const block = nodeToBlock(b);
  block.dataset[MENU_ITEM] = "";

  return block;
}