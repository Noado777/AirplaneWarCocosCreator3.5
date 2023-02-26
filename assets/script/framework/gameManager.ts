import { _decorator, Component, instantiate, Node, Prefab, math, Scheduler, Vec3,PhysicsSystem, Collider, randomRangeInt, Label,physics, repeat, labelAssembler, animation, Animation} from 'cc';
import { constant } from './constant';
import { enemyPlane } from '../plane/enemyPlane';
import { bulletControl } from '../bullet/bulletControl';
import { bulletProp } from '../bullet/bulletProp';
import { playControl } from '../plane/playControl';
import { audioManager } from './audioManager';
import { poolManager } from './poolManager';
const { ccclass, property } = _decorator;

//管理子弹发射
//关联玩家飞机，获取位置
@ccclass('gameManager')
export class gameManager extends Component {
    //plane
    @property(Node)
    public playerPlane:Node = null;
    
    //enemy
    @property(Prefab)
    public enemy01:Prefab = null;
    @property(Prefab)
    public enemy02:Prefab = null;
    @property
    public createEnemyTime:number = 1.2;
    @property
    public enemySpeed01:number = 4;
    @property
    public enemySpeed02:number = 6;
    //关联挂载节点
    @property(Node)
    enemyRoot:Node = null;
    //爆炸
    @property(Prefab)
    enemyExplode:Prefab = null;
    

    //bullet
    @property(Prefab)
    public bullet01:Prefab = null;
    @property(Prefab)
    public bullet02:Prefab = null;
    @property(Prefab)
    public bullet03:Prefab = null;
    @property(Prefab)
    public bullet04:Prefab = null;
    @property(Prefab)
    public bullet05:Prefab = null;
    //子弹射击周期
    @property
    public shootTime:number = 0.15;
    //设置创建的子弹实例的父节点
    @property(Node)
    public bulletRoot:Node = null;
   
    // props
    @property(Prefab)
    public bulletPropM: Prefab = null;
    @property(Prefab)
    public bulletPropH: Prefab = null;
    @property(Prefab)
    public bulletPropS: Prefab = null;
    @property(Node)
    public propRoot:Node = null ;
    @property
    public bulletPropSpeed = 4;

    //场置
    @property(Node)
    public stone:Node = null;

    //游戏积分面板
    @property(Label)
    currScore :Label = null;
    @property(Label)
    finScore:Label = null;
   

    //音频
    @property(audioManager)
    effectAudioManager :audioManager = null;

    //加分效果
    @property(Node)
    public propS:Node = null;
    @property(Node)
    public propH:Node = null;
    @property(Node)
    public propM:Node = null;
    //类型不是来自cc,上面要传入，关联节点
    @property(Animation)
    public animS:Animation = null;
    @property(Animation)
    public animH:Animation = null;
    @property(Animation)
    public animM:Animation = null;

    //成功页面的数据
    @property(Label)
    public achiveScore: Label = null;
    @property(Label)
    public enemyKill:Label = null;
    @property(Label)
    public percent:Label = null;
    @property(Label)
    public planeScore:Label = null;
    @property(Label)
    public propScore:Label = null;
    @property(Label)
    public numS:Label = null;
    @property(Label)
    public numH:Label = null;
    @property(Label)
    public numM:Label = null;

    //游戏积分
    public score:number = 0;
    public enemyKillNum:number = 0;
    public totalEnemy:number = 0;
    //道具积分
    public propSNum = 0;
    public propHNum = 0;
    public propMNum = 0;

    //游戏是否开始结束
    public IsGame :boolean = false ;
    //是否通关
    public IsSucceed:boolean = false;
    

    //道具产生时间
    private _currCreatePropTime = 0;


    //射击时间
    private _curShootTime = 0;
    private _isShooting = false;

    //私有变量存放敌机创建时间
    private _currCreateEnemyTime = 0 ;
    //组合间隔
    private _combinationInterval = 0 ;
    //开始产生敌机
    private _createrEnemy =false;

    //子弹控制
    public bulletControl:bulletControl = null;

    //子弹类型  
    private _bulletType = constant.BulletPropType.BULLET_PROP_M;

    //石头场景
    private _stoneSpeed:number = 5;

    onLoad(){
        this.unschedule(this._changePlaneMode);
    }

    start() {
        this.mainGameSet();
        this.node.active = true;
        PhysicsSystem.instance.enable = true;    
    }    
    

