import { io } from "socket.io-client";
import Game from './Game';
import LobbyUsersList from "./LobbyUsersList";

let game = null;
let userList = null;
let currentScreen = "lobby";
const socket = io("http://localhost:8000");

const setup = () => {
	console.log('setup::start');
	const gameDiv = document.getElementById('game');
	const canvas = document.createElement('canvas');
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
	gameDiv.appendChild(canvas);
	initFullScreenCanvas(canvas)	
	game = new Game(canvas, socket, () => {switchScreen("lobby")});
	if (isTouchDevice()) {
		canvas.addEventListener("touchstart", (e) => {
				const touch = e.targetTouches[0];
				game.handleClick(touch.pageX, touch.pageY);
				e.stopPropagation();
				e.preventDefault();
		}, false);
	} else {
			canvas.addEventListener("mouseup", (e) => {
					game.handleClick(e.pageX, e.pageY);
					e.stopPropagation();
					e.preventDefault();
			}, false);
	}
	
	socket.on("userJoined", (user) => {
		console.log(`${user.username} joined`);
		userList.add(user.id, user.username, user.status);
	});
	socket.on("userLeft", (user) => {
		console.log(`${user.username} left`);
		userList.remove(user.id);
	});
	socket.on("userPlaying", (user) => {
		console.log(`${user.username} playing`);
		userList.setStatus(user.id, user.status);
	});
	socket.on("userReady", (user) => {
		console.log(`${user.username} ready`);
		userList.setStatus(user.id, user.status);
	});
	socket.on("userList", (users) => {
		console.log(users);
		users.forEach(u => {
			userList.add(u.id, u.username, u.status);
		});
	});
	socket.on("challenged", (player1, player2) => {
		switchScreen("game");
		alert("Challanged by " + player1.username);
	});
	socket.on("info", (info) => {
		console.log(info);
	});

	const listElement = document.getElementById("online_users");
	userList = new LobbyUsersList(listElement, onChallenge);
};

function onChallenge(userId, userName, status) {
	console.log("you challenge user " + userName + " who is " + status);
	socket.emit("challenge", userId, (player1, player2, message) => {
		if (message && message !== "") {
			// Something is wrong, maybe the other party has left
			alert(message);
		} else {
			// The game has started
			console.log("Playing with " + player2.name);
			switchScreen("game");
		}
	});
}

function switchScreen(screenId) {
	document.getElementById(currentScreen).style.display = "none";
	document.getElementById(screenId).style.display = "block";
	currentScreen = screenId;
}

/**
 * Resizes the canvas element once the window is resized.
 */
function initFullScreenCanvas(canvas) {
	resizeCanvas(canvas);
	window.addEventListener("resize", () => resizeCanvas(canvas));
}

/**
 * Does the actual resize
 */
function resizeCanvas(canvas) {
	canvas.width = document.width || document.body.clientWidth;
	canvas.height = document.height || document.body.clientHeight; 
	game && game.handleResize();
}

function isTouchDevice() {
	return ('ontouchstart' in document.documentElement);
}

setup();
