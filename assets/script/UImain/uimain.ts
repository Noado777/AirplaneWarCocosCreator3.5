import { _decorator, Component, Node, Input, input, EventTouch, SystemEvent, Sprite, Button , Animation} from 'cc';
import { gameManager } from '../framework/gameManager';
import { playControl } from '../plane/playControl';
const { ccclass, property } = _decorator;

@ccclass('uimain')
export class uimain extends Component {

    @property
    public speed :number = 0.001;

    @property(Node)
    playerPlane:Node = null;

    @property(gameManager)
    gameManager:gameManager = null;

    //场景切换
    //游戏已经开始即进行中的界面
    @property(Node)
    public gameStart :Node = null;
    //游戏还没开始的标题页主页
    @property(Node)
    public gameMain : Node = null ; 
    //游戏结束页面
    @property(Node)
    public gameOver : Node = null ;
    //游戏胜利页面
    @property(Node)
    public succeed:Node = null;

    //按钮
    @property(Node)
    public gameOverButton:Node = null;

    @property(Node)
    public returnButton:Node = null;

    
    @property(Animation)
    public failAnim :Animation = null;

    @property(Node)
    public succeedAnimNode :Node = null;

    @property(Animation)
    public succeedAnim :Animation = null;

    private _mainPage : boolean = false;
    private _gameOverPage :boolean = false;
    
    onLoad(){      
        this._mainPage = true      
    }

    start() {
        this.gameMainPage();
        //console.log('uimain-start')
        input.on(Input.EventType.TOUCH_MOVE,this._touchMove,this);
        input.on(Input.EventType.TOUCH_START,this._touchStart,this);
        input.on(Input.EventType.TOUCH_END,this._touchEnd,this);

    }


    update(deltaTime: number) {
        let playerPlane = this.gameManager.playerPlane;
        let IsPlayerDied = playerPlane.getComponent(playControl).IsDied;
        if(IsPlayerDied){    
            //console.log('飞机死亡，调出游戏结束页面')
            this.gameOverPage(); 
            input.off(Input.EventType.TOUCH_START,this._touchStart,this);
            input.off(Input.EventType.TOUCH_MOVE,this._touchMove,this);
            input.off(Input.EventType.TOUCH_END,this._touchEnd,this);
        }else{
            input.on(Input.EventType.TOUCH_MOVE,this._touchMove,this);
            input.on(Input.EventType.TOUCH_START,this._touchStart,this);
            input.on(Input.EventType.TOUCH_END,this._touchEnd,this); 
        }
        if(this.gameManager.IsSucceed === true){
            //console.log('uimain-upsate-succceed-Issucceed?'+this.gameManager.IsSucceed)
            this.succeedPage(); 
            input.off(Input.EventType.TOUCH_START,this._touchStart,this);
            input.off(Input.EventType.TOUCH_MOVE,this._touchMove,this);
            input.off(Input.EventType.TOUCH_END,this._touchEnd,this);           
        }

    }

    //这部分从playerControl移过来，在场景中创建ui节点canvas挂该组件，然后关联飞机plane01，抄过来的this.node改成this.playerPlane
    //获取新的触点值，二者相减得到移动方向

    private _touchMove(event: EventTouch) {
        //isgame为false不能往下进行,否则返回
        if(!this.gameManager.IsGame){
            this.gameManager.IsGame = true;
            //console.log('isgame')
            this.gameStartPage();
            return;
        }   
        //getDelta()获取触点值与上一次触点值之间的差值
        const delta = event.touch.getDelta();
        let pos = this.playerPlane.getPosition();
        this.playerPlane.setPosition(pos.x + this.speed * delta.y, pos.y, pos.z + this.speed * delta.x);
    }

    private _touchStart(){
        //这些都要在GameManager中的Isgame为true时才开始，false滑动后为true
        if(this.gameManager.IsGame){    
            this.gameManager.isShooting(true);              
        }else{
            this.gameStartPage();
            this.gameManager.IsGame = true;
            let plane = this.playerPlane.getChildByName('plane01')
            let tailFlame = this.playerPlane.getChildByName('tailFlame')
            plane.active = true;
            tailFlame.active = true; 
            //console.log('按住 uimain set the isgame = true'+this.gameManager.IsGame)
        }       
    }

    private _touchEnd(){
        if(!this.gameManager.IsGame){
           return; 
        }   
        this.gameManager.isShooting(false);    
        //console.log('抬起'+this.gameManager.IsGame) 
    }

    
    

    public gameOverPage(){  
        this.succeed.active = false; 
        this._mainPage = false;    
        this.gameMain.active = false;
        this.gameStart.active = false;
        this.gameOver.active = true;
        let player = this.node.getComponent(Animation);
        player.play('gameOverTitle');
        //console.log('游戏结束页面')
    }

    public succeedPage(){   
        this.succeed.active = true;
        //this.succeedAnim.play();  这样写是错的！！！ 
        this.gameMain.active = false;
        this.gameStart.active = false;
        this.gameOver.active = false;
        this.gameManager.succeedSet();
        let player = this.node.getComponent(Animation);
        player.play('succeedTitle');
        //console.log('游戏胜利页面')
    }

    public gameMainPage(){
        this.gameOver.active = false ;
        this.gameMain.active =true ;
        this.gameStart.active = false;
        this.succeed.active = false; 
        //console.log('main')
        this.gameManager.mainGameSet();
        
    }

    public gameStartPage(){
        this.gameMain.active = false;
        this.gameOver.active = false;
        this.gameStart.active = true;
        
        this.succeed.active = false; 
        this.gameManager.startGameSet();
        //console.log('restart')       
    }

    public buttonAudio(){
        this.gameManager.effectAudioManager.playEffect('button')
    }

}

