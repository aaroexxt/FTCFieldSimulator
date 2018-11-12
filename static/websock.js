//Websock.js

console.log("websock loaded");

const WSport = 8080;
const fieldWidth = 1000;
const fieldHeight = 500;
function heartbeat() {
  clearTimeout(this.pingTimeout);
  this.pingTimeout = setTimeout(() => {
  	console.log("Terminating websocket");
    this.terminate();
  }, 1000 + 100); //localhost so latency should be low
}

var currentRobotPositionA = {
	x: 0,
	y: 0
};
var currentRobotPositionB = {
	x: 0,
	y: 0
};
var robotEndpointsA = [[0,0]];
var robotEndpointsB = [[0,0]];
var robotField = [];

const field = document.getElementById("field");
field.width = fieldWidth;
field.height = fieldHeight;
const fctx = field.getContext("2d");

ws = new WebSocket(`ws://${location.host}:${WSport}`);
ws.onerror = (err) => {
	console.error(err);
}
ws.onopen = (msg) => {
	console.log("open: "+msg);
	heartbeat();
	ws.send("hi")
}
ws.onclose = (msg) => {
	console.log("close: "+msg);
	clearTimeout(this.pingTimeout);
}
ws.onping = ping => {
	heartbeat();
}
ws.onmessage = (msg) => {
	let data = JSON.parse(msg.data);
	let field = data.field;
	let status = data.status;
	let robotA = data.robotA;
	let robotB = data.robotB;
	console.log("msg: ",JSON.parse(msg.data));
	if (status == "OK" && typeof robotA !== "undefined" && typeof robotB !== "undefined") {
		console.log("recieved ok statusupdate");
		let crpA = currentRobotPositionA;
		crpA.x = robotA.x;
		crpA.y = robotA.y;
		robotEndpointsA = robotA.endpoints;
		let crpB = currentRobotPositionB;
		crpB.x = robotB.x;
		crpB.y = robotB.y;
		robotEndpointsB = robotB.endpoints;
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
	fctx.clearRect(0,0,fieldWidth, fieldHeight);
	fctx.beginPath();
	let epA = robotEndpointsA;
	let epB = robotEndpointsB;
	fctx.moveTo(epA[0][0], epA[0][1]);
	for (var i=1; i<epA.length; i++) {
		fctx.lineTo(epA[i][0], epA[i][1]);
	}
	fctx.moveTo(epB[0][0], epB[0][1]);
	for (var i=1; i<epB.length; i++) {
		fctx.lineTo(epB[i][0], epB[i][1]);
	}
	fctx.stroke();

}