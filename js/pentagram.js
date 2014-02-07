$(document).ready(function() {
	init();
	draw();
});

var cv;
var dsp;

var RED = 0;
var BLUE = 1;
var GREEN = 2;
var YELLOW = 3;
var mode = RED;

function init() {
	cv = new Canvas256();
	cv.init();

	handleModeSwitch();

	dsp = new Float32Array(320 * 180);
	for (var j = 0; j < 180; j++) {
		for (var i = 0; i < 320; i++) {
			var k = j * 320 + i;
			dsp[k] = 0.8 + Math.random() * 0.2;
		}		
	}
}

function handleModeSwitch() {
	if (mode === RED) {
		for (var i = 0; i < 64; i++) {
			cv.setPaletteColor(i + 64 * 0, i * 4, 0, 0);
			cv.setPaletteColor(i + 64 * 1, 255, i * 4, 0);
			cv.setPaletteColor(i + 64 * 2, 255, 255, i * 4);
			cv.setPaletteColor(i + 64 * 3, 255, 255, 255);
		}
	}
	else
	if (mode === BLUE) {
		for (var i = 0; i < 64; i++) {
			cv.setPaletteColor(i + 64 * 0, 0, 0, i * 4);
			cv.setPaletteColor(i + 64 * 1, 0, i * 4, 255);
			cv.setPaletteColor(i + 64 * 2, i * 4, 255, 255);
			cv.setPaletteColor(i + 64 * 3, 255, 255, 255);
		}	
	}
	else
	if (mode === GREEN) {
		for (var i = 0; i < 64; i++) {
			cv.setPaletteColor(i + 64 * 0, 0, i * 2, 0);
			cv.setPaletteColor(i + 64 * 1, 0, 128 + i * 2, 0);
			cv.setPaletteColor(i + 64 * 2, i * 4, 255, i * 4);
			cv.setPaletteColor(i + 64 * 3, 255, 255, 255);
		}	
	}
	else
	if (mode === YELLOW) {
		for (var i = 0; i < 64; i++) {
			cv.setPaletteColor(i + 64 * 0, i * 2, i * 2, 0);
			cv.setPaletteColor(i + 64 * 1, 128 + i * 2, 128 + i * 2, 0);
			cv.setPaletteColor(i + 64 * 2, 255, 255, i * 4);
			cv.setPaletteColor(i + 64 * 3, 255, 255, 255);
		}	
	}
}

var angle = 0;
var radius = 60;
var radius2 = 30;
var delta = 0.05;
var delta2 = 0.05;
var deltaAngle = 1;
function draw() {
	//cv.clear();

	radius += delta;
	if (radius >= 70 || radius <= 50) 
	{ 
		delta *= -1;
		mode++;
		if (mode === 4) mode = 0;		
		handleModeSwitch();
	}

	radius2 += delta2;
	if (radius2 >= 70 || radius2 <= 20) {
		delta2 *= -1;
	}

	angle += deltaAngle;

	if (mode === RED || mode === GREEN) {
		for (var i = 0; i < 5; i++) {
			var x0 = Math.floor(160 + radius * Math.cos(Math.PI / 180 * (angle + 72 * i)));
			var y0 = Math.floor(90 + radius * Math.sin(Math.PI / 180 * (angle + 72 * i)));
			var x1 = Math.floor(160 + radius * Math.cos(Math.PI / 180 * (angle + 72 * (i + 2))));
			var y1 = Math.floor(90 + radius * Math.sin(Math.PI / 180 * (angle + 72 * (i + 2))));

			line(x0, y0, x1, y1);
		}

		for (var i = 0; i < 20; i++) {
			var x0 = Math.floor(160 + radius * Math.cos(Math.PI / 180 * (angle + 18 * i)));
			var y0 = Math.floor(90 + radius * Math.sin(Math.PI / 180 * (angle + 18 * i)));
			var x1 = Math.floor(160 + radius * Math.cos(Math.PI / 180 * (angle + 18 * (i + 1))));
			var y1 = Math.floor(90 + radius * Math.sin(Math.PI / 180 * (angle + 18 * (i + 1))));

			line(x0, y0, x1, y1);
		}
	}
	else 
	if (mode === BLUE || mode === YELLOW) {
		for (var i = 0; i < 10; i++) {
			var x0 = Math.floor(160 + radius * Math.cos(Math.PI / 180 * (angle + 36 * i)));
			var y0 = Math.floor(90 + radius * Math.sin(Math.PI / 180 * (angle + 36 * i)));
			var x1 = Math.floor(160 + radius2 * Math.cos(Math.PI / 180 * (angle + 36 * (i + 3))));
			var y1 = Math.floor(90 + radius2 * Math.sin(Math.PI / 180 * (angle + 36 * (i + 3))));
			var x2 = Math.floor(160 + radius * Math.cos(Math.PI / 180 * (angle + 36 * (i + 6))));
			var y2 = Math.floor(90 + radius * Math.sin(Math.PI / 180 * (angle + 36 * (i + 6))));

			line(x0, y0, x1, y1);
			line(x1, y1, x2, y2);
		}
	}

	flare();
	cv.flip();

	requestAnimationFrame(draw);
}

function flare() {
	if (mode === RED || mode == YELLOW) {
		for (var j = 1; j < 179; j++) {
			for (var i = 1; i < 319; i++) {
				var c = cv.getPixel(i, j) + cv.getPixel(i - 1, j) + cv.getPixel(i + 1, j) + cv.getPixel(i, j + 1);
				c = Math.floor(c / 4);
				c *= dsp[j * 320 + i];
				c = Math.floor(cv.clamp(c, 0, 255));
				cv.putPixel(i, j, c);
			}
		}
	}
	else
	if (mode === BLUE || mode === GREEN) {
		for (var j = 1; j < 179; j++) {
			for (var i = 1; i < 319; i++) {
				var c = cv.getPixel(i, j) + cv.getPixel(i - 1, j) + cv.getPixel(i + 1, j) + cv.getPixel(i, j + 1) + cv.getPixel(i, j - 1);
				c = Math.floor(c / 5.5);
				cv.putPixel(i, j, c);
			}
		}
	}
}

function line(x0, y0, x1, y1, color) {
	var colorFunc;
	if (mode === RED) colorFunc = function() { return Math.floor(Math.random() * 255); }; else
	if (mode === BLUE || mode === GREEN || mode == YELLOW) colorFunc = function() { return 255; };

	var pixelFunc;
	if (mode === RED || mode === BLUE || mode === YELLOW) pixelFunc = function() { cv.putPixel(x0, y0, c); }; else
	if (mode === GREEN) pixelFunc = function() { if (greenTimer % 20 > 10) cv.putPixel(x0, y0, c); };

	// bresenham's line algorithm from wikipedia

	var dx = Math.abs(x1 - x0);
	var dy = Math.abs(y1 - y0);
	var sx = (x0 < x1) ? 1 : - 1;
	var sy = (y0 < y1) ? 1 : - 1;
	var err = dx - dy;

	greenTimer = 0;	
	while (true) {
		greenTimer += 1;
		var c = colorFunc();
		pixelFunc();
		if (x0 === x1 && y0 === y1) break;
		var e2 = 2 * err;
		if (e2 > -dy) {
			err -= dy;
			x0 += sx;
		}
		if (x0 === x1 && y0 === y1) {
			pixelFunc();
			break;
		}
		if (e2 < dx) { 
			err += dx;
			y0 += sy;
		}
	}
}