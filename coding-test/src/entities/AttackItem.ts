import { GameObject } from "./GameObject";

export class AttackItem extends GameObject {
  lifeTime = 5000;
  timer = 0;

  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number) {
    super(elem, width, height, x, y);
    elem.classList.add('collectible', 'attack-item');
  }

  update(dt: number) {
    this.timer += dt;
    if (this.timer >= this.lifeTime) {
      this.destroy();
    }
    super.update(dt);
  }

  destroy() {
    if (this.elem && this.elem.parentNode) {
      this.elem.parentNode.removeChild(this.elem);
    }
  }
}