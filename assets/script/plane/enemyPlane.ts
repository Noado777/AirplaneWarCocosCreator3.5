import { _decorator, BoxCollider, Component, ITriggerEvent, Node, Prefab } from 'cc';
import { gameManager } from '../framework/gameManager';
import { bulletControl } from '../bullet/bulletControl';
import { constant } from '../framework/constant';
import { poolManager } from '../framework/poolManager';
const { ccclass, property } = _decorator;

@ccclass('enemyPlane')
export class enemyPlane extends Component {
    @property
    speed:number = 3;

    

    OVERSCREEN = 14;
    private _enemyShootTime =1;
    private _createBullet: boolean = true ;
    
    private _gameManager:gameManager  = null; //show方法要传进来
    private _currCreateBulletTime = 0;

    private _explodeNode:Node = null;

    onEnable() {
        const collider = this.node.getComponent(BoxCollider);
        collider.on("onTriggerEnter", this._onTriggerEnter, this);
    }

    onDisable() {
        const collider = this.node.getComponent(BoxCollider);
        collider.off('onTriggerExit', this._onTriggerEnter, this)
    }

    start() {
        // const collider = this.node.getComponent(BoxCollider);
        // collider.on("onTriggerEnter", this._onTriggerEnter, this);
        // collider.off('onTriggerExit', this._onTriggerEnter, this);
    }

    update(deltaTime: number) {
        //设置敌机移动
        const pos = this.node.position;
        let playerPlane:number = constant.PlaneType.TYEP1;
        this.node.setPosition(pos.x-this.speed * deltaTime,pos.y,pos.z);
        //创建计时
        this._currCreateBulletTime += deltaTime;
        if(this.node.name === 'plane03'){
            playerPlane = constant.PlaneType.TYPE2
        }
        //创建子弹（有些飞机不发射子弹，先判断是否发射子弹）
        if(this._createBullet == true && this._currCreateBulletTime >= this._enemyShootTime){
            let targetPos = this.node.getPosition();
            //GameManager通过调用show传参，这里回调，教程在show前面加了，gameManager传入？接口？
            this._gameManager.createEnemyBullet(targetPos,playerPlane);   
            this._currCreateBulletTime = 0 ;           //计时归零 
        }
        //销毁敌机节点
        if(pos.x < -this.OVERSCREEN){
            poolManager.instance().putNode(this.node);
            //this.node.destroy()
            //console.log('Bullet has been destroied.')
        }
    }

    //传参,教程是在上面写了回调补了这个
    show(gameManager:gameManager,speed:number,createBullet:boolean){
        this._gameManager = gameManager;
        this.speed = speed; 
        this._createBullet = createBullet; 
    }

    private _onTriggerEnter(event:ITriggerEvent){
        // 获取碰撞组件组名并判断作为接下来进行啥事件的根据
        const Conlision = event.otherCollider.getGroup()
        // console.log(Conlision+'两只飞机')
        if(Conlision  === constant.CollisionGroup.PLAYER || Conlision === constant.CollisionGroup.PLAY_BULLET){
            // 敌机有碰撞，敌机销毁，加分
            // console.log('敌机死亡')
            //this.node.destroy();
            poolManager.instance().putNode(this.node);
            let addition = 1;
            this._gameManager.addScore(addition);
            this._gameManager.addKillEnemyNumber();
            this._gameManager.EnemyDieAudio();
            this._explodeNode = poolManager.instance().getNode(this._gameManager.enemyExplode,this._gameManager.enemyRoot);
            let pos = this.node.getPosition();
            this._explodeNode.setPosition(pos);
            this.schedule(this._enemyPutNode,1)
        }
    }

    private _enemyPutNode(){
        poolManager.instance().putNode(this._explodeNode);
    }
    
}

