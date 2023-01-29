interface User {
  id: number;
  username: string;
  status: string;
}

interface GameTurn {
  status: number;
  x: number;
  y: number;
  piece: number;
}

export {
  User,
  GameTurn
};