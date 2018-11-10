//Websock.js

console.log("websock loaded");

const WSport = 8080;
var currentRobotPosition = {
	x: 0,
	y: 0
};
var robotEndpoints = [[0,0]];
var robotField = [];

const field = document.getElementById("field");
field.width = 500;
field.height = 500;
const fctx = field.getContext("2d");

ws = new WebSocket(`ws://${location.host}:${WSport}`);
ws.onerror = (err) => {
	console.error(err);
}
ws.onopen = (msg) => {
	console.log("open: "+msg);
	ws.send("hi")
}
ws.onclose = (msg) => {
	console.log("close: "+msg);
}
ws.onmessage = (msg) => {
	let data = JSON.parse(msg.data);
	let field = data.field;
	let status = data.status;
	let robot = data.robot;
	let endpoints = data.endpoints;
	console.log("msg: ",JSON.parse(msg.data));
	if (status == "OK" && typeof robot !== "undefined" && typeof endpoints !== "undefined") {
		console.log("recieved ok statusupdate");
		let crp = currentRobotPosition;
		crp.x = robot.x;
		crp.y = robot.y;
		robotEndpoints = endpoints;
		updateRobotPos();
	} else if (status == "OK" && typeof field !== "undefined") {
		console.log("field update");
		robotField = field;
		document.getElementById("wait").style.display = "none";
	} else {
		console.warn("no positional update?");
	}
}

function updateRobotPos() {
	fctx.clearRect(0,0,field.width, field.height);
	let ep = robotEndpoints;
	fctx.moveTo(ep[0][0], ep[0][1]);
	for (var i=1; i<ep.length; i++) {
		fctx.lineTo(ep[i][0], ep[i][1]);
	}
	fctx.stroke();
}