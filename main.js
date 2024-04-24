import { foo, el, addEl } from "./dom-utils.js";
import { createBlock } from "./block.js";

console.log(foo);

addEl(el("div", { toto: "12" }, [el("span", undefined, ["HELLO", "MOTO"])]));

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
