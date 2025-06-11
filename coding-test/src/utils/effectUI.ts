// 효과 표시 UI
export class EffectDisplay {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "effect-display";
    this.container.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      pointer-events: none;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
    `;
    document.body.appendChild(this.container);
  }

  showEffect(message: string, color: string = "#ffffff") {
    const effectElement = document.createElement("div");
    effectElement.textContent = message;
    effectElement.style.cssText = `
      background: rgba(0,0,0,0.9);
      color: ${color};
      padding: 15px 30px;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      border: 3px solid ${color};
      box-shadow: 0 0 20px ${color}40, inset 0 0 20px ${color}20;
      animation: effectNotification 1.5s ease-in-out;
      text-align: center;
      min-width: 200px;
      text-shadow: 0 0 10px ${color};
    `;

    this.container.appendChild(effectElement);

    // 1.5초 후 제거
    setTimeout(() => {
      if (effectElement.parentNode) {
        effectElement.parentNode.removeChild(effectElement);
      }
    }, 1500);
  }

  destroy() {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}