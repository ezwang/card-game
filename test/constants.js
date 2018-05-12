var assert = require('assert');
var constants = require('../public/js/constants.js');

describe('constants', function() {
    function assertValidActions(actions) {
        assert.ok(Array.isArray(actions));
        actions.forEach(function(action) {
            assert.ok(Array.isArray(action));
        });
    }

    describe('cards', function() {
        it('should have correct names and ids for all cards', function() {
            Object.keys(constants.cards).forEach(function(cardId) {
                var card = constants.cards[cardId];
                assert.equal(typeof card.id, 'number');
                assert.equal(typeof card.name, 'string');
                assert.equal(card.id, cardId);
            });
        });
        it('should have valid minion ids', function() {
            Object.keys(constants.cards).forEach(function(cardId) {
                var card = constants.cards[cardId];
                if (card.type == 'minion') {
                    assert.notStrictEqual(card.spawn, undefined);
                    card.spawn.forEach((x) => assert.notStrictEqual(constants.minions[x], undefined));
                }
            });
        });
        it('should have valid spell actions', function() {
            Object.keys(constants.cards).forEach(function(cardId) {
                var card = constants.cards[cardId];
                if (card.type == 'spell') {
                    assert.notStrictEqual(card.actions, undefined);
                    assertValidActions(card.actions);
                }
            });
        });
    });
    describe('minions', function() {
        it('should have names', function() {
            Object.keys(constants.minions).forEach(function(minionId) {
                var minion = constants.minions[minionId];
                assert.strictEqual(typeof minion.name, 'string');
            });
        });
        it('should have valid events', function() {
            Object.keys(constants.minions).forEach(function(minionId) {
                var minion = constants.minions[minionId];
                if (typeof minion.events !== 'undefined') {
                    Object.values(minion.events).forEach(function(handler) {
                        assertValidActions(handler);
                    });
                }
            });
        });
    });
});
