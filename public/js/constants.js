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
            actions: [['damage', 1]]
        },
        '5': {
            id: 5,
            mana: 2,
            type: 'minion',
            type: 'minion',
            name: 'Charger',
            spawn: [2]
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
        }
    }
};

if (typeof module !== 'undefined') {
    module.exports = constants;
}