    update(deltaTime: number) {   
        let playerComp = this.playerPlane.getComponent(playControl);
        if(playerComp.IsDied){            
            this._currCreatePropTime = 0 ;
            this._currCreateEnemyTime = 0; 
            this.overGameSet();  
        }
        //设置循环
        this._curShootTime += deltaTime;//已开始
        //console.log('IsGame = '+this.IsGame+' IsGameOver = '+this.IsGameOver);
        //console.log(this._isShooting);
        //console.log(this._curShootTime);
        
        //触屏射击
        if(this._isShooting && this._curShootTime > this.shootTime){
            if(this._bulletType === constant.BulletPropType.BULLET_PROP_H ){
                this.createPlayerBulletH();
            }else if(this._bulletType === constant.BulletPropType.BULLET_PROP_S ){
                this.createPlayerBulletS();               
            }else{
                this.createPlayerBulletM();               
            }
            //设置的循环
            this._curShootTime = 0;
        }
        
        if(this.IsGame){
            //敌机模式切换
            this._currCreateEnemyTime += deltaTime;
            //console.log('changemode  ' + this._combinationInterval)
            //console.log(this._currCreateEnemyTime+'   '+2*this.createEnemyTime)
            
            if (this._combinationInterval % 2 != 0  && this._combinationInterval < 8) {
                if (this._currCreateEnemyTime >= this.createEnemyTime - this._combinationInterval * 0.03 && this._createrEnemy == true) {
                    console.log('doing PLAN1')
                    this.createEnemyPlane();
                    
                    this._currCreateEnemyTime = 0;
                }
            } else if (this._combinationInterval === constant.Combination.PLAN2) {
                //console.log('combination1'+this._combinationInterval)   
                if (this._currCreateEnemyTime >= this.createEnemyTime * 1.5) {
                    console.log('doing PLAN2')
                    this.createCombinationPlan2();
                    this._currCreateEnemyTime = 0;
                }
            } else if (this._combinationInterval === constant.Combination.PLAN3) {
                
                if (this._currCreateEnemyTime >= this.createEnemyTime * 1.8) {
                    console.log('doing PLAN3')
                    this.createCombinationPlan3();
                    this._currCreateEnemyTime = 0;
                }
            } else if (this._combinationInterval === constant.Combination.PLAN4) {
                if (this._currCreateEnemyTime >= this.createEnemyTime * 2.2) {
                    console.log('doing PLAN4')
                    this.createCombinationPlan4();
                    this._currCreateEnemyTime = 0;
                }
            }else if (this._combinationInterval === constant.Combination.PLAN5) {
                if (this._currCreateEnemyTime >= this.createEnemyTime * 1.8) {
                    console.log('doing PLAN5')
                    this.createCombinationPlan5();
                    this._currCreateEnemyTime = 0;
                }
            }else if (this._combinationInterval === constant.Combination.PLAN_PAUSE ) {
                if (this._currCreateEnemyTime >= this.createEnemyTime *0.8) {
                    console.log('doing PLAN1')
                    this.createEnemyPlane();
                    this._currCreateEnemyTime = 0;
                }
            }else if (this._combinationInterval === constant.Combination.PLAN6) {
                if (this._currCreateEnemyTime >= this.createEnemyTime * 2.5) {
                    console.log('doing PLAN6')
                    this.createCombinationPlan6();
                    this._currCreateEnemyTime = 0;
                }
            }else if (this._combinationInterval === constant.Combination.PLAN7) {
                if (this._currCreateEnemyTime >= this.createEnemyTime * 2.2) {
                    console.log('doing PLAN7')
                    this.createCombinationPlan7();
                    this._currCreateEnemyTime = 0;
                }
            }else if (this._combinationInterval === constant.Combination.PLAN_PAUSE1 
                || this._combinationInterval === constant.Combination.PLAN_PAUSE2
                || this._combinationInterval === constant.Combination.PLAN_PAUSE3) {
                if (this._currCreateEnemyTime >= this.createEnemyTime * 0.5) {
                    console.log('doing PLAN1')
                    this.createEnemyPlane();
                    this._currCreateEnemyTime = 0;
                }
            }else if (this._combinationInterval === constant.Combination.PLAN8) {
                if (this._currCreateEnemyTime >= this.createEnemyTime * 2) {
                    console.log('doing PLAN8')
                    this.createCombinationPlan8();
                    this._currCreateEnemyTime = 0;
                }
            
            }else if (this._combinationInterval === constant.Combination.PLAN9) {
                if (this._currCreateEnemyTime >= this.createEnemyTime * 2) {
                    console.log('doing PLAN9')
                    this.createCombinationPlan9();
                    this._currCreateEnemyTime = 0;
                }
            }else if (this._combinationInterval === constant.Combination.PLAN10) {
                if (this._currCreateEnemyTime >= this.createEnemyTime * 2) {
                    console.log('doing PLAN10')
                    this.createCombinationPlan10();
                    this._currCreateEnemyTime = 0;
                }
            }else if (this._combinationInterval === constant.Combination.END) {
                this.destroyAllProp(); 
                this.ENDING(deltaTime);                   
                this.bothScore();
                this.killEnemyPercent();
                this.prop_addScore_toString(this.numH,this.propHNum);
                this.prop_addScore_toString(this.numS,this.propSNum);
                this.prop_addScore_toString(this.numM,this.propMNum);
            }
        }
        

        //创建道具
        this._currCreatePropTime += deltaTime;
        if(this._currCreatePropTime >=8 && this.IsGame && !this.IsSucceed){
            this.CreateProp();
            //得归零，不然就是5s以上每刷新一帧出来一个
            this._currCreatePropTime = 0;
        } 
                
    }


