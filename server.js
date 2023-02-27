const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
// var port = 'COM5';

let xyz;
var port = new SerialPort({
	path: 'COM5',
	baudRate: 9600,
});
const parser = new ReadlineParser();
port.pipe(parser);
let buff = 0;
console.log(buff);
parser.on('data', parseString);
let arr = [];
function parseString(str) {
	console.log(str);
	xyz = str;

	// arr = str.split(' ');
	// _x = arr[0];
	// _y = arr[1];
	// _z = arr[2];
	// console.log(_x, _y, _z);
	// console.log('__');
}

//
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const path = require('path');
app.use(express.static(__dirname + '/'));
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});
let buf = 0;

io.on('connection', (socket) => {
	setInterval(() => {
		buf++;
		io.emit('message', xyz);
	}, 10);
	// socket.on('chat message', (msg) => {});
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});
