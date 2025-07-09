// Animator.js

/**
 * Animator class: handles frame-based animations with support for easing,
 * sequences, and flexible parameter-driven transitions (from/to/animate).
 */
export class Animator {
  constructor() {
    // ⏱ Multiplier to slow down or speed up all animations
    this.delayMult = 1;

    // 🔁 Current frame count in an animation
    this.n = 0;

    // 🔁 Current step in a multi-part animation sequence
    this.w = 0;

    // 🔁 Current animation index being executed from listOfActions
    this.aniCount = 0;

    // 🧠 Stores initial values for 'animate' transitions
    this.g = [];

    // 🧠 Generic reusable temporary array for value storage
    this.v = [];

    // 🧠 Stores initial values for sequences (used in .from, .mix, etc.)
    this.initialValArray = [];

    // 🧠 Stores return values of initialFunc (one-time function caching)
    this.initialFuncKeyArr = [];

    // 🧠 Stores return values of initialFuncSeq (like above but for sequences)
    this.initialFuncSeqKeyArr = [];

    // 🧠 Optional object ID registry for external mapping
    this.objectIdArray = [];

    // 🧠 Stores named animation functions (like a function dictionary)
    this.functionsDictionary = {};

    // 📜 List of animation "stages" to execute in sequence
    this.listOfActions = [];

    // 🔁 Whether an animation sequence should loop forever
    this.shouldLoop = false;

    // ⚙️ Whether mainLoop is actively executing animations
    this.executing = false;
  }

