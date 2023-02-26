import { _decorator, animation, AnimationClip, BoxCollider, Component, ITriggerEvent, Label, Node, NodeSpace, sp, Animation } from 'cc';
import { gameManager } from '../framework/gameManager';
import { constant } from '../framework/constant';
import { poolManager } from '../framework/poolManager';
import { Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('bulletProp')
export class bulletProp extends Component {
    //加分效果
    
    private _bulletPropSpeedZ : number = 4;
    private _bulletPropSpeedX : number = 4;
    private _tempSpeed : number = 4;
    private _gameManager :gameManager = null;

    BOUND : number = 3.6;
    OVERSCREEN : Number = 10;

    onEnable (){
        const collider = this.node.getComponent(BoxCollider);
        collider.on('onTriggerEnter',this._onTriggerEnter,this);

    }
    onDisable (){
        const collider = this.node.getComponent(BoxCollider);
        collider.off('onTriggerExit',this._onTriggerEnter,this);
    }

    

    update(deltaTime: number) {
        //运动（这里预制体做得不好，轴要改）
        let pos = this.node.position;
        let movePosZ = pos.z + deltaTime * this._bulletPropSpeedZ;
        let movePosX = pos.x - deltaTime * this._bulletPropSpeedX;
        //console.log('this.BOUND'+ this.BOUND);
        //console.log('movePosZ'+movePosZ)
        if (movePosZ >= this.BOUND) {
            this._bulletPropSpeedZ = - this._tempSpeed;
        }
        if (movePosZ <= - this.BOUND) {
            this._bulletPropSpeedZ = this._tempSpeed;        
        }
        this.node.setPosition(movePosX, pos.y, movePosZ)
        //销毁
        pos = this.node.position;
        if(pos.x < -this.OVERSCREEN+4){
            //console.log('子弹道具销毁');
            //this.node.destroy();
            poolManager.instance().putNode(this.node)
        }

    }

    public show(gameManager:gameManager,speed:number){
        this._gameManager = gameManager;
        this._bulletPropSpeedX = 0.7 *speed;
        this._bulletPropSpeedZ = 0.7 * speed;
        this._tempSpeed = 0.7 *speed;
    }



    private _onTriggerEnter(event:ITriggerEvent){   
        poolManager.instance().putNode(this.node);
        if(this.node.name == 'bulletPropH'){
            this.propAddScoreEffect(this._gameManager.propH,10);
            this._gameManager.changeBullet(constant.BulletPropType.BULLET_PROP_H); 
            this._gameManager.propHNum += 1;
            //console.log('prop H  + 1  = ' + this._gameManager.propHNum)
        }else if(this.node.name == 'bulletPropS'){
            this.propAddScoreEffect(this._gameManager.propS,5);
            this._gameManager.changeBullet(constant.BulletPropType.BULLET_PROP_S);
            this._gameManager.propSNum += 1;
            //console.log('prop S  + 1  = ' + this._gameManager.propSNum)
        }else{
            this.propAddScoreEffect(this._gameManager.propM,20);
            this._gameManager.changeBullet(constant.BulletPropType.BULLET_PROP_M);
            this._gameManager.propMNum += 1;
            //console.log('prop M  + 1  = ' + this._gameManager.propMNum)
        }      
    }
    

    public propAddScoreEffect(propLabel:Node,addScore:number = 5){
        propLabel.active = true;
        let player = propLabel.getComponent(Animation)
        player.play('animationS')
        this.scheduleOnce(()=>propLabel.active = false,1);
        this._gameManager.addScore(addScore);     
    }


}

