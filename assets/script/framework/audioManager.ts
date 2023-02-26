import { _decorator, AudioClip, AudioSource, Component } from 'cc';
const { ccclass, property } = _decorator;

interface AudioDict{
    [name:string]:AudioClip;
}

@ccclass('audioManager')
export class audioManager extends Component {

    @property([AudioClip])
    audioList:AudioClip[] = [];

    private _dict:AudioDict = {};
    private _player:AudioSource = null;
    start() {
        for (let index = 0; index < this.audioList.length; index++) {
            const element = this.audioList[index]; 
            this._dict[element.name] = element ;
        }
        
    }

    public playEffect(name:string){
        this._player = this.node.getComponent(AudioSource);
        const audio = this._dict[name];
        if(audio !== undefined){
            this._player.playOneShot(audio);
        }
        
    }
}

