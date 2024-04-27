const registry = {
  program: evalProgram,
  repeat: evalRepeat,
  forward: evalForward,
  left: evalLeft,
  defVar: evalDefVar,
  op2: evalOp2,
  if: evalIf,
};

const DEG_TO_RAD = Math.PI / 180;

/**
 *
 * this === { scope : {<variables>}, x: number, y: number, theta: number, ctx2d: CanvasRenderingContext2D }
 *
 */
function createRunner() {
  let runs = 0;

  return {
    run(block) {
      const scope = {};
      const canvas = document.querySelector("canvas");
      const ctx2d = canvas.getContext("2d");

      const w = 100;
      const h = 100;
      // display size (CSS pixels)
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      // ratio of 2 <=> use 2 physical pixels for 1 CSS pixel
      if (window.devicePixelRatio > 1) {
        // canvas in memory (physical pixels)
        canvas.width = w * window.devicePixelRatio;
        canvas.height = h * window.devicePixelRatio;
        // use twice as much physical pixels for any operation
        ctx2d.scale(window.devicePixelRatio, window.devicePixelRatio);
      }

      const mid_w = w / 2;
      const mid_h = h / 2;

      evalBlock.call({ scope, ctx2d, x: mid_w, y: mid_h, theta: 0 }, block);

      if (false) {
        ctx2d.lineWidth = 4;

        ctx2d.beginPath();
        ctx2d.rect(mid_w - 5, mid_h - 5, 10, 10);
        ctx2d.stroke();

        ctx2d.lineWidth = 1;
        ctx2d.beginPath();
        ctx2d.moveTo(10, 20);
        ctx2d.lineTo(10, 40);
        ctx2d.lineTo(50, 40);
        ctx2d.moveTo(75, 10);
        ctx2d.lineTo(50, 40);
        ctx2d.stroke();
      }

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
  const steps = Number(input.value);
  console.log("forward", Number(input.value));
  const { x, y, theta, ctx2d } = this;
  const newX = x + Math.cos(theta) * steps;
  const newY = y + Math.sin(theta) * steps;

  ctx2d.beginPath();
  ctx2d.moveTo(x, y);
  ctx2d.lineTo(newX, newY);
  ctx2d.stroke();

  this.x = newX;
  this.y = newY;
}

/**
 *
 * @param {HTMLElement} block
 */
function evalLeft(block) {
  const input = block.querySelector("input");
  const degrees = Number(input.value);
  this.theta -= degrees * DEG_TO_RAD;
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
  const operator = inputs[1].value;
  const right = Number(inputs[2].value);
  console.log("op2", left, operator, right);

  switch (operator) {
    case "+":
      this.scope[left] += right;
      break;
    case "-":
      this.scope[left] -= right;
  }

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
  const op = comparator.value;
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