  // 🔧 Utility: returns the appropriate easing function
  getEaseFunction(type) {
    const easeMap = {
      linear: (t) => t,

      // Quadratic
      easeIn: (t) => t * t,
      easeOut: (t) => t * (2 - t),
      easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

      // Cubic
      easeInCubic: (t) => t * t * t,
      easeOutCubic: (t) => --t * t * t + 1,
      easeInOutCubic: (t) =>
        t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) ** 2 + 1,

      // Exponential
      easeInExpo: (t) => (t === 0 ? 0 : Math.pow(2, 10 * (t - 1))),
      easeOutExpo: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
      easeInOutExpo: (t) => {
        if (t === 0 || t === 1) return t;
        t *= 2;
        return t < 1
          ? 0.5 * Math.pow(2, 10 * (t - 1))
          : 0.5 * (2 - Math.pow(2, -10 * (t - 1)));
      },

      // Back
      easeInBack: (t) => {
        const c1 = 1.70158;
        return c1 * t * t * t - c1 * t * t;
      },
      easeOutBack: (t) => {
        const c1 = 1.70158;
        return 1 + c1 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
      },
      easeInOutBack: (t) => {
        const c1 = 1.70158 * 1.525;
        return t < 0.5
          ? (Math.pow(2 * t, 2) * ((c1 + 1) * 2 * t - c1)) / 2
          : (Math.pow(2 * t - 2, 2) * ((c1 + 1) * (t * 2 - 2) + c1) + 2) / 2;
      },

      // Elastic
      easeOutElastic: (t) => {
        const c4 = (2 * Math.PI) / 3;
        return t === 0
          ? 0
          : t === 1
          ? 1
          : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      },

      drag: (t) => 1 - Math.pow(1 - t, 3),

      // Bounce

      bounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;

        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          t -= 1.5 / d1;
          return n1 * t * t + 0.75;
        } else if (t < 2.5 / d1) {
          t -= 2.25 / d1;
          return n1 * t * t + 0.9375;
        } else {
          t -= 2.625 / d1;
          return n1 * t * t + 0.984375;
        }
      },

      easeOutBounce: (t) => {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (t < 1 / d1) {
          return n1 * t * t;
        } else if (t < 2 / d1) {
          return n1 * (t -= 1.5 / d1) * t + 0.75;
        } else if (t < 2.5 / d1) {
          return n1 * (t -= 2.25 / d1) * t + 0.9375;
        } else {
          return n1 * (t -= 2.625 / d1) * t + 0.984375;
        }
      },

      easeInBounce: (t) => 1 - easeMap.easeOutBounce(1 - t),

      easeInOutBounce: (t) =>
        t < 0.5
          ? (1 - easeMap.easeOutBounce(1 - 2 * t)) * 0.5
          : (1 + easeMap.easeOutBounce(2 * t - 1)) * 0.5,
    };

    return easeMap[type] || easeMap.linear;
  }

  // Set global delay multiplier if no animation is currently running
  setDelayMult(val) {
    if (this.n == 0 && val > 0) {
      this.delayMult = val;
    }
  }

  // Returns and caches initial value `a` by ID
  initialVal(a, id) {
    if (this.g[id] == 0 || this.g[id] == undefined) {
      this.g[id] = a;
    }
    return this.g[id];
  }

  // Like initialVal, but specifically for sequences
  initialValSeq(a = null, id = 0) {
    if (a !== null && this.initialValArray[id] === undefined) {
      this.initialValArray[id] = a;
    }
    return this.initialValArray[id];
  }

  // One-time function result storage for static animations
  initialFunc(func, id = 0) {
    if (this.initialFuncKeyArr[id] == undefined) {
      this.initialFuncKeyArr[id] = func() || -1;
    }
    return this.initialFuncKeyArr[id];
  }

  // One-time function result storage for animation sequences
  initialFuncSeq(func, id = 0) {
    if (this.initialFuncSeqKeyArr[id] == undefined) {
      this.initialFuncSeqKeyArr[id] = func() || -1;
    }
    return this.initialFuncSeqKeyArr[id];
  }

  /**
   * Core animation handler — runs `func(frame)` up to `no_frame` times.
   * Returns 0 if still running, 1 if finished.
   */
  sub_animate(no_frame, func) {
    if (this.n < no_frame) {
      func(this.n);
      this.n++;
      return 0;
    } else {
      // Reset caches when animation ends
      this.g = [];
      this.initialFuncKeyArr = [];
      return 1;
    }
  }

  /**
   * Executes a list of animation callbacks in sequence.
   * Returns 1 when sequence is finished.
   */
  animationSequence(arr) {
    if (this.w < arr.length && arr[this.w](this.w)) {
      this.n = 0;
      this.w++;
      if (this.w == arr.length) {
        this.w++;
        this.v = [];
        this.initialValArray = [];
        this.initialFuncSeqKeyArr = [];
        return 1;
      }
    }
    return 0;
  }

  /**
   * Basic time-based animation wrapper.
   * `func(frame)` is called each frame for `duration` frames.
   */
  animateFunc(duration, func) {
    duration = duration <= 1 ? 1 : Math.floor(duration * this.delayMult);
    return () => this.sub_animate(duration, func);
  }

  /**
   * Animate object properties using deltas, supports easing.
   * A = [ { obj, changes, parameters: { ease: "easeIn" } } ]
   */
  STanimate_(duration, A) {
    duration = duration <= 1 ? 1 : Math.floor(duration * this.delayMult);
    if (A.length === 0) duration = 0;

    let initialized = false;

    return () => {
      if (!initialized) {
        A.forEach(({ obj, changes }, ind) => {
          let j = 0;
          for (const key in changes) {
            const start = obj[key];
            const end = start + changes[key];
            changes["__start_" + key] = start;
            changes["__end_" + key] = end;
            j++;
          }
        });
        initialized = true;
      }

      return this.sub_animate(duration, (frame) => {
        const t = Math.min(frame / duration, 1);

        A.forEach(({ obj, changes, parameters = {} }) => {
          const easeFunc = this.getEaseFunction(parameters.ease || "linear");

          for (const key in changes) {
            if (key.startsWith("__")) continue;

            const start = changes["__start_" + key];
            const end = changes["__end_" + key];

            let easedValue = start + (end - start) * easeFunc(t);

            // Snap to final value on last frame
            if (frame === duration - 1) {
              easedValue = end;
            }

            obj[key] = easedValue;
          }
        });
      });
    };
  }

  /**
   * Animate object properties using deltas, supports easing.
   * A = [ { obj, changes, parameters: { ease: "easeIn" } } ]
   */
  animate(duration, A) {
    return () => {
      duration = duration <= 1 ? 1 : Math.floor(duration * this.delayMult);
      if (A.length === 0) duration = 0;

      A.forEach(({ obj, changes }, ind) => {
        let j = 0;
        for (const key in changes) {
          const start = this.initialVal(obj[key], 1001 * ind + j);
          const end = start + changes[key];
          changes["__start_" + key] = start;
          changes["__end_" + key] = end;
          j++;
        }
      });
      return this.sub_animate(duration, (frame) => {
        const t = Math.min(frame / duration, 1);

        A.forEach(({ obj, changes, parameters = {} }) => {
          const easeFunc = this.getEaseFunction(parameters.ease || "linear");

          for (const key in changes) {
            if (key.startsWith("__")) continue;

            const start = changes["__start_" + key];
            const end = changes["__end_" + key];

            let easedValue = start + (end - start) * easeFunc(t);

            // Force exact end value on final frame to prevent drift
            if (frame === duration - 1) {
              easedValue = end;
            }

            obj[key] = easedValue;
          }
        });
      });
    };
  }

  /**
   * Animates from current value to target value
   */
  to(duration, A) {
    return () => {
      duration = duration <= 1 ? 1 : Math.floor(duration * this.delayMult);
      if (A.length == 0) duration = 0;
      return this.sub_animate(duration, () => {
        A.forEach(({ obj, changes }, ind) => {
          let j = 1;
          for (const key in changes) {
            if (typeof changes[key] === "number") {
              obj[key] +=
                this.initialVal(changes[key] - obj[key], 1001 * j + ind) /
                duration;
            }
            j++;
          }
        });
      });
    };
  }

  /**
   * Starts from an offset state, then animates back to original state
   */
  from(duration, A) {
    duration = duration <= 1 ? 1 : Math.floor(duration * this.delayMult);
    if (A.length == 0) duration = 0;
    return () => {
      return this.sub_animate(duration, () => {
        let copy = this.iVSub(
          A.map(({ obj }) => structuredClone(obj)),
          1000
        );
        if (this.iVSub(null, 1001) === undefined) {
          A.forEach(({ obj, changes }) => {
            for (const key in changes) {
              if (typeof changes[key] === "number") {
                obj[key] += changes[key];
              }
            }
          });
          this.iVSub(1, 1001);
        }
        A.forEach(({ obj, changes }, ind) => {
          for (const key in changes) {
            if (typeof changes[key] === "number") {
              obj[key] += (copy[ind][key] - changes[key]) / duration;
            }
          }
        });
      });
    };
  }

  /**
   * Mixed animation mode combining `from`, `to`, and `animate` tags.
   * Each item in A must have a `tag` property: "from", "to", or "animate".
   */
  mix(duration, A) {
    duration = duration <= 1 ? 1 : Math.floor(duration * this.delayMult);
    if (A.length == 0) duration = 0;
    return () => {
      return this.sub_animate(duration, () => {
        let copy = this.initialVal(
          A.map((item) => structuredClone(item.obj)),
          1000
        );
        if (this.initialVal(null, 1001) === undefined) {
          A.filter(([tag]) => tag === "from").forEach(
            ([_, obj, x, y, opacity]) => {
              obj.x = x;
              obj.y = y;
              obj.opacity = opacity;
            }
          );
          this.initialVal(1, 1001);
        }
        A.forEach((item, ind) => {
          const { tag, obj, changes } = item;
          if (tag === "from") {
            for (const key in changes) {
              if (typeof changes[key] === "number") {
                obj[key] += (copy[ind][key] - changes[key]) / duration;
              }
            }
          } else if (tag === "to") {
            let j = 1;
            for (const key in changes) {
              if (typeof changes[key] === "number") {
                obj[key] +=
                  this.initialVal(changes[key] - obj[key], 1001 * j + ind) /
                  duration;
              }
              j++;
            }
          } else if (tag === "animate") {
            for (const key in changes) {
              if (typeof changes[key] === "number") {
                obj[key] += changes[key] / duration;
              }
            }
          }
        });
      });
    };
  }

  /**
   * delays the animation for the given number of frames.
   * @param {*} duration number of frames to delay
   */
  delay(duration) {
    return () => {
      return this.sub_animate(duration, () => {});
    };
  }

  standAloneAnimate(duration, A) {
    const anim = this.STanimate_(duration, A); // Create once
    this.addStage({
      func: () => this.animationSequence([anim]), // Reuse the same function
    });
  }

  standAloneTo(duration, A) {
    const anim = this.to(duration, A); // Create once
    this.addStage({
      func: () => this.animationSequence([anim]), // Reuse the same function
    });
  }

  standAloneFrom(duration, A) {
    const anim = this.from(duration, A); // Create once
    this.addStage({
      func: () => this.animationSequence([anim]), // Reuse the same function
    });
  }

  standAloneMix(duration, A) {
    const anim = this.mix(duration, A); // Create once
    this.addStage({
      func: () => this.animationSequence([anim]), // Reuse the same function
    });
  }

  standAloneDelay(duration) {
    const anim = this.delay(duration); // Create once
    this.addStage({
      func: () => this.animationSequence([anim]), // Reuse the same function
    });
  }

  standAloneFunc(duration, func) {
    const anim = this.animateFunc(duration, func); // Create once
    this.addStage({
      func: () => this.animationSequence([anim]), // Reuse the same function
    });
  }
  /**
   * Animate an object smoothly along a mid-point quadratic Bézier path.
   * Matches the same curve rendering used in canvas editors.
   * @param {*} obj Object with x and y to animate
   * @param {*} points Control points from the curve editor
   * @param {*} duration Total animation duration
   * @param {*} ease Easing function name (e.g. "easeInOutCubic")
   */
  standAloneCurve(obj, points, duration = 100, ease = "linear") {
    if (points.length < 2) return;

    const easeFunc = this.getEaseFunction(ease);

    // Catmull-Rom interpolation helper
    function getCatmullRomPoint(p0, p1, p2, p3, t) {
      const t2 = t * t;
      const t3 = t2 * t;

      return {
        x:
          0.5 *
          (2 * p1.x +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
        y:
          0.5 *
          (2 * p1.y +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3),
      };
    }

    const segments = [];

    // Create segments for all middle points (Catmull-Rom requires 4 points)
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1 < 0 ? 0 : i - 1];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2 >= points.length ? points.length - 1 : i + 2];
      segments.push([p0, p1, p2, p3]);
    }

    this.addStage({
      func: () =>
        this.animationSequence([
          this.animateFunc(duration, (frame) => {
            const t = easeFunc(frame / duration);
            const total = segments.length;
            const segT = Math.min(t * total, total - 0.00001);
            const segIndex = Math.floor(segT);
            const localT = segT - segIndex;

            const [p0, p1, p2, p3] = segments[segIndex];
            const pos = getCatmullRomPoint(p0, p1, p2, p3, localT);

            obj.x = pos.x;
            obj.y = pos.y;

            // Optional snap
            if (frame === duration - 1) {
              obj.x = points[points.length - 1].x;
              obj.y = points[points.length - 1].y;
            }
          }),
        ]),
    });
  }

  /**
   * Core driver that steps through `listOfActions` each frame.
   */
  mainAnimationSequence() {
    if (this.aniCount < this.listOfActions.length) {
      this.executing = true;
      const Arg = this.listOfActions[this.aniCount];
      if (Arg.funcName === undefined) {
        if (Arg.func(Arg.Args || [])) {
          this.w = 0;
          this.aniCount++;
        }
      } else if (Arg.funcName in this.functionsDictionary) {
        if (this.functionsDictionary[Arg.funcName](Arg.Args || [])) {
          this.w = 0;
          this.aniCount++;
        }
      }
    } else {
      if (this.shouldLoop) {
        this.aniCount = 0;
      }
      this.executing = false;
    }
  }

  /**
   * Adds a stage to the animation sequence.
   * A stage is an object: { funcName, Args } or { func, Args }
   */
  addStage(stage) {
    this.listOfActions.push(stage);
  }

  /**
   * Runs the animation loop every 10ms using setTimeout.
   */
  mainLoop(interval = 10) {
    this.mainAnimationSequence();
    setTimeout(() => this.mainLoop(interval), interval);
  }

  // Internal helper used in `from()` (assumed based on naming)
  iVSub(a, id) {
    return this.initialVal(a, id);
  }
}

