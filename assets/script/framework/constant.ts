import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

//用于存放类型：飞机类型、子弹类型、飞机组合等等

@ccclass('constant')
export class constant {
    //定义敌机类型
    public static PlaneType = {
        TYEP1: 1,
        TYPE2: 2,
    }
    //定义组合类型
    public static Combination = {
        PLAN1: 1,
        PLAN2: 2,
        PLAN3: 4,
        PLAN4: 6,    
        PLAN5: 8, 
        PLAN_PAUSE:9,  
        PLAN6: 10,
        PLAN7: 11,
        PLAN_PAUSE1: 12,
        PLAN8: 13,
        PLAN_PAUSE2: 14,
        PLAN9: 15,
        PLAN_PAUSE3: 16,
        PLAN10: 17,
        END:18,
        
    }
    //定义碰撞的tag
    public static CollisionGroup = {
        PLAYER: 1 << 1,
        ENEMY: 1 << 2,
        PLAY_BULLET: 1 << 3,
        ENEMY_BULLET: 1 << 4,
    }
    //子弹道具类型
    public static BulletPropType = {
        BULLET_PROP_M: 1 ,
        BULLET_PROP_H: 2 ,
        BULLET_PROP_S: 3 ,
    }
    //S型子弹方向
    public static BulletDirection = {
        MIDDLE:1,
        REFT:2,
        RIGHT:3,
    }
}

