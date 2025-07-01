import { Animator } from "./animator.js";
import { htmlToObj } from "./htmlToObj.js";

const animator = new Animator();
const box1 = new htmlToObj("box1");

animator.addStage({
  func: function () {
    return animator.animationSequence([
      animator.animateFunc(1, () => {
        box1.opacity = 0;
        box1.x = 100;
        box1.y = 100;
        box1.width = 100;
        box1.height = 100;
        box1.rotation = 0;
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

animator.shouldLoop = true;
animator.mainLoop();
