import { GameObject } from "./GameObject";

export class MyBall extends GameObject {
  constructor(
    elem: HTMLElement,
    width: number,
    height: number,
    x: number,
    y: number
  ) {
    super(elem, width, height, x, y);
    elem.style.backgroundColor = "red";
    elem.style.borderRadius = "999px";
  }
}
