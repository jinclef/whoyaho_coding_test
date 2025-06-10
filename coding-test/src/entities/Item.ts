import { GameObject } from "./GameObject";

// 아이템 타입 정의
enum ItemType {
  SlowMotion = "slow-motion",
  Points1000 = "points-1000", 
  Points10000 = "points-10000",
  RemoveBomb = "remove-bomb",
  ExtraLife = "extra-life",
  Invincible = "invincible"
}

// 아이템 클래스
class Item extends GameObject {
  type: ItemType;
  spawnTime: number;
  lifespan: number = 10000; // 10초 후 사라짐

  constructor(type: ItemType, x: number, y: number, spawnTime: number) {
    const elem = document.createElement("div");
    elem.className = `item item-${type}`;
    elem.style.cssText = `
      position: absolute;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      z-index: 10;
      background: ${Item.getItemColor(type)};
      border: 2px solid white;
      box-shadow: 0 0 10px rgba(255,255,255,0.5);
      animation: itemFloat 2s ease-in-out infinite alternate;
    `;
    
    super(elem, 30, 30, x, y);
    this.type = type;
    this.spawnTime = spawnTime;
  }

  static getItemColor(type: ItemType): string {
    switch (type) {
      case ItemType.SlowMotion: return "linear-gradient(45deg, #00ffff, #0080ff)";
      case ItemType.Points1000: return "linear-gradient(45deg, #ffff00, #ff8000)";
      case ItemType.Points10000: return "linear-gradient(45deg, #ff0080, #ff00ff)";
      case ItemType.RemoveBomb: return "linear-gradient(45deg, #00ff00, #80ff00)";
      case ItemType.ExtraLife: return "linear-gradient(45deg, #ff4080, #ff0040)";
      case ItemType.Invincible: return "linear-gradient(45deg, #ffffff, #c0c0c0)";
      default: return "#ffffff";
    }
  }

  update(_dt: number) {
    // 아이템은 움직이지 않음, 시간 체크만
  }

  isExpired(currentTime: number): boolean {
    return currentTime - this.spawnTime > this.lifespan;
  }

	render() {
    this.elem!.style.left = `${this.x}px`;
    this.elem!.style.top = `${this.y}px`;
  }
}

export { Item, ItemType };