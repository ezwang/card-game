var Game = require('./game.js');
var deepcopy = require('deepcopy');

var id_incr = 0;
var player_dict = {};
var queued = [];

function Player(ws) {
    this.state = 'init';
    this.ws = ws;
    this.id = id_incr;
    player_dict[this.id] = this;
    id_incr++;
}

Player.get = function(playerId) {
    return player_dict[playerId];
};

Player.prototype.getId = function() {
    return this.id;
};

Player.prototype.authenticate = function(username) {
    this.username = username;
    return true;
};

Player.prototype.sendPacket = function(type, data) {
    // send if socket is open
    if (this.ws.readyState == 1) {
        this.ws.send(JSON.stringify({ type: type, data: data }));
    }
};
var constants = require('./public/js/constants.js');

Player.prototype.setGameState = function(gameState) {
    this.state = gameState;
    this.sendPacket('gameState', gameState);
}

/*
 * Handle a forced disconnect or the case when a client disconnects.
 */
Player.prototype.disconnect = function(errorMessage) {
    if (errorMessage) {
        this.sendPacket('error', errorMessage);
    }
    var i = queued.indexOf(this.id);
    if (i > -1) {
        queued.splice(i, 1);
    }
    if (this.game) {
        this.game.end(this.game.getOpponent(this));
    }
    this.ws.close();
}

/*
 * Returns the current player deck for the game, with the cards in randomized order.
 */
Player.prototype.getDeck = function() {
    var cardIds = Object.keys(constants.cards).filter((k) => constants.cards[k].obtainable !== false);
    Array.prototype.push.apply(cardIds, cardIds);
    return cardIds.sort(() => 0.5 - Math.random()).slice(0, 30);
}

/**
 * Transfer a card from the player's deck to their hand.
 */
Player.prototype.drawCard = function() {
    if (this.deck.length > 0) {
        var newCard = this.deck.pop();
        this.hand.push(newCard);
        this.sendPacket("addCard", { player: this.id, card: newCard });
        this.game.getOpponent(this).sendPacket("addCard", { player: this.id });
    }
};

Player.prototype.spawnMinion = function (minionId) {
    var minionInfo = constants.minions[minionId];
    if (this.minions.length >= constants.player.MAX_MINIONS) {
        return false;
    }
    var copy = deepcopy(minionInfo);
    const plr = this;
    copy.hasAttack = minionInfo.attributes && minionInfo.attributes.indexOf('charge') > -1;
    copy.damage = function(amount) {
        copy.health -= amount;
        if (copy.health <= 0) {
            // TODO: implement deathrattle
            plr.minions.splice(plr.minions.indexOf(copy), 1);
            plr.game.sendPacket("removeMinion", {
                playerId: plr.id,
                minionInstanceId: copy.minionInstanceId
            });
        }
        else {
            plr.game.sendPacket("updateMinion", {
                playerId: plr.id,
                minionInstanceId: copy.minionInstanceId,
                health: copy.health
            });
        }
    };
    copy.minionInstanceId = this.game.minionIdCounter;
    this.game.minionIdCounter++;
    this.minions.push(copy);
    this.game.sendPacket("addMinion", {
        playerId: this.id,
        minionInstanceId: copy.minionInstanceId,
        minionId: minionInfo.id,
        hasAttack: copy.hasAttack
    });
    return true;
};

Player.prototype.damage = function(amount) {
    this.health -= amount;
    if (this.health <= 0) {
        this.game.end(this.game.getOpponent(this));
    }
    this.game.sendPacket("updatePlayer", { playerId: this.id, health: this.health });
};

Player.prototype.doAttack = function(from, to) {
    var fromMinion = this.minions.find((x) => x.minionInstanceId == from);

    if (!fromMinion) {
        // TODO: handle case where minion is not attacking
        return false;
    }

    var hasTaunt = this.game.getOpponent(this).minions.filter((x) => x.attributes && x.attributes.indexOf('taunt') > -1).length > 0;

    // check if minion has attack
    if (!fromMinion.hasAttack) {
        return;
    }

    if (to == "opponent") {
        if (!hasTaunt) {
            this.game.getOpponent(this).damage(fromMinion.attack);
        }
        else {
            // TODO: tell player that minion has taunt
            return false;
        }
    }
    else {
        var toMinion = this.game.getOpponent(this).minions.find((x) => x.minionInstanceId == to);
        if (hasTaunt && (!toMinion.attributes || toMinion.attributes.indexOf('taunt') < 0)) {
            // TODO: tell player that minion has taunt
            return false;
        }
        toMinion.damage(fromMinion.attack);
        fromMinion.damage(toMinion.attack);
    }
    fromMinion.hasAttack = false;
    this.game.sendPacket("updateMinion", {
        playerId: this.id,
        minionInstanceId: fromMinion.minionInstanceId,
        hasAttack: false
    });
};

Player.prototype.playCard = function(cardId, target) {
    if (this.game) {
        this.hand.splice(this.hand.indexOf(cardId), 1);
        var cardInfo = constants.cards[cardId];
        if (this.game.turn != this.id) {
            // TODO: tell player not their turn
            return false;
        }
        if (cardInfo.mana > this.mana) {
            // TODO: tell player not enough mana
            return false;
        }
        if (cardInfo.target && !target) {
            // TODO: tell player needs target
            return false;
        }
        var plr = this;
        var game = this.game;
        switch (cardInfo.type) {
            case 'minion':
                cardInfo.spawn.forEach(function(minionId) {
                    plr.spawnMinion(minionId);
                });
                break;
            case 'spell':
                cardInfo.actions.forEach(function(action) {
                    if (Array.isArray(action)) {
                        switch (action[0]) {
                            case 'draw':
                                for (var i = 0; i < action[1]; i++) {
                                    plr.drawCard();
                                }
                                break;
                            case 'damage':
                                if (target == "opponent") {
                                    game.getOpponent(plr).damage(action[1]);
                                }
                                else if (target == "player") {
                                    plr.damage(action[1]);
                                }
                                else {
                                    var toMinion = game.getOpponent(plr).minions.find((x) => x.minionInstanceId == target);
                                    if (!toMinion) {
                                        toMinion = plr.minions.find((x) => x.minionInstanceId == target);
                                    }
                                    toMinion.damage(action[1]);
                                }
                                break;
                            case 'all_damage':
                                plr.damage(action[1]);
                                var opp = game.getOpponent(plr);
                                opp.damage(action[1]);
                                for (var i = plr.minions.length - 1; i >= 0; i--) {
                                    plr.minions[i].damage(action[1]);
                                }
                                for (var i = opp.minions.length - 1; i >= 0; i--) {
                                    opp.minions[i].damage(action[1]);
                                }
                                break;
                        }
                    }
                });
                break;
        }
        this.mana -= cardInfo.mana;
        this.game.sendPacket("playCard", {
            playerMana: this.mana,
            playerId: this.id,
            cardId: cardId
        });
        return true;
    }
    else {
        throw "Tried to play card while not in game!";
    }
};

/*
 * Add a player to the queue of players searching for a game or start a new game with 2 players.
 */
Player.prototype.addToQueue = function() {
    if (queued.length > 0) {
        var opponent = queued.pop();
        var game = new Game(this, Player.get(opponent));
        game.init();
    }
    else {
        queued.push(this.id);
    }
};

module.exports = Player;
