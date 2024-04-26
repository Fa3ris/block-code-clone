const registry = {
  program: evalProgram,
  repeat: evalRepeat,
  forward: evalForward,
  left: evalLeft,
  defVar: evalDefVar,
  op2: evalOp2,
  if: evalIf,
};

let scope = {};

/**
 *
 * @param {HTMLElement} block
 */
export function evalBlock(block) {
  false && console.log(block.dataset.name, block);
  registry[block.dataset.name](block);
}

/**
 *
 * @param {HTMLElement} block
 */
function evalProgram(block) {
  const statementBlocks = block.querySelector(".container");
  Array.prototype.map.call(statementBlocks.childNodes, evalBlock);
}

/**
 *
 * @param {HTMLElement} block
 */
function evalRepeat(block) {
  const statementBlocks = block.querySelector(".container");

  let loops = Math.abs(Number(block.querySelector("input").value));
  console.log("repeat", loops);
  while (loops) {
    console.group("loop", loops);
    Array.prototype.map.call(statementBlocks.childNodes, evalBlock);
    loops--;
    console.groupEnd();
  }
}

/**
 *
 * @param {HTMLElement} block
 */
function evalForward(block) {
  const input = block.querySelector("input");
  console.log("forward", Number(input.value));
}

/**
 *
 * @param {HTMLElement} block
 */
function evalLeft(block) {
  const input = block.querySelector("input");
  console.log("left", Number(input.value));
}

/**
 *
 * @param {HTMLElement} block
 */
function evalDefVar(block) {
  const inputs = block.querySelectorAll("input");
  console.log("devVar", inputs[0].value, "=", Number(inputs[1].value));

  scope[inputs[0].value] = Number(inputs[1].value);

  console.log(inputs[0].value, "==", scope[inputs[0].value]);
}

/**
 *
 * @param {HTMLElement} block
 */
function evalOp2(block) {
  const inputs = block.querySelectorAll("input");
  console.log("op2", inputs[0].value, "+", Number(inputs[1].value));

  scope[inputs[0].value] += Number(inputs[1].value);

  console.log(inputs[0].value, "==", scope[inputs[0].value]);
}

/**
 *
 * @param {HTMLElement} block
 */
function evalIf(block) {
  const [_, first, comparator, second] = block.firstChild.childNodes;
  console.log("if", first.value, comparator.textContent, Number(second.value));

  console.log(first.value, "==", scope[first.value]);

  let predicate = false;

  switch (comparator.textContent) {
    case ">":
      predicate = scope[first.value] > Number(second.value);
      break;
    case "<":
      predicate = scope[first.value] < Number(second.value);
      break;
    case "=":
      predicate = scope[first.value] == Number(second.value);
      break;
  }

  if (predicate) {
    const thens = block.querySelector("[data-name=then]");
    console.group("then");
    Array.prototype.map.call(thens.childNodes, evalBlock);
    console.groupEnd();
  } else {
    const elses = block.querySelector("[data-name=else]");
    console.group("else");
    Array.prototype.map.call(elses.childNodes, evalBlock);
    console.groupEnd();
  }
}
