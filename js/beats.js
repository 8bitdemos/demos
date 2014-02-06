$(document).ready(function() {
	init();
	draw();
});

var cv;

function init() {
	cv = new Canvas256();
	//cv.fitToWindow = false;
	cv.init();

	for (var i = 0; i < 64; i++) {
		cv.setPaletteColor(i + 64 * 0, i * 2, 0, i * 2);
		cv.setPaletteColor(i + 64 * 1, 128 + i * 2, 0, 128 + i * 2);
		cv.setPaletteColor(i + 64 * 2, 255, i * 4, 255);
		cv.setPaletteColor(i + 64 * 3, 255, 255, 255);
	}
}

function draw() {
	//cv.clear();

	var x = 16 + 12 + randomInt(0, 12) * 24;
	var h = randomInt(0, 10);
	for (var i = 1; i <= h; i++) {
		hline(x - 8, x + 8, 180 - i * 10);
	}

	flare();
	cv.flip();

	requestAnimationFrame(draw);
}

function flare() {
	for (var j = 1; j < 179; j++) {
		for (var i = 1; i < 319; i++) {
			var c = cv.getPixel(i, j) + cv.getPixel(i - 1, j) + cv.getPixel(i + 1, j) + cv.getPixel(i, j + 1) + cv.getPixel(i, j - 1);
			c = Math.floor(c / 5.05);
			cv.putPixel(i, j, c);
		}
	}
}

function clamp(x, min, max) {
	if (x < min) return min;
	if (x > max) return max;
	return x;
}

function randomInt(min, max) {
	return Math.floor(min + Math.random() * Math.abs(min - max));
}

function check(name, x) {
	if (check[name] === undefined) {
		check[name] = { min: x, max: x };
	}
	else {
		if (x < check[name].min) {
			check[name].min = x;
		}
		else
		if (x > check[name].max) {
			check[name].max = x;
		}
	}
}

function hline(x0, x1, y) {
	for (var x = x0; x <= x1; x++) {
		cv.putPixel(x, y, 255);
	}
}

function line(x0, y0, x1, y1) {	
	var colorFunc = function() { return 255; };
	var pixelFunc = function() { cv.putPixel(x0, y0, c) };

	// bresenham's line algorithm from wikipedia

	var dx = Math.abs(x1 - x0);
	var dy = Math.abs(y1 - y0);
	var sx = (x0 < x1) ? 1 : - 1;
	var sy = (y0 < y1) ? 1 : - 1;
	var err = dx - dy;

	while (true) {
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

function circle(x, y, radius) {
	for (var i = 0; i < 20; i++) {
		var x0 = Math.floor(x + radius * Math.cos(Math.PI / 180 * 18 * i));
		var y0 = Math.floor(y + radius * Math.sin(Math.PI / 180 * 18 * i));
		var x1 = Math.floor(x + radius * Math.cos(Math.PI / 180 * 18 * (i + 1)));
		var y1 = Math.floor(y + radius * Math.sin(Math.PI / 180 * 18 * (i + 1)));

		line(x0, y0, x1, y1);
	}
}