    public startGameSet(){
        //已经开始的参数设置
        //开始产生敌机
        this._createrEnemy = true;
        //伴随射击
        this._curShootTime = 0;
        this._isShooting = false;
        //console.log('用了gamestart的设置')
        this._combinationInterval = 1 ;
        this._bulletType =constant.BulletPropType.BULLET_PROP_M;
        this._currCreatePropTime = 0;
        this.score = 0;
        this.currScore.string = this.score.toString(); 
        this.enemyKillNum = 0;
        this.enemyKill.string = this.enemyKillNum.toString();
        this.IsSucceed = false;
        //飞机血量重置 位置重置
        let playerComp = this.playerPlane.getComponent(playControl);
        playerComp.playerLife = 5 ;
        playerComp.remainder.setScale(1,1,1);
        playerComp.IsShow = false;
        playerComp.IsDied = false;
        this.playerPlane.setPosition(-3,0,0);
        playerComp.explode.active = false;
        let plane = this.playerPlane.getChildByName('plane01')
        let tailFlame = this.playerPlane.getChildByName('tailFlame')
        plane.active = true;
        tailFlame.active = true;
        this.IsGame = true;
        this._changePlaneMode();
        plane.active = true;
        this.stone.active = false;
        this.stone.setPosition(20, 0, 0);
        this.propHNum = 0;
        this.propSNum = 0;
        this.propMNum = 0;
    }

    public mainGameSet(){
        //未开始参数设置
        //开始不产生敌机设置
        this._createrEnemy = false;   
        this._curShootTime = 0;
        this._isShooting = false;
        this._currCreatePropTime = 0
        this._currCreateEnemyTime = 0 ;
        this._combinationInterval = 1 ;
        this.unschedule(this._changePlaneMode);
        this._bulletType =constant.BulletPropType.BULLET_PROP_M;
        this._currCreatePropTime = 0;
        this.score = 0;
        this.enemyKillNum = 0;
        this.IsSucceed = false;
        //飞机血量重置 位置重置
        this.playerPlane.active = true;
        let playerComp = this.playerPlane.getComponent(playControl);
        playerComp.playerLife = 5 ;
        playerComp.remainder.setScale(1,1,1);
        playerComp.IsShow = false;
        playerComp.IsDied = false;
        let plane = this.playerPlane.getChildByName('plane01')
        let tailFlame = this.playerPlane.getChildByName('tailFlame')
        plane.active = true;
        tailFlame.active = true;
        this.playerPlane.setPosition(-3,0,0)
        playerComp.explode.active = false;
        this.IsGame  = false ;
        this.stone.active = false;
        this.stone.setPosition(20, 0, 0)
        this.propHNum = 0;
        this.propSNum = 0;
        this.propMNum = 0;
    }

    public succeedSet(){
        this.achiveScore.string = this.score.toString();
        this.enemyKill.string = this.enemyKillNum.toString();
        this.unschedule(this._changePlaneMode);
        this.IsGame  = false ;
        this._isShooting = false;  
        this._curShootTime = 0 ;    
        // 销毁道具
        this.destroyAllProp(); 
    }

    public overGameSet(){
        this.finScore.string = this.score.toString();
        this.unschedule(this._changePlaneMode);
        this.IsGame  = false ;
        this._isShooting = false;  
        this._curShootTime = 0 ;   
        this.IsSucceed = false;  
        //敌机不再产生
        this._createrEnemy = false ;
        //道具不产生
        this._currCreatePropTime = 0;
        // 销毁敌机
        this.destroyAllEnemy();
        // 销毁道具
        this.destroyAllProp();
        // 销毁子弹
        this.destroyAllBullet();
    }


    public createPlayerBulletM(){    
        //替换为节点池
        let bullet = poolManager.instance().getNode(this.bullet01,this.bulletRoot);
        //实例化
        //let bullet = instantiate(this.bullet01);
        bullet.getComponent(bulletControl).IsEnemyBullet(false,this);
        //设置父节点
        //bullet.setParent(this.bulletRoot);
        //设置子弹位置
        const pos = this.playerPlane.position;
        bullet.setPosition(pos.x+0.5,-0.2,pos.z) 
        //子弹音效
        this.effectAudioManager.playEffect('playerM');
    }

    public createPlayerBulletH(){      
        const pos = this.playerPlane.position;
        //left
        //let bullet1 = instantiate(this.bullet03);
        //bullet1.setParent(this.bulletRoot);
        //替换为节点池
        let bullet1 = poolManager.instance().getNode(this.bullet03,this.bulletRoot);
        bullet1.getComponent(bulletControl).IsEnemyBullet(false,this);
        bullet1.setPosition(pos.x-0.2,pos.y,pos.z-0.5)
        //right
        //let bullet = instantiate(this.bullet03);
        //替换为节点池
        let bullet = poolManager.instance().getNode(this.bullet03,this.bulletRoot);
        bullet.getComponent(bulletControl).IsEnemyBullet(false,this);
        //bullet.setParent(this.bulletRoot);
        bullet.setPosition(pos.x-0.2,pos.y,pos.z+0.6)
        //子弹音效
        this.effectAudioManager.playEffect('playerH');

    }

