//TODO - use modules and webpack

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
/**
* IIFE - represents the game flow
* @returns an object containing the operations for the game flow
*/
const gameFlow = (function () {
    
    let totalMoves = 0;
    let players, currentPlayer;

    const maxMoves = 9,
          // Length of the side of the board
        sideLength = 3,
         // Variables for tracking the position of each player's choice
        rows = createCountArray(3, 2, sideLength),
        cols = createCountArray(3, 2, sideLength),
        diag = createCountArray(2, 1, sideLength),
        antiDiag = createCountArray(2, 1, sideLength),
        gridWinEntries = [];
    // 2D array for rows and columns, each contains an array for a specific player
    rows.dim = cols.dim = 2;
    // Diagonals only need one array for both players
    diag.dim = antiDiag.dim = 1;
    
    function createPlayers() {

        let userSymbol = ' ', options = ['X', 'O'], userSymbolIndex = 0;

        while (userSymbol && !options.includes((userSymbol = prompt('Select X or O', 'X'))));
        // If the user choosed a String symbol 
        if (userSymbol) {
            userSymbolIndex = options.indexOf(userSymbol);
            // If we didn't create the players then create them and put their references into an array
            if (!players) {
                players = [Player(options[userSymbolIndex]), Player(options[1 - userSymbolIndex])];
            }
            // Else if the "X"  player switched symbol
            else if (userSymbol && userSymbol !== players[0].symb) {
                switchSymbols();
            }
            // Figure who is the player with a "X" symbol
            currentPlayer = figureX();

            return true;
        }

        return false;
    }
    // Switch the players symbols
    function switchSymbols() {
        let temp = players[0].symb;
        players[0].symb = players[1].symb;
        players[1].symb = temp;
    }
    /**
    * @param {Integer} size the size of the array
    * @param {Integer} dim the dimention of the array
    * @param {Integer} val the value to be in each cell of the array
    * @returns an array to count the choices of the players
    */
    function createCountArray(size, dim, val) {

        let arr = [];

        while (size--)
            arr.push(val);
        // If it's 2D array than recursively create an identical array at keep a reference for it at the first cell of the 2D array
        if (dim === 2)
            return [createCountArray(arr.length, 1, val), arr];

        return arr;

    }
    /**
    * Logic to track if there's a winner while updating counts per rows, cokumn and diagonals
    * @param rol the row for the player's current choice
    * @param col the column for the player's current choice
    * @returns true if the player won, false otherwise
    */
    function currentPlayResult(row, col) {
         
        rows[currentPlayer][row]--;
        cols[currentPlayer][col]--;
        // Update diagonal count
        if (row === col)
            diag[currentPlayer]--;
        // Update anti-digonal count
        if (row + col === sideLength - 1)
            antiDiag[currentPlayer]--

        return isWin(row, col);

    }
    /**
    * Restore arrays state before a new game
    */
    function restoreArraysState() {
        let length = sideLength;
        while (length--) {
            rows[0][length] = rows[1][length] = sideLength;
            cols[0][length] = cols[1][length] = sideLength;
        }
        diag[0] = diag[1] = antiDiag[0] = antiDiag[1] = sideLength;

    }
    /**
    * Calculate the indexes for the win row, column, diagonal, or anti-diagonal
    * @param currentEntry the current calculated grid's entry
    * @param nextEntry function that calculates the grid's next entry based on the grid's calculated current entry
    */
    function setGridWinEntries(currentEntry, nextEntry) {
        let i = sideLength;
        while (i--) {
            gridWinEntries[i] = currentEntry;
            currentEntry = nextEntry(currentEntry);
        }
    }
    
    /**
    * @returns true if the current player won, false otherwise
    */
    function isWin(row, col) {
        // True if there's a win, false otherwise
        let res = !(rows[currentPlayer][row] && cols[currentPlayer][col] && diag[currentPlayer] && antiDiag[currentPlayer]);
        // If there's a win then calculate the grid's entry base on the current win row, column, diagonal, or anti-diagonal
        if (res) {
            switch (true) {
                case (!rows[currentPlayer][row]): setGridWinEntries(row * 3, (currentEntry) => { return currentEntry + 1; }); break;
                case (!cols[currentPlayer][col]): setGridWinEntries(col, (currentEntry) => { return currentEntry + 3; }); break;
                case (!diag[currentPlayer]): setGridWinEntries(0, (currentEntry) => { return currentEntry + 4; }); break;
                case (!antiDiag[currentPlayer]): setGridWinEntries(2, (currentEntry) => { return currentEntry + 2; }); break;
            }
        }
        return res;
    }

    function switchPlayer() {

        currentPlayer = 1 - currentPlayer;
    }

    function figureX() {

        return (players[0].symb === 'X' ? 0 : 1);
    }
    

    function getGridWinEntries() {
        return gridWinEntries;
    }

    function incTotalMoves() {
        totalMoves++;

        return totalMoves === maxMoves;
    }

    function getPlayers() {
        return players;
    }

    function getCurrentPlayer() { return currentPlayer; }

    function endGame(shouldIncScore) {
        if (shouldIncScore)
            players[currentPlayer].incScore();

        totalMoves = 0;
        restoreArraysState();

    }

    return {
        currentPlayResult,
        switchPlayer,
        getCurrentPlayer,
        incTotalMoves,
        getPlayers,
        endGame,
        createPlayers,
        setGridWinEntries,
        getGridWinEntries,
    };


}());


