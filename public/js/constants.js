var constants = {
    player: {
        INITIAL_HEALTH: 30,
        INITIAL_MANA: 1,
        MAX_MANA: 10
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
        }
    }
};

if (typeof module !== 'undefined') {
    module.exports = constants;
}
