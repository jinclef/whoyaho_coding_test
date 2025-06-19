import { GameObject } from "../GameObject";
import { GameManager } from "../GameManager";
import { BallType } from "../BallSpawner";
import { Obstacle } from "../GameBall";

export class ObstacleWall extends GameObject {
    lifeTime = 0;
    timer = 0;

  constructor(elem: HTMLElement, width: number, height: number, x: number, y: number) {
    super(elem, width, height, x, y);
    elem.classList.add('obstacle-wall');
    elem.style.width = `${width}px`;
    elem.style.height = `${height}px`;
    this.degree = 0;
    this.speed = 0;
  }

  update(){
    this.render();
  }

  destroy(){ // stage가 넘어갈 때 모두 destroy 되도록.
    if (this.elem && this.elem.parentNode) {
      this.elem.parentNode.removeChild(this.elem);
    }
  }
}

export function createObstacleWalls(gameObjMap: Map<string, GameObject>){
    const gameArea = GameManager.gameArea;
    if (!gameArea) return;
    
    const areaWidth = gameArea.clientWidth;
    const areaHeight = gameArea.clientHeight;

    const obstacleWallCount = Math.floor((Math.random()+3)); // 1~2개
    
    let cnt = 0;
    for (let i=0; i<obstacleWallCount; i++){
        // 최솟값 30
        const obstacleWidth = Math.floor(Math.random() * 10 + 1) * 100 + 30;
        const obstacleHeight = Math.floor(Math.random() * 10) * 30 + 30;

        const x = Math.random() * (areaWidth - 60) + 30;
        const y = Math.random() * (areaHeight - 60) + 30;
        if(x < gameArea.clientLeft || x> gameArea.clientLeft + gameArea.clientWidth ||
            y<gameArea.clientTop || y > gameArea.clientTop + gameArea.clientHeight) continue;
        
        const elem = document.createElement('div');
        const obstacleWall = new ObstacleWall(elem, obstacleWidth, obstacleHeight,x,y);
        gameObjMap.set(`ObstacleWall-${cnt}`, obstacleWall);
        gameArea.append(elem);
        cnt++;
    }
    console.log("created walls: " + cnt);
}

// 내 공, 장애물 공 이 벽과 충돌하는 이벤트 처리
export function handleObstacleWallCollision(gameObjMap: Map<string, GameObject>){
    const randomAngle = () => (Math.random() - 0.5) * 10;
    const isPointInCircle = (pointX: number, pointY: number, circleCenterX: number, circleCenterY: number, circleRadius: number) => {
        const distance = (pointX - circleCenterX) ** 2 + (pointY - circleCenterY) ** 2;
        if (Math.sqrt(distance) < circleRadius) return true;
        else return false;
    }

    gameObjMap.forEach((obj, key) => {
        if(key.startsWith(`${BallType[BallType.Obstacle]}-`) || key.startsWith(`${BallType[BallType.Normal]}-`)){  // 사각형-원.
            // 사각형을 원의 반지름만큼 확장시킨 범위 내에 원의 중심이 있으면 충돌.
            const obstacleBall = obj as Obstacle;
            const radius = obstacleBall.width/2;
            const centerX = obstacleBall.leftTopX + radius;
            const centerY = obstacleBall.leftTopY + radius;

            let obstacleWalls: ObstacleWall[] = [];
            gameObjMap.forEach((obj) => {
                if (obj.elem?.className == 'obstacle-wall'){
                    obstacleWalls.push(obj as ObstacleWall);
                }
            })
            for(let i=0; i<obstacleWalls.length; i++){
                const wall = obstacleWalls[i] as ObstacleWall;
                
                // 모서리 충돌 처리
                const wallLeft = wall.leftTopX - radius;
                const wallRight = wall.leftTopX + wall.width + radius;
                const wallTop = wall.leftTopY - radius;
                const wallBottom = wall.leftTopY + wall.height + radius;
                if (wallLeft < centerX && centerX < wallRight &&
                        wallTop < centerY && centerY < wallBottom){
                    // 충돌!
                    if (centerX <= wall.leftTopX || wall.leftTopX + wall.width <= centerX){
                        // 좌우충돌                    
                        obstacleBall.degree = 180 - obstacleBall.degree;
                    } else if (centerY <= wall.leftTopY || wall.leftTopY + wall.height <= centerY){
                        // 상하충돌
                        obstacleBall.degree = -obstacleBall.degree;
                    }
                }
                //TODO: 꼭짓점 충돌 처리
                //TODO: 검은공이 있던 자리에 벽이 생기면 벽에 갇힘. -> 어떻게 해결함?
            }
        }
    })
}
/*
if (isPointInCircle(wall.leftTopX, wall.leftTopY, centerX, centerY, radius)) obstacleBall.degree = 180 - obstacleBall.degree + randomAngle();
else if(isPointInCircle(wall.leftTopX, wall.leftTopY + wall.height, centerX, centerY, radius)) obstacleBall.degree = 180 - obstacleBall.degree + randomAngle();
else if(isPointInCircle(wall.leftTopX + wall.width, wall.leftTopY, centerX, centerY, radius))obstacleBall.degree = 180 - obstacleBall.degree + randomAngle();
else if(isPointInCircle(wall.leftTopX + wall.width, wall.leftTopY + wall.height, centerX, centerY, radius)) obstacleBall.degree = 180 - obstacleBall.degree + randomAngle();
*/