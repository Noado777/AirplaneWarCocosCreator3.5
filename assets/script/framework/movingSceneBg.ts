import { _decorator, Component, Node, PrimitiveType,math, random } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('movingSceneBg')
export class movingSceneBg extends Component {
    @property(Node)
    bg01:Node = null;

    @property(Node)
    bg02:Node = null;

    @property(Node)
    ball01:Node = null;

    @property(Node)
    ball02:Node = null;

    @property(Node)
    ball03:Node = null;

    private _speed = 1;
    private _ballspeed01 = 0.8;
    private _ballspeed02 = 0.5;
    private _ballspeed03 = 1.5;
    private _ball03speedX = 1.5;

    private _ballRandomZ = -3;
    private _ballRandomX = 0;
    
    private _range = 20;


    private _init() {
        this.bg01.setPosition(0, -10, 0);
        this.bg02.setPosition(20, -10, 0);
        this.ball01.setPosition(9,-1,3);
        this.ball02.setPosition(2,-3.5,-3);
        this.ball03.setPosition(-5,-7,3);
    }

    private _movingScene(deltaTime:number) {
        this.bg01.setPosition(this.bg01.getPosition().x - this._speed * deltaTime, -10, 0);
        this.bg02.setPosition(this.bg02.getPosition().x - this._speed * deltaTime, -10, 0);
        if(this.bg01.getPosition().x <= - this._range){
            this.bg01.setPosition(this.bg02.getPosition().x +this._range, -10, 0)
        }
        if(this.bg02.getPosition().x <= - this._range){
            this.bg02.setPosition(this.bg01.getPosition().x +this._range, -10, 0)
        }
 
    }
    
    
    private _movingBall02(deltaTime:number){
        let pos = this.ball02.getPosition();
        this.ball02.setPosition(pos.x + deltaTime *this._ballspeed02,pos.y,pos.z)
        if(pos.x + deltaTime *this._ballspeed02<=-2){
            this._ballspeed02 *= -1;
        }if(pos.x + deltaTime *this._ballspeed02>=4){
            this._ballspeed02 *= -1;
        }
    }

    private _movingBall01(deltaTime:number){
        let pos = this.ball01.getPosition();  
        let moveLength = pos.x - deltaTime *this._ballspeed01;
        this.ball01.setPosition(moveLength,pos.y,pos.z)
        if(moveLength<=-8){
            this._ballRandomZ = math.randomRange(-4,4);
            this.ball01.setPosition(pos.x + 20,pos.y,this._ballRandomZ)
        }  
    }

    private _movingBall03(deltaTime:number){
        let pos = this.ball03.getPosition();  
        let moveLength = pos.z + deltaTime *this._ballspeed03;

        if(moveLength<=-6 || moveLength>= 6){
            this._ballspeed03 *= -1;
            this._ballRandomX = math.randomRange(-4,11);
            pos.x = this._ballRandomX;
            if(this._ballRandomX < 2){
                this._ball03speedX *= 1;
            }else if(this._ballRandomX > 8){
                this._ball03speedX *= -1;
            }else{
                this._ball03speedX *= 0;
            }
        }  
        this.ball03.setPosition(pos.x + this._ball03speedX*deltaTime,pos.y,moveLength)
    }

    

    start() {
        this._init();
    }

    update(deltaTime: number) {
        this._movingScene(deltaTime);
        this._movingBall01(deltaTime);
        this._movingBall02(deltaTime);
        this._movingBall03(deltaTime);
    }
}

