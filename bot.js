var Player = require('./player.js');
var constants = require('./public/js/constants.js');

function Bot() {
    Player.call(this, null);
    this.username = 'Tutorial Bot';
}

Bot.prototype = Object.create(Player.prototype);

function hasAction(card, action) {
    if (!card.actions) return false;
    return card.actions.some((x) => x[0] == action);
}

Bot.getTarget = function(game, bot, opp) {
    var sortedMinions = opp.minions.sort(function(x, y) {
        // target taunt minions first
        var xTaunt = x.hasAttribute('taunt');
        var yTaunt = y.hasAttribute('taunt');
        if (xTaunt && !yTaunt) {
            return -1;
        }
        if (yTaunt && !xTaunt) {
            return 1;
        }
        // target special minions second
        var xSpecial = x.hasAttribute('special');
        var ySpecial = y.hasAttribute('special');
        if (xSpecial && !ySpecial) {
            return -1;
        }
        if (ySpecial && !xSpecial) {
            return 1;
        }
        // target minion with least health
        var healthDiff = x.health - y.health;
        if (healthDiff != 0) {
            return healthDiff;
        }
        else {
            // target minion with highest attack
            return y.attack - x.attack;
        }
    });
    var targetObject, target, hasTaunt;
    if (sortedMinions.length > 0) {
        targetObject = sortedMinions[0];
        target = targetObject.minionInstanceId;
        hasTaunt = targetObject.hasAttribute('taunt');
    }
    else {
        targetObject = null;
        target = 'opponent';
        hasTaunt = false;
    }

    // if no taunts and can kill opponent (or get close to doing so), do so
    var maxDamage = bot.minions.map((x) => x.attack).reduce((x, y) => x + y, 0);
    if (maxDamage * 1.2 >= opp.health && !hasTaunt) {
        target = 'opponent';
        targetObject = null;
    }
    return {
        target: target,
        targetObject: targetObject,
        hasTaunt: hasTaunt
    };
};

Bot.prototype.sendMessage = function(msg) {
    if (!this.game) {
        return;
    }
    this.game.getOpponent(this).sendPacket('message', '[Tutorial Bot] ' + msg);
};

Bot.prototype.playMove = function() {
    // bot's turn, do actions
    const bot = this;
    const opp = this.game.getOpponent(this);
    // if game is over, don't do anything
    if (bot.health <= 0 || opp.health <= 0) {
        return;
    }
    var processActionQueue = function() {
        // game ended, stop processing
        if (!bot.game) {
            return;
        }
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
                        if (hasAction(card, 'damage')) {
                            bot.playCard(card.id, Bot.getTarget(bot.game, bot, opp).target);
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
        var targetInfo = Bot.getTarget(bot.game, bot, opp);
        var target = targetInfo.target;
        var targetObject = targetInfo.targetObject;

        bot.minions.sort((x, y) => y.health - x.health).every(function(minion) {
            if (minion.hasAttack) {
                if (targetObject) {
                    if (minion.health <= targetObject.attack) {
                        if (minion.attack < targetObject.health / 4) {
                            // don't attack if attack won't do much
                            if (!targetInfo.hasTaunt) {
                                target = 'opponent';
                                targetObject = null;
                            }
                            else {
                                return true;
                            }
                        }
                        else if (!targetObject.hasAttribute('taunt') && !targetObject.hasAttribute('special')) {
                            if (minion.health >= targetObject.health && minion.attack >= targetObject.attack) {
                                // don't attack if this minion is better than the opponent's minion
                                if (!targetInfo.hasTaunt) {
                                    target = 'opponent';
                                    targetObject = null;
                                }
                                else {
                                    return true;
                                }
                            }
                        }
                    }
                }
                // don't attack if taunt and player has low health
                if (minion.hasAttribute('taunt') && bot.health <= 8) {
                    return true;
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

Bot.prototype.cleanup = function() {
    if (this.timeoutIds) {
        this.timeoutIds.forEach((x) => clearTimeout(x));
    }
};

Bot.prototype.doIntroduction = function() {
    const bot = this;
    var i = 0;
    bot.timeoutIds = [];
    constants.game.INTRO.forEach(function(msg) {
        var timeoutId = setTimeout(function() {
            bot.sendMessage(msg);
        }, (constants.game.MESSAGE_FADE_SPEED + 500) * i);
        bot.timeoutIds.push(timeoutId);
        i++;
    });
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
        case 'message':
            break;
        case 'nextTurn':
            // not in a game, don't do anything
            if (!this.game) {
                break;
            }
            // first time tutorial text
            const opp = this.game.getOpponent(this);
            if (data.turn == opp.id) {
                if (!this.firstTurn) {
                    this.doIntroduction();
                    this.firstTurn = true;
                }
            }
            // process AI moves
            if (data.turn == this.id) {
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
