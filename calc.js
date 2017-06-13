"use strict";

//Creates an n(length)-dimensional array
//From solution here: https://stackoverflow.com/questions/966225/how-can-i-create-a-two-dimensional-array-in-javascript/966938#966938
function createArray(length) {
    var arr = new Array(length || 0),
        i = length;

    if (arguments.length > 1) {
        var args = Array.prototype.slice.call(arguments, 1);
        while (i--) arr[length - 1 - i] = createArray.apply(this, args);
    }

    return arr;
}

//Returns all of a pieces' available moves as a 2d array of x,y coordinates 
function calcMoves(type, map, x, y, color) {

    if (color == null) {
        color = "white"; //Color of currently selected piece

        if (map[x][y].includes("white")) {
            color = "white";
        } else if (map[x][y].includes("black")) {
            color = "black";
        }
    }

    var result = [];

    if (type == 'p') { //Calculate pawn moves

        //Not considering en passant, pawn can move only 1 square away from its starting point, except at the first move allowing 2 squares, vertically
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
            if (map[xi][y] == 'x' && map[xi - xdirection][y] == 'x') {
                result.push([xi, y]);
                //console.log("Calculated pawn move at " + xi + ", " + y);
            }
        }


        //Check space 1 square in front
        if (x + xdirection >= 0 && x + xdirection < 8) {
            if (map[x + xdirection][y] == 'x') {
                result.push([(x + xdirection), y]);
                //console.log("Calculated pawn move at " + (x + xdirection) + ", " + y);
            }
        }

        //Show takeouts diagonally
        if ((x + xdirection >= 0 && x + xdirection < 8) && (y + 1 >= 0 && y + 1 < 8)) {
            if (map[x + xdirection][y + 1] != 'x' && !map[x + xdirection][y + 1].includes(color)) {
                if (map[x + xdirection][y + 1].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }

                result.push([x + xdirection, y + 1]);
            }
        }
        if ((x + xdirection >= 0 && x + xdirection < 8) && (y - 1 >= 0 && y - 1 < 8)) {
            if (map[x + xdirection][y - 1] != 'x' && !map[x + xdirection][y - 1].includes(color)) {
                if (map[x + xdirection][y - 1].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }

                result.push([x + xdirection, y - 1]);

            }
        }


    } else if (type == 'r') { //Calculate rook moves

        //Rook can move any amount of free spaces vertically or horizontally

        //Check vertical down
        for (var xdir = -1; x + xdir >= 0 && x + xdir < 8; xdir -= 1) {

            if (map[x + xdir][y] == 'x') {
                result.push([x + xdir, y]);
            } else if (map[x + xdir][y] != 'x' && !map[x + xdir][y].includes(color)) {
                if (map[x + xdir][y].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([x + xdir, y]);
                break;
            } else break;
        }

        //Check vertical up
        for (var xdir = 1; x + xdir >= 0 && x + xdir < 8; xdir += 1) {

            if (map[x + xdir][y] == 'x') {
                result.push([x + xdir, y]);
            } else if (map[x + xdir][y] != 'x' && !map[x + xdir][y].includes(color)) {
                if (map[x + xdir][y].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([x + xdir, y]);
                break;
            } else break;
        }

        //Check horizontal left
        for (var ydir = -1; y + ydir >= 0 && y + ydir < 8; ydir -= 1) {

            if (map[x][y + ydir] == 'x') {
                result.push([x, y + ydir]);
            } else if (map[x][y + ydir] != 'x' && !map[x][y + ydir].includes(color)) {
                if (map[x][y + ydir].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([x, y + ydir]);
                break;
            } else break;
        }

        //Check horizontal right
        for (var ydir = 1; y + ydir >= 0 && y + ydir < 8; ydir += 1) {

            if (map[x][y + ydir] == 'x') {
                result.push([x, y + ydir]);
            } else if (map[x][y + ydir] != 'x' && !map[x][y + ydir].includes(color)) {
                if (map[x][y + ydir].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
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

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
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

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
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

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
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

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
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
                        if (!(map[nextx][nexty]).includes(color)) {
                            if (map[nextx][nexty].charAt(0) == 'g') {
                                //TODO: check which color's king, display in game
                                //console.log("King is in check");
                            }
                            result.push([nextx, nexty]);
                            //console.log("Calculating knight move at " + (x + xdir) + ", " + (y + ydir));
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

            if (map[x + xdir][y] == 'x') {
                result.push([x + xdir, y]);
            } else if (map[x + xdir][y] != 'x' && map[x + xdir][y].includes(color)) {
                break;
            } else if (map[x + xdir][y] != 'x' && !map[x + xdir][y].includes(color)) {
                if (map[x + xdir][y].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([x + xdir, y]);
                break;
            } else break;
        }

        //Check vertical up
        for (var xdir = 1; x + xdir >= 0 && x + xdir < 8; xdir += 1) {

            if (map[x + xdir][y] == 'x') {
                result.push([x + xdir, y]);
            } else if (map[x + xdir][y] != 'x' && map[x + xdir][y].includes(color)) {
                break;
            } else if (map[x + xdir][y] != 'x' && !map[x + xdir][y].includes(color)) {
                if (map[x + xdir][y].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([x + xdir, y]);
                break;
            } else break;
        }

        //Check horizontal left
        for (var ydir = -1; y + ydir >= 0 && y + ydir < 8; ydir -= 1) {

            if (map[x][y + ydir] == 'x') {
                result.push([x, y + ydir]);
            } else if (map[x][y + ydir] != 'x' && !map[x][y + ydir].includes(color)) {
                if (map[x][y + ydir].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([x, y + ydir]);
                break;
            } else break;
        }

        //Check horizontal right
        for (var ydir = 1; y + ydir >= 0 && y + ydir < 8; ydir += 1) {

            if (map[x][y + ydir] == 'x') {
                result.push([x, y + ydir]);
            } else if (map[x][y + ydir] != 'x' && !map[x][y + ydir].includes(color)) {
                if (map[x][y + ydir].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([x, y + ydir]);
                break;
            } else break;
        }
        //Up Left
        for (var xinc = -1, yinc = -1; x + xinc >= 0 && y + yinc >= 0; xinc -= 1, yinc -= 1) {
            var nextx = x + xinc,
                nexty = y + yinc;

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    // console.log("King is in check");
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

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
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

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
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

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
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

            if (map[x + xdir][y] == 'x') {
                result.push([x + xdir, y]);
            } else if (map[x + xdir][y] != 'x' && map[x + xdir][y].includes(color)) {
                break;
            } else if (map[x + xdir][y] != 'x' && !map[x + xdir][y].includes(color)) {
                if (map[x + xdir][y].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([x + xdir, y]);
                break;
            }

            //Terminate after one move calculated
            break;
        }

        //Check vertical up
        for (var xdir = 1; x + xdir >= 0 && x + xdir < 8; xdir += 1) {

            if (map[x + xdir][y] == 'x') {
                result.push([x + xdir, y]);
            } else if (map[x + xdir][y] != 'x' && map[x + xdir][y].includes(color)) {
                break;
            } else if (map[x + xdir][y] != 'x' && !map[x + xdir][y].includes(color)) {
                if (map[x + xdir][y].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([x + xdir, y]);
                break;
            }
            break;
        }

        //Check horizontal left
        for (var ydir = -1; y + ydir >= 0 && y + ydir < 8; ydir -= 1) {

            if (map[x][y + ydir] == 'x') {
                result.push([x, y + ydir]);
            } else if (map[x][y + ydir] != 'x' && !map[x][y + ydir].includes(color)) {
                if (map[x][y + ydir].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([x, y + ydir]);
                break;
            }
            break;
        }

        //Check horizontal right
        for (var ydir = 1; y + ydir >= 0 && y + ydir < 8;) {

            if (map[x][y + ydir] == 'x') {
                result.push([x, y + ydir]);
            } else if (map[x, y + ydir] != 'x' && !map[x][y + ydir].includes(color)) {
                result.push([x, y + ydir]);
                break;
            } else break;
            
            break;
        }
        //Up Left
        for (var xinc = -1, yinc = -1; x + xinc >= 0 && y + yinc >= 0;) {
            var nextx = x + xinc,
                nexty = y + yinc;

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([nextx, nexty]);
                break;
            } else {
                break;
            }
            break;
        }

        //Up Right
        for (var xinc = -1, yinc = 1; x + xinc >= 0 && y + yinc < 8;) {
            var nextx = x + xinc,
                nexty = y + yinc;

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([nextx, nexty]);
                break;
            } else {
                break;
            }
            break;
        }

        //Down Left
        for (var xinc = 1, yinc = -1; x + xinc < 8 && y + yinc >= 0;) {
            var nextx = x + xinc,
                nexty = y + yinc;

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
                }
                result.push([nextx, nexty]);
                break;
            } else {
                break;
            }
            break;
        }

        //Down Right
        for (var xinc = 1, yinc = 1; x + xinc < 8 && y + yinc < 8;) {
            var nextx = x + xinc,
                nexty = y + yinc;

            if (map[nextx][nexty] == 'x') {
                result.push([nextx, nexty]);
            } else if (!map[nextx][nexty].includes(color)) {
                if (map[nextx][nexty].charAt(0) == 'g') {
                    //TODO: check which color's king, display in game
                    //console.log("King is in check");
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


//Returns a list of all opponent moves from currx, curry that can take down a piece given its proposed coordinates nextx, nexty. if there are no moves, returns null
//  Result array structure: [ [movex, movey] ]
function calcOpponentMovesAtPos(map, currx, curry, nextx, nexty) {
    var result = new Array();
    result[0] = [];
    var resulti = 0;

    //Set up mock map where the piece has already been moved
    let mockMap = map.map(o => Object.assign({}, o));
    mockMap[nextx][nexty] = map[currx][curry];
    mockMap[currx][curry] = 'x';
    
    
    //Get items in all possible directions' coordinates from next,nexty, so that, if any item is a game piece (!'x'), its moves can be calculated. 
    //Queen can move in all possible directions, so this will cover every other piece in range's moves too
    var possibleOpponents = calcMoves('q', mockMap, nextx, nexty);


    //Calculate moves of all possible opponents, and if their possible moves include the current piece's next x and y position, add their coordinates to the list of results
    for (var x = 0; x < possibleOpponents.length; x++) {
        var opX = possibleOpponents[x][0],
            opY = possibleOpponents[x][1];

        //Check if item is a game piece
        if (mockMap[opX][opY] != 'x') {
            var opType = map[opX][opY].charAt(0);
            var oppMoves = calcMoves(opType, mockMap, opX, opY);

            for (var xi = 0; xi < oppMoves.length; xi++) {
                var moveX = oppMoves[xi][0],
                    moveY = oppMoves[xi][1];

                if (moveX == nextx && moveY == nexty) {
                    result[resulti] = [opX, opY];
                    resulti++;
                }
            }
        }
    }

    return result;
}

//Returns a list of all pieces' moves that takes given color's opponent's king. If there are no moves, returns null
//  Result array structure: [ [[piecex, piecey], [movex, movey]] ]
function calcMovesToKing(map, kingx, kingy, color) {

    var result = createArray(100, 2, 2);
    var resulti = 0;

    //List of all available player pieces as an array of arrays of x y coords
    var pieces = createArray(16, 2);
    var piecesi = 0;

    //Save memory by only calculating moves for those within the range of a queen, or knight (since it's the only one able to jump), since that covers all possible movements in chess
    var withinReach = calcMoves('q', map, kingx, kingy, color);
    var plusKnight = calcMoves('k', map, kingx, kingy, color);
    pieces = withinReach.concat(plusKnight);
    piecesi = pieces.length;


    //For every possible move a player can make within a queen's reach, check to see if that gets the given color's king into check
    var oppColor = (color == "black")?"white":"black";
    for (var i = 0; i < piecesi; i++) {
        //List of current piece's available moves
        var ptype = map[pieces[i][0]][pieces[i][1]].charAt(0);
        var moves = calcMoves(ptype, map, pieces[i][0], pieces[i][1], oppColor);

        //Run through piece's moves, see if piece's move location includes king
        for (var movesi = 0; movesi < moves.length; movesi++) {
            if (moves[movesi][0] == kingx && moves[movesi][1] == kingy) {
                result[resulti][0] = [pieces[i][0], pieces[i][1]];
                result[resulti][1] = [moves[movesi][0], moves[movesi][1]];
                resulti++;
            }
            /*var opponentMovesAtMove = calcOpponentMovesAtPos(boardMap, pieces[i][0], pieces[i][1], moves[movesi][0], moves[movesi][1]);
            
            for(var oppMovesi = 0; oppMovesi < opponentMovesAtMove.length; oppMovesi++) {
                if(opponentMovesAtMove[oppMovesi][0] == kingx && opponentMovesAtMove[oppMovesi][1] == kingy) {
                    result[resulti][0] = [ pieces[i][0], pieces[i][1] ];
                    result[resulti][1] = [ opponentMovesAtMove[oppMovesi][0], opponentMovesAtMove[oppMovesi][1] ];
                    resulti++;
                }
            }*/
        }
    }

    if (resulti > 0) return result;
    else return null;

}

//Returns list of moves out of check given king x and y 
//  Result array structure [ [[piecex,piecey], [movex,movey]] ]
function calcMovesOutofCheck(map, kingx, kingy) {
    var result = createArray(100, 2, 2);
    var resulti = 0;

    var color = (map[kingx][kingy].includes("black")) ? "black" : "white";
    var oppcolor = (color == "black") ? "white" : "black";

    //List of all available player pieces as an array of arrays of x y coords
    var pieces = createArray(16, 2);
    var piecesi = 0;

    //Populate pieces[][] from boardMap[][]
    for (var x = 0; x < 8; x++) {
        for (var y = 0; y < 8; y++) {
            if (map[x][y].includes(color)) {
                pieces[piecesi][0] = x;
                pieces[piecesi][1] = y;
                piecesi++;
            }
        }
    }

    //For every possible move a player can make, check to see if that gets its king out of check
    for (var i = 0; i < piecesi; i++) {
        //Calculate current piece's available moves
        var ptype = map[pieces[i][0]][pieces[i][1]].charAt(0);
        var moves = calcMoves(ptype, map, pieces[i][0], pieces[i][1]);

        for (var movesi = 0; movesi < moves.length; movesi++) {

            //Try the move on a fake map, see if the king is still in check on that map
            //--Original was being corrupted even with Array.from(), this forces a new copy
            //--From https://stackoverflow.com/questions/43484533/javascript-array-copy-getting-corrupted/43484663#43484663
            let mockMap = map.map(o => Object.assign({}, o));

            var piecexy = [pieces[i][0], pieces[i][1]];
            var movexy = [moves[movesi][0], moves[movesi][1]];
            var pdata = mockMap[piecexy[0]][piecexy[1]];
            mockMap[piecexy[0]][piecexy[1]] = 'x';
            mockMap[movexy[0]][movexy[1]] = pdata;

            if (ptype != 'g') {
                if (calcMovesToKing(mockMap, kingx, kingy, color) == null) {
                    result[resulti][0] = [piecexy[0], piecexy[1]];
                    result[resulti][1] = [movexy[0], movexy[1]];
                    resulti++;
                }
            } else {
                //Calculate the kings own move out of check, which will use a new position than global inCheck[]
                if (calcMovesToKing(mockMap, movexy[0], movexy[1], color) == null) {
                    result[resulti][0] = [piecexy[0], piecexy[1]];
                    result[resulti][1] = [movexy[0], movexy[1]];
                    resulti++;
                }
            }

        }
    }

    if (resulti > 0) return result;
    else return null;
}
