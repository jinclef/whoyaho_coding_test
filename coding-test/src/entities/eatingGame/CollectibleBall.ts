import { GameObject } from "../GameObject";

export class CollectibleBall extends GameObject {
  type: string;
  value: string | number;
  lifeTime = 0; // 0이면 무제한
  timer = 0;
  
  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number, type = 'normal', value: string | number = 1) {
    super(elem, width, height, x, y);
    this.type = type;
    this.value = value;
    if(type === 'normal') {
      this.degree = Math.random() * 360;
      this.speed = 0.05 + Math.random() * 0.08;
    } else {
      this.degree = 0; // 보너스 공은 고정된 위치에 생성
      this.speed = 0; // 보너스 공은 이동하지 않음
      if (type === 'bonus') {
        this.lifeTime = 10000; // 보너스 공은 10초 후에 사라짐
      } else if (type === 'score') {
        this.lifeTime = 5000; // 점수 공은 5초 후에 사라짐
      }
    }
    
    elem.classList.add('collectible');
    if (type === 'normal') {
      elem.classList.add('normal-ball');
    } else if (type === 'bonus') {
      elem.classList.add('bonus-ball');
      elem.textContent = value.toString();
    } else if (type === 'score') {
      elem.classList.add('score-ball');
      elem.textContent = value.toString();
      const numValue = typeof value === 'number' ? value : parseInt(value.toString());
      elem.style.backgroundColor = numValue >= 100 ? '#e74c3c' : numValue >= 50 ? '#f39c12' : '#2ecc71';
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
    super.detectAreaCollision();
  }

  destroy() {
    if (this.elem && this.elem.parentNode) {
      this.elem.parentNode.removeChild(this.elem);
    }
  }
}