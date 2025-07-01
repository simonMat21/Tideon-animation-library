export class htmlToObj {
  constructor(id) {
    this.id = id;
    this._rotation = 0; // Store rotation internally
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
