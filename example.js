import { Animator, htmlToObj } from "./Tideon.js";

const animator = new Animator();
const box1 = new htmlToObj("box1");
const box2 = new htmlToObj("box2");

animator.addStage({
  func: function () {
    return animator.animationSequence([
      animator.animateFunc(1, () => {
        box1.setAll({
          x: 100,
          y: 200,
          opacity: 0,
          width: 100,
          height: 100,
          rotation: 0,
        });
      }),
      animator.delay(50),
      animator.to(60, [
        {
          obj: box1,
          changes: {
            x: 200,
            opacity: 1,
            rotation: 90,
            width: 200,
            height: 200,
          },
        },
      ]),
      animator.delay(20),
      //   animator.animate(60, [{ obj: box1, changes: { x: 300 } }]),
      animator.animate(80, [
        {
          obj: box1,
          changes: { x: 500 },
          parameters: { ease: "easeOut" },
        },
      ]),
      animator.to(60, [
        {
          obj: box1,
          changes: {
            opacity: 0,
          },
        },
      ]),
    ]);
  },
});

animator.standAloneAnimate(100, [
  { obj: box2, changes: { x: 800 }, parameters: { ease: "easeInOut" } },
]);

animator.shouldLoop = true;
animator.mainLoop(10);
