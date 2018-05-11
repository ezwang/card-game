function createButton(text, callback) {
    var button = new PIXI.Text(text, new PIXI.TextStyle({
        fill: '#ffffff'
    }));
    button.interactive = true;
    button.buttonMode = true;
    button.on('pointerdown', callback);
    button.anchor.set(0.5);
    return button;
}

function createMinion(minionInfo, minionId) {
    var minion = new PIXI.Container();
    minion.id = minionInfo.id;
    minion.minionInstanceId = minionId;
    minion.attackData = minionId;
    var background = PIXI.Sprite.fromImage('./img/minion.png');
    background.width = 80;
    background.height = 80;

    var health = new PIXI.Text(minionInfo.health, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#ff0000',
            dropShadow: true,
            dropShadowDistance: 1
    }));
    minion.interactive = true;
    minion.buttonMode = true;
    minion.healthText = health;
    health.anchor.set(0.5);
    health.x = 70;
    health.y = 70;

    var attack = new PIXI.Text(minionInfo.attack, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#ffff00',
            dropShadow: true,
            dropShadowDistance: 1
    }));
    minion.attackText = attack;
    attack.anchor.set(0.5);
    attack.x = 15;
    attack.y = 70;

    minion.addChild(background);

    if (minionInfo.attributes) {
        if (minionInfo.attributes.indexOf('taunt') > -1) {
            var shield = PIXI.Sprite.fromImage('./img/shield.png');
            shield.anchor.set(0.5);
            shield.width = 20;
            shield.height = 20;
            shield.x = 40;
            shield.y = 60;
            minion.addChild(shield);
        }
    }
    minion.addChild(health);
    minion.addChild(attack);
    return minion;
}

function createCard(cardInfo) {
    var card = new PIXI.Container();
    card.id = cardInfo.id;
    card.mana = cardInfo.mana;
    var background = PIXI.Sprite.fromImage('./img/card.png');
    var image = new PIXI.Graphics();
    image.beginFill(0xff00ff);
    image.drawRect(0, 0, 160, 100);
    image.x = 15;
    image.y = 15;
    var title = new PIXI.Text(cardInfo.name || 'Untitled Card', new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 20
    }));
    title.anchor.set(0.5);
    title.x = 100;
    title.y = 120;
    var description = new PIXI.Text(cardInfo.description, new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 14,
        wordWrap: true,
        wordWrapWidth: 150
    }));
    description.anchor.set(0.5, 0);
    description.x = 100;
    description.y = 140;
    background.width = 200;
    background.height = 250;
    var type;
    if (cardInfo.type == 'minion') {
        type = 'Minion x ' + cardInfo.spawn.length;
    }
    else if (cardInfo.type == 'spell') {
        type = 'Spell';
    }
    type = new PIXI.Text(type, new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 14,
        wordWrap: true,
        wordWrapWidth: 150
    }));
    type.anchor.set(0.5, 0);
    type.x = 100;
    type.y = 210;
    var mana = new PIXI.Text(cardInfo.mana, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#0000ff',
            dropShadow: true,
            dropShadowDistance: 1
    }));
    mana.y = 10;
    mana.x = 160;
    card.interative = true;
    card.buttonMode = true;
    card.addChild(image);
    card.addChild(background);
    card.addChild(title);
    card.addChild(mana);
    card.addChild(description);
    card.addChild(type);
    card.interative = true;
    card.buttonMode = true;
    if (cardInfo.spawn) {
        var minion = constants.minions[cardInfo.spawn[0]];
        var health = new PIXI.Text(minion.health, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#ff0000',
            dropShadow: true,
            dropShadowDistance: 1
        }));
        health.anchor.set(0.5);
        health.x = 180;
        health.y = 220;
        var attack = new PIXI.Text(minion.attack, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#cccc00',
            dropShadow: true,
            dropShadowDistance: 1
        }));
        attack.anchor.set(0.5);
        attack.x = 30;
        attack.y = 220;
        card.addChild(health);
        card.addChild(attack);
    }
    card.interactive = true;
    card.buttonMode = true;
    return card;
}

