var assert = require('assert');
var constants = require('../public/js/constants.js');

describe('constants', function() {
    describe('cards', function() {
        it('should have correct ids for all cards', function() {
            Object.keys(constants.cards).forEach(function(cardId) {
                var card = constants.cards[cardId];
                assert.equal(typeof card.id, 'number');
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
                }
            });
        });
    });
});
