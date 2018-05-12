function createButton(text, callback) {
    var button = new PIXI.Text(text, new PIXI.TextStyle({
        fontFamily: 'Pangolin',
        fill: '#ffffff',
        fontSize: 36
    }));
    button.on('mouseover', function() {
        button.style.fill = '#aaaaaa';
    });
    button.on('mouseout', function() {
        button.style.fill = '#ffffff';
    });
    button.interactive = true;
    button.buttonMode = true;
    button.on('pointerdown', callback);
    button.anchor.set(0.5);
    return button;
}

function createMinion(minionInfo, minionId) {
    var minion = new PIXI.Container();
    minion.id = minionInfo.id;
    minion._health = minionInfo.health;
    minion._attack = minionInfo.attack;
    minion._attributes = minionInfo.attributes || [];
    minion.minionInstanceId = minionId;
    minion.attackData = minionId;
    Object.defineProperty(minion, 'health', {
        set: function(x) {
            if (this._health > x) {
                createDamageEffect(minion, 40, 40);
            }
            this._health = x;
            this.healthText.text = x;
        },
        get: function() { return this._health; }
    });
    Object.defineProperty(minion, 'attack', {
        set: function(x) { this._attack = x; this.attackText.text = x; },
        get: function() { return this._attack; }
    });
    Object.defineProperty(minion, 'attributes', {
        set: function(x) { this._attributes = x; this.regenAttributes(); },
        get: function() { return this._attributes }
    });
    var background = PIXI.Sprite.fromImage('./img/minion.png');
    background.width = 80;
    background.height = 80;

    var health = new PIXI.Text(minion.health, new PIXI.TextStyle({
            fontFamily: 'Pangolin',
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

    var attack = new PIXI.Text(minion.attack, new PIXI.TextStyle({
            fontFamily: 'Pangolin',
            fontSize: 32,
            fill: '#ffff00',
            dropShadow: true,
            dropShadowDistance: 1
    }));
    minion.attackText = attack;
    attack.anchor.set(0.5);
    attack.x = 15;
    attack.y = 70;

    var name = new PIXI.Text(minionInfo.name, new PIXI.TextStyle({
        fontFamily: 'Pangolin',
        fontSize: 12
    }));
    name.anchor.set(0.5);
    name.x = 40;
    name.y = 10;

    minion.addChild(background);
    minion.addChild(name);

    minion.attributeSprites = {};
    minion.regenAttributes = function() {
        Object.keys(minion.attributeSprites).forEach(function(attr) {
            minion.removeChild(minion.attributeSprites[attr]);
        });
        minion.attributeSprites = {};
        if (minion.attributes) {
            game.ATTRIBUTE_MAP.forEach(function(attr) {
                if (minion.attributes.indexOf(attr[0]) > -1) {
                    var attrSprite = PIXI.Sprite.fromImage(attr[1]);
                    attrSprite.anchor.set(0.5);
                    attrSprite.width = 20;
                    attrSprite.height = 20;
                    attrSprite.x = 40;
                    attrSprite.y = 60;
                    minion.attributeSprites[attr[0]] = attrSprite;
                    minion.addChild(attrSprite);
                }
            });
        }
    }
    minion.regenAttributes();

    minion.addChild(health);
    minion.addChild(attack);
    return minion;
}

function createDamageEffect(item, x, y) {
    var emitter = new PIXI.particles.Emitter(item, [PIXI.Texture.fromImage('./img/particle.png')], {
        pos: {
            x: x,
            y: y
        },
        frequency: 0.01,
        spawnChance: 1,
        particlesPerWave: 1,
        maxParticles: 1000,
        lifetime: {
            min: 0.5,
            max: 0.5
        },
        startRotation: {
            min: 0,
            max: 360
        },
        alpha: {
            list: [{ value: 0.5, time: 0 }, { value: 0.1, time: 1 }],
            isStepped: false
        },
        color: {
            list: [{value: "ff0000", time: 0}, {value: "cc0000", time: 1}],
            isStepped: false
        },
        speed: {
            list: [{value: 100, time: 0}, {value: 50, time: 1}],
            isStepped: false
        },
        emitterLifetime: 0.1
    });
    emitter.emit = true;
    emitter.playOnceAndDestroy();
}

function createCard(cardInfo) {
    var card = new PIXI.Container();
    card.id = cardInfo.id;
    card.target = cardInfo.target;
    card._mana = cardInfo.mana;
    Object.defineProperty(card, 'mana', {
        set: function(x) { card._mana = x; card.manaText.text = x; },
        get: function() { return card._mana; }
    });
    var background = PIXI.Sprite.fromImage('./img/card.png');
    var image = new PIXI.Graphics();
    image.beginFill(0xff00ff);
    image.drawRect(0, 0, 160, 100);
    image.x = 15;
    image.y = 15;
    var title = new PIXI.Text(cardInfo.name || 'Untitled Card', new PIXI.TextStyle({
        fontFamily: 'Pangolin',
        fontSize: 20
    }));
    title.anchor.set(0.5);
    title.x = 100;
    title.y = 120;
    var description = new PIXI.Text(cardInfo.description, new PIXI.TextStyle({
        fontFamily: 'Pangolin',
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
        fontFamily: 'Pangolin',
        fontSize: 14,
        wordWrap: true,
        wordWrapWidth: 150
    }));
    type.anchor.set(0.5, 0);
    type.x = 100;
    type.y = 210;
    var mana = new PIXI.Text(cardInfo.mana, new PIXI.TextStyle({
            fontFamily: 'Pangolin',
            fontSize: 32,
            fill: '#0000ff',
            dropShadow: true,
            dropShadowDistance: 1
    }));
    card.manaText = mana;
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
            fontFamily: 'Pangolin',
            fontSize: 32,
            fill: '#ff0000',
            dropShadow: true,
            dropShadowDistance: 1
        }));
        health.anchor.set(0.5);
        health.x = 180;
        health.y = 220;
        var attack = new PIXI.Text(minion.attack, new PIXI.TextStyle({
            fontFamily: 'Pangolin',
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

        if (minion.attributes) {
            var i = 0;
            game.ATTRIBUTE_MAP.forEach(function(attr) {
                if (minion.attributes.indexOf(attr[0]) > -1) {
                    var attrSprite = PIXI.Sprite.fromImage(attr[1]);
                    attrSprite.anchor.set(0.5);
                    attrSprite.alpha = 0.8;
                    attrSprite.width = 20;
                    attrSprite.height = 20;
                    attrSprite.x = background.width - 40 - 20 * i;
                    attrSprite.y = background.height - 40;
                    card.addChild(attrSprite);
                    i++;
                }
            });
        }
    }
    card.interactive = true;
    card.buttonMode = true;
    return card;
}

var game = {
    ATTRIBUTE_MAP: [['charge', './img/charge.png'], ['taunt', './img/taunt.png'], ['deathrattle', './img/deathrattle.png'], ['shield', './img/shield.png'], ['special', './img/special.png']],
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
            fontFamily: 'Pangolin',
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

        var cardBack = PIXI.Sprite.fromImage('./img/card_back.png');
        cardBack.anchor.set(0.5);
        cardBack.alpha = 0.3;
        cardBack.width = 400;
        cardBack.height = 500;
        cardBack.x = game.getScreenWidth() / 2;
        cardBack.y = game.getScreenHeight() / 2;
        cardBack.rotation = 15;
        lobbyContainer.addChild(cardBack);

        var gameTitle = PIXI.Sprite.fromImage('./img/logo.png');
        gameTitle.anchor.set(0.5);
        gameTitle.x = game.getScreenWidth() / 2;
        gameTitle.y = 125;
        lobbyContainer.addChild(gameTitle);
        var playButton = createButton('Play', function() {
            game.sendPacket('queue');
        });
        playButton.x = game.getScreenWidth() / 2;
        playButton.y = 125 + 140;
        var cardButton = createButton('Your Cards', function() {
            game.setGameState('cards');
        });
        cardButton.x = game.getScreenWidth() / 2;
        cardButton.y = 125 + 140 + 50;
        lobbyContainer.addChild(cardButton);
        lobbyContainer.addChild(playButton);
        game.pixi.stage.addChild(lobbyContainer);
        game.containers.push(lobbyContainer);

        // cards screen
        var cardsContainer = new PIXI.Container();
        game.cardsContainer = cardsContainer;

        var cardCollectionTitle = new PIXI.Text('Your Cards', new PIXI.TextStyle({
            fill: '#ffffff',
            fontSize: 48,
            fontFamily: 'Pangolin'
        }));
        cardCollectionTitle.x = 10;
        cardCollectionTitle.y = 10;
        cardBack = PIXI.Sprite.fromImage('./img/card_back.png');
        cardBack.anchor.set(0.5);
        cardBack.alpha = 0.3;
        cardBack.width = 400;
        cardBack.height = 500;
        cardBack.x = game.getScreenWidth() / 2;
        cardBack.y = game.getScreenHeight() / 2;
        cardBack.rotation = 15;
        cardsContainer.addChild(cardBack);
        cardsContainer.addChild(cardCollectionTitle);

        var backButton = createButton('Back', function() {
            game.setGameState('lobby');
        });
        var prevPageButton = createButton('<<<', function() {
            game.playerCardRenderOffset = Math.max(0, game.playerCardRenderOffset - 1);
            game.renderCardCollection();
        });
        var nextPageButton = createButton('>>>', function() {
            game.playerCardRenderOffset = Math.min(game.playerCardRenderOffset + 1, Math.floor(game.playerCardList.length / constants.cardcollection.CARDS_PER_PAGE));
            game.renderCardCollection();
        });
        nextPageButton.anchor.set(0, 1);
        prevPageButton.anchor.set(0, 1);
        nextPageButton.x = 10 + 100;
        prevPageButton.x = 10;
        nextPageButton.y = game.getScreenHeight() - 5;
        prevPageButton.y = game.getScreenHeight() - 5;
        backButton.anchor.set(1);
        backButton.x = game.getScreenWidth() - 5;
        backButton.y = game.getScreenHeight() - 5;
        cardsContainer.addChild(backButton);
        cardsContainer.addChild(nextPageButton);
        cardsContainer.addChild(prevPageButton);
        game.pixi.stage.addChild(cardsContainer);

        game.containers.push(cardsContainer);

        // game screen
        var gameContainer = new PIXI.Container();
        game.gameContainer = gameContainer;

        game.statusText = {};
        var infoFont = new PIXI.TextStyle({
            fontFamily: 'Pangolin',
            fontSize: 16,
            fill: '#ffffff'
        });
        var playerInfo = new PIXI.Text('Unknown vs. Unknown', infoFont);
        playerInfo.x = 5;
        var turnStatus = new PIXI.Text('Unknown', infoFont);
        turnStatus.x = 5;
        turnStatus.y = 18;

        var playerCardsLeft = new PIXI.Text('You have ? cards left', infoFont);
        playerCardsLeft.x = 5;
        playerCardsLeft.y = 36;
        game.gameContainer.addChild(playerCardsLeft);

        var opponentCardsLeft = new PIXI.Text('Your opponent has ? cards left', infoFont);
        opponentCardsLeft.x = 5;
        opponentCardsLeft.y = 54;
        game.gameContainer.addChild(opponentCardsLeft);

        var turnTimer = new PIXI.Text('0:00', infoFont);
        turnTimer.x = 5;
        turnTimer.y = 90;
        game.gameContainer.addChild(turnTimer);

        var playerPortrait = new PIXI.Graphics();
        playerPortrait.beginFill(0xffff00);
        playerPortrait.drawRect(0, 0, 100, 120);
        playerPortrait.x = game.getScreenWidth() / 2 - 50;
        playerPortrait.y = game.getScreenHeight() - 25 - playerPortrait.height - 100;
        playerPortrait.interactive = true;
        playerPortrait.attackData = "player";
        game.playerPortrait = playerPortrait;

        var opponentPortrait = new PIXI.Graphics();
        opponentPortrait.beginFill(0xffff00);
        opponentPortrait.drawRect(0, 0, 100, 120);
        opponentPortrait.x = game.getScreenWidth() / 2 - 50;
        opponentPortrait.y = 25;
        opponentPortrait.interactive = true;
        opponentPortrait.attackData = "opponent";
        game.opponentPortrait = opponentPortrait;

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
            fontFamily: 'Pangolin',
            fontSize: 32,
            fill: '#ff0000'
        }));
        playerHealth.x = 85;
        playerHealth.y = 105;
        var playerMana = new PIXI.Text('??', new PIXI.TextStyle({
            fontFamily: 'Pangolin',
            fontSize: 32,
            fill: '#0000ff'
        }));
        playerMana.x = -5;
        playerMana.y = 105;
        var opponentHealth = new PIXI.Text('??', new PIXI.TextStyle({
            fontFamily: 'Pangolin',
            fontSize: 32,
            fill: '#ff0000'
        }));
        opponentHealth.x = 85;
        opponentHealth.y = 105;
        var opponentMana = new PIXI.Text('??', new PIXI.TextStyle({
            fontFamily: 'Pangolin',
            fontSize: 32,
            fill: '#0000ff'
        }));
        opponentMana.x = -5;
        opponentMana.y = 105;
        game.statusText.turnTimer = turnTimer;
        game.statusText.turnStatus = turnStatus;
        game.statusText.playerHealth = playerHealth;
        game.statusText.opponentHealth = opponentHealth;
        game.statusText.playerMana = playerMana;
        game.statusText.opponentMana = opponentMana;
        game.statusText.playerInfo = playerInfo;
        game.statusText.playerCardsLeft = playerCardsLeft;
        game.statusText.opponentCardsLeft = opponentCardsLeft;
        playerPortrait.addChild(playerHealth);
        opponentPortrait.addChild(opponentHealth);
        playerPortrait.addChild(playerMana);
        opponentPortrait.addChild(opponentMana);

        var endTurn = new PIXI.Text("End Turn", new PIXI.TextStyle({
            fontFamily: 'Pangolin',
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

        var opponentCards = new PIXI.Container();
        opponentCards.x = 500;
        game.opponentCardsContainer = opponentCards;
        gameContainer.addChild(opponentCards);

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

        var targetIndicator = PIXI.Sprite.fromImage('./img/target.png');
        targetIndicator.anchor.set(0.5);
        targetIndicator.visible = false;
        targetIndicator.alpha = 0.5;
        targetIndicator.width = 64;
        targetIndicator.height = 64;
        game.targetIndicator = targetIndicator;

        // victory screen
        var endContainer = new PIXI.Container();
        game.endContainer = endContainer;
        game.statusText.endText = new PIXI.Text('Unknown!', new PIXI.TextStyle({
            fontFamily: 'Pangolin',
            fontSize: 72,
            fill: '#0000ff'
        }));
        game.statusText.endText.anchor.set(0.5);
        game.statusText.endText.x = game.getScreenWidth() / 2;
        game.statusText.endText.y = game.getScreenHeight() / 2 - 100;
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
        endButton.y = game.getScreenHeight() / 2;
        endContainer.addChild(endButton);

        gameContainer.addChild(playerPortrait);
        gameContainer.addChild(opponentPortrait);
        gameContainer.addChild(playerInfo);
        gameContainer.addChild(turnStatus);
        gameContainer.addChild(endContainer);
        gameContainer.addChild(endTurn);
        gameContainer.addChild(targetIndicator);

        game.pixi.stage.addChild(gameContainer);
        game.containers.push(gameContainer);

        game.animations = [];
        game.pixi.ticker.add(game.processAnimations);

        game.setGameState('empty');
        setInterval(game.doTurnTimer, 1000);
    },
    doTurnTimer: function() {
        if (game.turnTimer) {
            game.turnTimer -= 1;
            game.updateInfo("turn_timer", game.turnTimer);
        }
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
            if (anim.obj[anim.field] > 1) {
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
        if (game.targetIndicator) {
            game.targetIndicator.rotation += delta / 100;
        }
    },
    connect: function(username) {
        game.ws = new WebSocket(window.location.protocol.replace('http', 'ws') + "//" + window.location.host + window.location.pathname);
        game.ws.onopen = function() {
            game.sendPacket("auth", username);
        };
        game.ws.onmessage = game.receivePacket;
        game.ws.onclose = function() {
            $("#login-container").fadeIn();
            game.setGameState('empty');
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
                game.lobbyContainer.visible = true;
                break;
            case 'queued':
                game.queuedContainer.visible = true;
                break;
            case 'game':
                game.gameContainer.visible = true;
                game.endContainer.visible = false;
                break;
            case 'cards':
                game.cardsContainer.visible = true;
                game.sendPacket("loadCards");
                break;
            case 'empty':
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
            case 'turn_timer':
                game.turnTimer = value;
                game.statusText.turnTimer.text = Math.floor(game.turnTimer / 60) + ":" + ("00" + (game.turnTimer % 60)).slice(-2);
                break;
            case 'player_cards_left':
                game.statusText.playerCardsLeft.text = 'You have ' + value + ' cards left';
                break;
            case 'opponent_cards_left':
                game.statusText.opponentCardsLeft.text = 'Your opponent has ' + value + ' cards left';
                break;
            case 'player_health':
                if (game.playerHealth > value) {
                    createDamageEffect(game.playerPortrait, 50, 60);
                }
                game.playerHealth = value;
                game.statusText.playerHealth.text = value;
                break;
            case 'opponent_health':
                if (game.opponentHealth > value) {
                    createDamageEffect(game.opponentPortrait, 50, 60);
                }
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
    showPlayedCard: function(card, wasDiscarded) {
        var card = createCard(constants.cards[card]);
        card.interactive = false;
        card.buttonMode = false;
        card.width /= 2;
        card.height /= 2;
        card.x = game.getScreenWidth() - 235 - 100 * game.cardDisplayMax;
        game.cardDisplayIncr++;
        game.cardDisplayMax++;
        card.y = 5;
        card.filters = [ new PIXI.filters.GlowFilter(5, 2, 2, wasDiscarded ? 0xff0000 : 0xaaaaaa, 0.5) ];
        game.gameContainer.addChild(card);
        setTimeout(function() {
            game.animations.push({
                obj: card,
                field: 'alpha',
                speed: -0.1,
                callback: function() {
                    game.gameContainer.removeChild(card);
                    game.cardDisplayIncr--;
                    if (game.cardDisplayIncr <= 0) {
                        game.cardDisplayMax = 0;
                    }
                }
            });
        }, constants.game.LAST_CARD_DELAY);
    },
    removeCard: function(player, card, wasDiscarded) {
        if (player == game.playerId) {
            var cardIndex = game.playerHand.map((x) => parseInt(x.id)).indexOf(parseInt(card));
            if (cardIndex > -1) {
                game.playerCardContainer.removeChild(game.playerHand[cardIndex]);
                game.playerHand.splice(cardIndex, 1);
            }
            if (wasDiscarded) {
                game.showPlayedCard(card, wasDiscarded);
            }
        }
        else {
            game.opponentHand--;
            game.showPlayedCard(card, wasDiscarded);
        }
        game.reorderCards();
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
                if (card.target) {
                    game.targetIndicator.visible = true;
                }
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
        game.opponentCardsContainer.children.forEach((x) => game.opponentCardsContainer.removeChild(x));
        for (var i = 0; i < game.opponentHand; i++) {
            var cardBack = PIXI.Sprite.fromImage('./img/card_back.png');
            cardBack.width = 100;
            cardBack.height = 125;
            cardBack.x = i * 25;
            game.opponentCardsContainer.addChild(cardBack);
        }
    },
    showError: function(errorMsg) {
        var errorText = new PIXI.Text(errorMsg, new PIXI.TextStyle({
            fontFamily: 'Pangolin',
            fontSize: 18,
            fill: '#ff0000'
        }));
        errorText.x = 5;
        errorText.y = 72;
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
    renderCardCollection: function() {
        if (!game.playerCardRender) {
            game.playerCardRender = [];
            game.playerCardRenderOffset = 0;
        }
        else {
            game.playerCardRender.forEach((x) => game.cardsContainer.removeChild(x));
            game.playerCardRender = [];
        }
        for (var i = 0; i < constants.cardcollection.CARDS_PER_PAGE; i++) {
            var cardIndex = i + game.playerCardRenderOffset * constants.cardcollection.CARDS_PER_PAGE;
            if (cardIndex >= game.playerCardList.length) {
                break;
            }
            var card = createCard(constants.cards[game.playerCardList[cardIndex]]);
            card.width /= 1.6;
            card.height /= 1.6;
            card.x = 5 + (130 * (i % constants.cardcollection.CARDS_PER_ROW));
            card.y = 75 + 5 + (160 * Math.floor(i / constants.cardcollection.CARDS_PER_ROW));
            game.playerCardRender.push(card);
            game.cardsContainer.addChild(card);
        }
    },
    receivePacket: function(data) {
        var data = JSON.parse(data.data);
        switch (data.type) {
            case 'gameState':
                game.setGameState(data.data);
                break;
            case 'gameInit':
                game.setGameState('game');
                if (game.playerHand) {
                    game.playerHand.forEach((x) => game.playerCardContainer.removeChild(x));
                }
                game.playerHand = [];
                game.opponentHand = 0;
                if (game.playerArmy) {
                    game.playerArmy.forEach((x) => game.playerMinionContainer.removeChild(x));
                }
                if (game.opponentArmy) {
                    game.opponentArmy.forEach((x) => game.opponentMinionContainer.removeChild(x));
                }
                game.playerArmy = [];
                game.opponentArmy = [];
                game.playerId = data.data.player.id;
                game.opponentId = data.data.opponent.id;
                game.turn = data.data.turn;
                game.cardDisplayIncr = 0;
                game.cardDisplayMax = 0;
                game.updateInfo("turn_timer", data.data.turnTimer);
                game.updateInfo("player_turn", data.data.player.id == game.turn);
                game.updateInfo("player_names", [data.data.player.name, data.data.opponent.name]);
                game.updateInfo("player_health", data.data.player.health);
                game.updateInfo("player_mana", data.data.player.mana);
                game.updateInfo("opponent_health", data.data.opponent.health);
                game.updateInfo("opponent_mana", data.data.opponent.mana);
                game.updateInfo("player_cards_left", data.data.playerDeckSize);
                game.updateInfo("opponent_cards_left", data.data.opponentDeckSize);
                data.data.playerHand.forEach(function(card) {
                    game.addCard(game.playerId, card);
                });
                game.opponentHand = data.data.opponentHandSize;
                game.reorderCards();
                break;
            case 'updatePlayer':
                ['health', 'mana'].forEach(function(item) {
                    if (typeof data.data[item] !== 'undefined') {
                        if (data.data.playerId == game.playerId) {
                            game.updateInfo('player_' + item, data.data[item]);
                        }
                        else {
                            game.updateInfo('opponent_' + item, data.data[item]);
                        }
                    }
                });
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
                        }
                        if (typeof data.data.attack !== 'undefined') {
                            minion.attack = data.data.attack;
                        }
                        if (typeof data.data.attributes !== 'undefined') {
                            minion.attributes = data.data.attributes;
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
                var minionToRemove;
                var callback;
                game.playerArmy.forEach(function(minion) {
                    if (minion.minionInstanceId == instId) {
                        minionToRemove = minion;
                        callback = function() {
                            game.playerArmy.splice(game.playerArmy.indexOf(minion), 1);
                            game.playerMinionContainer.removeChild(minion);
                        };
                        return false;
                    }
                    return true;
                });
                game.opponentArmy.forEach(function(minion) {
                    if (minion.minionInstanceId == instId) {
                        minionToRemove = minion;
                        callback = function() {
                            game.opponentArmy.splice(game.opponentArmy.indexOf(minion), 1);
                            game.opponentMinionContainer.removeChild(minion);
                        };
                        return false;
                    }
                    return true;
                });
                if (minionToRemove) {
                    if (typeof data.data.health !== 'undefined') {
                        minionToRemove.health = data.data.health;
                    }
                    createDamageEffect(minionToRemove, 40, 40);
                    setTimeout(function() {
                        callback();
                        game.refreshMinions();
                    }, 600);
                }
                break;
            case 'addCard':
                if (data.data.player == game.playerId) {
                    game.updateInfo("player_cards_left", data.data.cardsLeft);
                    game.addCard(game.playerId, data.data.card);
                }
                else {
                    game.updateInfo("opponent_cards_left", data.data.cardsLeft);
                    game.opponentHand++;
                    game.reorderCards();
                }
                break;
            case 'nextTurn':
                game.turn = data.data.turn;
                game.updateInfo("turn_timer", data.data.turnTimer);
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
            case 'discardCard':
                game.removeCard(data.data.playerId, data.data.cardId, true);
                break;
            case 'playCard':
                if (game.playerId == data.data.playerId) {
                    game.updateInfo("player_mana", data.data.playerMana);
                }
                else {
                    game.updateInfo("opponent_mana", data.data.playerMana);
                }
                game.removeCard(data.data.playerId, data.data.cardId, false);
                setTimeout(game.checkCanMove, constants.player.NO_MOVE_DELAY);
                break;
            case 'addMinion':
                game.spawnMinion(data.data.playerId, data.data.minionId, data.data.hasAttack, data.data.minionInstanceId);
                break;
            case 'loadCards':
                game.playerCardList = data.data;
                game.renderCardCollection();
                break;
            case 'gameTimer':
                game.updateInfo("turn_timer", data.data);
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
        if (game.targetIndicator) {
            game.targetIndicator.visible = false;
        }
    });

    // if username was saved in localstorage, automatically fill
    var username = localStorage.getItem("username");
    if (username) {
        $("#username").val(username);
        $("#login button[type=submit]").click();
    }

    $("body").mousemove(function() {
        var mousePos = game.pixi.renderer.plugins.interaction.mouse.global;
        if (game.targetIndicator) {
            game.targetIndicator.x = mousePos.x;
            game.targetIndicator.y = mousePos.y;
        }
    });
});
