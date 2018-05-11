var constants = {
    player: {
        INITIAL_HEALTH: 30,
        INITIAL_MANA: 3, // TODO: revert to 1
        MAX_MANA: 10,
        MAX_MINIONS: 8
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
            mana: 6,
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
            name: 'Knight'
        },
        '5': {
            id: 5,
            health: 1,
            attack: 1,
            name: 'Squire'
        }
    }
};

if (typeof module !== 'undefined') {
    module.exports = constants;
}
