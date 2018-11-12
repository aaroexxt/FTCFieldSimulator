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
const controllerB = new gamePad('ps4/dualshock4');

//WHAT CONTROLLERS ARE ENABLED
const controllerAEnabled = false;
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
			y: 128,
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

var currentRobotA = {
	x: 100,
	y: 100,
	angle: 0,
	velocityX: 0,
	velocityY: 0,
	width: 100,
	height: 100,
	moveFriction: 0.1,
	angFriction: 0.1,
	maxSpeed: 3,
	omega: 0, //ang vel
	endpoints: [[0,0], [10,0], [10,10], [0,10]]
}
var currentRobotB = {
	x: 100,
	y: 100,
	angle: 0,
	velocityX: 0,
	velocityY: 0,
	width: 100,
	height: 100,
	moveFriction: 0.1,
	angFriction: 0.1,
	maxSpeed: 3,
	omega: 0, //ang vel
	endpoints: [[0,0], [10,0], [10,10], [0,10]]
}

const normalizeControls = function(options) {
	let xDelta = options.x-options.stick.x;
	if (Math.abs(xDelta) < options.deadZone) {
		xDelta = 0;
	}
	options.position.x = xDelta;
	let yDelta = options.y-options.stick.y;
	//yDelta*=-1; //idk why but y is inverted
	if (Math.abs(yDelta) < options.deadZone) {
		yDelta = 0;
	}
	options.position.y = yDelta;
}

const updateRobotPosition = function(robot, deltaTime, powerLeftX, powerLeftY, powerRightX, powerRightY) {
	//ALL The functions return deltas
	let strafeF = strafeRobot(powerLeftX, robot); //returns deltas

	let moveF = moveRobotFB(powerLeftY, robot);
	let angle = turnRobot(powerRightX, robot);

	robot.velocityX += strafeF[0]+moveF[0]*2;
	robot.velocityY += strafeF[1]+moveF[1]*2;

	if (robot.velocityX < 0) {
		robot.velocityX += robot.moveFriction;
	} else if (robot.velocityX !== 0) {
		robot.velocityX -= robot.moveFriction;
	}

	if (robot.velocityY < 0) {
		robot.velocityY += robot.moveFriction;
	} else if (robot.velocityY !== 0) {
		robot.velocityY -= robot.moveFriction;
	}

	if (robot.velocityX > robot.maxSpeed) {
		robot.velocityX = robot.maxSpeed;
	} else if (robot.velocityX < -robot.maxSpeed) {
		robot.velocityX = robot.maxSpeed;
	}
	if (robot.velocityY > robot.maxSpeed) {
		robot.velocityY = robot.maxSpeed;
	} else if (robot.velocityY < -robot.maxSpeed) {
		robot.velocityY = robot.maxSpeed;
	}

	robot.x += robot.velocityX*deltaTime;
	robot.y += robot.velocityY*deltaTime;

	robot.omega += angle;
	if (robot.omega < 0) {
		robot.omega +=robot.angFriction;
	} else if (robot.omega !== 0) {
		robot.omega -=robot.angFriction;
	}

	robot.angle += (robot.omega*(deltaTime/50));
	robot.angle = constrainAngle(robot.angle);

	//console.log(robot.velocityX, robot.velocityY, moveF)

	//robot.angle = deltaTheta*deltaTime; //lol
	//robot.omega = turnD;
	//robot.
}
const reduceRobotFinal = (robot) => {
	console.log("reduce")
	if (robot.angle < 0.2) {
		robot.angle = 0;
	} else if (robot.angle > -0.2) {
		robot.angle = 0;
	}

	if (robot.velocityY < 0.01) {
		robot.velocityY = 0;
	} else if (robot.velocityY > -0.01) {
		robot.velocityY = 0;
	}
	if (robot.velocityX < 0.01) {
		robot.velocityX = 0;
	} else if (robot.velocityX > -0.01) {
		robot.velocityX = 0;
	}
}
const strafeRobot = function(power, robot) {
	let strafeAngle = (robot.angle+90);
	strafeAngle = constrainAngle(strafeAngle);

	strafeDistance = fFromJoystickPower(power);
	return [-strafeDistance*Math.cos(strafeAngle), -strafeDistance*Math.sin(strafeAngle)];
}
const moveRobotFB = function(power, robot) {
	let moveAngle = robot.angle;
	moveAngle = constrainAngle(moveAngle);

	moveDistance = fFromJoystickPower(power);
	return [moveDistance*Math.cos(moveAngle), moveDistance*Math.sin(moveAngle)];
}
const turnRobot = function(power, robot) {
	let turnAngle = (degFromJoystickPower(power));
	//turnAngle = constrainAngle(turnAngle);
	//turnAngle %= 360; //between 0 and 360
	//robot.angle += turnAngle;
	//robot.angle = constrainAngle(robot.angle);
	return turnAngle;//constrainAngle(robot.angle-turnAngle);
	//robot.angle %= 360;
}

