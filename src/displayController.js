import gameFlow from './gameFlow'



(function () {

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

