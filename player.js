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
    copy._health = copy.health;
    copy._attack = copy.attack;
    const plr = this;
    copy.hasAttribute = function(attr) {
        if (!copy.attributes) {
            return false;
        }
        return copy.attributes.indexOf(attr) > -1;
    };
    copy.hasAttack = copy.hasAttribute('charge');
    delete copy.health;
    delete copy.attack;
    Object.defineProperty(copy, 'attack', {
        get: function() {
            return this._attack;
        },
        set: function(amount) {
            this._attack = amount;
            plr.game.sendPacket("updateMinion", {
                playerId: plr.id,
                minionInstanceId: this.minionInstanceId,
                attack: this.attack
            });
        }
    });
    Object.defineProperty(copy, 'health', {
        get: function() {
            return this._health;
        },
        set: function(amount) {
            var doingDamage = false;
            if (this._health > amount) {
                doingDamage = true;
            }
            if (doingDamage && this.hasAttribute('shield')) {
                this.attributes.splice(this.attributes.indexOf('shield'), 1);
            }
            else {
                this._health = amount;
            }
            if (this.health <= 0) {
                if (this.hasAttribute('deathrattle')) {
                    this.deathrattle.forEach(function(action) {
                        switch(action[0]) {
                            case 'spawn':
                                action[1].forEach(function(minionId) {
                                    plr.spawnMinion(minionId);
                                });
                                break;
                            default:
                                console.warn('Unknown deathrattle action: ' + action[0]);
                        }
                    });
                }
                plr.minions.splice(plr.minions.indexOf(copy), 1);
                plr.game.sendPacket("removeMinion", {
                    playerId: plr.id,
                    minionInstanceId: copy.minionInstanceId
                });
            }
            else {
                plr.game.sendPacket("updateMinion", {
                    playerId: plr.id,
                    minionInstanceId: this.minionInstanceId,
                    health: this.health,
                    attributes: this.attributes
                });
            }
        }
    });
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

Player.prototype.sendError = function(errorMsg) {
    this.sendPacket("error", errorMsg);
};

Player.prototype.doAttack = function(from, to) {
    var fromMinion = this.minions.find((x) => x.minionInstanceId == from);

    if (!fromMinion) {
        // TODO: handle case where minion is not attacking
        return false;
    }

    var hasTaunt = this.game.getOpponent(this).minions.filter((x) => x.hasAttribute('taunt')).length > 0;

    // check if minion has attack
    if (!fromMinion.hasAttack) {
        return;
    }

    if (to == "opponent") {
        if (!hasTaunt) {
            this.game.getOpponent(this).damage(fromMinion.attack);
        }
        else {
            this.sendError("You must attack a minion with taunt!");
            return false;
        }
    }
    else {
        var toMinion = this.game.getOpponent(this).minions.find((x) => x.minionInstanceId == to);
        if (toMinion) {
            if (hasTaunt && !toMinion.hasAttribute('taunt')) {
                this.sendError("You must attack a minion with taunt!");
                return false;
            }
            toMinion.health -= fromMinion.attack;
            fromMinion.health -= toMinion.attack;
        }
        else {
            this.sendError("Cannot attack that object!");
            return false;
        }
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
            this.sendError("It is not currently your turn!");
            return false;
        }
        if (cardInfo.mana > this.mana) {
            this.sendError("You do not have enough mana to play this card!");
            return false;
        }
        if (cardInfo.target && !target) {
            this.sendError("This card requires a target to be played on!");
            return false;
        }
        var plr = this;
        var game = this.game;
        var opp = game.getOpponent(plr);
        switch (cardInfo.type) {
            case 'minion':
                cardInfo.spawn.forEach(function(minionId) {
                    plr.spawnMinion(minionId);
                });
                break;
            case 'spell':
                break;
            default:
                console.warn('Unknown card type: ' + cardInfo.type);
                break;
        }
        if (cardInfo.actions) {
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
                                opp.damage(action[1]);
                            }
                            else if (target == "player") {
                                plr.damage(action[1]);
                            }
                            else {
                                var toMinion = game.getOpponent(plr).minions.find((x) => x.minionInstanceId == target);
                                if (typeof toMinion === 'undefined') {
                                    toMinion = plr.minions.find((x) => x.minionInstanceId == target);
                                }
                                toMinion.health -= action[1];
                            }
                            break;
                        case 'all_damage':
                            plr.damage(action[1]);
                            opp.damage(action[1]);
                            for (var i = plr.minions.length - 1; i >= 0; i--) {
                                plr.minions[i].health -= action[1];
                            }
                            for (var i = opp.minions.length - 1; i >= 0; i--) {
                                opp.minions[i].health -= action[1];
                            }
                            break;
                        case 'mana':
                            plr.mana += action[1];
                            game.sendPacket("updatePlayer", { playerId: plr.id, mana: plr.mana });
                            break;
                        case 'buff_attack_all':
                            for (var i = plr.minions.length - 1; i >= 0; i--) {
                                plr.minions[i].attack += action[1];
                            }
                            break;
                        case 'buff_health_all':
                            for (var i = plr.minions.length - 1; i >= 0; i--) {
                                plr.minions[i].health += action[1];
                            }
                            break;
                        case 'discard':
                            for (var i = 0; i < action[1]; i++) {
                                if (plr.hand.length > 0) {
                                    var random = Math.floor(plr.hand.length * Math.random());
                                    var cardId = plr.hand.splice(random, 1)[0];
                                    game.sendPacket("discardCard", {
                                        playerId: this.id,
                                        cardId: cardId
                                    });
                                }
                            }
                            break;
                        case 'damage_opponent':
                            opp.damage(action[1]);
                            break;
                        default:
                            console.warn('Unknown spell card action: ' + action[0]);
                            break;
                    }
                }
            });
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
