var constants = {
    player: {
        INITIAL_HEALTH: 30,
        INITIAL_MANA: 1,
        COIN_ID: 14,
        MAX_MANA: 10,
        MAX_MINIONS: 8,
        MAX_CARDS: 10,
        NO_MOVE_DELAY: 500
    },
    cards: {
        '0': {
            id: 0,
            mana: 3,
            type: 'minion',
            spawn: [0, 0, 0],
            name: 'Tiny Army',
            description: 'Spawn a few soldiers. Not a very special card.'
        },
        '1': {
            id: 1,
            mana: 5,
            type: 'minion',
            spawn: [0, 0, 0, 0, 0],
            name: 'Medium Army',
            description: 'Spawn a few more soldiers.'
        },
        '2': {
            id: 2,
            mana: 2,
            type: 'minion',
            spawn: [1],
            name: 'Dummy',
            description: 'Spawn a distraction.'
        },
        '3': {
            id: 3,
            mana: 3,
            type: 'spell',
            name: 'Card Search',
            description: 'Draw two cards.',
            actions: [['draw', 2]]
        },
        '4': {
            id: 4,
            mana: 2,
            type: 'spell',
            name: 'Fireball',
            description: 'Do one damage to some target.',
            actions: [['damage', 1]],
            target: true
        },
        '5': {
            id: 5,
            mana: 2,
            type: 'minion',
            name: 'Charger',
            description: 'Gets an early chance to attack.',
            spawn: [2]
        },
        '6': {
            id: 6,
            mana: 10,
            type: 'spell',
            name: 'Nuke',
            description: 'Do 10 damage to some target.',
            actions: [['damage', 10]],
            target: true
        },
        '7': {
            id: 7,
            mana: 4,
            type: 'minion',
            name: 'Tank',
            description: 'A pretty good unit.',
            spawn: [3]
        },
        '8': {
            id: 8,
            mana: 3,
            type: 'minion',
            name: 'Knight',
            description: 'A knight and his squire.',
            spawn: [4, 5]
        },
        '9': {
            id: 9,
            mana: 5,
            type: 'spell',
            name: 'Explosion',
            description: 'Do 3 damage to everything.',
            actions: [['all_damage', 3]]
        },
        '10': {
            id: 10,
            mana: 6,
            type: 'minion',
            name: 'The Red Panda',
            description: 'Very tanky unit.',
            spawn: [6]
        },
        '11': {
            id: 11,
            mana: 3,
            type: 'minion',
            name: 'The Bunny',
            description: 'Good for quick attacks.',
            spawn: [7]
        },
        '12': {
            id: 12,
            mana: 3,
            type: 'minion',
            name: 'The Wombat',
            description: 'Good as a temporary shield.',
            spawn: [8]
        },
        '13': {
            id: 13,
            mana: 3,
            type: 'minion',
            name: 'The Field Mouse',
            description: 'Spawns more allies on death.',
            spawn: [9]
        },
        '14': {
            id: 14,
            mana: 0,
            type: 'spell',
            name: 'The Coin',
            description: 'Gives you one extra mana this turn.',
            obtainable: false,
            actions: [['mana', 1]]
        },
        '15': {
            id: 15,
            mana: 6,
            type: 'spell',
            name: 'Stronger Fireball',
            description: 'Do four damage to some target.',
            actions: [['damage', 4]],
            target: true
        },
        '16': {
            id: 16,
            mana: 5,
            type: 'spell',
            name: 'Morale Boost',
            description: 'Give all of your minions +2 attack.',
            actions: [['buff_attack_all', 2]]
        },
        '17': {
            id: 17,
            mana: 5,
            type: 'spell',
            name: 'Medical Aid',
            description: 'Give all of your minions +2 health.',
            actions: [['buff_health_all', 2]]
        },
        '18': {
            id: 18,
            mana: 5,
            type: 'minion',
            name: 'Ninja',
            description: 'Do 2 damage to the opponent.',
            actions: [['damage_opponent', 2]],
            spawn: [11]
        },
        '19': {
            id: 19,
            mana: 1,
            type: 'minion',
            name: 'Lesser Demon',
            description: 'Discard a random card.',
            actions: [['discard', 1]],
            spawn: [12]
        },
        '20': {
            id: 20,
            mana: 9,
            type: 'spell',
            name: 'Mass Heal',
            description: 'Heal a unit for 10 health.',
            actions: [['damage', -10]],
            target: true
        },
        '21': {
            id: 21,
            mana: 2,
            type: 'spell',
            name: 'Shield',
            description: 'Give a minion a shield.',
            actions: [['attribute', 'shield']],
            target: true
        },
        '22': {
            id: 22,
            mana: 2,
            type: 'spell',
            name: 'Taunt',
            description: 'Give a minion taunt status.',
            actions: [['attribute', 'taunt']],
            target: true
        },
        '23': {
            id: 23,
            mana: 4,
            type: 'minion',
            name: 'Fallen Swordsman',
            description: 'Any time a minion takes damage, this unit gains one attack.',
            spawn: [13]
        },
        '24': {
            id: 24,
            mana: 1,
            type: 'spell',
            name: 'Soul Sacrifice',
            description: 'Lose two health, gain two cards.',
            actions: [['damage_player', 2], ['draw', 2]]
        },
        '25': {
            id: 25,
            mana: 4,
            type: 'minion',
            name: 'The Giant',
            description: 'Gains +1 health at the start of every turn.',
            spawn: [14]
        }
    },
    minions: {
        '0': {
            id: 0,
            health: 1,
            attack: 1,
            name: 'Tiny Soldier'
        },
        '1': {
            id: 1,
            health: 3,
            attack: 0,
            name: 'Dummy',
            attributes: ['taunt']
        },
        '2': {
            id: 2,
            health: 1,
            attack: 1,
            name: 'Charger',
            attributes: ['charge']
        },
        '3': {
            id: 3,
            health: 4,
            attack: 3,
            name: 'Tank'
        },
        '4': {
            id: 4,
            health: 1,
            attack: 2,
            name: 'Knight',
            attributes: ['shield']
        },
        '5': {
            id: 5,
            health: 1,
            attack: 1,
            name: 'Squire'
        },
        '6': {
            id: 6,
            health: 7,
            attack: 6,
            name: 'Red Panda'
        },
        '7': {
            id: 7,
            health: 2,
            attack: 4,
            name: 'The Bunny',
            attributes: ['charge']
        },
        '8': {
            id: 8,
            health: 3,
            attack: 3,
            name: 'The Wombat',
            attributes: ['taunt']
        },
        '9': {
            id: 9,
            health: 2,
            attack: 1,
            name: 'The Field Mouse',
            attributes: ['deathrattle'],
            deathrattle: [['spawn', [10, 10]]]
        },
        '10': {
            id: 10,
            health: 1,
            attack: 1,
            name: 'Lesser Field Mice'
        },
        '11': {
            id: 11,
            health: 4,
            attack: 4,
            name: 'Ninja'
        },
        '12': {
            id: 12,
            health: 3,
            attack: 2,
            name: 'Lesser Demon'
        },
        '13': {
            id: 13,
            health: 4,
            attack: 2,
            name: 'Fallen Swordsman',
            events: {
                minion_damage: [['buff_attack', 1]]
            }
        },
        '14': {
            id: 14,
            health: 3,
            attack: 1,
            name: 'The Giant',
            events: {
                turn_start: [['buff_health', 1]]
            }
        }
    }
};

if (typeof module !== 'undefined') {
    module.exports = constants;
}
