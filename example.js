import { Animator, htmlToObj } from "./Tideon.js";

let animators = [];

for (let i = 0; i < 8; i++) {
  animators.push(new Animator());
}

let boxes = [];
for (let i = 0; i < 8; i++) {
  boxes.push(new htmlToObj(`box${i}`));
}

const easeFunctionNames = [
  "linear",
  "easeIn",
  "easeOut",
  "easeInOut",
  "easeInCubic",
  "easeOutCubic",
  "easeInOutCubic",
  "easeInExpo",
  "easeOutExpo",
  "easeInOutExpo",
  "easeInBack",
  "easeOutBack",
  "easeInOutBack",
  "easeOutElastic",
  "drag",
  "bounce",
  "easeOutBounce",
  "easeInBounce",
  "easeInOutBounce",
];

for (let i = 0; i < animators.length; i++) {
  animators[i].standAloneFunc(1, () => {
    boxes[i].setAll({
      x: 200,
      y: 90,
      opacity: 1,
    });
  });
  animators[i].standAloneDelay(20);
  animators[i].standAloneAnimate(150, [
    {
      obj: boxes[i],
      changes: { x: 1000 },
      parameters: { ease: easeFunctionNames[i] },
    },
  ]);
  animators[i].standAloneDelay(20);
  animators[i].standAloneAnimate(50, [
    { obj: boxes[i], changes: { opacity: -1 } },
  ]);
}

//--------------------------------------------------------------------------------

animators.forEach((ani) => {
  ani.shouldLoop = true;
  ani.mainLoop(10);
});

//--------------------------------------------------------------------------------
