cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //    default: null,
        //    url: cc.Texture2D,  // optional, default is typeof default
        //    serializable: true, // optional, default is true
        //    visible: true,      // optional, default is true
        //    displayName: 'Foo', // optional
        //    readonly: false,    // optional, default is false
        // },
        // ...
        Label:{
            default:null,
            type:cc.Node
        },
        background:{
            default:null,
            type:cc.Node
        },
        restartBtn:{
            default:null,
            type:cc.Node
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    restartGame:function () {
        cc.director.loadScene("Game");

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
