//================= Experimental ===========================//
// -------------------------------------------------------- //
// * ----- A hopefully semi-intelligent chess bot  ------ * //
// -------------------------------------------------------- //
// -------------------------------------------------------- //
// * ---- Here goes nothing -------------- 06/10/17 ---- OP //
// -------------------------------------------------------- //
//==========================================================//

// All black strategy based on http://www.chessstrategyonline.com/content/tutorials/how-to-start-a-game-of-chess-first-moves-black


"use strict";

//Set to false to disable debugging messages for AI
let enableLog = true;
let enableInfoMsgs = true;
let enableErrorMsgs = true;
let enableWarningMsgs = true

//Debug function for AI problems, formats a console.log call to be standard and readable
function log(classtext, sender, message, dir = null) {
    if (enableLog) {
        if (classtext == "Info" && enableInfoMsgs)
            console.log(`AI: ${classtext} from ${sender}: ${message}`);
            if(dir != null) console.dir(dir);
        else if (classtext == "Warning" && enableWarningMsgs)
            console.warn(`AI: ${classtext} from ${sender}: ${message}`);
            if(dir != null) console.dir(dir);
        else if (classtext == "Error" && enableErrorMsgs)
            console.error(`AI: ${classtext} from ${sender}: ${message}`);
            if(dir != null) console.dir(dir);
    }
}

//Piece object stores piece data and position  
class Piece {
    constructor(id, type, x, y, color, moveList) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.color = color;

        //Stores a history of piece moves
        //Array structure: [ [ pieceID, movex, movey, piece, takenPieceID ] ] 
        this.moveHistory = createArray(30, 4);

        //Stores a list of moves calculated in advance, so that we don't need to recalculate if the current strategy doesn't need to change
        //Structure: [ [x, y, opptype, priority] ]
        this.moveList = moveList;
    }


    //Returns last move by piece
    getLastMove() {
        return this.moveList[moveList.length - 1];
    }

}

//Board class stores all pieces and contains functions for getting or setting data pertaining to the current or past boardmaps
class Board {
    constructor(startmap, color) {

        //Stores the current boardMap
        this.map = createArray(8, 8);

        //Stores the boardMap of all previous states, any time a turn is taken
        this.mapHistory = createArray(50, 8, 8);
        this.mapCount = 0;

        //Stores list of piece moves on map, [ [fromx, fromy], [tox, toy] ]
        this.lastMove = createArray(2, 2);

        //Stores list of opponent moves on map
        this.lastOppMove = createArray(2, 2);

        this.color = color;

        this.init(startmap);
    }

