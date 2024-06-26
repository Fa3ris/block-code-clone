import { attachListeners, nodeToBlock } from "./block.js";
import { addEl } from "./dom-utils.js";
import { run } from "./eval.js";

const program = {
  action: "program",
  statements: [
    {
      action: "defVar",
      value: 1,
      name: "x",
    },
    {
      action: "repeat",
      value: 10,
      statements: [
        {
          action: "forward",
          value: 12,
          type: "steps",
        },
        {
          action: "left",
          value: 33,
          type: "degrees",
        },

        {
          action: "op2",
          op1: "x",
          operator: "+",
          op2: 1,
        },
        {
          action: "if",
          condition: {
            action: "comparison",
            op1: "x",
            operator: ">",
            op2: 10,
          },
          thenStatements: [
            {
              action: "op2",
              op1: "x",
              operator: "+",
              op2: 1,
            },
          ],
          elseStatements: [
            {
              action: "if",
              condition: {
                action: "comparison",
                op1: "x",
                operator: "<",
                op2: 7,
              },
              thenStatements: [
                {
                  action: "op2",
                  op1: "x",
                  operator: "+",
                  op2: 4,
                },
              ],
              elseStatements: [],
            },
          ],
        },
      ],
    },
  ],
};

const programBlock = nodeToBlock(program);

const pgContainer = document.body.querySelector(".program-container");
const menuContainer = document.body.querySelector(".menu-items");

attachListeners(programBlock, menuContainer, (block) =>
  requestAnimationFrame(() => run(block))
);
addEl(programBlock, pgContainer);

["repeat", "left", "forward", "defVar", "op2", "if"].forEach((b) => {
  addEl(nodeToBlock(b), menuContainer);
});

requestAnimationFrame(() => run(programBlock));
