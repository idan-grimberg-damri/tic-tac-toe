/**
* Factory of players. 
* @param {String} symb a String in {"X","O"}
* @returns a player object
*/
const Player = function (symb) {

    let player = {}, score = 0;

    Object.defineProperties(player, {
        symb: {
            get: () => { return symb; },
            set: (newSymb) => { symb = newSymb },
            enumerable: true,
            configurable: true

        },

        score: {
            get: () => { return score; },
            enumerable: true,
            configurable: true
        },

        incScore: {
            value: () => { score++; },
            enumerable: true,
            writable: false,
            configurable: false
        }
    });

    return player;
}

export default Player;