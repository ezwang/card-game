var assert = require('assert');
var sinon = require('sinon');

var constants = require('../public/js/constants.js');
var Game = require('../game.js');
var Bot = require('../bot.js');

describe('Bot', function() {
    var oldBotDelay;

    before(function() {
        oldBotDelay = constants.game.BOT_DELAY;
        constants.game.BOT_DELAY = 0;
    });

    after(function() {
        constants.game.BOT_DELAY = oldBotDelay;
    });

    var game, bot1, bot2;
    beforeEach(function() {
        bot1 = new Bot();
        bot2 = new Bot();
        game = new Game(bot1, bot2);
    });

    it('plays 10 turns', function(done) {
        this.timeout(5 * 1000);

        var originalSwitchTurns = game.switchTurns.bind(game);
        var stub = sinon.stub(Game.prototype, 'switchTurns').callsFake(function(playerId) {
            if (game.turnCounter >= 10) {
                stub.restore();
                game.end(bot1.id);
                done();
            }
            else {
                originalSwitchTurns(playerId);
            }
        });

        game.init();
    });

    it('handles sudden interrupts', function(done) {
        this.timeout(5 * 1000);

        var originalSwitchTurns = game.switchTurns.bind(game);
        var stub = sinon.stub(Game.prototype, 'switchTurns').callsFake(function(playerId) {
            if (game.turnCounter >= 10) {
                stub.restore();
                game.end(bot1.id);
                assert.ok(!game.switchTurns(playerId));
                done();
            }
            else {
                originalSwitchTurns(playerId);
            }
        });

        game.init();
    });

    it('plays against self correctly (first 30 cards)', function(done) {
        this.timeout(5 * 1000);

        var cardStub = sinon.stub(Bot.prototype, 'getDeck').callsFake(function() {
            var deck = [];
            for (var i = 0; i < constants.player.DECK_SIZE; i++) {
                deck.push(i);
            }
            return deck;
        });

        var stub = sinon.stub(Game.prototype, 'end').callsFake(function() {
            assert.ok(game.turnCounter >= 3, game.turnCounter);
            assert.ok(bot1.health <= 0 || bot2.health <= 0, `Bot1 Health: ${bot1.health}, Bot2 Health: ${bot2.health}`);
            stub.restore();
            cardStub.restore();
            game.end(bot1.id);
            done();
        });

        game.init();
    });

    it('plays against self correctly', function(done) {
        this.timeout(5 * 1000);

        var stub = sinon.stub(Game.prototype, 'end').callsFake(function() {
            assert.ok(game.turnCounter >= 3, game.turnCounter);
            assert.ok(bot1.health <= 0 || bot2.health <= 0, `Bot1 Health: ${bot1.health}, Bot2 Health: ${bot2.health}`);
            stub.restore();
            game.end(bot1.id);
            done();
        });

        game.init();
    });
});
