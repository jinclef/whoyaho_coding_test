// 효과 표시 UI
export class EffectDisplay {
  private container: HTMLElement;

  constructor() {
    this.container = document.createElement("div");
    this.container.id = "effect-display";
    this.container.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
      pointer-events: none;
    `;
    document.body.appendChild(this.container);
  }

  showEffect(message: string, color: string = "#ffffff") {
    const effectElement = document.createElement("div");
    effectElement.textContent = message;
    effectElement.style.cssText = `
      background: rgba(0,0,0,0.8);
      color: ${color};
      padding: 10px 20px;
      border-radius: 5px;
      margin-bottom: 5px;
      animation: effectBlink 3s ease-in-out;
      font-size: 14px;
      font-weight: bold;
      border: 2px solid ${color};
    `;

    this.container.appendChild(effectElement);

    // 3초 후 제거
    setTimeout(() => {
      if (effectElement.parentNode) {
        effectElement.parentNode.removeChild(effectElement);
      }
    }, 3000);
  }

  destroy() {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
  }
}
