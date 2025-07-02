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
      easeIn: (t) => t * t,
      easeOut: (t) => t * (2 - t),
      easeInOut: (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
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
    if (this.w < arr.length && arr[this.w]()) {
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
  animate(duration, A) {
    duration = duration <= 1 ? 1 : Math.floor(duration * this.delayMult);
    if (A.length === 0) duration = 0;

    A.forEach(({ obj, changes }, ind) => {
      let j = 0;
      for (const key in changes) {
        changes["__start_" + key] = this.initialVal(obj[key], 1001 * ind + j);
        j++;
      }
    });

    return () => {
      return this.sub_animate(duration, (frame) => {
        const t = Math.min(frame / duration, 1);
        A.forEach(({ obj, changes, parameters = {} }) => {
          const easeFunc = this.getEaseFunction(parameters.ease || "linear");
          for (const key in changes) {
            if (key.startsWith("__")) continue;
            const start = changes["__start_" + key];
            const delta = changes[key];
            obj[key] = start + delta * easeFunc(t);
          }
        });
      });
    };
  }

  /**
   * Animates from current value to target value
   */
  to(duration, A) {
    duration = duration <= 1 ? 1 : Math.floor(duration * this.delayMult);
    if (A.length == 0) duration = 0;
    return () => {
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
  mainLoop() {
    this.mainAnimationSequence();
    setTimeout(() => this.mainLoop(), 10);
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
    document.getElementById(this.id).style.left = value + "px";
  }
  get x() {
    return parseFloat(getComputedStyle(document.getElementById(this.id)).left);
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