    public createPlayerBulletS(){  
        const pos = this.playerPlane.position;    
        //left
        //let bullet1 = instantiate(this.bullet05);
        //bullet1.setParent(this.bulletRoot);
        //替换为节点池
        let bullet1 = poolManager.instance().getNode(this.bullet05,this.bulletRoot);
        let bulletComp1 = bullet1.getComponent(bulletControl);
        bulletComp1.IsBulletDiffuse(true,true);
        bullet1.getComponent(bulletControl).IsEnemyBullet(false,this);     
        bullet1.setPosition(pos.x-0.2,pos.y,pos.z-0.3)
        //middle
        //let bullet = instantiate(this.bullet05);
        //bullet.setParent(this.bulletRoot);
        //替换为节点池
        let bullet = poolManager.instance().getNode(this.bullet05,this.bulletRoot);
        let bulletComp = bullet.getComponent(bulletControl);
        bulletComp.IsBulletDiffuse(false,false);
        bullet.getComponent(bulletControl).IsEnemyBullet(false,this);  
        bullet.setPosition(pos.x-0.2,pos.y,pos.z)
        //right
        //let bullet2 = instantiate(this.bullet05);
        // bullet2.setParent(this.bulletRoot);
        //替换为节点池
        let bullet2 = poolManager.instance().getNode(this.bullet05,this.bulletRoot);
        let bulletComp2 = bullet2.getComponent(bulletControl);
        bulletComp2.IsBulletDiffuse(true,false);
        bullet2.getComponent(bulletControl).IsEnemyBullet(false,this);
        
        bullet2.setPosition(pos.x-0.2,pos.y,pos.z+0.3)
        //子弹音效
        this.effectAudioManager.playEffect('playerS');
    }

    public changeBullet(bulletType :number){
        this._bulletType = bulletType;
    }

    //触摸时设计，创建接口：判断当前是否是触摸状态
    //在uimain做关联
    public isShooting(value:boolean){
        this._isShooting = value;
    }

    public createEnemyBullet(targetPos:Vec3,PlaneType:number){  
        let bulletPre = this.bullet02; 
        if(PlaneType === constant.PlaneType.TYPE2) {
            bulletPre = this.bullet04;
        }
        //let bullet = instantiate(bulletPre); 
        //bullet.setParent(this.bulletRoot);
        //替换为节点池
        let bullet = poolManager.instance().getNode(bulletPre,this.bulletRoot);
        bullet.getComponent(bulletControl).IsEnemyBullet(true,this);
        //从挂在敌机预制体上的脚本获取敌机位置，修改作为子弹的产生的位置
        bullet.setPosition(targetPos.x-0.4,targetPos.y,targetPos.z);

        //子弹音效
        this.effectAudioManager.playEffect('bullet');

        //所有子弹预制体的分组都是玩家子弹，在这里重新设置分组
        const colliderComp = bullet.getComponent(Collider);
        colliderComp.setGroup(constant.CollisionGroup.ENEMY_BULLET);
        colliderComp.setMask(constant.CollisionGroup.PLAYER);
    }

    public createEnemyPlane(){
        //随机飞机类型
        let eitherEnemy = math.randomRangeInt(1,3) //1,2取随机数，不包括3
        //eitherEnemy.toString();
        //console.log(eitherEnemy)
        let prefab:Prefab = null;
        let speed = 0 ;
        if(eitherEnemy == constant.PlaneType.TYEP1){
            //console.log('TYPE01'+constant.PlaneType.TYEP1)
            prefab = this.enemy01;
            speed = this.enemySpeed01;
        }else if(eitherEnemy == constant.PlaneType.TYPE2){
            //console.log('TYPE02'+constant.PlaneType.TYPE2)
            prefab = this.enemy02;
            speed = this.enemySpeed02;
        }
        //实例化敌机
        //let enemy = instantiate(prefeb)
        //enemy.setParent(this.enemyRoot)
        //替换为节点池
        let enemy = poolManager.instance().getNode(prefab,this.enemyRoot);
        enemy.setPosition(10, 0, math.randomRange(-3.2, 3.2));
        this.countEnemy();
        //飞机飞动，传speed
        let enemyComp = enemy.getComponent(enemyPlane);
        enemyComp.show(this,speed,true)
    }

    public createCombinationPlan2(){
        //console.log('doing combination')
        let eitherEnemy = math.randomRangeInt(1,3) //1,2取随机数，不包括3
        let prefab:Prefab = null;
        let speed = 0 ;
        if(eitherEnemy == constant.PlaneType.TYEP1){
            prefab =this.enemy01;
            speed = this.enemySpeed01;
            this.countEnemy(5);
            let oneLine1 = new Array<Node>(5);
            for(let i = 0;i < oneLine1.length; i++){
                //let oneLine1Enemy = instantiate(prefeb);
                //oneLine1Enemy.setParent(this.enemyRoot);
                //节点池替换
                let oneLine1Enemy = poolManager.instance().getNode(prefab,this.enemyRoot);
                oneLine1Enemy.setPosition(10,0,-3.2+1.6*i);
                let enemyComp = oneLine1Enemy.getComponent(enemyPlane);
                enemyComp.show(this,speed,false)
                
            }
        }else{
            prefab = this.enemy02;
            speed = this.enemySpeed02;
            let oneLine2 = new Array<Node>(3);
            this.countEnemy(3);
            for(let i = 0 ;i < oneLine2.length;i++){
                //let oneLine2Enemy = instantiate(prefeb);
                //oneLine2Enemy.setParent(this.enemyRoot);
                let oneLine2Enemy = poolManager.instance().getNode(prefab,this.enemyRoot);
                oneLine2Enemy.setPosition(10, 0, -1.8+1.8*i);
                let enemyComp = oneLine2Enemy.getComponent(enemyPlane);
                enemyComp.show(this,speed,false);
                
            }
       }
    }


