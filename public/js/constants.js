var constants = {
    player: {
        INITIAL_HEALTH: 30,
        MAX_HEALTH: 30,
        INITIAL_MANA: 1,
        COIN_ID: 14,
        MAX_MANA: 10,
        MAX_MINIONS: 8,
        MAX_CARDS: 10,
        NO_MOVE_DELAY: 500
    },
    game: {
        LAST_CARD_DELAY: 2000,
        TURN_TIME: 120,
    },
    cardcollection: {
        CARDS_PER_ROW: 6,
        CARDS_PER_PAGE: 18
    },
    cards: {
        '0': {
            mana: 3,
            type: 'minion',
            spawn: [0, 0, 0],
            name: 'Tiny Army',
            description: 'Spawn a few soldiers. Not a very special card.'
        },
        '1': {
            mana: 5,
            type: 'minion',
            spawn: [0, 0, 0, 0, 0],
            name: 'Medium Army',
            description: 'Spawn a few more soldiers.'
        },
        '2': {
            mana: 2,
            type: 'minion',
            spawn: [1],
            name: 'Dummy',
            description: 'Spawn a distraction.'
        },
        '3': {
            mana: 3,
            type: 'spell',
            name: 'Card Search',
            description: 'Draw two cards.',
            actions: [['draw', 2]]
        },
        '4': {
            mana: 2,
            type: 'spell',
            name: 'Fireball',
            description: 'Do one damage to some target.',
            actions: [['damage', 1]],
            target: true
        },
        '5': {
            mana: 2,
            type: 'minion',
            name: 'Charger',
            description: 'Gets an early chance to attack.',
            spawn: [2]
        },
        '6': {
            mana: 10,
            type: 'spell',
            name: 'Nuke',
            description: 'Do 10 damage to some target.',
            actions: [['damage', 10]],
            target: true
        },
        '7': {
            mana: 4,
            type: 'minion',
            name: 'Tank',
            description: 'A pretty good unit.',
            spawn: [3]
        },
        '8': {
            mana: 3,
            type: 'minion',
            name: 'Knight',
            description: 'A knight and his squire.',
            spawn: [4, 5]
        },
        '9': {
            mana: 5,
            type: 'spell',
            name: 'Explosion',
            description: 'Do 3 damage to everything.',
            actions: [['all_damage', 3]]
        },
        '10': {
            mana: 6,
            type: 'minion',
            name: 'Red Panda',
            description: 'Very tanky unit.',
            spawn: [6]
        },
        '11': {
            mana: 3,
            type: 'minion',
            name: 'The Bunny',
            description: 'Good for quick attacks.',
            spawn: [7]
        },
        '12': {
            mana: 3,
            type: 'minion',
            name: 'The Wombat',
            description: 'Good as a temporary shield.',
            spawn: [8]
        },
        '13': {
            mana: 3,
            type: 'minion',
            name: 'The Field Mouse',
            description: 'Spawns more allies on death.',
            spawn: [9]
        },
        '14': {
            mana: 0,
            type: 'spell',
            name: 'The Coin',
            description: 'Gives you one extra mana this turn.',
            obtainable: false,
            actions: [['mana', 1]]
        },
        '15': {
            mana: 6,
            type: 'spell',
            name: 'Stronger Fireball',
            description: 'Do four damage to some target.',
            actions: [['damage', 4]],
            target: true
        },
        '16': {
            mana: 5,
            type: 'spell',
            name: 'Morale Boost',
            description: 'Give all of your minions +2 attack.',
            actions: [['buff_attack_all', 2]]
        },
        '17': {
            mana: 5,
            type: 'spell',
            name: 'Medical Aid',
            description: 'Give all of your minions +2 health.',
            actions: [['buff_health_all', 2]]
        },
        '18': {
            mana: 5,
            type: 'minion',
            name: 'Ninja',
            description: 'Do 2 damage to the opponent.',
            actions: [['damage_opponent', 2]],
            spawn: [11]
        },
        '19': {
            mana: 1,
            type: 'minion',
            name: 'Lesser Demon',
            description: 'Discard a random card.',
            actions: [['discard', 1]],
            spawn: [12]
        },
        '20': {
            mana: 9,
            type: 'spell',
            name: 'Mass Heal',
            description: 'Heal a unit for 10 health.',
            actions: [['heal', 10]],
            target: true
        },
        '21': {
            mana: 2,
            type: 'spell',
            name: 'Shield',
            description: 'Give a minion a shield.',
            actions: [['attribute', 'shield']],
            target: true
        },
        '22': {
            mana: 2,
            type: 'spell',
            name: 'Taunt',
            description: 'Give a minion taunt status.',
            actions: [['attribute', 'taunt']],
            target: true
        },
        '23': {
            mana: 4,
            type: 'minion',
            name: 'Fallen Swordsman',
            description: 'Any time a minion takes damage, this unit gains one attack.',
            spawn: [13]
        },
        '24': {
            mana: 1,
            type: 'spell',
            name: 'Soul Sacrifice',
            description: 'Lose two health, gain two cards.',
            actions: [['damage_player', 2], ['draw', 2]]
        },
        '25': {
            mana: 4,
            type: 'minion',
            name: 'The Giant',
            description: 'Gains +1 health at the start of every turn.',
            spawn: [14]
        },
        '26': {
            mana: 2,
            type: 'minion',
            name: 'Annoy-o-matic',
            description: 'Has taunt and shield.',
            spawn: [15]
        },
        '27': {
            mana: 8,
            type: 'minion',
            name: 'Dr. Boom',
            description: 'Also spawns 2 explode bots.',
            spawn: [17, 16, 17]
        },
        '28': {
            mana: 3,
            type: 'minion',
            name: 'Imp Master',
            description: 'When damaged, summon a 1/1 imp.',
            spawn: [18]
        },
        '29': {
            mana: 3,
            type: 'minion',
            name: 'Shredder',
            description: 'When damaged, discard a card from your hand.',
            spawn: [20]
        },
        '30': {
            mana: 1,
            type: 'spell',
            name: 'Magic Missile',
            description: 'Do 3 damage randomly split among enemies.',
            actions: [['random_damage_opponent', 1], ['random_damage_opponent', 1], ['random_damage_opponent', 1]]
        },
        '31': {
            mana: 5,
            type: 'spell',
            name: 'Powerful Buff',
            description: 'Give a minion +4/+4.',
            target: true,
            actions: [['buff_health', 4], ['buff_attack', 4]]
        },
        '32': {
            mana: 2,
            type: 'minion',
            name: 'Knife Thrower',
            description: 'Deal 1 damage to a random enemy when a minion is spawned.',
            spawn: [21]
        },
        '33': {
            mana: 2,
            type: 'minion',
            name: 'Gravedigger',
            description: 'Draw a card when this minion dies.',
            spawn: [22]
        },
        '34': {
            mana: 5,
            type: 'spell',
            name: 'Earthquake',
            description: 'Do 2 damage to all enemies.',
            actions: [['all_damage_opponent', 2]]
        },
        '35': {
            mana: 1,
            type: 'minion',
            name: 'Archer',
            description: 'Deal one damage.',
            target: true,
            spawn: [23],
            actions: [['damage', 1]]
        },
        '36': {
            mana: 2,
            type: 'spell',
            name: 'Mind Read',
            description: "Copy 2 cards from opponent's hand.",
            actions: [['card_copy', 2]]
        },
        '37': {
            mana: 2,
            type: 'spell',
            name: 'Life Drain',
            description: "Steal 2 health from the opponent.",
            actions: [['damage_opponent', 2], ['damage_player', -2]]
        },
        '38': {
            mana: 10,
            type: 'minion',
            name: 'Big Boss',
            description: 'Throw away all cards in hand.',
            spawn: [24],
            actions: [['discard', 10]]
        },
        '39': {
            mana: 4,
            type: 'minion',
            name: 'Shieldmaster',
            description: 'Taunt',
            spawn: [25]
        },
        '40': {
            mana: 7,
            type: 'spell',
            name: 'Destruction',
            description: 'Destroy a minion.',
            target: true,
            actions: [['destroy']]
        },
        '41': {
            mana: 3,
            type: 'spell',
            name: 'Lumpify',
            description: 'Replace a minion with a 0/1 lump with taunt.',
            target: true,
            actions: [['replace', 26]]
        },
        '42': {
            mana: 6,
            type: 'minion',
            name: 'Fire Golem',
            description: 'Do 3 damage to some object.',
            target: true,
            spawn: [27],
            actions: [['damage', 3]]
        }
    },
    minions: {
        '0': {
            health: 1,
            attack: 1,
            name: 'Tiny Soldier'
        },
        '1': {
            health: 3,
            attack: 0,
            name: 'Dummy',
            attributes: ['taunt']
        },
        '2': {
            health: 1,
            attack: 1,
            name: 'Charger',
            attributes: ['charge']
        },
        '3': {
            health: 4,
            attack: 3,
            name: 'Tank'
        },
        '4': {
            health: 1,
            attack: 2,
            name: 'Knight',
            attributes: ['shield']
        },
        '5': {
            health: 1,
            attack: 1,
            name: 'Squire'
        },
        '6': {
            health: 7,
            attack: 6,
            name: 'Red Panda'
        },
        '7': {
            health: 2,
            attack: 4,
            name: 'The Bunny',
            attributes: ['charge']
        },
        '8': {
            health: 3,
            attack: 3,
            name: 'The Wombat',
            attributes: ['taunt']
        },
        '9': {
            health: 2,
            attack: 1,
            name: 'The Field Mouse',
            events: {
                death: [['spawn', [10, 10]]]
            }
        },
        '10': {
            health: 1,
            attack: 1,
            name: 'Lesser Field Mice'
        },
        '11': {
            health: 4,
            attack: 4,
            name: 'Ninja'
        },
        '12': {
            health: 3,
            attack: 2,
            name: 'Lesser Demon'
        },
        '13': {
            health: 4,
            attack: 2,
            name: 'Fallen Swordsman',
            events: {
                minion_damage: [['buff_attack', 1]]
            }
        },
        '14': {
            health: 3,
            attack: 1,
            name: 'The Giant',
            events: {
                turn_start: [['buff_health', 1]]
            }
        },
        '15': {
            health: 1,
            attack: 1,
            name: 'Annoy-o-matic',
            attributes: ['taunt', 'shield']
        },
        '16': {
            health: 7,
            attack: 7,
            name: 'Dr. Boom'
        },
        '17': {
            health: 1,
            attack: 1,
            name: 'Explode Bot',
            events: {
                death: [['random_damage', 2], ['random_damage', 2]]
            }
        },
        '18': {
            health: 4,
            attack: 2,
            name: 'Imp Master',
            events: {
                self_damage: [['spawn', [19]]]
            }
        },
        '19': {
            health: 1,
            attack: 1,
            name: 'Imp'
        },
        '20': {
            health: 6,
            attack: 4,
            name: 'Shredder',
            events: {
                self_damage: [['discard', 1]]
            }
        },
        '21': {
            health: 2,
            attack: 2,
            name: 'Knife Thrower',
            events: {
                minion_spawn: [['random_damage_opponent', 1]]
            }
        },
        '22': {
            name: 'Gravedigger',
            health: 1,
            attack: 1,
            events: {
                death: [['draw', 1]]
            }
        },
        '23': {
            name: 'Archer',
            health: 1,
            attack: 1
        },
        '24': {
            name: 'Big Boss',
            health: 12,
            attack: 12
        },
        '25': {
            name: 'Shieldmaster',
            health: 5,
            attack: 3,
            attributes: ['taunt']
        },
        '26': {
            name: 'Lump',
            health: 1,
            attack: 0,
            attributes: ['taunt']
        },
        '27': {
            name: 'Fire Golem',
            health: 3,
            attack: 6
        }
    }
};

Object.keys(constants.cards).forEach(function(id) {
    constants.cards[id].id = parseInt(id);
});

Object.keys(constants.minions).forEach(function(id) {
    constants.minions[id].id = parseInt(id);
});

Object.values(constants.minions).forEach(function(x) {
    if (x.events) {
        if (!x.attributes) {
            x.attributes = [];
        }
        if (x.events.death && Object.keys(x.events).length < 2) {
            x.attributes.push('deathrattle');
        }
        else {
            x.attributes.push('special');
        }
    }
});

if (typeof module !== 'undefined') {
    module.exports = constants;
}
