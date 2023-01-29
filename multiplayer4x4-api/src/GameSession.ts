import { Socket } from 'socket.io';
import BoardModel from './BoardModel';
import { User } from './types';

export default class GameSession {

  players: User[];
  private sockets: Socket[];
  private currentPlayer: number;
  private roomName: string;
  private boardModel: BoardModel;
  private onEndGame: () => void;

  constructor(id: number, player1: User, socket1: Socket, player2: User, socket2: Socket, onEndGame: () => void) {
    this.roomName = `game${id}`;
    this.players = [player1, player2];
    this.sockets = [socket1, socket2]
    this.currentPlayer = 0;
    this.boardModel = new BoardModel();
    this.onEndGame = onEndGame;
    for (let i = 0; i < this.players.length; i++) {
      this.setupGameListeners(i);
    }
  }

  private setupGameListeners(playerIndex: number) {
    this.sockets[playerIndex].join(this.roomName);
    this.sockets[playerIndex].on("turn", this.getTurnCallback(playerIndex));
  }

  private getTurnCallback(playerIndex: number): (column: number) => void {
    const callback = (column: number) => {
      if (playerIndex != this.currentPlayer) {
        this.sockets[playerIndex].emit("error", "It's not your turn");
        return;
      }
      const turn = this.boardModel.makeTurn(column);

      if (turn.status == BoardModel.ILLEGAL_TURN) {
        this.sockets[playerIndex].emit("error", "This turn is illegal");
        return;
      }
  
      // The turn is legal, we can broadcast it to both parties
      this.sockets[0].to(this.roomName).emit("turnResult", turn);
      this.sockets[1].to(this.roomName).emit("turnResult", turn);

      // Next player is the "current" now
      this.currentPlayer = (this.currentPlayer + 1) % 2;
      // If there's a win condition or it is a draw,
      // then players are already in lobby. Clean up listeners.
      if (turn.status == BoardModel.WIN || turn.status == BoardModel.DRAW) {
        // End game, leave room and de-register listeners
        this.sockets.forEach(s => {
          s.removeAllListeners("turn");
          s.leave(this.roomName);
        });
        // Call the callback
        this.onEndGame();
      }
    }
    return callback.bind(this);
  }

}