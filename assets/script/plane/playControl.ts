import { _decorator, AudioSource, BoxCollider, Component, EventTouch, Input, ITriggerEvent, Node, RigidBody, SystemEvent,Touch } from 'cc';
import { constant } from '../framework/constant';

import { gameManager } from '../framework/gameManager';
const { ccclass, property } = _decorator;

@ccclass('playControl')
export class playControl extends Component {
    
    @property(Node)
    explode:Node = null;

    @property(Node)
    public remainder:Node = null;

    public IsDied : boolean =false;
    public playerLife : number = 5;

    public IsShow = false;
    private _zeroLife :number = 0;
    private _totalLife = 5;

    

    private _top = 7;
    private _bottom = -4;
    private _right = 3;
    private _left = -3;
    

    onEnable() {
        const collider = this.node.getComponent(BoxCollider);
        collider.on("onTriggerEnter", this._onTriggerEnter, this);
    }

    onDisable() {
        const collider = this.node.getComponent(BoxCollider);
        collider.off('onTriggerExit', this._onTriggerEnter, this)
    }

    start(){
        this.node.active =true ;
        this.explode.active = false;
        let blood = this.node.getChildByName('blood');
        blood.active  = false ;
        
        // const collider = this.node.getComponent(BoxCollider);
        // collider.on("onTriggerEnter", this._onTriggerEnter, this);
        // collider.off('onTriggerExit', this._onTriggerEnter, this)
    }

    update(deltaTime: number) {
        let pos = this.node.position;
        if(pos.z >= this._right ){
            this.node.setPosition(pos.x,pos.y,this._right);
        }else if(pos.z<= this._left){
            this.node.setPosition(pos.x,pos.y,this._left);
        }
        if(pos.x>= this._top){
            this.node.setPosition(this._top,pos.y,pos.z);
        }else if (pos.x<=this._bottom){
            this.node.setPosition(this._bottom,pos.y,pos.z);
        }
    }

    
    
    private _onTriggerEnter(event:ITriggerEvent){
        //const collision = this.node.getComponent(RigidBody);
        //let group_player = collision.getGroup();
        const Conlision = event.otherCollider.getGroup()
        //console.log(Conlision+ '碰撞了')
        if(Conlision  === constant.CollisionGroup.ENEMY || Conlision === constant.CollisionGroup.ENEMY_BULLET){
            if(!this.IsShow){
                this.IsShow = true;
            }
            this.playerLife-- ;
            
            this.remainder.active = true;
            let remainder = this.playerLife/this._totalLife;
            if(this.IsShow){
                let blood = this.node.getChildByName('blood');
                blood.active  = true;
                this.scheduleOnce(()=> blood.active = false,2)
            }
            //console.log('剩余血量  '+remainder)
            this.remainder.setScale(1,1,remainder)

            //console.log('blood,life:'+this.playerLife);
            if( this.playerLife<= this._zeroLife){       
                this.IsDied = true;     
                //console.log('飞机死亡',this.IsDied)
                this.PlayerDieAudio();
                //this.explode.setPosition(this.node.getPosition());
                this.explode.active = true;
                this.IsShow =false ;
                let blood = this.node.getChildByName('blood');
                blood.active  = false ;
            }
        }
    }

    public PlayerDieAudio(){
        let playAudio = this.getComponent(AudioSource);
        playAudio.play();
        //console.log('飞机炸毁')
        let plane = this.node.getChildByName('plane01')
        let tailFlame = this.node.getChildByName('tailFlame')
        this.scheduleOnce(()=>plane.active = false,0.5);    
        this.scheduleOnce(()=>tailFlame.active = false,0.5);  
    }

    
    
}

