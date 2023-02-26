import { _decorator, Component, instantiate, Node, NodePool, Prefab } from 'cc';
const { ccclass, property } = _decorator;

interface IDictPool{
    [name:string]:NodePool;
}

interface IDictPrefab{
    [name:string]:Prefab;
}

@ccclass('poolManager')
export class poolManager  {
    //定义数据容器，空集而不是null!
    private _dictPool:IDictPool = {};
    private _dictPrefab:IDictPrefab = {};
    
    //单例
    private static _instance : poolManager ;
    public static instance(){
        if(!this._instance){
            this._instance = new poolManager();
        }
        return this._instance;
    }
    

    public getNode(prefab:Prefab,parent:Node){
        let name = prefab.data.name;
        const pool = this._dictPool[name];
        this._dictPrefab[name] = prefab;  
        let node : Node = null;
        //是否已存在节点池
        if(pool){

            //是否已存储了节点
            if(pool.size()>0){
                node = pool.get();
            }else{
                node = instantiate(prefab);
            }
        }else{
            this._dictPool[name] = new NodePool();
            node = instantiate(prefab);
        }
        node.parent = parent;
        node.active;
        //console.log('get node '+ name)
        return node;
    }

    public putNode(node){
        let name = node.name;
        node.parent = null;
        if(!this._dictPool[name]){
            this._dictPool[name] = new NodePool();
        }
        this._dictPool[name].put(node);
        //console.log('put node '+ name)
    }
}

