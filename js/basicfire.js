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
		cv.setPaletteColor(i + 64 * 0, i * 4, 0, 0);
		cv.setPaletteColor(i + 64 * 1, 255, i * 4, 0);
		cv.setPaletteColor(i + 64 * 2, 255, 255, i * 4);
		cv.setPaletteColor(i + 64 * 3, 255, 255, 255);
	}
}

function draw() {
	for (var i = 1; i < 319; i++) {
		var c = Math.floor(Math.random() * 255);
		cv.putPixel(i, 178, c);
	}

	flare();
	cv.flip();

	requestAnimationFrame(draw);
}

function flare() {
	for (var j = 1; j < 179; j++) {
		for (var i = 1; i < 319; i++) {
			var c = cv.getPixel(i, j) + cv.getPixel(i - 1, j) + cv.getPixel(i + 1, j) + cv.getPixel(i, j + 1);
			c = Math.floor(c / 4);
			cv.putPixel(i, j, c);
		}
	}
}