    public createCombinationPlan5(){
        let prefab = this.enemy01;
        let speed = this.enemySpeed01;
        let eitherEnemy = math.randomRangeInt(1,3)
        if(eitherEnemy === constant.PlaneType.TYPE2){
            //console.log('shoot line 01')
            prefab = this.enemy02;
            speed = this.enemySpeed02;
            let oneLine2 = new Array<Node>(3);
            for(let i = 0 ;i < oneLine2.length;i++){
                //let oneLine2Enemy = instantiate(prefeb);
                //oneLine2Enemy.setParent(this.enemyRoot);
                let oneLine2Enemy = poolManager.instance().getNode(prefab,this.enemyRoot);
                oneLine2Enemy.setPosition(10, 0, -1.8+1.8*i);
                let enemyComp = oneLine2Enemy.getComponent(enemyPlane);
                if(i%2){
                    enemyComp.show(this, speed, false)
                }else{
                    enemyComp.show(this, speed, true)
                }
            }  
            this.countEnemy(3);  
        }else{
            //console.log('shoot line 02')
            prefab = this.enemy01;
            speed = this.enemySpeed02;   
            let oneLine1 = new Array<Node>(5);
            for (let i = 0; i < oneLine1.length; i++) {
                //let oneLine1Enemy = instantiate(prefeb);
                //oneLine1Enemy.setParent(this.enemyRoot);
                //节点池替换
                let oneLine1Enemy = poolManager.instance().getNode(prefab, this.enemyRoot);
                oneLine1Enemy.setPosition(10, 0, -3.2 + 1.6 * i);
                oneLine1Enemy.active = true;
                let enemyComp = oneLine1Enemy.getComponent(enemyPlane);
                if(i%2){
                    enemyComp.show(this, speed, false)
                }else{
                    enemyComp.show(this, speed, true)
                }
                
            }
            this.countEnemy(5);

        }
    }
    public createCombinationPlan3(){
        let eitherEnemy = math.randomRangeInt(1,3)
        //console.log('random number  '+ eitherEnemy);
        let prefab = this.enemy01;
        let speed = this.enemySpeed01;
        if(eitherEnemy === constant.PlaneType.TYPE2){
            console.log('sq shape')
            let VShape = new Array<Node>(8);
            let p = 1.2;
            let q = 1.5;
            let VShapeV2 :number [] [] = [[10+2*p,10+p,10,10+p,10+2*p,10+3*p,10+4*p,10+3*p],[-2*q,-q,0,q,2*q,q,0,-q]]
            for(let i = 0;i<VShape.length;i++){
                //Array[i]=instantiate(prefeb);
                //VShapePlane.setParent(this.enemyRoot);
                //节点池替换
                let VShapePlane = poolManager.instance().getNode(prefab,this.enemyRoot);
                Array[i] = VShapePlane;
                VShapePlane.setPosition(VShapeV2[0][i],0,VShapeV2[1][i])
                let enemyComp = VShapePlane.getComponent(enemyPlane);
                enemyComp.show(this,speed,false);
            }
            this.countEnemy(8);
        }else{
            //console.log(' line shape')
            prefab = this.enemy02;
            speed = this.enemySpeed02;
            let oneLine2 = new Array<Node>(3);
            for(let i = 0 ;i < oneLine2.length;i++){
                //let oneLine2Enemy = instantiate(prefeb);
                //oneLine2Enemy.setParent(this.enemyRoot);
                let oneLine2Enemy = poolManager.instance().getNode(prefab,this.enemyRoot);
                oneLine2Enemy.setPosition(10, 0, -1.8+1.8*i);
                let enemyComp = oneLine2Enemy.getComponent(enemyPlane);
                if(i%2){
                    enemyComp.show(this, speed, false)
                }else{
                    enemyComp.show(this, speed, true)
                }  
            }
            this.countEnemy(3);
        }
    }


