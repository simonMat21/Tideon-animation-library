import { Animator, htmlToObj } from "./Tideon.js";
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

let animators = [];

for (let i = 0; i < 8; i++) {
  animators.push(new Animator());
}

let boxes = [];
for (let i = 0; i < 8; i++) {
  boxes.push(new htmlToObj(`box${i}`));
}
let bb = new htmlToObj(`box${8}`);

let letters = [];
for (let i = 0; i < 9; i++) {
  letters.push(new htmlToObj(`letter${i}`));
}

animators[1].addStage({
  func: function () {
    return animators[1].animationSequence([
      animators[1].animateFunc(1, () => {
        letters[0].setAll({
          x: 80,
          y: 0,
          rotation: -90,
          opacity: 0,
        });
        letters[1].setAll({
          x: 210,
          y: 0,
          opacity: 0,
        });
        letters[2].setAll({
          x: 240,
          y: 100,
          rotation: -180,
          opacity: 0,
        });
        letters[3].setAll({
          x: 280,
          y: 200,
          opacity: 0,
        });
        letters[4].setAll({
          x: 320,
          y: 100,
          fontSize: 0,
          opacity: 0,
        });
        letters[5].setAll({
          x: 360,
          y: 100,
          fontSize: 180,
          opacity: 0,
        });
        letters[6].setAll({
          x: 400,
          y: 100,
          fontSize: 180,
          opacity: 0,
        });
        letters[7].setAll({
          x: 440,
          y: 200,
          opacity: 0,
        });
        letters[8].setAll({
          x: 480,
          y: 0,
          opacity: 0,
        });
      }),
      animators[1].delay(20),
      animators[1].animate(60, [
        {
          obj: letters[0],
          changes: { x: 100, y: 100, rotation: 90, opacity: 1 },
          parameters: { ease: "easeInOut" },
        },
        {
          obj: letters[1],
          changes: { y: 100, opacity: 1 },
          parameters: { ease: "easeInOut" },
        },
        {
          obj: letters[2],
          changes: { rotation: 180, opacity: 1 },
          parameters: { ease: "easeInOut" },
        },
        {
          obj: letters[3],
          changes: { y: -100, opacity: 1 },
          parameters: { ease: "easeInOut" },
        },
        {
          obj: letters[4],
          changes: { fontSize: 70, opacity: 1 },
          parameters: { ease: "easeInOut" },
        },
        {
          obj: letters[5],
          changes: { fontSize: -110, opacity: 1 },
          parameters: { ease: "easeInOut" },
        },
        {
          obj: letters[6],
          changes: { fontSize: -110, opacity: 1 },
          parameters: { ease: "easeInOut" },
        },
      ]),
      animators[1].animate(80, [
        {
          obj: letters[7],
          changes: { y: -100, opacity: 1 },
          parameters: { ease: "easeOutElastic" },
        },
        {
          obj: letters[8],
          changes: { y: 100, opacity: 1 },
          parameters: { ease: "easeOutBounce" },
        },
      ]),
      animators[1].delay(80),
      animators[1].animate(
        40,
        letters.map((l) => ({
          obj: l,
          changes: { opacity: -1 },
        }))
      ),
    ]);
  },
});

animators[0].addStage({
  func: function () {
    return animators[0].animationSequence([
      animators[0].animateFunc(1, () => {
        boxes.forEach((b) => {
          b.setAll({
            x: 50,
            y: 90,
            opacity: 1,
          });
        });
      }),
      animators[0].delay(20),
      animators[0].animate(
        100,
        boxes.map((b, i) => ({
          obj: b,
          changes: { x: 700 },
          parameters: { ease: easeFunctionNames[i] },
        }))
      ),
      animators[0].delay(20),
    ]);
  },
});

animators[2].standAloneFunc(1, () => {
  bb.x = 76;
  bb.y = 34;
});

animators[2].standAloneCurve(
  bb,
  [
    {
      x: 39,
      y: 123,
    },
    {
      x: 456,
      y: 29,
    },
    {
      x: 30,
      y: 28,
    },
    {
      x: 406,
      y: 121,
    },
  ],
  100
);

//--------------------------------------------------------------------------------

// animators.forEach((ani) => {
//   ani.shouldLoop = true;
//   ani.mainLoop(10);
// });
animators[0].shouldLoop = true;
animators[0].mainLoop(10);

animators[1].shouldLoop = true;
animators[1].mainLoop(10);

animators[2].shouldLoop = true;
animators[2].mainLoop(10);

//--------------------------------------------------------------------------------
