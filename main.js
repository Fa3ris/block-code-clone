import { el, addEl } from "./dom-utils.js";
import { createBlock, nodeToBlock } from "./block.js";

const program = {
  action: "program",
  statements: [
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
          action: "defVar",
          value: 1,
          name: "x",
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
                operator: "=",
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
addEl(programBlock);

evalBlock(program);
function evalBlock(block) {
  console.log(block);
}

addEl(
  createBlock(
    ["repeat", el("input", { type: "number", value: 10 })],
    [
      [["forward", el("input", { type: "number", value: 12 }), "steps"]],
      [
        ["left", el("input", { type: "number", value: 12 }), "degrees"],
        [
          [
            [
              "var",
              el("input", { type: "text", value: "x" }),
              el("input", { type: "number", value: 5 }),
            ],
          ],
          [["right", el("input", { type: "number", value: 42 }), "degrees"]],
          [
            [
              "add",
              el("input", { type: "text", value: "x" }),
              el("input", { type: "number", value: 1 }),
            ],
          ],
          [
            [
              "if",
              el("input", { type: "text", value: "x" }),
              ">",
              el("input", { type: "number", value: 10 }),
            ],
          ],
        ],
      ],
    ]
  )
);
