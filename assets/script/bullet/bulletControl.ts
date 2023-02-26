import { _decorator, BoxCollider, Component, ITriggerEvent, Node } from 'cc';
import { gameManager } from '../framework/gameManager';
import { constant } from '../framework/constant';
import { poolManager } from '../framework/poolManager';
const { ccclass, property } = _decorator;
//子弹脚本挂在子弹预设体上，不必去考虑子弹的创建，只需要考虑子弹的运行和销毁
//将敌机的子弹也放进来
@ccclass('bulletControl')
export class bulletControl extends Component {
    @property
    public PlayerbulletSpeed:number = 5;

    @property
    public EnemyBulletSpeed:number = 8;
    
    private _isEnemyBullet:boolean = false;

    private _bulletChangeDirection:boolean = false;
    private _bulletXSpeed :number = 0;
    private _leftOrRight: boolean = true;
    private _bulletDiffuseSpeedNumber = 2 ;
    private _gameManager :gameManager ;

    OVERSCREEN:number = 8;
    onEnable() {
        const collider = this.node.getComponent(BoxCollider);
        collider.on("onTriggerEnter", this._onTriggerEnter, this);
    }

    onDisable() {
        const collider = this.node.getComponent(BoxCollider);
        collider.off('onTriggerExit', this._onTriggerEnter, this)
    }

    start() {

    }

    update(deltaTime: number) {    

        let pos = this.node.position;
        
        //子弹方向
        if(this._isEnemyBullet){     
            //console.log('子弹速度 '+this.bulletSpeed) 
            let moveLength = pos.x - this.EnemyBulletSpeed * deltaTime;
            //console.log('移动多少 ' + moveLength)
            this.node.setPosition(moveLength, pos.y, pos.z)
            if(moveLength< -this.OVERSCREEN){
                //this.node.destroy();
                //console.log('EnemyBullet has been destroied.')
                poolManager.instance().putNode(this.node);
            }
        
        }else{
            
            if(this._bulletChangeDirection  && this._leftOrRight){
                this._bulletXSpeed = -this._bulletDiffuseSpeedNumber;
                
            }else if(this._bulletChangeDirection && !this._leftOrRight){
                this._bulletXSpeed = this._bulletDiffuseSpeedNumber;
            }else{
                this._bulletXSpeed = 0;
            }
            let moveLength = pos.x + this.PlayerbulletSpeed * deltaTime;
            let bulletDiffuse = pos.z + this._bulletXSpeed * deltaTime ;

            this.node.setPosition(moveLength, pos.y, bulletDiffuse);
            if(moveLength>this.OVERSCREEN){
                //this.node.destroy();
                //console.log('MyBullet has been destroied.')
                poolManager.instance().putNode(this.node);
            }
        } 
             
    }

    IsBulletDiffuse(diffuse:boolean,leftOrRight:boolean){
        this._bulletChangeDirection = diffuse ;
        this._leftOrRight = leftOrRight;
    }


    IsEnemyBullet(enemyCondition:boolean,gameManager:gameManager){
        this._isEnemyBullet = enemyCondition;
        this._gameManager = gameManager;
    }

    private _onTriggerEnter(event: ITriggerEvent){
        poolManager.instance().putNode(this.node);
        //this.node.destroy();
    }
}

