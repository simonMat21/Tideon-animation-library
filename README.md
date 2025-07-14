# Tideon.js

**Tideon.js** is a lightweight, extensible JavaScript animation engine designed for creating smooth and expressive UI and canvas animations with minimal effort. It supports advanced animation features like easing, chained sequences, curve-path motion, and "from", "to", and "mix" transition styles.

Example use of Tideon.js :   [example website](https://simonmat21.github.io/Tideon-animation-library/).

> **New!** ✨ Now includes a built-in **Curve Editor** — a visual, draggable canvas tool that lets you define custom animation paths interactively!

---

## 🛠️ Features

- ⚡ Powerful and fast frame-based animation loop
- 🎛️ Rich easing support (linear, back, bounce, elastic, exponential, etc.)
- 🔁 Sequences of chained animations
- 🔄 Looping, delay, and custom per-frame logic
- 🎯 Supports both absolute (`to`, `from`) and relative (`animate`) transitions
- 🧹 Integrated curve editor with Catmull-Rom interpolation for smooth path motion
- 🧼 Works seamlessly with HTML elements via `htmlToObj` wrapper

---

## 📦 Installation

Just include `Animator.js` in your project:

```html
<script src="Animator.js"></script>
```

Or import it as a module:

```js
import { Animator, htmlToObj, initCurveEditor } from "./Animator.js";
```

---

## 🧠 Animator Class (Core API)

### 🛠️ Constructor

```js
const ani = new Animator();
```

Creates a new animation manager instance.

### ⭮️ `mainLoop(interval = 10)`

Starts the animation engine loop, checking for and running animation stages every `interval` ms.

### ➕ `addStage({ funcName, Args })` or `{ func, Args }`

Adds a new stage (step) in the animation pipeline.

---

## 🔧 Animator Functions

### 🏠 Structure

You animate objects by building **stages**, and then letting `mainLoop()` run those stages frame by frame.

---

### 🎮 `animate(duration, A)`

Performs relative property changes (deltas).

```js
ani.animate(50, [
  {
    obj: myObj,
    changes: { x: 100, opacity: -0.3 },
    parameters: { ease: "easeOut" },
  },
]);
```

- `changes` are deltas (not final values)
- Automatically caches starting values
- Supports `parameters.ease`

---

### 🌟 `to(duration, A)`

Animates from current state **to** a target value.

```js
ani.to(60, [{ obj: myObj, changes: { x: 200, y: 100 } }]);
```

---

### 📽 `from(duration, A)`

Starts from an offset state, animates **back to original**.

```js
ani.from(40, [{ obj: myObj, changes: { x: -50, y: -30 } }]);
```

---

### 🧪 `mix(duration, A)`

Mixes different animation types (`from`, `to`, `animate`) in one call.

```js
ani.mix(80, [
  { tag: "from", obj: myObj, changes: { x: -100, y: -50 } },
  { tag: "to", obj: anotherObj, changes: { x: 300, y: 150 } },
  { tag: "animate", obj: thirdObj, changes: { opacity: 0.5 } },
]);
```

---

### ⏳ `delay(duration)`

Pauses the sequence for a fixed number of frames.

```js
ani.delay(30); // Wait for 30 frames
```

---

### 🏃 `animateFunc(duration, func)`

Per-frame callback-based animation.

```js
ani.animateFunc(100, (frame) => {
  obj.x += 1;
  obj.y += Math.sin(frame / 10);
});
```

---

### 🌍 `standAloneCurve(obj, points, duration, ease)`

Moves an object smoothly along a Catmull-Rom interpolated path.

```js
ani.standAloneCurve(obj, points, 120, "easeInOutCubic");
```

- `points`: An array of `{ x, y }` coordinates
- `obj`: Must have `x` and `y` properties

---

## 🔍 Curve Editor

### `initCurveEditor()`

Adds a canvas-based curve editor on your screen to **visually define path points** by clicking and dragging.

- ✍ Click to add a point
- ↔ Drag to move
- 📍 Double-click to delete
- ⌨ Press `E` to export the path (prints to console)

Great for building paths to use with `standAloneCurve()`!

---

## 🏢 htmlToObj

A small utility class that wraps around a DOM element and gives you animation-friendly properties like:

- `x`, `y`, `width`, `height`
- `rotation`, `scale`, `opacity`, `color`

Example:

```js
const box = new htmlToObj("boxId");
ani.standAloneTo(60, [{ obj: box, changes: { x: 200, opacity: 0.5 } }]);
```

---

## 🔧 Example

```js
const a = new Animator();
a.standAloneFrom(40, [{ obj: myObj, changes: { x: -100, opacity: -0.5 } }]);
a.standAloneTo(60, [{ obj: myObj, changes: { x: 200, opacity: 1 } }]);
a.mainLoop();
```

---

## 🚀 License

MIT License

---

## ✨ Author

Created with ❤️ by Simon Mattekkatt (JustAGuy.21)
