var assert = require('assert');
var sinon = require('sinon');

var Game = require('../game.js');
var Player = require('../player.js');
var constants = require('../public/js/constants.js');

describe('game', function() {
    var player1, player2;
    var game;
    var oldMinions;

    before(function() {
        sinon.stub(Player.prototype, 'sendPacket');
        oldMinions = constants.minions;
        constants.minions = {
            '0': {
                name: 'Test Minion',
                health: 5,
                mana: 5
            }
        };
    });

    after(function() {
        Player.prototype.sendPacket.restore();
        constants.minions = oldMinions;
    });

    beforeEach(function() {
        player1 = new Player();
        player2 = new Player();
        game = new Game(player1, player2);
        game.init();
    });

    afterEach(function() {
        game.end(player1);
    });

    it('should initialize correctly', function() {
        assert.ok(game);

        assert.equal(player1.sendPacket.getCall(0).args[0], 'gameInit');
        assert.equal(player2.sendPacket.getCall(0).args[0], 'gameInit');
    });

    it('#getOpponent(player)', function() {
        assert.equal(game.getOpponent(player1), player2);
        assert.equal(game.getOpponent(player2), player1);
    });

    it('#getPlayerById(playerId)', function() {
        assert.equal(game.getPlayerById(player1.id), player1);
    });

    it('#switchTurns(playerId)', function() {
        game.switchTurns(game.turn);

        assert.equal(player1.sendPacket.lastCall.args[0], 'nextTurn');
        assert.equal(player2.sendPacket.lastCall.args[0], 'nextTurn');
    });

    describe('player', function() {

        beforeEach(function() {
            player1.spawnMinion(0);
        });

        it('spawns minions correctly', function() {
            assert.equal(player1.minions.length, 1);
            assert.equal(player1.sendPacket.lastCall.args[0], 'addMinion');
            assert.equal(player2.sendPacket.lastCall.args[0], 'addMinion');
        });

        it('kills minions correctly', function() {
            player1.minions[0].health -= 999;

            assert.equal(player1.minions.length, 0);
            assert.equal(player1.sendPacket.lastCall.args[0], 'removeMinion');
            assert.equal(player2.sendPacket.lastCall.args[0], 'removeMinion');
        });

        it('damages minions correctly', function() {
            player1.minions[0].health -= 1;

            assert.equal(player1.minions.length, 1);
            assert.equal(player1.sendPacket.lastCall.args[0], 'updateMinion');
            assert.equal(player2.sendPacket.lastCall.args[0], 'updateMinion');
        });

        describe('#processActions', function() {
            it('damage correct', function() {
                player1.processActions([['damage', 3]], player1.minions[0].minionInstanceId).forEach((x) => x());

                assert.equal(player1.minions[0].health, 2);
            });

            it('all_damage correct', function() {
                for (var i = 0; i < 5; i++) {
                    player1.spawnMinion(0);
                    player2.spawnMinion(0);
                }

                player1.processActions([['all_damage', 5]]).forEach((x) => x());

                assert.equal(player1.minions.length, 0);
                assert.equal(player2.minions.length, 0);
            });

            it('heal correct', function() {
                player1.minions[0].health -= 1;

                player1.processActions([['heal', 3]], player1.minions[0].minionInstanceId).forEach((x) => x());

                assert.equal(player1.minions[0].health, 5);
            });

            it('heal player correct', function() {
                player1.damage(-10);

                assert.equal(player1.health, constants.player.MAX_HEALTH);
            });

            it('draw correct', function() {
                var numCards = player1.hand.length;

                player1.processActions([['draw', 3]]).forEach((x) => x());

                assert.equal(player1.hand.length, numCards + 3);
            });

            it('discard correct', function() {
                player1.processActions([['discard', 10]]).forEach((x) => x());

                assert.equal(player1.hand.length, 0);
            });

            it('card_copy correct', function() {
                var numCards = player1.hand.length;
                var numCardsOpp = player2.hand.length;

                player1.processActions([['card_copy', 3]]).forEach((x) => x());

                assert.equal(player1.hand.length, numCards + 3);
                assert.equal(player2.hand.length, numCardsOpp);
            });
        });
    });
});