    init(startmap) {
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                let piece = null;
                if (startmap[x][y] != 'x') {
                    let color = (startmap[x][y].includes("white")) ? "white" : "black";
                    let type = startmap[x][y].charAt(0);
                    let allMoves = calcMoves(type, startmap, x, y, color);
                    let movesList = createArray(allMoves.length, 2);
                    for (var i = 0; i < allMoves.length; i++) {
                        let mx = allMoves[i][0],
                            my = allMoves[i][1];
                        movesList[i] = [mx, my];
                    }
                    //ID = type + number at end of value
                    let id = type + startmap[x][y].charAt(startmap[x][y].length - 1);
                    piece = new Piece(id, startmap[x][y].charAt(0), x, y, color, movesList);
                }
                this.map[x][y] = piece;
            }
        }
        this.mapHistory[this.mapCount] = this.map.map(o => Object.assign({}, o))
        this.mapCount += 1;
    }

    //Recalculates and populates the move list of pieces whose current moveList conflicts with new location of last moved opponent piece
    syncMoveListsAtOppMove(oppfromx, oppfromy, oppmovex, oppmovey) {
        let mypieces = this.getPiecesByColor(this.color);

        for (var i = 0; i < mypieces.length; i++) {
            let pmoves = mypieces[i].moveList;
            for (var x = 0; x < pmoves.length; x++) {
                let move = pmoves[x];
                if ((move[0] == oppmovex && move[1] == oppmovey) || move[0] == oppfromx && move[1] == oppfromy) {
                    //Opp piece position conflicts with current movelist
                    let newmovelist = this.getMovesList(mypieces[i], this.color);
                    mypieces[i].moveList = newmovelist;
                    log("Info", "syncMoveListsAtOppMove()", "Conflict found, recalculating moves for piece at x, y -" + mypieces[i].x + ", " + mypieces[i].y);
                }
            }
        }
    }
    
    //Returns a map with text values instead of piece objects for passing to calc.js
    getTextMap(map) {
        let result = createArray(8, 8);
        for(var x = 0; x < 8; x++) {
            for(var y = 0; y < 8; y++) {
                if(map[x][y] != null) {
                    let piece = map[x][y];
                    result[x][y] = piece.type + piece.color + piece.id.charAt(piece.id.length-1);
                } else {
                    result[x][y] = 'x';
                }
                
            }
        }
        return result;
    }

    //Pushes the last boardMap onto mapHistory, increments mapCount, updates out of sync piece objects on current map  
    // Assumes called after every movePiece() in game.js
    pushMap(arraymap) {
        log("Info", "pushMap()", "Pushing and recalculating on new map:", arraymap);
        //Check where pieces have moved, and convert those changed items to piece objects for chessbot's map
        let lastx = 0,
            lasty = 0,
            nextx = 0,
            nexty = 0;
        
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                if (arraymap[x][y] == 'x' && this.map[x][y] != null) {
                    //If the piece on the pushed map has moved, set that position to null on our map
                    lastx = x;
                    lasty = y;
                    this.map[x][y] = null;
                    continue;
                } else if (arraymap[x][y] != 'x') {
                    //If looking at the position the piece has moved to, recalculate its moves 
                    let id = arraymap[x][y].charAt(0) + arraymap[x][y].charAt(arraymap[x][y].length - 1);
                    let color = arraymap[x][y].includes("black") ? "black" : "white";
                    if (this.map[x][y] == null || id != this.map[x][y].id || color != this.map[x][y].color) {
                        log("Info", "pushMap()", "recalculating moves for piece at x, y - " + x + ", " + y);
                        let allMoves = calcMoves(id.charAt(0), arraymap, x, y, color);
                        let movesList = createArray(allMoves.length, 2);
                        for (var i = 0; i < allMoves.length; i++) {
                            let mx = allMoves[i][0],
                                my = allMoves[i][1];
                            movesList[i] = [mx, my];
                        }
                        nextx = x;
                        nexty = y;
                        this.map[x][y] = new Piece(id, id.charAt(0), x, y, color, movesList);
                    }
                }
            }
        }
        this.lastMove = [[lastx, lasty], [nextx, nexty]];
        if (this.map[nextx][nexty].color != this.color) {
            this.lastOppMove = [[lastx, lasty], [nextx, nexty]];
        }
        
        log("Info", "pushMap()", "Recalculating conflicting pieces at opponent move x,y - " + nextx + ", " + nexty);
        this.syncMoveListsAtOppMove(lastx, lasty, nextx, nexty);
        
        this.mapHistory[this.mapCount] = this.map.map(o => Object.assign({}, o));
        this.mapCount++;
    }

    //Returns 2d array of x,y coords of available piece moves
    getMovesList(piece, color) {
        if(piece != null && this.map[piece.x][piece.y] != null) {
            return calcMoves(piece.type, this.getTextMap(this.map), piece.x, piece.y, color);
        } else {
            log("Warning", "getMovesList()", "Move calculation attempted on null piece");
            return [];
        }
    }

    getMoveCount() {
        return this.mapCount - 1;
    }

    getLastMove() {
        return this.lastMove;
    }

    getLastOppMove() {
        return this.lastOppMove;
    }

    //Returns piece object at xy coords on map, null if none exists    
    getPieceAtXY(x, y) {
        return this.map[x][y];
    }

    //Returns a 2d array of xy coords of pieces on the current map given color
    getPiecesByColor(color) {
        let result = [];
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                if (this.map[x][y] != null) {
                    if (this.map[x][y].color == color) {
                        result.push(this.map[x][y]);
                    }
                }
            }
        }

        return result;
    }
    
    //Returns the xy coords of a given color's king
    getKingXY(color) {
        for (var x = 0; x < 8; x++) {
            for (var y = 0; y < 8; y++) {
                if (this.map[x][y] != null) {
                    if (this.map[x][y].color == color && this.map[x][y].type == 'g') {
                        return [x, y];
                    }
                }
            }
        }
    }

}


//ChessBot class manages gameplay at each turn and is the direct interface to game.js, with functions for all strategic calculations and decision-making
class ChessBot {

    constructor(boardMap, color) {
        log("Info", "ChessBot::constructor()", "Initiating bot");

        this.color = color;
        this.oppColor = (this.color == "black") ? "white" : "black";

        this.boardMap = boardMap;

        let mockMap = this.boardMap.map(o => Object.assign({}, o));
        this.board = new Board(mockMap, this.color);

        this.inCheck = false;


    }

