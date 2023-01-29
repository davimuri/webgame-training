import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import { GameTurn, User } from './types';
import GameSession from './GameSession';

type ChallengeCallbackType = (player1: number, player2: number, message: string) => void;

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  info: (text: string) => void;
  userJoined: (user: User) => void;
  userLeft: (user: User) => void;
  userList: (users: User) => void;
  challenged: (player1: User, player2: User) => void;
  userPlaying: (user: User) => void;
  userReady: (user: User) => void;
  turnResult: (turn: GameTurn) => void;
  error: (message: string) => void;
}

interface ClientToServerEvents {
  hello: () => void;
  challenge: (challengedUserId: number, callback: ChallengeCallbackType) => void;
  turn: (column: number) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

let maxUserId = 0;
let maxGameId = 0;
const users = new Map<number, User>();
const userSockets = new Map<number, Socket>();
const app = express();
const server = http.createServer(app);
const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(
  server,
  {
    cors: {
      origin: "http://localhost:3000"
    }
  }
);

app.get('/', (req, res) => {
  res.send('<h1>Hello world 2</h1>');
});

io.on('connection', (socket) => {
  console.log('a user connected');
  const userId = addUser(socket);

  socket.on('challenge', (challengedUserId, callback) => {
    console.log("challenge::start");
    printUsers();
    console.log(typeof challengedUserId);
    console.log(`challenge - challengedUserId: ${challengedUserId} user: ${users.get(challengedUserId)}`);
    if (userId === challengedUserId) {
      callback(userId, challengedUserId, "Cannot challenge self");
    } else if (!users.has(challengedUserId)) {
      callback(userId, challengedUserId, `Cannot find user ${challengedUserId}`);
    } else if (users.get(challengedUserId).status != "ready") {
      callback(userId, challengedUserId, "User is not ready to play");
    } else {
      startGame(users.get(userId), users.get(challengedUserId), callback);
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(userId);
    if (user) {
      socket.broadcast.emit("userLeft", user);
      users.delete(userId);
      userSockets.delete(userId);
    }
    printUsers();
  });
});

/**
* Registers the user on the server. Notifies everybody that
* he joined the lobby, sends the list of the online users
* to the newly connected one.
* @param socket the socket object of the connected client
* @returns the ID of the newly created user
*/
function addUser(socket: Socket): number {
  const userId = maxUserId++;
  const userName = "User " + userId;
  const user = {id: userId, username: userName, status: "ready"};
  users.set(userId, user);
  userSockets.set(userId, socket);
  socket.emit("info", `You have connected as ${userName}`);
  socket.emit("userList", Array.from(users.values()));
  socket.broadcast.emit("userJoined", user);
  printUsers();
  return userId;
}

function startGame(initiator: User, target: User, initiatorRespond: ChallengeCallbackType) {
  initiator.status = target.status = "playing";
  initiatorRespond(initiator.id, target.id, "");
  if (userSockets.has(target.id)) {
    userSockets.get(target.id).emit('challenged', initiator, target);
  }
  io.sockets.emit("userPlaying", initiator);
  io.sockets.emit("userPlaying", target);
  const gameId = maxGameId++;
  new GameSession(
    gameId,
    target, userSockets.get(target.id),
    initiator, userSockets.get(initiator.id),
    () => {
      initiator.status = target.status = "ready";
      io.sockets.emit("userReady", initiator);
      io.sockets.emit("userReady", target);
    }
  );
}

function printUsers() {
  for (const entry of users.entries()) {
    console.log(`${entry[0]} -> ${JSON.stringify(entry[1])}`);
  }
}

server.listen(8000, () => {
  console.log('listening on *:8000');
});