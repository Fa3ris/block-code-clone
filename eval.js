const registry = {
  program: evalProgram,
  repeat: evalRepeat,
  forward: evalForward,
  left: evalLeft,
  defVar: evalDefVar,
  op2: evalOp2,
  if: evalIf,
};

/**
 * 
 * this === { scope : {<variables>} }
 * 
 */
function createRunner() {
  let runs = 0;
  return {
    run(block) {
      const scope = {};
      evalBlock.call({ scope }, block);
      console.log("final state", scope, "runs", ++runs);
    },
  };
}

const { run } = createRunner();
export { run };

/**
 *
 * @param {HTMLElement} block
 */
function evalBlock(block) {
  false && console.log(block.dataset.name, block);
  registry[block.dataset.name].call(this, block);
}

/**
 *
 * @param {HTMLElement} block
 */
function evalProgram(block) {
  const statementBlocks = block.querySelector(".container");
  Array.prototype.map.call(statementBlocks.childNodes, evalBlock, this);
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
    Array.prototype.map.call(statementBlocks.childNodes, evalBlock, this);
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

  const left = inputs[0].value;
  const right = Number(inputs[1].value);
  console.log("defVar", left, "=", right);

  this.scope[left] = right;
  console.log(left, "==", this.scope[left]);
}

/**
 *
 * @param {HTMLElement} block
 */
function evalOp2(block) {
  const inputs = block.querySelectorAll("input");
  const left = inputs[0].value;
  const rigth = Number(inputs[1].value);
  console.log("op2", left, "+", rigth);

  this.scope[left] += rigth;
  console.log(left, "==", this.scope[left]);
}

/**
 *
 * @param {HTMLElement} block
 */
function evalIf(block) {
  const [_, first, comparator, second] = block.firstChild.childNodes;

  const left = first.value;
  const right = Number(second.value);
  const op = comparator.textContent;
  console.log("if", left, op, right);

  const leftValue = this.scope[left];
  console.log(left, "==", leftValue);

  let predicate = false;

  switch (op) {
    case ">":
      predicate = leftValue > right;
      break;
    case "<":
      predicate = leftValue < right;
      break;
    case "=":
      predicate = leftValue == right;
      break;
  }

  if (predicate) {
    const thens = block.querySelector("[data-name=then]");
    console.group("then");
    Array.prototype.map.call(thens.childNodes, evalBlock, this);
    console.groupEnd();
  } else {
    const elses = block.querySelector("[data-name=else]");
    console.group("else");
    Array.prototype.map.call(elses.childNodes, evalBlock, this);
    console.groupEnd();
  }
}
