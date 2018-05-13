var Player = require('./player.js');
var constants = require('./public/js/constants.js');

function Bot() {
    Player.call(this, null);
    this.username = 'Bot';
}

Bot.prototype = Object.create(Player.prototype);

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
        case 'nextTurn':
            if (data.turn == this.id) {
                // bot's turn, do actions
                const bot = this;
                const opp = this.game.getOpponent(this);
                // if game is over, ignore nextTurn event
                if (this.health <= 0 || opp.health <= 0) {
                    break;
                }
                var processActionQueue = function() {
                    var noActions = true;
                    for (var i = 0; i < bot.hand.length; i++) {
                        var card = constants.cards[bot.hand[i]];
                        if (card.mana <= bot.mana && !card.target) {
                            noActions = false;
                            bot.playCard(card.id);
                            break;
                        }
                    }
                    if (!noActions) {
                        setTimeout(processActionQueue, 1000);
                        return;
                    }
                    var target = opp.minions.find((x) => x.hasAttribute('taunt'));
                    if (!target) {
                        if (opp.minions.length > 0) {
                            target = opp.minions[0].minionInstanceId;
                        }
                        else {
                            target = 'opponent';
                        }
                    }
                    else {
                        target = target.minionInstanceId;
                    }
                    for (var i = 0; i < bot.minions.length; i++) {
                        if (bot.minions[i].hasAttack) {
                            bot.doAttack(bot.minions[i].minionInstanceId, target);
                            noActions = false;
                            break;
                        }
                    }
                    if (noActions) {
                        bot.game.switchTurns(bot.id);
                    }
                    else {
                        setTimeout(processActionQueue, 1000);
                    }
                };
                processActionQueue();
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