    //Returns true if any pieces have reached or passed center board
    hasOppReachedCenter() {
        if (this.oppColor == "white") {
            for (x = 3; x < 7; x++) {
                for (y = 0; y < 7; y++) {
                    let piece = this.board.getPieceAtXY(x, y);
                    if (piece != null && piece.color == this.oppColor) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    getOppOpeningStyle(lastMove) {
        let xmirror = [0, 1, 2, 3, 4, 5, 6, 7];
        let ymirror = [0, 1, 2, 3, 4, 5, 6, 7];
        if (this.color == "black") {
            xmirror = xmirror.reverse();
            ymirror = ymirror.reverse();
        }

        let oppfromx = lastMove[0][0],
            oppfromy = lastMove[0][1],
            opptox = lastMove[1][0],
            opptoy = lastMove[1][1];


        if (this.color == "black") {
            if (oppfromx == 1 && oppfromy == 3) {

            }
        }


    }


    getItalianOpening() {

    }

    getScotchOpening() {

    }

    getSpanishOpening() {

    }

    getQueensPawnOpening() {

    }

    getQueensGambitOpening() {

    }

    getEnglishOpening() {

    }


    //Returns the weight or importance of a particular piece, with higher being greater importance
    getPieceWeight(type) {
        switch (type) {
            case 'p':
                return 1;
            case 'k':
                return 2;
            case 'b':
                return 3;
            case 'r':
                return 4;
            case 'q':
                return 5;
            case 'g':
                return 6;
        }
    }

    getWeightedMoves(availablePieces = null) {
        //Result array is foratted as follows:
        // [[[fromx, fromy], [tox, toy, priority]]]
        //Priority is calculated as the result of that move's taken piece weight minus it's own weight if that leaves it vulnerable to any opponent move
        let results = createArray(100, 2, 3);
        let resultsi = 0;


        let mypieces = this.board.getPiecesByColor(this.color);
        if(availablePieces != null) mypieces = availablePieces;
        let oppPieces = this.board.getPiecesByColor(this.oppColor);

        //Go through all pieces, and see which ones take an opponents piece
        for (var i = 0; i < mypieces.length && mypieces[i] != null; i++) {
            let pieceMoves = mypieces[i].moveList;
            for (var x = 0; x < pieceMoves.length; x++) {
                //See if move in list is an opponent's piece
                let target = this.board.getPieceAtXY(pieceMoves[x][0], pieceMoves[x][1]);
                if (target != null) {
                    //Get the weight of the reward of attacking that piece
                    let reward = this.getPieceWeight(target.type);

                    //Get the weight of the risk of attacking that piece, if any opponent pieces can reach it, risk is the weight value of the piece that could be taken
                    let risk = 0;
                    for (var y = 0; y < oppPieces.length; y++) {
                        let oppMoves = oppPieces[y].moveList;
                        for (var z = 0; z < oppMoves.length; z++) {
                            if (oppMoves[z][0] == target.x && oppMoves[z][1] == target.y) {
                                risk = this.getPieceWeight(mypieces[i].type);
                                break;
                            }
                        }
                    }

                    results[resultsi] = ([[mypieces[i].x, mypieces[i].y, 0], [target.x, target.y, reward - risk]]);
                    resultsi++;

                } else {
                    results[resultsi] = ([[mypieces[i].x, mypieces[i].y, 0], [pieceMoves[x][0], pieceMoves[x][1], 0]]);
                    resultsi++;
                }
                
            }
        }
        
        //Trim off unused part of array
        results.splice(resultsi+1);

        return results;
    }

    getPriorityMove(weightedMoves) {

        let highestPriority = 0;
        let result = null;

        for (var i = 0; i < weightedMoves.length; i++) {
            let wmove = weightedMoves[i];
            if (wmove[1][2] > highestPriority) {
                highestPriority = wmove[1][2];
                result = [[wmove[0][0], wmove[0][1]], [wmove[1][0], wmove[1][1]]];
            }
        }

        if (highestPriority == 0) {
            let wmove = weightedMoves[0];
            result = [[wmove[0][0], wmove[0][1]], [wmove[1][0], wmove[1][1]]];
            log("Info", "getPriortiyMove()", "No priority moves found.");
        }

        return result;
    }

    getMirrorMove(lastMove) {
        console.dir(lastMove);
        let xmirror = [0, 1, 2, 3, 4, 5, 6, 7];
        let ymirror = [0, 1, 2, 3, 4, 5, 6, 7];
        if (this.color == "black") {
            xmirror = xmirror.reverse();
        }

        let oppfromx = lastMove[0][0],
            oppfromy = lastMove[0][1],
            opptox = lastMove[1][0],
            opptoy = lastMove[1][1];

        let fromx = xmirror.indexOf(oppfromx),
            fromy = ymirror.indexOf(oppfromy),
            tox = xmirror.indexOf(opptox),
            toy = ymirror.indexOf(opptoy);

        return [[fromx, fromy], [tox, toy]];
    }

    getRandomOpeningMove() {
        let rand = Math.floor(Math.random() * 7);
        switch (rand) {
            case 0:
                return this.getItalianOpening();
            case 1:
                return this.getScotchOpening();
            case 2:
                return this.getSpanishOpening();
            case 3:
                return this.getQueensPawnOpening();
            case 4:
                return this.getQueensGambitOpening();
            case 5:
                return this.getEnglishOpening();
            case 6:
            default:
                return this.getMirrorMove();

        }
    }

    pushMap(arraymap) {
        //Always push the new map to board to start, since it changed on opponents last move
        this.board.pushMap(arraymap);
    }

    //Returns the bot's move as a 2d array - [[fromx, fromy], [tox, toy]]
    getMove() {

        //Get opponents first move
        let lastMove = this.board.getLastOppMove();
        let lastPiece = this.board.getPieceAtXY(lastMove[1][0], lastMove[1][0]);

        if (!this.inCheck) {
            //Black opening strategy, based on reading opponent popular opening moves
            // if none apply, take a random opening strategy
            if (this.board.getMoveCount() <= 8) {
                return this.getMirrorMove(lastMove);
                //return [[6, 1], [5, 1]];
            } else {
                //The game is getting real, time to start doing something strategic
                let wmoves = this.getWeightedMoves();
                let move = this.getPriorityMove(wmoves);
                if (move != null) {
                    log("Info", "getMove()", "Chessbot move:", move);
                    return move;
                } else {
                    log("Error:", "getMove()", "No moves found in getPriorityMove()");
                    return;
                }
            }
        } else { //Find the best way out of check
            //Update piece moveLists according to calcMovesOutOfCheck
            let kingxy = this.board.getKingXY(this.color);
            let movesOutOfCheck = calcMovesOutofCheck(this.board.getTextMap(this.board.map), kingxy[0], kingxy[1]);
            log("Info", "getMove()[inCheck=true]", "Found moves out of check:", movesOutOfCheck);
            let availablePieces = createArray(16);
            let api = 0;
            let newMoveList = createArray(20, 2);
            let nmli = 0;
            for(var i = 0; i < movesOutOfCheck.length; i++) {
                
                let move = movesOutOfCheck[i];
                if(typeof(move[0][0]) == "undefined" || typeof(move[0][1]) == "undefined") break;
                
                let pieceupdated = false;
                let oldpiece = this.board.getPieceAtXY(move[0][0], move[0][1]);
                if(api == 0) {
                    let ml = [[ move[1][0], move[1][1] ]];
                    availablePieces[api] = new Piece(oldpiece.id, oldpiece.type, oldpiece.x, oldpiece.y, oldpiece.color, ml);
                    nmli++;
                } else if(availablePieces[api] != null && availablePieces[api].id == oldpiece.id) {
                    availablePieces[api].moveList[nmli] = [ move[1][0], move[1][1] ];
                    nmli++;
                } else {
                    api++;
                    nmli = 0;
                    let ml = [[ move[1][0], move[1][1] ]];
                    availablePieces[api] = new Piece(oldpiece.id, oldpiece.type, oldpiece.x, oldpiece.y, oldpiece.color, ml);
                    nmli++;
                }
                
            }
            
            //Remove null items in availablePieces
            availablePieces.splice(api+1);
            
            //Get priority move given available pieces and updated moveLists
            let wmoves = this.getWeightedMoves(availablePieces);
            let pmove = this.getPriorityMove(wmoves);
            if (pmove != null) {
                //TODO: recalculate moves on available pieces now that not in check
                for(var i = 0; i < availablePieces.length; i++) {
                    availablePieces[i].moveList = this.board.getMovesList(availablePieces[i], this.color);
                }
                this.inCheck = false;
                log("Info", "getMove()[inCheck=true]", "ChessBot move:", pmove);
                return pmove;
            } else {
                log("Error:", "getMove()[inCheck=true]", "No moves found in getPriorityMove(), can't make move out of check");
                return;
            }
            
        }




        //TODO: White
    }

    setInCheck(tf) {
        this.inCheck = (tf == true) ? true : false;
    }
}