const displayController = (function () {

    const players = [document.querySelector('.player0'), document.querySelector('.player1')]
    const gridContainer = document.querySelector('.grid-container');
    const gridItems = document.querySelectorAll('.grid-item');
    const playButton = document.querySelector('button');
    const lastWinEntries = [];

    setOnPlayClickListener();

    function setOnPlayClickListener() {
        playButton.addEventListener('click', onPlayClick);
    }

    function onPlayClick() {

        let i = 2;

        if (!gameFlow.createPlayers())
            return;

        playButton.removeEventListener('click', onPlayClick);
        gridItems.forEach((item) => { item.textContent = ''; });

        let playerElement, player;

        while (i--) {
            playerElement = players[i];
            player = gameFlow.getPlayers()[i];
            playerElement.querySelector('h2').textContent = `Player${player.symb}`;
            playerElement.querySelector('.score').textContent = `Score: ${player.score}`
            playerElement.querySelector('.winner').textContent = ``;
        }

        if (lastWinEntries.length === 3)
            lastWinEntries.forEach((entry) => { entry.classList.toggle('win-emphasis'); })

        setOnBoardClickListener();

    }

    function setOnBoardClickListener() {
        gridContainer.addEventListener('click', onBoardClick, false)
    }

    function onBoardClick(event) {
        // if the target's text content is empty
        if (event.target.className !== 'grid-container' && !event.target.textContent) {
            let index = event.target.dataset.boardIndex, currentPlayer = gameFlow.getCurrentPlayer();
            let isWin, isMaxMovesReached;

            event.target.textContent = gameFlow.getPlayers()[currentPlayer].symb;

            isWin = gameFlow.currentPlayResult(Math.floor(index / 3), Math.floor(index % 3));
            isMaxMovesReached = gameFlow.incTotalMoves();

            if (isWin || isMaxMovesReached) {
                gridContainer.removeEventListener('click', onBoardClick);

                gameFlow.endGame(isWin || !isMaxMovesReached); //if there's a win we want it to be true, else false 

                updatePlayersStatus(isWin, currentPlayer);

                if (isWin)
                    emphasisWin();
                else if (lastWinEntries.length > 0)
                    lastWinEntries.pop();

                setOnPlayClickListener();
            }

            gameFlow.switchPlayer();
        }
    }

    function emphasisWin() {
        let items = Array.from(gridItems);
        let entries = gameFlow.getGridWinEntries();
        let j = 0;
        let currentItem;
        for (let i = 0; i < items.length; i++) {
            currentItem = items[i];
            if (entries.includes(parseInt(currentItem.dataset.boardIndex))) {
                currentItem.classList.toggle('win-emphasis');
                lastWinEntries[j++] = currentItem;
            }
        }

    }

    function updatePlayersStatus(isWin, currentPlayer) {
        let gameResult = (isWin ? 'Win' : 'Draw');
        players[currentPlayer].querySelector('.score').textContent = `Score: ${gameFlow.getPlayers()[currentPlayer].score}`;
        players[currentPlayer].querySelector('.winner').textContent = gameResult;
        if (!isWin)
            players[1 - currentPlayer].querySelector('.winner').textContent = gameResult
        else
            players[1 - currentPlayer].querySelector('.winner').textContent = 'Lose';

    }
}());

