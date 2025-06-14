import { startAvoidingGame } from "./avoidingGame";
import { startEatingGame } from "./eatingGame";

document.getElementById("start-button")?.addEventListener("click", () => {
  document.getElementById('game-container-avoid')!.style.display = 'inline-block';
  document.getElementById('game-container-eating')!.style.display = 'none';
  startAvoidingGame();
});

document.getElementById("start-button-2")?.addEventListener("click", () => {
    document.getElementById('game-container-eating')!.style.display = 'flex';
  document.getElementById('game-container-avoid')!.style.display = 'none';
  startEatingGame();
});