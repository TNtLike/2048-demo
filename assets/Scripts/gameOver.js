cc.Class({
    extends: cc.Component,

    properties: {
        Label: {
            default: null,
            type: cc.Node
        },
        background: {
            default: null,
            type: cc.Node
        },
        restartBtn: {
            default: null,
            type: cc.Node
        },
    },

    // use this for initialization
    onLoad: function () {

    },

    restartGame: function () {
        cc.director.loadScene("Game");

    },

    // update(dt) {},
});