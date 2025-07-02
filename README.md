# 🌀 Tideon.js

A lightweight, customizable JavaScript animation engine that supports `to`, `from`, `animate`, easing functions (`linear`, `easeIn`, `easeOut`, etc.), and animation sequences. Perfect for animating object-style properties such as `x`, `y`, `opacity`, and more — commonly used in custom DOM wrappers or canvas-style animations.

---

## 📦 Features

- 🔁 Frame-based animations
- 🎯 Supports `to`, `from`, `animate`, and `mix` styles
- ⏱ Easing functions: `linear`, `easeIn`, `easeOut`, `easeInOut`
- ⏳ Supports animation sequences and delays
- 🧠 One-time initial value caching
- 🧩 Fully customizable animation parameters
- 🔂 Optional looping

---

## 🚀 Getting Started

### 1. Add the file

```js
import { Animator } from "./Tideon.js";
```

### 2. Create an animator instance and initialise the loop

```js
const animator = new Animator();
animator.mainLoop();
```

### 3. Animate an object

```js
const box = { x: 0, y: 0, opacity: 1 };

animator.addStage({
  func: function () {
    return animator.animationSequence([
      animator.animate(80, [
        {
          obj: box,
          changes: { x: 500 },
          parameters: { ease: "easeOut" },
        },
      ]),
    ]);
  },
});
```

---

## 🧠 Core Concepts

### 🎬 animate(duration, changesArray)

Performs delta-based animations with optional easing.

```js
animator.animate(60, [
  { obj, changes: { x: 100 }, parameters: { ease: "easeInOut" } },
])();
```

---

### 📈 to(duration, changesArray)

Moves an object **to** a target value.

```js
animator.to(60, [{ obj, changes: { x: 400, opacity: 0 } }])();
```

---

### 📉 from(duration, changesArray)

Animates an object **from** a temporary offset value to its original.

```js
animator.from(60, [{ obj, changes: { y: -50 } }])();
```

---

### 🧪 mix(duration, array)

Combines `from`, `to`, and `animate` style instructions in one animation:

```js
animator.mix(60, [
  { tag: "from", obj, changes: { x: -100 } },
  { tag: "to", obj, changes: { y: 200 } },
  { tag: "animate", obj, changes: { opacity: 0.3 } },
])();
```

---

### 💤 delay(duration)

Inserts a pause between animations.

```js
animator.delay(30)();
```

---

### 🧵 animationSequence([step1, step2, ...])

Runs multiple animations one after the other.

```js
const step1 = animator.to(60, [{ obj, changes: { x: 200 } }]);
const step2 = animator.animate(60, [{ obj, changes: { opacity: -0.5 } }]);

animator.animationSequence([step1, step2]);
```

---

### 🔁 mainLoop()

Continuously executes your animation sequence using `setTimeout`.

```js
animator.mainLoop();
```

---

## 🛠 Internal Utilities

| Function                  | Description                                                   |
| ------------------------- | ------------------------------------------------------------- |
| `setDelayMult(val)`       | Sets a global speed multiplier (only before animation starts) |
| `initialVal(a, id)`       | Stores and retrieves initial values (used for caching)        |
| `initialFunc(func, id)`   | Caches return value of a function during the first run        |
| `sub_animate(n, f)`       | Core frame driver. Calls function `f(frame)` for `n` frames   |
| `addStage(stage)`         | Adds an animation stage to the `listOfActions` queue          |
| `mainAnimationSequence()` | Executes queued stages one at a time                          |
| `functionsDictionary`     | Lookup for named animation steps (`funcName`)                 |

---

## 💡 Example Use Case

Suppose you have a custom object that wraps a DOM element and controls its style:

```js
class divToObj {
  constructor(id) {
    this.divRef = document.getElementById(id);
  }

  set x(val) {
    this.divRef.style.left = val + "px";
  }
  get x() {
    return parseFloat(getComputedStyle(this.divRef).left);
  }

  // ... (other style props: y, opacity, etc.)
}
```

Now you can animate the DOM element using `Animator`:

```js
const box = new divToObj("box1");

animator.addStage({
  func: function () {
    return animator.animationSequence([
      animator.animate(80, [
        {
          obj: box,
          changes: { x: 500 },
          parameters: { ease: "easeOut" },
        },
      ]),
    ]);
  },
});
```

---

## 🔧 Customize

You can extend the `easeMap` in `getEaseFunction()` to support:

- `easeInCubic`
- `bounce`
- `elastic`
- or even custom timing functions.

---

## 🔧 useful tips

This library is mainly made for making cool animations and is best when used with other drawing libraries like p5.js.

This.is meant to be a really light weight library that can be easily implimented. So I won't recommend this library for more professional projects.

---

## 📚 License

MIT License — Free to use, modify, and distribute.

---

## ✍️ Author

Built by [Justaguy.21] — Happy Animating!  
Feel free to open issues or contribute on GitHub.
