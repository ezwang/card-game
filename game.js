var constants = require('./public/js/constants.js');

function Game(player1, player2) {
    if (!player1 || !player2) {
        throw new TypeError('The game constructor requires 2 players!');
    }

    this.p1 = player1;
    this.p2 = player2;
}

Game.prototype.sendPacket = function(type, data) {
    this.p1.sendPacket(type, data);
    this.p2.sendPacket(type, data);
};

function initPlayer(plr) {
    plr.health = constants.player.INITIAL_HEALTH;
    plr.mana = constants.player.INITIAL_MANA;
    plr.maxMana = constants.player.INITIAL_MANA;
    plr.minions = [];
}

Game.prototype.init = function() {
    initPlayer(this.p1);
    initPlayer(this.p2);

    this.minionIdCounter = 0;

    this.p1.game = this;
    this.p2.game = this;

    this.p1.deck = this.p1.getDeck();
    this.p2.deck = this.p2.getDeck();

    // move 3 cards from deck to hand
    this.p1.hand = this.p1.deck.slice(0, 3).map((x) => parseInt(x));
    this.p2.hand = this.p2.deck.slice(0, 3).map((x) => parseInt(x));

    this.p1.deck = this.p1.deck.slice(3);
    this.p2.deck = this.p2.deck.slice(3);

    this.turn = -1;

    var p1info = {
        id: this.p1.id,
        name: this.p1.username,
        health: this.p1.health,
        mana: this.p1.mana
    };
    var p2info = {
        id: this.p2.id,
        name: this.p2.username,
        health: this.p2.health,
        mana: this.p2.mana
    };
    this.setTurnTimer(constants.game.TURN_TIME);
    this.p1.sendPacket('gameInit', {
        player: p1info,
        opponent: p2info,
        playerHand: this.p1.hand,
        playerDeckSize: this.p1.deck.length,
        opponentDeckSize: this.p2.deck.length,
        opponentHandSize: this.p2.hand.length,
        turn: this.turn,
        turnTimer: this.turnTimer
    });
    this.p2.sendPacket('gameInit', {
        player: p2info,
        opponent: p1info,
        playerHand: this.p2.hand,
        playerDeckSize: this.p2.deck.length,
        opponentDeckSize: this.p1.deck.length,
        opponentHandSize: this.p1.hand.length,
        turn: this.turn,
        turnTimer: this.turnTimer
    });
    const game = this;
};

Game.prototype.initTurn = function() {
    this.turn = Math.random() > 0.5 ? this.p1.id : this.p2.id;

    // give the 2nd player to move a coin
    if (this.turn == this.p1.id) {
        this.p2.addCard(constants.player.COIN_ID);
    }
    else {
        this.p1.addCard(constants.player.COIN_ID);
    }

    this.setTurnTimer(constants.game.TURN_TIME);
    this.sendPacket('nextTurn', {
        turn: this.turn,
        turnTimer: this.turnTimer
    });
};

Game.prototype.doTimer = function(ref) {
    this.turnTimer -= 10;
    if (this.turnTimer <= 0) {
        if (this.turn != -1) {
            this.getPlayerById(this.turn).sendError('Your turn is over!');
            this.switchTurns(this.turn);
        }
        else {
            this.initTurn();
        }
    }
    this.sendPacket('gameTimer', this.turnTimer);
};

Game.prototype.end = function(winner) {
    this.sendPacket('gameEnd', {
        winner: winner.id
    });
    this.p1.game = null;
    this.p2.game = null;
    clearInterval(this.timerInterval);
};

Game.prototype.getOpponent = function(player) {
    if (player == this.p1) {
        return this.p2;
    }
    return this.p1;
};

Game.prototype.getPlayerById = function(player) {
    if (player == this.p1.id) {
        return this.p1;
    }
    else if (player == this.p2.id) {
        return this.p2;
    }
    throw new Error(`Could not find player with id: ${player}, valid options are [${this.p1.id}, ${this.p2.id}]!`);
};

Game.prototype.findMinion = function(minionInstanceId) {
    var minion = this.p1.minions.find((x) => x.minionInstanceId == minionInstanceId);
    if (typeof minion === 'undefined') {
        minion = this.p2.minions.find((x) => x.minionInstanceId == minionInstanceId);
    }
    return minion;
};

Game.prototype.setTurnTimer = function(time) {
    this.turnTimer = time;
    if (typeof this.timerInterval !== 'undefined') {
        clearInterval(this.timerInterval);
    }
    const game = this;
    this.timerInterval = setInterval(function() { game.doTimer(); }, 10000);
};

Game.prototype.switchTurns = function(playerId) {
    if (typeof playerId === 'undefined') {
        throw new Error('Must specify the current player id!');
    }
    var currentPlayer = this.getPlayerById(playerId);
    if (playerId != this.turn) {
        currentPlayer.sendError("It is not currently your turn!");
        return false;
    }
    currentPlayer.maxMana = Math.min(constants.player.MAX_MANA, currentPlayer.maxMana + 1);
    currentPlayer.mana = currentPlayer.maxMana;
    var opponent = this.getOpponent(currentPlayer);
    opponent.drawCard();
    this.turn = opponent.id;
    opponent.minions.forEach(function(x) {
        if (x.attack > 0) {
            x.hasAttack = true;
        }
        else {
            x.hasAttack = false;
        }
        if (x.events && x.events.turn_start) {
            opponent.processActions(x.events.turn_start, x.minionInstanceId).forEach((x) => x());
        }
    });
    currentPlayer.minions.forEach(function(x) {
        x.hasAttack = false;
        if (x.events && x.events.turn_end) {
            currentPlayer.processActions(x.events.turn_end, x.minionInstanceId).forEach((x) => x());
        }
    });
    this.setTurnTimer(constants.game.TURN_TIME);
    var info = {
        turn: this.turn,
        minionAttack: opponent.minions.map((x) => x.hasAttack),
        turnTimer: this.turnTimer
    };
    info[currentPlayer.id] = {
        mana: currentPlayer.mana,
        maxMana: currentPlayer.maxMana
    };
    info[opponent.id] = {
        mana: opponent.mana,
        maxMana: opponent.maxMana
    };
    this.sendPacket("nextTurn", info);
    return true;
};

module.exports = Game;
