var Player = require('./player.js');
var constants = require('./public/js/constants.js');

function Bot() {
    Player.call(this, null);
    this.username = 'Bot';
}

Bot.prototype = Object.create(Player.prototype);

function hasAction(card, action) {
    if (!card.actions) return false;
    return card.actions.some((x) => x[0] == action);
}

Bot.prototype.playMove = function() {
    // bot's turn, do actions
    const bot = this;
    const opp = this.game.getOpponent(this);
    // if game is over, don't do anything
    if (bot.health <= 0 || opp.health <= 0) {
        return;
    }
    var processActionQueue = function() {
        var noActions = true;
        // try playing spell cards
        bot.hand.every(function(cardId) {
            var card = constants.cards[cardId];
            if (card.mana <= bot.mana) {
                if (card.type == 'spell') {
                    if (!card.target) {
                        if (hasAction(card, 'all_damage')) {
                            if (opp.minions.length >= bot.minions.length + 2) {
                                bot.playCard(card.id);
                                noActions = false;
                                return false;
                            }
                        }
                        if (hasAction(card, 'all_damage_opponent') || hasAction(card, 'random_damage_opponent')) {
                            if (opp.minions.length >= 2) {
                                bot.playCard(card.id);
                                noActions = false;
                                return false;
                            }
                        }
                        if (hasAction(card, 'draw') || hasAction('card_copy')) {
                            bot.playCard(card.id);
                            noActions = false;
                            return false;
                        }
                    }
                    else {
                        if (hasAction(card, 'heal')) {
                            if (bot.health <= constants.player.MAX_HEALTH - 10) {
                                bot.playCard(card.id, "player");
                                noActions = false;
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        });
        if (!noActions) {
            setTimeout(processActionQueue, constants.game.BOT_DELAY);
            return;
        }
        // try playing minion cards
        bot.hand.every(function(cardId) {
            var card = constants.cards[cardId];
            if (card.mana <= bot.mana && bot.minions.length < constants.player.MAX_MINIONS) {
                if (card.type == 'minion' && !card.target) {
                    noActions = false;
                    bot.playCard(card.id);
                    return false;
                }
            }
            return true;
        });
        if (!noActions) {
            setTimeout(processActionQueue, constants.game.BOT_DELAY);
            return;
        }
        // do minion attacks
        var targetObject = opp.minions.sort((x, y) => x.health - y.health).find((x) => x.hasAttribute('taunt'));
        var target = targetObject;
        var hasTaunt = true;
        if (!target) {
            hasTaunt = false;
            if (opp.minions.length > 0) {
                targetObject = opp.minions.sort((x, y) => x.health - y.health)[0];
                target = targetObject.minionInstanceId;
            }
            else {
                target = 'opponent';
                targetObject = null;
            }
        }
        else {
            target = targetObject.minionInstanceId;
        }

        // if no taunts and can kill opponent, do so
        var maxDamage = bot.minions.map((x) => x.attack).reduce((x, y) => x + y, 0);
        if (maxDamage >= opp.health && !hasTaunt) {
            target = 'opponent';
            targetObject = null;
        }

        bot.minions.sort((x, y) => y.health - x.health).every(function(minion) {
            if (minion.hasAttack) {
                if (targetObject) {
                    if (minion.health <= targetObject.attack) {
                        if (!targetObject.hasAttribute('taunt') && !targetObject.hasAttribute('special')) {
                            if (minion.health >= targetObject.health && minion.health >= target) {
                                target = 'opponent';
                                targetObject = null;
                            }
                        }
                    }
                }
                bot.doAttack(minion.minionInstanceId, target);
                noActions = false;
                return false;
            }
            return true;
        });
        if (noActions) {
            if (bot.game) {
                bot.game.switchTurns(bot.id);
            }
        }
        else {
            setTimeout(processActionQueue, constants.game.BOT_DELAY);
        }
    };
    processActionQueue();
};

Bot.prototype.sendPacket = function(msg, data) {
    switch(msg) {
        case 'gameInit':
            // do mulligan, remove all 5+ cards
            this.doMulligan(this.hand.map((x) => constants.cards[x].mana >= 5));
            break;
        case 'gameTimer':
            break;
        case 'addCard':
            break;
        case 'discardCard':
            break;
        case 'updatePlayer':
            break;
        case 'updateMinion':
            break;
        case 'playCard':
            break;
        case 'addMinion':
            break;
        case 'removeMinion':
            break;
        case 'gameEnd':
            break;
        case 'nextTurn':
            if (data.turn == this.id) {
                // not in a game, don't do anything
                if (!this.game) {
                    break;
                }
                this.playMove();
            }
            break;
        case 'error':
              console.warn(`Bot (error): ${data}`);
              break;
        default:
            console.warn(`Bot (unhandled): ${msg} -> ${JSON.stringify(data)}`);
    }
};

Bot.prototype.constructor = Bot;
module.exports = Bot;