export class htmlToObj {
  constructor(id) {
    this.id = id;
    this._rotation = 0; // Store rotation internally
    this._x = 0;
  }

  setAll(props) {
    for (const key in props) {
      if (key in this) {
        try {
          this[key] = props[key]; // trigger the setter
        } catch (e) {
          console.warn(`Failed to set ${key}:`, e);
        }
      } else {
        console.warn(`Unknown property: ${key}`);
      }
    }
  }

  // X position (left)
  set x(value) {
    this._x = value;
    document.getElementById(this.id).style.left = this._x + "px";
  }
  get x() {
    return this._x;
  }

  // Y position (top)
  set y(value) {
    document.getElementById(this.id).style.top = value + "px";
  }
  get y() {
    return parseFloat(getComputedStyle(document.getElementById(this.id)).top);
  }

  // Width
  set width(value) {
    document.getElementById(this.id).style.width = value + "px";
  }
  get width() {
    return parseFloat(getComputedStyle(document.getElementById(this.id)).width);
  }

  // Height
  set height(value) {
    document.getElementById(this.id).style.height = value + "px";
  }
  get height() {
    return parseFloat(
      getComputedStyle(document.getElementById(this.id)).height
    );
  }

  // scale
  set scale(value) {
    document.getElementById(this.id).style.transform = `scale(${value})`;
  }
  get scale() {
    return parseFloat(
      getComputedStyle(document.getElementById(this.id)).height
    );
  }

  // fontSize
  set fontSize(value) {
    document.getElementById(this.id).style.fontSize = value + "px";
  }
  get fontSize() {
    return parseFloat(
      getComputedStyle(document.getElementById(this.id)).fontSize
    );
  }

  // Background color
  set color(value) {
    document.getElementById(this.id).style.backgroundColor = value;
  }
  get color() {
    return getComputedStyle(document.getElementById(this.id)).backgroundColor;
  }

  // Opacity
  set opacity(value) {
    document.getElementById(this.id).style.opacity = value;
  }
  get opacity() {
    return parseFloat(
      getComputedStyle(document.getElementById(this.id)).opacity
    );
  }

  set rotation(degrees) {
    this._rotation = degrees;
    document.getElementById(this.id).style.transform = `rotate(${degrees}deg)`;
  }

  get rotation() {
    return this._rotation;
  }

  set text(value) {
    document.getElementById(this.id).textContent = value;
  }
  get text() {
    return document.getElementById(this.id).textContent;
  }
}
