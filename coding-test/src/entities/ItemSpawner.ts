import { Item, ItemType } from './Item';
import { GameObject } from './GameObject';

// 가중치 기반 아이템 선택
const itemWeights = {
	[ItemType.SlowMotion]: 10,
	[ItemType.PointsSmall]: 35,
	[ItemType.PointsBig]: 5,
	[ItemType.RemoveBomb]: 100,
	[ItemType.ExtraLife]: 10,
	[ItemType.Invincible]: 100
};

const weightedItems: ItemType[] = [];
Object.entries(itemWeights).forEach(([itemType, weight]) => {
	for (let i = 0; i < weight; i++) {
		weightedItems.push(itemType as ItemType);
	}
});

export function spawnRandomItem(gameArea: HTMLElement, currentTime: number, gameObjMap: Map<string, GameObject>) {
  const boundingRect = gameArea.getBoundingClientRect();
  const randomType = weightedItems[Math.floor(Math.random() * weightedItems.length)];
  
  // spawnBall과 동일한 패딩 로직 사용
  const padding = 50;
  const x = padding + Math.random() * (boundingRect.width - 30 - padding * 2);
  const y = padding + Math.random() * (boundingRect.height - 30 - padding * 2);
  
  const item = new Item(randomType, x, y, currentTime);
  const itemKey = `Item_${currentTime}_${Math.floor(Math.random() * 10000)}`;
  
  gameObjMap.set(itemKey, item);
  gameArea.appendChild(item.elem!);
  
  item.render();
}