/*******
FTC Simulator
By Aaron Becker
Lastminute
*******/

console.log("init begin; ftc Simulator weee :)))\nBy Aaron Becker");

const gamePad = require('node-gamepad');
const express = require('express');

const controllerA = new gamePad('logitech/gamepadf310');
const controllerB = new gamePad('logitech/gamepadf310');

controller.connect();

controller.on( 'up:press', function() {
    console.log( 'up' );
} );
controller.on( 'down:press', function() {
    console.log( 'down' );
} );