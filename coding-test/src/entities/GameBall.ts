import { BallType } from "./BallSpawner";
import { GameObject } from "./GameObject";

export class Obstacle extends GameObject {
  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number) {
    super(elem, width, height, x, y);
    elem.classList.add('obstacle');
    elem.style.width = `${width}px`;
    elem.style.height = `${height}px`;
    this.degree = Math.random() * 360;
    this.speed = (2 + Math.random()) * 0.1;
  }
}

export class CollectibleBall extends GameObject {
  type: BallType;
  value: string | number;
  lifeTime = 0; // 0이면 무제한
  timer = 0;
  
  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number, type: BallType = BallType.Normal, value: string | number = 1) {
    super(elem, width, height, x, y);
    this.type = type;
    this.value = value;
    if(type === BallType.Normal) {
      this.degree = Math.random() * 360;
      this.speed = 0.05 + Math.random() * 0.08;
    } else {
      this.degree = 0; // 보너스 공은 고정된 위치에 생성
      this.speed = 0; // 보너스 공은 이동하지 않음
      this.lifeTime = 10000; // 보너스 공은 10초 후에 사라짐
    }
    
    elem.classList.add('collectible');
    if (type === BallType.Normal) {
      elem.classList.add('normal-ball');
    } else if (type === BallType.Bonus) {
      elem.classList.add('bonus-ball');
      elem.textContent = value.toString();
    }
  }

  update(dt: number) {
    // 보너스 공 수명 관리
    if (this.lifeTime > 0) {
      this.timer += dt;
      if (this.timer >= this.lifeTime) {
        this.destroy();
        return;
      }
    }
    
    super.update(dt);
  }

  destroy() {
    if (this.elem && this.elem.parentNode) {
      this.elem.parentNode.removeChild(this.elem);
    }
  }
}