/*******
FTC Simulator
By Aaron Becker
Lastminute
*******/

console.log("init begin; ftc Simulator weee :)))\nBy Aaron Becker");

//INIT STUFF

const gamePad = require('node-gamepad');
const fs = require('fs');
const express = require('express');
const path = require('path');

//SETTINGS
const serverPort = 80;
const websocketPort = 8080;
const assetsDirectory = "static";
const frontendFile = "main.html";

//CONTROLLERS
const controllerA = new gamePad('ps4/dualshock4', {
	productID: 2508
});
const controllerB = new gamePad('logitech/gamepadf310');

//WHAT CONTROLLERS ARE ENABLED
const controllerAEnabled = true;
const controllerBEnabled = false;

//CONTROLLER SETTINGS
const controllerZeros = {
	a: {
		rightStick: {
			x: 124,
			y: 124,
			max: 256
		},
		leftStick: {
			x: 130,
			y: 128
			max: 256 //GUESSED
		},
		deadZone: 25
	},
	b: {
		rightStick: {
			x: 124,
			y: 124,
			max: 256
		},
		leftStick: {
			x: 130,
			y: 128,
			max: 256
		},
		deadZone: 25
	}
}

var currentControllerPositions = {
	a: {
		rightStick: {
			x: 0,
			y: 0
		},
		leftStick: {
			x: 0,
			y: 0
		},
		buttonMappings: {
			a: false,
			b: false,
			c: false,
			d: false,
			dpadUp: false,
			dpadDown: false,
			dpadLeft: false,
			dpadRight: false
		}
	},
	b: {
		rightStick: {
			x: 0,
			y: 0
		},
		leftStick: {
			x: 0,
			y: 0
		},
		buttonMappings: {
			a: false,
			b: false,
			c: false,
			d: false,
			dpadUp: false,
			dpadDown: false,
			dpadLeft: false,
			dpadRight: false
		}
	}
}

var currentRobotPosition = {
	x: 0,
	y: 0
}

const normalizeControls = function(options) {
	let xDelta = options.x-options.stick.x;
	if (Math.abs(xDelta) < options.deadZone) {
		xDelta = 0;
	}
	options.position.x = xDelta;
	let yDelta = options.y-options.stick.y;
	yDelta*=-1; //idk why but y is inverted
	if (Math.abs(yDelta) < options.deadZone) {
		yDelta = 0;
	}
	options.position.y = yDelta;
}

const updateRobotPosition = function(powerLeft, powerRight) {
	robot.
}

//CONNECT CONTROLLER
console.log("initting controlers");
if (!controllerAEnabled && !controllerBEnabled) {
	throw "no controller was enabled you meme"
}
if (controllerAEnabled) {
	try {
		controllerA.connect();
	} catch(e) {
		throw "Could not init controllerA, is it connected?";
	}

	//do the control mapping
	controllerA.on('left:move', function(position) {
	    normalizeControls({
	    	x: position.x,
	    	y: position.y,
	    	stick: controllerZeros.a.leftStick,
	    	deadZone: controllerZeros.a.deadZone,
	    	position: currentControllerPositions.a.leftStick
	    })
	});
	controllerA.on('right:move', function(position) {
	    normalizeControls({
	    	x: position.x,
	    	y: position.y,
	    	stick: controllerZeros.a.rightStick,
	    	deadZone: controllerZeros.a.deadZone,
	    	position: currentControllerPositions.a.rightStick
	    })
	});
	//https://github.com/carldanley/node-gamepad/blob/master/controllers/ps4/dualshock4.json
	console.log("Registered movement controls for controllerA");
	controllerA.on("dpadUp:press", () => {
		currentControllerPositions.a.buttonMappings.dpadUp = true;
	});
	controllerA.on("dpadUp:release", () => {
		currentControllerPositions.a.buttonMappings.dpadUp = false;
	});
	controllerA.on("dpadDown:press", () => {
		currentControllerPositions.a.buttonMappings.dpadDown = true;
	});
	controllerA.on("dpadDown:release", () => {
		currentControllerPositions.a.buttonMappings.dpadDown = false;
	});
	controllerA.on("dpadRight:press", () => {
		currentControllerPositions.a.buttonMappings.dpadRight = true;
	});
	controllerA.on("dpadRight:release", () => {
		currentControllerPositions.a.buttonMappings.dpadRight = false;
	});
	controllerA.on("dpadLeft:press", () => {
		currentControllerPositions.a.buttonMappings.dpadLeft = true;
	});
	controllerA.on("dpadLeft:release", () => {
		currentControllerPositions.a.buttonMappings.dpadLeft = false;
	});
	console.log("Registered button controls for controllerA");
}
if (controllerBEnabled) {
	try {
		controllerB.connect();
	} catch(e) {
		throw "Could not init controllerB, is it connected?";
	}
	//do the control mapping
	controllerB.on('left:move', function(position) {
	    normalizeControls({
	    	x: position.x,
	    	y: position.y,
	    	stick: controllerZeros.b.leftStick,
	    	deadZone: controllerZeros.b.deadZone,
	    	position: currentControllerPositions.b.leftStick
	    })
	});
	controllerB.on('right:move', function(position) {
	    normalizeControls({
	    	x: position.x,
	    	y: position.y,
	    	stick: controllerZeros.b.rightStick,
	    	deadZone: controllerZeros.b.deadZone,
	    	position: currentControllerPositions.b.rightStick
	    })
	});
	//https://github.com/carldanley/node-gamepad/blob/master/controllers/ps4/dualshock4.json
	console.log("Registered movement controls for controllerB");
	controllerB.on("dpadUp:press", () => {
		currentControllerPositions.b.buttonMappings.dpadUp = true;
	});
	controllerB.on("dpadUp:release", () => {
		currentControllerPositions.b.buttonMappings.dpadUp = false;
	});
	controllerB.on("dpadDown:press", () => {
		currentControllerPositions.b.buttonMappings.dpadDown = true;
	});
	controllerB.on("dpadDown:release", () => {
		currentControllerPositions.b.buttonMappings.dpadDown = false;
	});
	controllerB.on("dpadRight:press", () => {
		currentControllerPositions.b.buttonMappings.dpadRight = true;
	});
	controllerB.on("dpadRight:release", () => {
		currentControllerPositions.b.buttonMappings.dpadRight = false;
	});
	controllerB.on("dpadLeft:press", () => {
		currentControllerPositions.b.buttonMappings.dpadLeft = true;
	});
	controllerB.on("dpadLeft:release", () => {
		currentControllerPositions.b.buttonMappings.dpadLeft = false;
	});
	console.log("Registered button controls for controllerB");
}

console.log("init express");
const app = express();
app.use("/static",express.static(path.join(__dirname, assetsDirectory))); //config static

console.log("routes init");
app.get('/', (req, res) => {
	console.log("cli request");
	fs.readFile(frontendFile, (error, buffer) => {
		if (error) {
			res.end("Couldn't find file: "+frontendFile);
		} else {
			res.end(buffer);
		}
	});
})

console.log("server init");
app.listen(serverPort, () => console.log(`server OK, port=${serverPort}!`));

console.log("websocket bois init");

const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: websocketPort });
wss.on('connection', ws => {
  ws.on('message', message => {
    console.log(`Received message => ${message}`)
  })
  ws.send(JSON.stringify({"status": "OK"}));
})