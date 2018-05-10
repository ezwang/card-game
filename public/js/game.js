var game = {
    init: function() {
        game.pixi = new PIXI.Application(window.innerWidth, window.innerHeight);
        document.body.appendChild(game.pixi.view);
    },
    resize: function() {
        game.pixi.renderer.resize(window.innerWidth, window.innerHeight);
    }
};

$(document).ready(game.init);
$(window).resize(game.resize);