    public createCombinationPlan4(){
        //console.log('doing combination2')
        let eitherEnemy = math.randomRangeInt(1,3) //1,2取随机数，不包括3
        let prefab:Prefab = null;
        let speed = 5 ;
        if(eitherEnemy === constant.PlaneType.TYPE2){
            //console.log(' V shape')
            prefab = this.enemy02;
            speed = this.enemySpeed01;
            let VShape = new Array<Node>(7);
            let p = 0.7;
            let q = 1.1;
            let VShapeV2 :number [] [] = [[10+3*p,10+2*p,10+p,10,10+p,10+2*p,10+3*p],[-3*q,-2*q,-q,0,q,2*q,3*q]]
            for(let i = 0;i<VShape.length;i++){
                //Array[i]=instantiate(prefeb); 
                let VShapePlane = poolManager.instance().getNode(prefab,this.enemyRoot);
                Array[i] = VShapePlane;
                //VShapePlane.setParent(this.enemyRoot);
                VShapePlane.setPosition(VShapeV2[0][i],0,VShapeV2[1][i])
                let enemyComp = VShapePlane.getComponent(enemyPlane);
                enemyComp.show(this,speed,false);
            }
            this.countEnemy(7);
        }else{
            //会发射子弹的多架飞机;
            //console.log(' line shape')
            prefab = this.enemy01;
            speed = this.enemySpeed01;
            
            let oneLine1 = new Array<Node>(5);
            for (let i = 0; i < oneLine1.length; i++) {
                //let oneLine1Enemy = instantiate(prefeb);
                //oneLine1Enemy.setParent(this.enemyRoot);
                //节点池替换
                let oneLine1Enemy = poolManager.instance().getNode(prefab, this.enemyRoot);
                oneLine1Enemy.setPosition(10, 0, -3.2 + 1.6 * i);
                oneLine1Enemy.active = true;
                let enemyComp = oneLine1Enemy.getComponent(enemyPlane);
                if(i%2){
                    enemyComp.show(this, speed, false)
                }else{
                    enemyComp.show(this, speed, true)
                }
            }
            this.countEnemy(5);
        }       
    }

    

    public createCombinationPlan7(){
        let eitherEnemy = math.randomRangeInt(1,3) //1,2取随机数，不包括3
        //console.log('random number  '+ eitherEnemy);
        let prefab:Prefab = null;
        let speed = 5 ;
        if(eitherEnemy === constant.PlaneType.TYPE2){
            //console.log('V shape shoot')
            prefab = this.enemy02;
            speed = this.enemySpeed01 ;
            let VShape = new Array<Node>(7);
            let p = 0.7;
            let q = 1.1;
            let VShapeV2 :number [] [] = [[10+3*p,10+2*p,10+p,10,10+p,10+2*p,10+3*p],[-3*q,-2*q,-q,0,q,2*q,3*q]]
            for(let i = 0;i<VShape.length;i++){
                //Array[i]=instantiate(prefeb); 
                let VShapePlane = poolManager.instance().getNode(prefab,this.enemyRoot);
                Array[i] = VShapePlane;
                //VShapePlane.setParent(this.enemyRoot);
                VShapePlane.setPosition(VShapeV2[0][i],0,VShapeV2[1][i])
                let enemyComp = VShapePlane.getComponent(enemyPlane);
                if(i%2 != 0){
                    enemyComp.show(this,speed,true)
                }else{
                    enemyComp.show(this,speed,false)
                }  
                
            }
            this.countEnemy(7);
        }else{
            
            //console.log('line ')
            prefab = this.enemy01;
            speed = this.enemySpeed02;  
            let oneLine1 = new Array<Node>(5);
            for (let i = 0; i < oneLine1.length; i++) {
                //let oneLine1Enemy = instantiate(prefeb);
                //oneLine1Enemy.setParent(this.enemyRoot);
                //节点池替换
                let oneLine1Enemy = poolManager.instance().getNode(prefab, this.enemyRoot);
                oneLine1Enemy.setPosition(10, 0, -3.2 + 1.6 * i);
                oneLine1Enemy.active = true;
                let enemyComp = oneLine1Enemy.getComponent(enemyPlane);
                enemyComp.show(this, speed, false) 
                
            }
            this.countEnemy(5);
        }       
    }
    
    public createCombinationPlan6(){
        let eitherEnemy = math.randomRangeInt(1,3)
        //console.log('random number  '+ eitherEnemy);
        let prefab = this.enemy01;
        let speed = this.enemySpeed01 ;
        if(eitherEnemy === constant.PlaneType.TYPE2){
            //console.log('sq shape shoot')
            let VShape = new Array<Node>(8);
            let p = 1.2;
            let q = 1.5;
            let VShapeV2 :number [] [] = [[10+2*p,10+p,10,10+p,10+2*p,10+3*p,10+4*p,10+3*p],[-2*q,-q,0,q,2*q,q,0,-q]]
            for(let i = 0;i<VShape.length;i++){
                //Array[i]=instantiate(prefeb);
                //VShapePlane.setParent(this.enemyRoot);
                //节点池替换
                let VShapePlane = poolManager.instance().getNode(prefab,this.enemyRoot);
                Array[i] = VShapePlane;
                VShapePlane.setPosition(VShapeV2[0][i],0,VShapeV2[1][i])
                let enemyComp = VShapePlane.getComponent(enemyPlane);
                if(i == 0|| i == 2 || i == 4){
                    enemyComp.show(this,speed,true) 
                }else{
                    enemyComp.show(this,speed,false)
                }
                
            }
            this.countEnemy(8);
        
        }else{
            //console.log('line ')
            prefab = this.enemy02;
            speed = this.enemySpeed02;
            let oneLine2 = new Array<Node>(3);
            for(let i = 0 ;i < oneLine2.length;i++){
                //let oneLine2Enemy = instantiate(prefeb);
                //oneLine2Enemy.setParent(this.enemyRoot);
                let oneLine2Enemy = poolManager.instance().getNode(prefab,this.enemyRoot);
                oneLine2Enemy.setPosition(10, 0, -1.8+1.8*i);
                let enemyComp = oneLine2Enemy.getComponent(enemyPlane);
                enemyComp.show(this, speed, false)     ;
                      
            }
            this.countEnemy(3);
        }
    }

