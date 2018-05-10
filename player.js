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
    this.minions.push(deepcopy(minionInfo));
    game.sendPacket("addMinion", {
        playerId: this.id,
        minionId: minionInfo.id
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
        var playCard;
        switch (cardInfo.type) {
            case 'minion':
                var game = this.game;
                cardInfo.spawn.forEach(function(minionId) {
                    this.spawnMinion(minionId);
                });
                break;
            case 'spell':
                var plr = this;
                cardInfo.actions.forEach(function(action) {
                    if (Array.isArray(action)) {
                        switch (action[0]) {
                            case 'draw':
                                for (var i = 0; i < action[1]; i++) {
                                    plr.drawCard();
                                }
                                break;
                            case 'damage':
                                if (!target) {
                                    playCard = false;
                                    return false;
                                }
                                // TODO: implement damage
                                break;
                        }
                    }
                });
                break;
        }
        if (!playCard) {
            // TODO: notify player conditions not met to play card
            return false;
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
