import { Animator, htmlToObj } from "./Tideon.js";

const animator = new Animator();
const box1 = new htmlToObj("box1");
const box2 = new htmlToObj("box2");

animator.addStage({
  func: function () {
    return animator.animationSequence([
      animator.animateFunc(1, () => {
        box1.setAll({
          x: 10,
          y: 50,
          opacity: 0,
          width: 100,
          height: 100,
          rotation: 0,
        });

        box2.setAll({
          x: 200,
          y: 50,
          opacity: 1,
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
animator.standAloneFunc(1, () => {
  box2.setAll({
    x: 200,
    y: 50,
    opacity: 1,
  });
});
animator.standAloneAnimate(150, [
  { obj: box2, changes: { x: 800 }, parameters: { ease: "drag" } },
]);
animator.standAloneDelay(20);
animator.standAloneAnimate(20, [{ obj: box2, changes: { opacity: -1 } }]);
animator.standAloneFunc(1, () => {
  box2.setAll({
    x: 200,
    y: 50,
    opacity: 1,
  });
});

animator.shouldLoop = true;
animator.mainLoop(10);
