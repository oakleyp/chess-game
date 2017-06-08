"use strict";

var paused = false;

let stopwatch = new StopWatch(document.getElementById('timer'));

function startTimer() {
    stopwatch.start();
}

function stopTimer() {
    paused = true;
    stopwatch.stop();
}

function startGame(gametype) {

    var board = document.getElementById('board');
    var cells = document.getElementsByClassName('cell');
    var pturn = document.getElementById('pturn');
    var taken = document.getElementById('pieces-list');
    var player = 1;

    startTimer();


    //Declare and initialize 2D array to store positions of all pieces on board, 0-7 right to left indexes containing 0-7 up and down for rows and columns, respectively.
    var boardMap = [];
    for (var i = 0; i < 8; i += 1) {
        boardMap[i] = ["x", "x", "x", "x", "x", "x", "x", "x"];
    }

    //Stores a list of all boardMaps at every point a piece changes position during the game
    var gameStates = [];

    //Stores a list of all takenPieces[] at every point a piece is taken
    var pieceStates = [];

    //Stores the currently selected piece's x([0]), y([1]) coordinates
    var selectedPiece = [];

    //Stores taken pieces from both teams
    var takenPieces = [];

    //Array to store initial player1 pieces
    var p1pieces = ['rwhite', 'kwhite', 'bwhite', 'qwhite', 'gwhite', 'bwhite', 'kwhite', 'rwhite',
                'pwhite', 'pwhite', 'pwhite', 'pwhite', 'pwhite', 'pwhite', 'pwhite', 'pwhite'];

    //Array to store initial player2 pieces
    var p2pieces = ['pblack', 'pblack', 'pblack', 'pblack', 'pblack', 'pblack', 'pblack', 'pblack',
                'rblack', 'kblack', 'bblack', 'qblack', 'gblack', 'bblack', 'kblack', 'rblack'];


    // set board cell bgs to alternating color and place p1 and p2 game pieces in initial location in boardMap
    var x = 0;
    var xadjust = 0;
    for (var i = 0; i < cells.length; i += 1) {
        //8 columns per row, starting at 0-7. if the index is the 8th, increment the row counter x where i is the column counter
        if (i % 8 == 0 && i != 0) {
            x += 1;
            xadjust += 8;
        }

        if (x % 2 == 0 || x == 0) {
            if (i % 2 == 0) cells[i].style.background = "#999";
            else cells[i].style.background = "#f9f9f9";
        } else {
            if (i % 2 == 0) cells[i].style.background = "#f9f9f9";
            else cells[i].style.background = "#999";
        }


        if (i >= 0 && i < 16) { //Place p1 game pieces
            boardMap[x][i - xadjust] = p1pieces[i];
        } else if (i >= 48 && i < 64) { //Place p2 game pieces
            boardMap[x][i - xadjust] = p2pieces[i - 48];
        } else { //Fill blank spaces with x's
            boardMap[x][i - xadjust] = 'x';
        }

    }

    console.dir(boardMap);

    //Prints the current player's turn to html id 'pturn'
    function printTurn() {
        if (player == 1)
            pturn.innerHTML = "White";
        else
            pturn.innerHTML = "Black";
    }

    //Decode placeholder values in array into black or white chess pieces as @font-face, changed from unicode, sorry IE 8 and below
    function decode(value) {
        //pawn, rook, bishop, knight, queen, and king, respectively
        var types = ['p', 'r', 'b', 'k', 'q', 'g'];
        for (var i = 0; i < types.length; i += 1) {
            if (value.charAt(0) == types[i]) {
                if (value.includes("white")) {
                    switch (types[i]) {
                        case 'p':
                            return "p";
                        case 'r':
                            return "r";
                        case 'b':
                            return "b";
                        case 'k':
                            return "n";
                        case 'q':
                            return "q";
                        case 'g':
                            return "k";
                        default:
                            console.log("Error decoding - input value=" + value);
                            break;
                    }
                } else if (value.includes("black")) {
                    switch (types[i]) {
                        case 'p':
                            return "o";
                        case 'r':
                            return "t";
                        case 'b':
                            return "v";
                        case 'k':
                            return "m";
                        case 'q':
                            return "w";
                        case 'g':
                            return "l";
                        default:
                            console.log("Error decoding: No type found; input value=" + value);
                            break;
                    }
                } else console.log("Error decoding: No color found; input value=" + value);
            }
        }
    }
    
    //Displays specified text on screen with a specified animation inside DIV id='display-text-container'
    function displayText(text, animationclass) {
        switch(animationclass) {
            default:
            case 'flip':
                var container = document.getElementById('display-text-container');
                var elem = document.createElement("h1");
                elem.innerHTML = text;
                elem.classList.add('display-text-center');
                elem.classList.add('flip');
                
                //Clear other elements first so they don't overlap
                var matchNodes = container.getElementsByClassName('display-text-center');
                if(matchNodes.length > 0)
                    container.removeChild(matchNodes[0]);
                
                container.appendChild(elem);
            }
    }
    
    //Prints taken pieces, given array takenPieces[], to DOM element 'pieces-list'
    function printTaken(takenPieces) {
        //Clear taken pieces from display 
        taken.innerHTML = "";

        //Convert nodelist to array as copy
        var pieces = Array.from(takenPieces);

        //Store pieces to be printed to screen, so that duplicates are displayed with a counter
        //2d array -> [0] = piece data | [1] = number of duplicates
        var printQueue = [];

        //Check for duplicate pieces in printqueue, and if existent, increment the counter
        for (var i = 0; i < pieces.length; i++) {
            var dupe = false;
            var queuedItem = pieces[i];
            for (var x = 0; x < printQueue.length; x++) {
                if (printQueue[x][0] == queuedItem) {
                    printQueue[x][1] += 1;
                    dupe = true;
                }
            }
            if (!dupe)
                printQueue.push([queuedItem, 1]);
        }

        //Print the pieces to display
        for (var i = 0; i < printQueue.length; i++) {
            var displayStr = `<li><i class="tcount">${printQueue[i][1]}</i><i class="space"></i>${decode(printQueue[i][0])}</li>`;
            var newItem = document.createElement("li");
            newItem.innerHTML = displayStr;
            console.log("piece taken - display: " + newItem.innerHTML);
            taken.appendChild(newItem);
        }
    }

    //Prints the 2d array boardMap to html id 'board'
    function printBoard(boardMap) {
        var i = 0;
        for (var x = 0; x < 8; x += 1) {
            for (var y = 0; y < 8; y += 1) {
                if (boardMap[x][y] != 'x' && boardMap[x][y].includes("black"))
                    cells[i].innerHTML = `<i id="piece${getCellIndex(x, y)}" class="piece black">${decode(boardMap[x][y])}</i>`;
                else if (boardMap[x][y] != 'x' && boardMap[x][y].includes("white"))
                    cells[i].innerHTML = `<i id="piece${getCellIndex(x, y)}" class="piece white">${decode(boardMap[x][y])}</i>`;
                else
                    //Keeping space filled with invisible text stops board resizing
                    cells[i].innerHTML = `<i class="piece invisible">x</i>`;

                if (y != 7) i++;
            }

            if (x != 7) i++;
        }

    }

    //Prints the pieces in their initial positions on the board
    printBoard(boardMap);

    //Returns a set of given x,y coordinates' corresponding index in array 'cells'
    function getCellIndex(x, y) {
        if ((x >= 0 && x < 8) && (y >= 0 && y < 8))
            return (x * 8) + y;
        else {
            //Something went very wrong, just break everything
            console.log(`Error getting cell index: Coordinates out of bounds at: (${x}, ${y})`);
            return;
        }
    }

    //Returns a piece's corresponding x,y coordinates in boardMap given its id attribute in DOM, as an array
    function getPieceXY(id) {
        var x = 0,
            y = 0;

        x = Math.floor(id / 8);
        y = id - (x * 8);

        //TODO: I'm sure there's a formula for this
        // Update -- Since this is for educational purposes, just showing work
        /*if (id < 8) {
            x = 0;
            y = id;
        }
        ...
        ...
        } else if (id < 64) {
            x = 7;
            y = id - 56;
        }*/

        return [x, y];
    }

    //Returns a set of x,y coordinates in boardMap as an array corresponding to a given alphanumeric chessboard coordinate
    function getXY(alphanumeric) {
        var alphaKey = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        var numKey = ['8', '7', '6', '5', '4', '3', '2', '1'];
        var yAlpha = alphanumeric.charAt(0);
        var xInverse = alphanumeric.charAt(1);

        var x = numKey.indexOf(xInverse);
        var y = alphaKey.indexOf(yAlpha);

        return [x, y];
    }

    //Moves a piece from the specified x,y coordinates to the specified newx,newy coordinates
    function movePiece(boardMap, x, y, newx, newy) {
        //Add current boardMap to gameStates
        gameStates.push(boardMap);

        var color = "white";
        if (boardMap[x][y].includes("white")) {
            color = "white";
        } else if (boardMap[x][y].includes("black")) {
            color = "black";
        }

        //Make sure own pieces can't be taken
        if (color == "white" && boardMap[newx][newy].includes("white")) {
            console.log("Can't take own piece.");
        } else if (color == "black" && boardMap[newx][newy].includes("black")) {
            console.log("Can't take own piece.");
        }

        var piece = boardMap[x][y];
        var moves = calcMoves(piece.charAt(0), boardMap, x, y);
        var valid = false;

        //See if requested move is valid
        for (var i = 0; i < moves.length; i += 1) {
            if (moves[i][0] == newx && moves[i][1] == newy) {
                valid = true;
            }
        }

        if (valid) {
            //Check if piece was taken, if so, refresh taken display
            if (boardMap[newx][newy] != 'x') {
                //See if there's a winner
                if(boardMap[newx][newy].charAt(0) == 'g') {
                    //King taken, determine and display winning team
                    if(boardMap[x][y].includes("black")) {
                        displayText("Black Wins!!!", "flip");
                        stopTimer();
                    } else if(boardMap[x][y].includes("white")) {
                        displayText("White Wins!!!", "flip");
                        stopTimer();
                    }
                }
                takenPieces.push(boardMap[newx][newy]);
                pieceStates.push(takenPieces);
                printTaken(takenPieces);
            }

            boardMap[x][y] = 'x';
            boardMap[newx][newy] = piece;

            //Switch players and reset
            if (player == 1) player = 2;
            else player = 1;
            printTurn();
            printBoard(boardMap);
            resetHighlights();
            selectedPiece = [];
        } else {
            console.log("Invalid move.");
            gameStates.pop();
        }


    }

    //Returns all of a pieces' available moves as a 2d array of x,y coordinates 
    function calcMoves(type, boardMap, x, y) {

        var color = "white"; //Color of currently selected piece

        if (boardMap[x][y].includes("white")) {
            color = "white";
        } else if (boardMap[x][y].includes("black")) {
            color = "black";
        }

        var result = [];

        if (type == 'p') { //Calculate pawn moves

            //Not considering en passante, pawn can move only 1 square away from its starting point, except at the first move allowing 2 squares, vertically
            //This translates to x position on boardMap
            var xdirection = 0;

            if (color == "white") {
                xdirection = 1;
            } else if (color == "black") {
                xdirection = -1;
            }

            //Set up starting case, check space 2 squares in front
            if ((color == "black" && x == 6) || (color == "white" && x == 1)) {
                var xi = x + (xdirection * 2);
                //Make sure there is space 2 ahead and are no enemies or friendlies directly in front
                if (boardMap[xi][y] == 'x' && boardMap[xi - xdirection][y] == 'x') {
                    result.push([xi, y]);
                    console.log("Calculated pawn move at " + xi + ", " + y);
                }
            }


            //Check space 1 square in front
            if (x + xdirection >= 0 && x + xdirection < 8) {
                if (boardMap[x + xdirection][y] == 'x') {
                    result.push([(x + xdirection), y]);
                    console.log("Calculated pawn move at " + (x + xdirection) + ", " + y);
                }
            }

            //Show takeouts diagonally
            if ((x + xdirection >= 0 && x + xdirection < 8) && (y + 1 >= 0 && y + 1 < 8)) {
                if (boardMap[x + xdirection][y + 1] != 'x' && !boardMap[x + xdirection][y + 1].includes(color)) {
                    if (boardMap[x + xdirection][y + 1].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }

                    result.push([x + xdirection, y + 1]);
                }
            }
            if ((x + xdirection >= 0 && x + xdirection < 8) && (y - 1 >= 0 && y - 1 < 8)) {
                if (boardMap[x + xdirection][y - 1] != 'x' && !boardMap[x + xdirection][y - 1].includes(color)) {
                    if (boardMap[x + xdirection][y - 1].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }

                    result.push([x + xdirection, y - 1]);

                }
            }


        } else if (type == 'r') { //Calculate rook moves

            //Rook can move any amount of free spaces vertically or horizontally

            //Check vertical down
            for (var xdir = -1; x + xdir >= 0 && x + xdir < 8; xdir -= 1) {

                if (boardMap[x + xdir][y] == 'x') {
                    result.push([x + xdir, y]);
                } else if (boardMap[x + xdir][y] != 'x' && !boardMap[x + xdir][y].includes(color)) {
                    if (boardMap[x + xdir][y].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x + xdir, y]);
                    break;
                } else break;
            }

            //Check vertical up
            for (var xdir = 1; x + xdir >= 0 && x + xdir < 8; xdir += 1) {

                if (boardMap[x + xdir][y] == 'x') {
                    result.push([x + xdir, y]);
                } else if (boardMap[x + xdir][y] != 'x' && !boardMap[x + xdir][y].includes(color)) {
                    if (boardMap[x + xdir][y].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x + xdir, y]);
                    break;
                } else break;
            }

            //Check horizontal left
            for (var ydir = -1; y + ydir >= 0 && y + ydir < 8; ydir -= 1) {

                if (boardMap[x][y + ydir] == 'x') {
                    result.push([x, y + ydir]);
                } else if (boardMap[x][y + ydir] != 'x' && !boardMap[x][y + ydir].includes(color)) {
                    if (boardMap[x][y + ydir].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x, y + ydir]);
                    break;
                } else break;
            }

            //Check horizontal right
            for (var ydir = 1; y + ydir >= 0 && y + ydir < 8; ydir += 1) {

                if (boardMap[x][y + ydir] == 'x') {
                    result.push([x, y + ydir]);
                } else if (boardMap[x][y + ydir] != 'x' && !boardMap[x][y + ydir].includes(color)) {
                    if (boardMap[x][y + ydir].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x, y + ydir]);
                    break;
                } else break;
            }

        } else if (type == 'b') { //Calculate bishop moves

            //Bishop can move diagonally in any direction until it hits a wall, player, or enemy

            //Up Left
            for (var xinc = -1, yinc = -1; x + xinc >= 0 && y + yinc >= 0; xinc -= 1, yinc -= 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
            }

            //Up Right
            for (var xinc = -1, yinc = 1; x + xinc >= 0 && y + yinc < 8; xinc -= 1, yinc += 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
            }

            //Down Left
            for (var xinc = 1, yinc = -1; x + xinc < 8 && y + yinc >= 0; xinc += 1, yinc -= 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
            }

            //Down Right
            for (var xinc = 1, yinc = 1; x + xinc < 8 && y + yinc < 8; xinc += 1, yinc += 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
            }


        } else if (type == 'k') { //Calculate knight moves

            //Knight moves in increments of 2 vertical squares and one horizontal square, or 2 horizontal squares and one vertical, either direction on either axis. good luck to the next person reading this
            for (var xdir = -2, ydir = -2; xdir <= 2 && ydir <= 2; xdir++) {
                for (; ydir <= 2; ydir += 1) {
                    //The net number of moves taken must equal 3
                    if ((Math.abs(xdir) + Math.abs(ydir) == 3)) {

                        var nextx = x + xdir,
                            nexty = y + ydir;

                        //Make sure the calculated coords aren't out of bounds
                        if ((nextx >= 0 && nextx < 8) && (nexty >= 0 && nexty < 8)) {
                            if (!(boardMap[nextx][nexty]).includes(color)) {
                                if (boardMap[nextx][nexty].charAt(0) == 'g') {
                                    //TODO: check which color's king, display in game
                                    console.log("King is in check");
                                }
                                result.push([nextx, nexty]);
                                console.log("Calculating knight move at " + (x + xdir) + ", " + (y + ydir));
                            }
                        }
                    }
                }

                ydir = -2;

            }

        } else if (type == 'q') { //Calculate queen moves

            //Queen can move in any direction for any amount of squares, until it hits a wall, player, or enemy

            //Check vertical down
            for (var xdir = -1; x + xdir >= 0 && x + xdir < 8; xdir -= 1) {

                if (boardMap[x + xdir][y] == 'x') {
                    result.push([x + xdir, y]);
                } else if (boardMap[x + xdir][y] != 'x' && boardMap[x + xdir][y].includes(color)) {
                    break;
                } else if (boardMap[x + xdir][y] != 'x' && !boardMap[x + xdir][y].includes(color)) {
                    if (boardMap[x + xdir][y].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x + xdir, y]);
                    break;
                } else break;
            }

            //Check vertical up
            for (var xdir = 1; x + xdir >= 0 && x + xdir < 8; xdir += 1) {

                if (boardMap[x + xdir][y] == 'x') {
                    result.push([x + xdir, y]);
                } else if (boardMap[x + xdir][y] != 'x' && boardMap[x + xdir][y].includes(color)) {
                    break;
                } else if (boardMap[x + xdir][y] != 'x' && !boardMap[x + xdir][y].includes(color)) {
                    if (boardMap[x + xdir][y].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x + xdir, y]);
                    break;
                } else break;
            }

            //Check horizontal left
            for (var ydir = -1; y + ydir >= 0 && y + ydir < 8; ydir -= 1) {

                if (boardMap[x][y + ydir] == 'x') {
                    result.push([x, y + ydir]);
                } else if (boardMap[x][y + ydir] != 'x' && !boardMap[x][y + ydir].includes(color)) {
                    if (boardMap[x][y + ydir].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x, y + ydir]);
                    break;
                } else break;
            }

            //Check horizontal right
            for (var ydir = 1; y + ydir >= 0 && y + ydir < 8; ydir += 1) {

                if (boardMap[x][y + ydir] == 'x') {
                    result.push([x, y + ydir]);
                } else if (boardMap[x][y + ydir] != 'x' && !boardMap[x][y + ydir].includes(color)) {
                    if (boardMap[x][y + ydir].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x, y + ydir]);
                    break;
                } else break;
            }
            //Up Left
            for (var xinc = -1, yinc = -1; x + xinc >= 0 && y + yinc >= 0; xinc -= 1, yinc -= 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
            }

            //Up Right
            for (var xinc = -1, yinc = 1; x + xinc >= 0 && y + yinc < 8; xinc -= 1, yinc += 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
            }

            //Down Left
            for (var xinc = 1, yinc = -1; x + xinc < 8 && y + yinc >= 0; xinc += 1, yinc -= 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
            }

            //Down Right
            for (var xinc = 1, yinc = 1; x + xinc < 8 && y + yinc < 8; xinc += 1, yinc += 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
            }

        } else if (type == 'g') { //Calculate king moves

            //King can move in any direction for exactly one square

            //Check vertical down
            for (var xdir = -1; x + xdir >= 0 && x + xdir < 8; xdir -= 1) {

                if (boardMap[x + xdir][y] == 'x') {
                    result.push([x + xdir, y]);
                } else if (boardMap[x + xdir][y] != 'x' && boardMap[x + xdir][y].includes(color)) {
                    break;
                } else if (boardMap[x + xdir][y] != 'x' && !boardMap[x + xdir][y].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x + xdir, y]);
                    break;
                }

                //Terminate after one move calculated
                break;
            }

            //Check vertical up
            for (var xdir = 1; x + xdir >= 0 && x + xdir < 8; xdir += 1) {

                if (boardMap[x + xdir][y] == 'x') {
                    result.push([x + xdir, y]);
                } else if (boardMap[x + xdir][y] != 'x' && boardMap[x + xdir][y].includes(color)) {
                    break;
                } else if (boardMap[x + xdir][y] != 'x' && !boardMap[x + xdir][y].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x + xdir, y]);
                    break;
                }
                break;
            }

            //Check horizontal left
            for (var ydir = -1; y + ydir >= 0 && y + ydir < 8; ydir -= 1) {

                if (boardMap[x][y + ydir] == 'x') {
                    result.push([x, y + ydir]);
                } else if (boardMap[x][y + ydir] != 'x' && !boardMap[x][y + ydir].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([x, y + ydir]);
                    break;
                }
                break;
            }

            //Check horizontal right
            for (var ydir = 1; y + ydir >= 0 && y + ydir < 8; ydir += 1) {

                if (boardMap[x][y + ydir] == 'x') {
                    result.push([x, y + ydir]);
                } else if (boardMap[x, y + ydir] != 'x' && !boardMap[x][y + ydir].includes(color)) {
                    result.push([x, y + ydir]);
                    break;
                } else break;
            }
            //Up Left
            for (var xinc = -1, yinc = -1; x + xinc >= 0 && y + yinc >= 0; xinc -= 1, yinc -= 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
                break;
            }

            //Up Right
            for (var xinc = -1, yinc = 1; x + xinc >= 0 && y + yinc < 8; xinc -= 1, yinc += 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
                break;
            }

            //Down Left
            for (var xinc = 1, yinc = -1; x + xinc < 8 && y + yinc >= 0; xinc += 1, yinc -= 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
                break;
            }

            //Down Right
            for (var xinc = 1, yinc = 1; x + xinc < 8 && y + yinc < 8; xinc += 1, yinc += 1) {
                var nextx = x + xinc,
                    nexty = y + yinc;

                if (boardMap[nextx][nexty] == 'x') {
                    result.push([nextx, nexty]);
                } else if (!boardMap[nextx][nexty].includes(color)) {
                    if (boardMap[nextx][nexty].charAt(0) == 'g') {
                        //TODO: check which color's king, display in game
                        console.log("King is in check");
                    }
                    result.push([nextx, nexty]);
                    break;
                } else {
                    break;
                }
                break;
            }
        }

        return result;

    }

    //Highlights cells given in an array of coordinates
    function highlightCells(coordsList) {
        if (coordsList != [] && coordsList != null) {
            for (var i = 0; i < coordsList.length; i += 1) {
                cells[getCellIndex(coordsList[i][0], coordsList[i][1])].style.background = "#65d5e5";
            }
        } else console.log("Error in highlightCells(): coordsList is empty")
    }

    //Resets all cell background colors to original
    function resetHighlights() {
        var x = 0;
        for (var i = 0; i < cells.length; i += 1) {
            //8 columns per row, starting at 0-7. if the index is the 8th, increment the row counter x where i is the column counter
            if (i % 8 == 0 && i != 0)
                x += 1;
            if (x % 2 == 0 || x == 0) {
                if (i % 2 == 0) cells[i].style.background = "#999";
                else cells[i].style.background = "#f9f9f9";
            } else {
                if (i % 2 == 0) cells[i].style.background = "#f9f9f9";
                else cells[i].style.background = "#999";
            }
        }
    }

    //Highlights all available moves for a selected piece
    function highlightMoves(type, x, y) {
        switch (type) {
            case 'p':
                highlightCells(calcMoves('p', boardMap, x, y));
                break;
            case 'r':
                highlightCells(calcMoves('r', boardMap, x, y));
                break;
            case 'b':
                highlightCells(calcMoves('b', boardMap, x, y));
                break;
            case 'k':
                highlightCells(calcMoves('k', boardMap, x, y));
                break;
            case 'q':
                highlightCells(calcMoves('q', boardMap, x, y));
                break;
            case 'g':
                highlightCells(calcMoves('g', boardMap, x, y));
                break;
        }
    }

    //Handles clicks of any icon on the board
    function selectPiece(id) {
        var x = 0,
            y = 0;

        //Get selected piece's x, y coordinates in boardMap[]
        var pieceID = id.replace("piece", "");
        var coords = getPieceXY(pieceID);
        x = coords[0];
        y = coords[1];

        //If clicked piece is not already selected, highlight it and all of its moves, if it's not as an attack otherwise resetHighlights()
        var color = "white";
        if (player == 1) color = "white";
        else color = "black";
        if (!(selectedPiece[0] == x && selectedPiece[1] == y) && boardMap[x][y].includes(color)) {

            if (selectPiece != []) resetHighlights();
            cells[pieceID].style.background = "#65d5e5";
            var type = boardMap[x][y].charAt(0);
            highlightMoves(type, x, y);
            selectedPiece = [x, y];

        } else if (!boardMap[x][y].includes(color)) {

            if (selectedPiece.length == 2) {
                //Try to move piece as attack
                var sPiecex = selectedPiece[0],
                    sPiecey = selectedPiece[1];
                var selectedPieceType = boardMap[sPiecex][sPiecey].charAt(0);
                movePiece(boardMap, sPiecex, sPiecey, x, y);
            }

        } else if (selectedPiece[0] == x && selectedPiece[1] == y) {
            resetHighlights();
            selectedPiece = [];
        }

    }

    //Handles clicks of any cell on the board
    function selectPlace(id) {
        var coords = getXY(id);
        var x = coords[0],
            y = coords[1];

        if (selectedPiece.length > 0) {
            if ((selectedPiece[0] == x && selectedPiece[1] == y)) {
                resetHighlights();
                selectedPiece = [];
            } else {
                //TODO: try to move piece to selected cell, take piece if necessary
                movePiece(boardMap, selectedPiece[0], selectedPiece[1], x, y);
            }
        } else if (boardMap[x][y] != 'x') {
            selectPiece("piece" + getCellIndex(x, y));
        }

    }

    //Gets clicks anywhere in the body and calls selectPiece() or selectPlace() if it corresponds to a game piece or cell on the board
    document.querySelector('body').addEventListener('click', function (event) {
        if (!paused) {
            if (event.target.tagName.toLowerCase() === 'i' && event.target.classList.contains("piece")) {
                selectPiece(event.target.getAttribute("id"));
            } else if (event.target.className.toLowerCase() === 'cell') {
                selectPlace(event.target.getAttribute("id"));
            }
        }
    });
}