const constrainAngle = function(angle) {
	if (angle > 360) {
		angle -=360;
	} else if (angle < 0) {
		angle +=360;
	}
	return angle;
}

const fFromJoystickPower = function(power) {
	return power*0.001;
}
const degFromJoystickPower = function(power) {
	return power*0.001;
}

const findRobotEndpoints = function(robot) {
	let topLAngle = robot.angle-45;
	let topRAngle = robot.angle+45;
	let bottomLAngle = robot.angle+180+45;
	let bottomRAngle = robot.angle+180-45;

	topLAngle = constrainAngle(topLAngle);
	topRAngle = constrainAngle(topRAngle);
	bottomLAngle = constrainAngle(bottomLAngle);
	bottomRAngle = constrainAngle(bottomRAngle);

	let leftTop = [((0.5*robot.width)*Math.cos(topLAngle))+robot.x, ((0.5*robot.height)*Math.sin(topLAngle))+robot.y];
	let rightTop = [((0.5*robot.width)*Math.cos(topRAngle))+robot.x, ((0.5*robot.height)*Math.sin(topRAngle))+robot.y];
	let leftBottom = [((0.5*robot.width)*Math.cos(bottomLAngle))+robot.x, ((0.5*robot.height)*Math.sin(bottomLAngle))+robot.y];
	let rightBottom = [((0.5*robot.width)*Math.cos(bottomRAngle))+robot.x, ((0.5*robot.height)*Math.sin(bottomRAngle))+robot.y];
	robot.endpoints = [leftTop, rightBottom, leftBottom, [robot.x, robot.y], leftTop];
	//console.log(robotEndpoints)
	//return ;
}

const updateRobot = function(robot, deltaTime, controller) {
	updateRobotPosition(robot, deltaTime, controller.leftStick.x, controller.leftStick.y, controller.rightStick.x, controller.rightStick.y);
	findRobotEndpoints(robot);
}

setInterval( () => {
	updateRobot(currentRobotA, 1, currentControllerPositions.a);
	updateRobot(currentRobotB, 1, currentControllerPositions.b);
}, 10);
/*setInterval( () => {
	reduceRobotFinal(currentRobotA);
	reduceRobotFinal(currentRobotB);
}, 500);*/

//CONNECT CONTROLLER
console.log("initting controlers");
if (!controllerAEnabled && !controllerBEnabled) {
	//throw "no controller was enabled you meme";
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

//WS CODE
function heartbeat() {
	console.log("hb from cli");
	this.isAlive = true;
}
function noop() {}

const WebSocket = require('ws')
const wss = new WebSocket.Server({ port: websocketPort });
wss.on('connection', ws => {
	ws.isAlive = true;
	ws.on('pong', heartbeat);

	ws.on('message', message => {
	console.log(`Received message => ${message}`)
	})
	//ws.send(JSON.stringify({"status": "OK"}));
	ws.send(JSON.stringify({"status": "OK", "field": []}));
	setInterval( () => {
		ws.send(JSON.stringify({"status": "OK", "robotA": currentRobotA, "robotB": currentRobotB}));
	},100);
})


const WSinterval = setInterval(function ping() {
  wss.clients.forEach(function each(ws) {
    if (ws.isAlive === false) {
    	console.log("Websocket disconnected (did you close the tab?), terminating");
    	return ws.terminate();
    }

    ws.isAlive = false; //set check
    ws.ping(noop);
  });
}, 1000);