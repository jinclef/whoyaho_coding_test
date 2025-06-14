import { startAvoidingGame } from "./avoidingGame";
import { startEatingGame } from "./eatingGame";

document.getElementById("start-button")?.addEventListener("click", () => {
  startAvoidingGame();
});

document.getElementById("start-button-2")?.addEventListener("click", () => {
  startEatingGame();
});