    public createCombinationPlan8(){
        let eitherEnemy = math.randomRangeInt(1,3) //1,2取随机数，不包括3
        let prefab:Prefab = null;
        let speed = 5 ;
        if(eitherEnemy === constant.PlaneType.TYPE2){
            //console.log('V shape shoot')
            prefab = this.enemy02;
            speed = this.enemySpeed01 ;
            let VShape = new Array<Node>(7);
            let p = 0.7;
            let q = 1.1;
            let VShapeV2 :number [] [] = [[10+3*p,10+2*p,10+p,10,10+p,10+2*p,10+3*p],[-3*q,-2*q,-q,0,q,2*q,3*q]]
            for(let i = 0;i<VShape.length;i++){
                //Array[i]=instantiate(prefeb); 
                let VShapePlane = poolManager.instance().getNode(prefab,this.enemyRoot);
                Array[i] = VShapePlane;
                //VShapePlane.setParent(this.enemyRoot);
                VShapePlane.setPosition(VShapeV2[0][i],0,VShapeV2[1][i])
                let enemyComp = VShapePlane.getComponent(enemyPlane);
                if(i%2){
                    enemyComp.show(this,speed,true)
                }else{
                    enemyComp.show(this,speed,false)
                }  
                
            }
            this.countEnemy(7);
        }else{
            
            //console.log('line shoot')
            prefab = this.enemy01;
            speed = this.enemySpeed02 ;  
            let oneLine1 = new Array<Node>(5);
            for (let i = 0; i < oneLine1.length; i++) {
                //let oneLine1Enemy = instantiate(prefeb);
                //oneLine1Enemy.setParent(this.enemyRoot);
                //节点池替换
                let oneLine1Enemy = poolManager.instance().getNode(prefab, this.enemyRoot);
                oneLine1Enemy.setPosition(10, 0, -3.2 + 1.6 * i);
                oneLine1Enemy.active = true;
                let enemyComp = oneLine1Enemy.getComponent(enemyPlane);
                if(i%2 ){
                    enemyComp.show(this, speed, false)
                }else{
                    enemyComp.show(this, speed, true)
                }
                
            }
            this.countEnemy(5);
        }       
    }

    public createCombinationPlan9(){
        let eitherEnemy = math.randomRangeInt(1,3)
        //console.log('random number  '+ eitherEnemy);
        let prefab = this.enemy01;
        let speed = this.enemySpeed01 ;
        if(eitherEnemy === constant.PlaneType.TYPE2){
            //console.log('sq shape shoot')
            let VShape = new Array<Node>(8);
            let p = 1.2;
            let q = 1.5;
            let VShapeV2 :number [] [] = [[10+2*p,10+p,10,10+p,10+2*p,10+3*p,10+4*p,10+3*p],[-2*q,-q,0,q,2*q,q,0,-q]]
            for(let i = 0;i<VShape.length;i++){
                //Array[i]=instantiate(prefeb);
                //VShapePlane.setParent(this.enemyRoot);
                //节点池替换
                let VShapePlane = poolManager.instance().getNode(prefab,this.enemyRoot);
                Array[i] = VShapePlane;
                VShapePlane.setPosition(VShapeV2[0][i],0,VShapeV2[1][i])
                let enemyComp = VShapePlane.getComponent(enemyPlane);
                if( i === 0 || i === 2 || i === 4){
                    enemyComp.show(this,speed,true) 
                }else{
                    enemyComp.show(this,speed,false)
                }
                
            }
            this.countEnemy(8);
        
        }else{
            //console.log('line shoot')
            prefab = this.enemy02;
            speed = this.enemySpeed02  ;
            let oneLine2 = new Array<Node>(3);
            for(let i = 0 ;i < oneLine2.length;i++){
                //let oneLine2Enemy = instantiate(prefeb);
                //oneLine2Enemy.setParent(this.enemyRoot);
                let oneLine2Enemy = poolManager.instance().getNode(prefab,this.enemyRoot);
                oneLine2Enemy.setPosition(10, 0, -1.8+1.8*i);
                let enemyComp = oneLine2Enemy.getComponent(enemyPlane);
                if(i%2){
                    enemyComp.show(this, speed, false)
                }else{
                    enemyComp.show(this, speed, true)
                }   
            }
            this.countEnemy(3);
        }
    }

