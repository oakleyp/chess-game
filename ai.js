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
        return this.moveList[moveList.length-1];
    }
    
}

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
        for(var x = 0; x < 8; x++) {
            for(var y = 0; y < 8; y++) {
                let piece = null;
                if(startmap[x][y] != 'x') {
                    let color = (startmap[x][y].includes("white"))?"white":"black";
                    let type = startmap[x][y].charAt(0);
                    let allMoves = calcMoves(type, startmap, x, y, color);
                    let movesList = createArray(allMoves.length, 2, 2);
                    for(var i = 0; i < allMoves.length; i++) {
                        let mx = allMoves[i][0], my = allMoves[i][1];
                        movesList[i][0] = [x, y];
                        movesList[i][1] = [ mx, my ];
                    }
                    //ID = type + number at end of value
                    let id = type + startmap[x][y].charAt(startmap[x][y].length-1);
                    piece = new Piece(id, startmap[x][y].charAt(0), x, y, color, movesList);
                } 
                this.map[x][y] = piece;
            }
        }
        console.dir("Initiating map:");
        console.dir(this.map.map(o => Object.assign({}, o)));
        console.log("Map count:" + this.mapCount);
        this.mapHistory[this.mapCount] = this.map.map(o => Object.assign({}, o))
        this.mapCount+=1;
        console.log("First mapHistory: ");
        console.dir(this.mapHistory);
    }
    
    pushMap(arraymap) {
        //Check where pieces have moved, and convert those changed items to piece objects for chessbot's map
        let lastx = 0, lasty = 0, nextx = 0, nexty = 0;
        for(var x = 0; x < 8; x++) {
            for(var y = 0; y < 8; y++) {
                if(arraymap[x][y] == 'x' && this.map[x][y] != null) {
                    //If the piece on the pushed map has moved, set that position to null on our map
                    lastx = x;
                    lasty = y;
                    this.map[x][y] = null;
                    continue;
                } else if(arraymap[x][y] != 'x') {
                    //If looking at the position the piece has moved to, recalculate its moves 
                    let id = arraymap[x][y].charAt(0) + arraymap[x][y].charAt(arraymap[x][y].length-1);
                    let color = arraymap[x][y].includes("black")?"black":"white";
                    if(this.map[x][y] == null || id != this.map[x][y].id || color != this.map[x][y].color) {
                        let allMoves = calcMoves(id.charAt(0), arraymap, x, y, color);
                        let movesList = createArray(allMoves.length, 2, 2);
                        for(var i = 0; i < allMoves.length; i++) {
                            let mx = allMoves[i][0], my = allMoves[i][1];
                            movesList[i][0] = [x, y];
                            movesList[i][1] = [ mx, my ];
                        }
                        nextx = x;
                        nexty = y;
                        this.map[x][y] = new Piece(id, id.charAt(0), x, y, color, movesList);
                    }
                }
            }
        }
        console.log("Pushing map")
        this.lastMove = [[lastx, lasty], [nextx, nexty]];
        if(this.map[nextx][nexty].color != this.color) {
            console.log("opp move next xy = " + nextx + ", " + nexty);
            console.log("color = " + this.map[nextx][nexty].color)
            this.lastOppMove = [[lastx, lasty], [nextx, nexty]];
        }
        console.log("Setting last move: ");
        console.dir(this.lastMove);
        console.dir("Pushing map:");
        console.dir(this.map.map(o => Object.assign({}, o)));
        console.log("Second map history: ");
        console.dir(this.mapHistory);
        this.mapHistory[this.mapCount] = this.map.map(o => Object.assign({}, o));
        this.mapCount++;
        console.log("Map count:" + this.mapCount);
    }
    
    getMovesList(piece) {
        return calcMoves(piece.type, this.board.map, piece.x, piece.y, piece.color);
    }
    
    getMoveCount() {
        return this.mapCount-1;
    }
    
    getLastMove() {
        return this.lastMove;
    }
    
    getLastOppMove() {
        return this.lastOppMove;
    }
    
    getPieceAtXY(x, y) {
        return this.map[x][y];
    }
    
    getKingXY(color) {
        
    }
    
}

class ChessBot {

    constructor(boardMap, color) {
        console.log("Initiating bot");
        
        this.color = color;
        this.oppColor = (this.color == "black") ? "white" : "black";
        
        this.boardMap = boardMap;
        
        let mockMap = this.boardMap.map(o => Object.assign({}, o));
        this.board = new Board(mockMap, this.color);

    }
    
    //Returns true if any pieces have reached or passed center board
    hasOppReachedCenter(color, board) {
        if(color == "white")
        for(x = 3; x < 7; x++) {
            for(y = 0; y < 7; y++) {
                let piece = board.getPieceAtXY(x, y);
                if(piece != null && piece.color == this.oppColor) {
                    return true;
                }
            }
        }
        return false;
    }
    
    getOppOpeningStyle(lastMove) {
        let xmirror = [0, 1, 2, 3, 4, 5, 6, 7];
        let ymirror = [0, 1, 2, 3, 4, 5, 6, 7];
        if(this.color == "black") {
            xmirror = xmirror.reverse();
            ymirror = ymirror.reverse();
        }
        
        let oppfromx = lastMove[0][0],
            oppfromy = lastMove[0][1],
            opptox = lastMove[1][0],
            opptoy = lastMove[1][1];
        
        
        if(this.color == "black") {
            if(oppfromx == 1 && oppfromy == 3) {
                
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
    
    getMirrorMove(lastMove) {
        console.dir(lastMove);
        let xmirror = [0, 1, 2, 3, 4, 5, 6, 7];
        let ymirror = [0, 1, 2, 3, 4, 5, 6, 7];
        if(this.color == "black") {
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
        switch(rand) {
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
    
    //Returns the bot's move as a 2d array - [[fromx, fromy], [tox, toy]]
    getMove(arraymap) {
        
        //Always push the new map to board to start, since it changed on opponents last move
        this.board.pushMap(arraymap);
        
        //Get opponents first move
        let lastMove = this.board.getLastOppMove();
        let lastPiece = this.board.getPieceAtXY(lastMove[1][0], lastMove[1][0]);
        
        
        //Black opening strategy, based on reading opponent popular opening moves
        // if none apply, take a random opening strategy
        if(this.board.getMoveCount() >= 1) {
            console.log("Getting last move: ");
            console.dir(lastMove);
            return this.getMirrorMove(lastMove);
            //return [[6, 1], [5, 1]];
        }
        
        
        
        
        



        //TODO: White
    }
}
