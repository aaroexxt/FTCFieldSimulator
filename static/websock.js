//Websock.js

const WSport = 8080;
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
	console.log("msg: ",JSON.parse(msg.data));
}