var game = {
    getScreenWidth: function() {
        return 800;
    },
    getScreenHeight: function() {
        return 600;
    },
    init: function() {
        game.pixi = new PIXI.Application(game.getScreenWidth(), game.getScreenHeight());
        document.body.appendChild(game.pixi.view);

        // initialize pixi containers
        game.containers = [];

        // waiting screen
        var queuedContainer = new PIXI.Container();
        game.queuedContainer = queuedContainer;
        var loadingMessage = new PIXI.Text('Finding an opponent...', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: '#ffffff'
        }));
        loadingMessage.anchor.set(0.5);
        loadingMessage.x = game.getScreenWidth() / 2;
        loadingMessage.y = 100;
        queuedContainer.addChild(loadingMessage);
        game.pixi.stage.addChild(queuedContainer);
        game.containers.push(queuedContainer);

        // main menu screen
        var lobbyContainer = new PIXI.Container();
        game.lobbyContainer = lobbyContainer;
        var gameTitle = new PIXI.Text('Card Game', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: '#ffffff'
        }));
        gameTitle.anchor.set(0.5);
        gameTitle.x = game.getScreenWidth() / 2;
        gameTitle.y = 100;
        lobbyContainer.addChild(gameTitle);
        var playButton = createButton('Play', function() {
            game.sendPacket('queue');
        });
        playButton.x = game.getScreenWidth() / 2;
        playButton.y = 100 + 100;
        lobbyContainer.addChild(playButton);
        game.pixi.stage.addChild(lobbyContainer);
        game.containers.push(lobbyContainer);

        // game screen
        var gameContainer = new PIXI.Container();
        game.gameContainer = gameContainer;

        game.statusText = {};
        var infoFont = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 16,
            fill: '#ffffff'
        });
        var playerInfo = new PIXI.Text('Unknown vs. Unknown', infoFont);
        var turnStatus = new PIXI.Text('Unknown', infoFont);
        turnStatus.y = 18;
        var playerPortrait = new PIXI.Graphics();
        playerPortrait.beginFill(0xffff00);
        playerPortrait.drawRect(0, 0, 100, 120);
        playerPortrait.x = game.getScreenWidth() / 2 - 50;
        playerPortrait.y = game.getScreenHeight() - 25 - playerPortrait.height - 100;
        playerPortrait.interactive = true;
        playerPortrait.attackData = "player";

        var opponentPortrait = new PIXI.Graphics();
        opponentPortrait.beginFill(0xffff00);
        opponentPortrait.drawRect(0, 0, 100, 120);
        opponentPortrait.x = game.getScreenWidth() / 2 - 50;
        opponentPortrait.y = 25;
        opponentPortrait.interactive = true;
        opponentPortrait.attackData = "opponent";

        playerPortrait.on('mouseup', function() {
            if (game.selectedMinion) {
                game.doAttack(game.selectedMinion, playerPortrait);
            }
            else if (game.selectedCard) {
                game.selectedCard.filters = game.selectedCard.oldFilters;
                game.playCard(game.selectedCard, playerPortrait.attackData);
                game.selectedCard = null;
            }
        });

        opponentPortrait.on('mouseup', function() {
            if (game.selectedMinion) {
                game.doAttack(game.selectedMinion, opponentPortrait);
            }
            else if (game.selectedCard) {
                game.selectedCard.filters = game.selectedCard.oldFilters;
                game.playCard(game.selectedCard, opponentPortrait.attackData);
                game.selectedCard = null;
            }
        });

        var playerHealth = new PIXI.Text('??', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#ff0000'
        }));
        playerHealth.x = 85;
        playerHealth.y = 105;
        var playerMana = new PIXI.Text('??', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#0000ff'
        }));
        playerMana.x = -5;
        playerMana.y = 105;
        var opponentHealth = new PIXI.Text('??', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#ff0000'
        }));
        opponentHealth.x = 85;
        opponentHealth.y = 105;
        var opponentMana = new PIXI.Text('??', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 32,
            fill: '#0000ff'
        }));
        opponentMana.x = -5;
        opponentMana.y = 105;
        game.statusText.turnStatus = turnStatus;
        game.statusText.playerHealth = playerHealth;
        game.statusText.opponentHealth = opponentHealth;
        game.statusText.playerMana = playerMana;
        game.statusText.opponentMana = opponentMana;
        game.statusText.playerInfo = playerInfo;
        playerPortrait.addChild(playerHealth);
        opponentPortrait.addChild(opponentHealth);
        playerPortrait.addChild(playerMana);
        opponentPortrait.addChild(opponentMana);

        var endTurn = new PIXI.Text("End Turn", new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fill: '#ffffff'
        }));
        game.statusText.endTurn = endTurn;
        endTurn.x = game.getScreenWidth() - 90;
        endTurn.y = game.getScreenHeight() / 2 + 60;
        endTurn.interactive = true;
        endTurn.buttonMode = true;
        endTurn.on('click', function() {
            game.sendPacket('endTurn');
        });

        var playerCards = new PIXI.Container();
        playerCards.x = 5;
        playerCards.y = game.getScreenHeight() - 130;
        game.playerCardContainer = playerCards;
        gameContainer.addChild(playerCards);

        var playerMinions = new PIXI.Container();
        var minionBg = new PIXI.Graphics();
        minionBg.beginFill(0xcccccc);
        minionBg.drawRect(0, 0, 790, 100);
        playerMinions.addChild(minionBg);
        playerMinions.x = 5;
        playerMinions.y = 250;
        game.playerMinionContainer = playerMinions;
        gameContainer.addChild(playerMinions);

        var opponentMinions = new PIXI.Container();
        minionBg = new PIXI.Graphics();
        minionBg.beginFill(0xdddddd);
        minionBg.drawRect(0, 0, 790, 100);
        opponentMinions.addChild(minionBg);
        opponentMinions.x = 5;
        opponentMinions.y = 150;
        game.opponentMinionContainer = opponentMinions;
        gameContainer.addChild(opponentMinions);

        // victory screen
        var endContainer = new PIXI.Container();
        game.endContainer = endContainer;
        game.statusText.endText = new PIXI.Text('Unknown!', new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fill: '#0000ff'
        }));
        game.statusText.endText.anchor.set(0.5);
        game.statusText.endText.x = game.getScreenWidth() / 2;
        game.statusText.endText.y = game.getScreenHeight() / 2;
        var fadedBg = new PIXI.Graphics();
        fadedBg.beginFill(0x000000);
        fadedBg.drawRect(0, 0, game.getScreenWidth(), game.getScreenHeight());
        fadedBg.alpha = 0.5;
        fadedBg.interactive = true;
        endContainer.addChild(fadedBg);
        endContainer.addChild(game.statusText.endText);

        var endButton = createButton('End Game', function() {
            endContainer.visible = false;
            game.setGameState('lobby');
        });
        endButton.x = game.getScreenWidth() / 2;
        endButton.y = game.getScreenHeight() / 2 + 100;
        endContainer.addChild(endButton);

        gameContainer.addChild(playerPortrait);
        gameContainer.addChild(opponentPortrait);
        gameContainer.addChild(playerInfo);
        gameContainer.addChild(turnStatus);
        gameContainer.addChild(endContainer);
        gameContainer.addChild(endTurn);

        game.pixi.stage.addChild(gameContainer);
        game.containers.push(gameContainer);

        game.animations = [];
        game.pixi.ticker.add(game.processAnimations);
    },
    playCard: function(card, target) {
        game.sendPacket("playCard", { card: card.id, target: target });
    },
    resize: function() {
        game.pixi.renderer.resize(game.getScreenWidth(), game.getScreenHeight());
    },
    processAnimations: function(delta) {
        game.animations = game.animations.filter(function(anim) {
            anim.obj[anim.field] += (anim.speed || 0.1) * delta;
            if (anim.obj[anim.field] >= 1) {
                anim.obj[anim.field] = 1;
                if (anim.callback) {
                    anim.callback();
                }
                return false;
            }
            else if (anim.obj[anim.field] <= 0) {
                anim.obj[anim.field] = 0;
                if (anim.callback) {
                    anim.callback();
                }
                return false;
            }
            return true;
        });
    },
    connect: function(username) {
        game.ws = new WebSocket("ws://" + window.location.host + window.location.pathname);
        game.ws.onopen = function() {
            game.sendPacket("auth", username);
        };
        game.ws.onmessage = game.receivePacket;
        game.ws.onclose = function() {
            $("#login-container").fadeIn();
            game.ws = null;
        };
    },
    sendPacket(type, data) {
        if (game.ws && game.ws.readyState == 1) {
            game.ws.send(JSON.stringify({
                type: type,
                data: data
            }));
        }
        else {
            console.warn("Failed to send packet " + type + " " + JSON.stringify(data) + ", socket not open.");
        }
    },
    setGameState: function(state) {
        game.containers.forEach(function(e) {
            e.visible = false;
        });
        switch (state) {
            case 'lobby':
                game.sendPacket('queue'); // TODO: remove, debugging only
                game.lobbyContainer.visible = true;
                break;
            case 'queued':
                game.queuedContainer.visible = true;
                break;
            case 'game':
                game.gameContainer.visible = true;
                game.endContainer.visible = false;
                break;
            default:
                console.warn('Invalid game state requested: ' + state);
        }
    },
    updateInfo: function(info, value) {
        switch (info) {
            case 'player_names':
                game.statusText.playerInfo.text = value[0] + ' vs. ' + value[1];
                break;
            case 'player_health':
                game.playerHealth = value;
                game.statusText.playerHealth.text = value;
                break;
            case 'opponent_health':
                game.opponentHealth = value;
                game.statusText.opponentHealth.text = value;
                break;
            case 'player_mana':
                game.playerMana = value;
                game.statusText.playerMana.text = value;
                break;
            case 'opponent_mana':
                game.opponentMana = value;
                game.statusText.opponentMana.text = value;
                break;
            case 'player_turn':
                game.statusText.endTurn.style.fill = value ? '#ffffff' : '#aaaaaa';
                game.statusText.turnStatus.text = value ? 'Your Turn' : "Opponent's Turn";
                break;
            default:
                console.warn('No information update handler for ' + info + ' -> ' + value + '.');
                break;
        }
    },
    removeCard(player, card) {
        if (player == game.playerId) {
            var cardIndex = game.playerHand.map((x) => x.id).indexOf(card);
            game.playerCardContainer.removeChild(game.playerHand[cardIndex]);
            game.playerHand.splice(cardIndex, 1);
            game.reorderCards();
        }
        else {
            // TODO: implement
        }
    },
    addCard(player, card) {
        if (player == game.playerId) {
            var card = createCard(constants.cards[card]);
            card.on('mouseover', function() {
                if (game.cardPreview) {
                    game.pixi.stage.removeChild(game.cardPreview);
                    game.cardPreview = null;
                }
                game.cardPreview = createCard(constants.cards[card.id]);
                game.cardPreview.interactive = false;
                game.playerCardContainer.removeChild(card);
                game.playerCardContainer.addChild(card);
                game.cardPreview.x = (game.getScreenWidth() - game.cardPreview.width) / 2;
                game.cardPreview.y = (game.getScreenHeight() - game.cardPreview.height) / 2;
                card.oldFilters = card.filters;
                card.filters = [ new PIXI.filters.GlowFilter(5, 2, 2, 0x00ff00, 0.5) ];
                game.pixi.stage.addChild(game.cardPreview);
            });
            card.on('mousedown', function() {
                if (game.cardPreview) {
                    game.pixi.stage.removeChild(game.cardPreview);
                    game.cardPreview = null;
                }
                card.filters = [ new PIXI.filters.GlowFilter(5, 2, 2, 0x0000ff, 0.5) ];
                game.selectedCard = card;
            });
            card.on('mouseup', function() {
                card.filters = card.oldFilters;
                game.selectedCard = null;
            });
            card.on('mouseout', function() {
                if (game.cardPreview && card.id == game.cardPreview.id) {
                    game.pixi.stage.removeChild(game.cardPreview);
                    game.cardPreview = null;
                    card.filters = card.oldFilters;
                }
            });
            game.playerHand.push(card);
            card.width /= 2;
            card.height /= 2;
            game.playerCardContainer.addChild(card);
            game.reorderCards();
        }
        else {
            // TODO: render opponent cards
        }
    },
    checkCanMove: function() {
        if (game.turn == game.playerId) {
            if (game.playerHand.filter((x) => x.mana <= game.playerMana).length > 0) {
                return true;
            }
            if (game.playerArmy.filter((x) => x.hasAttack).length > 0) {
                return true;
            }
            game.sendPacket('endTurn');
        }
    },
    doAttack: function(from, to) {
        game.sendPacket("doAttack", { from: from.attackData, to: to.attackData });
        setTimeout(game.checkCanMove, constants.player.NO_MOVE_DELAY);
    },
    spawnMinion: function(playerId, minionId, hasAttack, minionInstanceId) {
        var minion = createMinion(constants.minions[minionId], minionInstanceId);
        minion.on('mousedown', function() {
            game.selectedMinion = minion;
            minion.oldFilters = minion.filters;
            minion.filters = [new PIXI.filters.GlowFilter(2, 2, 2, 0x0000ff, 0.5)];
        });
        minion.on('mouseup', function() {
            if (game.selectedMinion && game.selectedMinion != minion) {
                game.doAttack(game.selectedMinion, minion);
            }
            else if (game.selectedCard) {
                game.selectedCard.filters = game.selectedCard.oldFilters;
                game.playCard(game.selectedCard, minion.minionInstanceId);
                game.selectedCard = null;
            }
        });
        minion.hasAttack = hasAttack;
        if (game.playerId == playerId) {
            game.playerMinionContainer.addChild(minion);
            game.playerArmy.push(minion);
        }
        else {
            game.opponentMinionContainer.addChild(minion);
            game.opponentArmy.push(minion);
        }
        minion.alpha = 0;
        game.animations.push({
            field: 'alpha',
            obj: minion,
            speed: 0.15
        });
        game.refreshMinions();
    },
    refreshMinions: function() {
        var opponentOffset = (constants.player.MAX_MINIONS - game.opponentArmy.length) * 50;
        for (var i = 0; i < game.opponentArmy.length; i++) {
            if (game.opponentArmy[i].hasAttack) {
                game.opponentArmy[i].filters = [ new PIXI.filters.GlowFilter(2, 2, 2, 0x00ff00, 0.5) ];
            }
            else {
                game.opponentArmy[i].filters = [];
            }
            game.opponentArmy[i].x = 100 * i + opponentOffset;
        }
        var playerOffset = (constants.player.MAX_MINIONS - game.playerArmy.length) * 50;
        for (var i = 0; i < game.playerArmy.length; i++) {
            if (game.playerArmy[i].hasAttack) {
                game.playerArmy[i].filters = [ new PIXI.filters.GlowFilter(2, 2, 2, 0x00ff00, 0.5) ];
            }
            else {
                game.playerArmy[i].filters = [];
            }
            game.playerArmy[i].x = 100 * i + playerOffset;
        }
    },
    reorderCards: function() {
        var order = [];
        for (var i = 0; i < 10; i++) {
            var temp = {};
            temp.y = -15 * Math.abs(5 - i) + 50;
            temp.x = 80 * i;
            order.push(temp);
        }
        var isPlayerTurn = game.turn == game.playerId;
        for (var i = 0; i < game.playerHand.length; i++) {
            var temp = order[5 + Math.floor((i + 1) / 2) * (i % 2 == 0 ? 1 : -1)];
            game.playerHand[i].x = temp.x;
            game.playerHand[i].y = temp.y;
            if (game.playerHand[i].mana <= game.playerMana && isPlayerTurn) {
                game.playerHand[i].filters = [ new PIXI.filters.GlowFilter(2, 2, 2, 0x00ff00, 0.5) ];
            }
            else {
                game.playerHand[i].filters = [];
            }
        }
    },
    showError: function(errorMsg) {
        var errorText = new PIXI.Text(errorMsg, new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 18,
            fill: '#ff0000'
        }));
        errorText.y = 38;
        game.pixi.stage.addChild(errorText);
        setTimeout(function() {
            game.animations.push({
                field: 'alpha',
                obj: errorText,
                speed: -0.1,
                callback: function() {
                    game.pixi.stage.removeChild(errorText);
                }
            });
        }, 1000);
    },
    receivePacket: function(data) {
        var data = JSON.parse(data.data);
        switch (data.type) {
            case 'gameState':
                game.setGameState(data.data);
                break;
            case 'gameInit':
                game.setGameState('game');
                game.playerHand = [];
                game.playerArmy = [];
                game.opponentArmy = [];
                game.playerId = data.data.player.id;
                game.opponentId = data.data.opponent.id;
                game.turn = data.data.turn;
                game.updateInfo("player_turn", data.data.player.id == game.turn);
                game.updateInfo("player_names", [data.data.player.name, data.data.opponent.name]);
                game.updateInfo("player_health", data.data.player.health);
                game.updateInfo("player_mana", data.data.player.mana);
                game.updateInfo("opponent_health", data.data.opponent.health);
                game.updateInfo("opponent_mana", data.data.opponent.mana);
                data.data.playerHand.forEach(function(card) {
                    game.addCard(game.playerId, card);
                });
                game.reorderCards();
                break;
            case 'updatePlayer':
                if (data.data.health) {
                    if (data.data.playerId == game.playerId) {
                        game.updateInfo('player_health', data.data.health);
                    }
                    else {
                        game.updateInfo('opponent_health', data.data.health);
                    }
                }
                break;
            case 'updateMinion':
                var instId = data.data.minionInstanceId;
                var process = function(minion) {
                    if (minion.minionInstanceId == instId) {
                        if (typeof data.data.hasAttack !== 'undefined') {
                            minion.hasAttack = data.data.hasAttack;
                        }
                        if (typeof data.data.health !== 'undefined') {
                            minion.health = data.data.health;
                            minion.healthText.text = data.data.health;
                        }
                        return true;
                    }
                    return false;
                }
                game.playerArmy.find(process);
                game.opponentArmy.find(process);
                game.refreshMinions();
                break;
            case 'removeMinion':
                var instId = data.data.minionInstanceId;
                game.playerArmy = game.playerArmy.filter(function(minion) {
                    if (minion.minionInstanceId == instId) {
                        game.playerMinionContainer.removeChild(minion);
                        return false;
                    }
                    return true;
                });
                game.opponentArmy = game.opponentArmy.filter(function(minion) {
                    if (minion.minionInstanceId == instId) {
                        game.opponentMinionContainer.removeChild(minion);
                        return false;
                    }
                    return true;
                });
                game.refreshMinions();
                break;
            case 'addCard':
                if (data.data.player == game.playerId) {
                    game.addCard(game.playerId, data.data.card);
                }
                else {
                    // TODO: implement showing opponent cards
                }
                break;
            case 'nextTurn':
                game.turn = data.data.turn;
                game.updateInfo("player_turn", game.playerId == game.turn);
                game.updateInfo("player_mana", data.data[game.playerId].mana);
                game.updateInfo("opponent_mana", data.data[game.opponentId].mana);
                var min;
                var oth;
                if (game.playerId == game.turn) {
                    min = game.playerArmy;
                    oth = game.opponentArmy;
                }
                else {
                    min = game.opponentArmy;
                    oth = game.playerArmy;
                }
                for (var i = 0; i < min.length; i++) {
                    min[i].hasAttack = data.data.minionAttack[i];
                }
                for (var i = 0; i < oth.length; i++) {
                    oth[i].hasAttack = false;
                }
                game.refreshMinions();
                game.reorderCards();
                setTimeout(game.checkCanMove, constants.player.NO_MOVE_DELAY);
                break;
            case 'gameEnd':
                game.statusText.endText.text = data.data.winner == game.playerId ? 'Winner!' : 'Loser!';
                game.endContainer.visible = true;
                break;
            case 'playCard':
                if (game.playerId == data.data.playerId) {
                    game.updateInfo("player_mana", data.data.playerMana);
                    game.removeCard(game.playerId, data.data.cardId);
                }
                else {
                    game.updateInfo("opponent_mana", data.data.playerMana);
                    // TODO: handle opponent play card
                }
                game.reorderCards();
                setTimeout(game.checkCanMove, constants.player.NO_MOVE_DELAY);
                break;
            case 'addMinion':
                game.spawnMinion(data.data.playerId, data.data.minionId, data.data.hasAttack, data.data.minionInstanceId);
                break;
            case 'error':
                game.showError(data.data);
                break;
            default:
                console.warn("Unknown packet: " + JSON.stringify(data));
                break;
        }
    }
};

$(document).ready(game.init);
$(window).resize(game.resize);

$(document).ready(function() {
    $("#login input[type=text]").keyup(function(e) {
        if (e.which == 13) {
            $("#login button[type=submit]").click();
        }
    });
    $("#login button[type=submit]").click(function(e) {
        e.preventDefault();
        var username = $("#username").val();
        if (username) {
            game.connect(username);
            $("#login-container").fadeOut();
        }
        else {
            $("#login .error").text("Please enter a username to play the game!");
        }
    });
    $("body").mouseup(function() {
        if (game.selectedCard) {
            game.selectedCard.filters = game.selectedCard.oldFilters;
            game.playCard(game.selectedCard);
            game.selectedCard = null;
        }
        if (game.selectedMinion) {
            game.selectedMinion.filters = game.selectedMinion.oldFilters;
            game.selectedMinion = null;
        }
    });

    // if username was saved in localstorage, automatically fill
    var username = localStorage.getItem("username");
    if (username) {
        $("#username").val(username);
        $("#login button[type=submit]").click();
    }
});