    public createCombinationPlan10(){
        let eitherEnemy = math.randomRangeInt(1,3)
        //console.log('random number  '+ eitherEnemy);
        let prefab = this.enemy01;
        let speed = this.enemySpeed01 ;
        if(eitherEnemy === constant.PlaneType.TYPE2){
            //console.log('sq shape shoot')
            let VShape = new Array<Node>(8);
            let p = 1.2;
            let q = 1.5;
            let VShapeV2 :number [] [] = [[10+2*p,10+p,10,10+p,10+2*p,10+3*p,10+4*p,10+3*p],[-2*q,-q,0,q,2*q,q,0,-q]]
            for(let i = 0;i<VShape.length;i++){
                //Array[i]=instantiate(prefeb);
                //VShapePlane.setParent(this.enemyRoot);
                //节点池替换
                let VShapePlane = poolManager.instance().getNode(prefab,this.enemyRoot);
                Array[i] = VShapePlane;
                VShapePlane.setPosition(VShapeV2[0][i],0,VShapeV2[1][i])
                let enemyComp = VShapePlane.getComponent(enemyPlane);
                if( i === 0 || i === 2 || i === 4){
                    enemyComp.show(this,speed,true) 
                }else{
                    enemyComp.show(this,speed,false)
                }
            }
            this.countEnemy(8);
        
        }else{
            //console.log('V shape shoot')
            prefab = this.enemy02;
            speed = this.enemySpeed01 ;
            let VShape = new Array<Node>(7);
            let p = 0.7;
            let q = 1.1;
            let VShapeV2 :number [] [] = [[10+3*p,10+2*p,10+p,10,10+p,10+2*p,10+3*p],[-3*q,-2*q,-q,0,q,2*q,3*q]]
            for(let i = 0;i<VShape.length;i++){
                //Array[i]=instantiate(prefeb); 
                let VShapePlane = poolManager.instance().getNode(prefab,this.enemyRoot);
                Array[i] = VShapePlane;
                //VShapePlane.setParent(this.enemyRoot);
                VShapePlane.setPosition(VShapeV2[0][i],0,VShapeV2[1][i])
                let enemyComp = VShapePlane.getComponent(enemyPlane);
                if(i%2){
                    enemyComp.show(this,speed,false)
                }else{
                    enemyComp.show(this,speed,true)
                } 
            } 
            this.countEnemy(7);
        }    
    }



    public CreateProp(){
        let prefab : Prefab = null ;
        let propType = randomRangeInt(1,4) ;
        if (propType === constant.BulletPropType.BULLET_PROP_S){
            prefab = this.bulletPropS;
        }else if(propType === constant.BulletPropType.BULLET_PROP_H){
            prefab = this.bulletPropH;
        }else{
            prefab = this.bulletPropM;
        }
        //let prop = instantiate(perfab);
        //prop.setParent(this.propRoot);
        let prop = poolManager.instance().getNode(prefab,this.enemyRoot);
        prop.setPosition(10, 0, math.randomRange(-3.5, 3.5));
        //console.log('子弹道具出现')
        //设置速度
        let propComp = prop.getComponent(bulletProp);
        propComp.show(this,this.bulletPropSpeed);
    }


    public addScore(addition:number){
        this.score += addition;
        this.currScore.string = this.score.toString();       
    }

    public addKillEnemyNumber(){
        this.enemyKillNum ++;
        this.enemyKill.string = this.enemyKillNum.toString();
    }

    public killEnemyPercent(){
        let percent = this.enemyKillNum/this.totalEnemy*100;
        let per = percent.toFixed(1) ;   
        let code:string = '%'
        this.percent.string = per.toString() + code;
    }

    public prop_addScore_toString(labelName:Label, labelNum:number){
        labelName.string = labelNum.toString();
    }

    public bothScore(){
        this.planeScore.string = this.enemyKillNum.toString();
        let ps = this.propSNum * 5 + this.propHNum * 10 + this.propMNum * 20;
        this.propScore.string = ps.toString();
    }

    private _changePlaneMode(){
        //每隔25s执行事件，共执行6次
        this.schedule(()=>this._combinationInterval++, 15,16);      
        //console.log('schedule:   '+this._combinationInterval)   
    }

    public destroyAllEnemy(){
        let children:Node[] = this.enemyRoot.children;
        // length -1 ,默认index从零开始，否则children[index]会显示undefined
        for (let index = children.length-1; index >= 0; index--) {    
            //console.log(children[index])
            //children[index].destroy();
            poolManager.instance().putNode(children[index])              
        }
    }

    public destroyAllBullet(){
        let children = this.bulletRoot.children;
        for (let index = children.length-1; index >= 0; index--) {
            //children[index].destroy();     
            poolManager.instance().putNode(children[index])         
        }
    }     
    
    public destroyAllProp(){
        let children = this.propRoot.children;
        for (let index = children.length-1; index >= 0; index--) {
            //children[index].destroy();  
            poolManager.instance().putNode(children[index])         
        }
    }

    public EnemyDieAudio(){
        this.effectAudioManager.playEffect('enemy')
    }


    public countEnemy(plus:number = 1){
        this.totalEnemy += plus;
        //console.log('create enemy + ' + plus +' = ' + this.totalEnemy)
    }

    public ENDING(deltaTime:number){
        this.stone.active = true;
        let pos = this.stone.position;
        let moveLength = pos.x;
        
        if(moveLength<= 2){
            moveLength = 2;
            this.IsSucceed = true;
        }else{
            moveLength = pos.x - deltaTime * this._stoneSpeed;
        }
        this.stone.setPosition(moveLength,pos.y,pos.z);
    }
}
    



//敌机出现策划案内容

//组合1：单架飞机
//组合2：一字型飞入5架飞机
//组合3：V字型飞入7架飞机

// 时间间隔
// 1-10S 组合1
// 11-10s 组合1 组合2
// 20s以上 组合1 组合2 组合3