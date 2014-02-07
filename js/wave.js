var cv;

$(document).ready(function() {
	cv = new Canvas256();
	cv.init();

	for (var i = 0; i < 64; i++) {
		cv.setPaletteColor(i + 64 * 0, i * 2, i * 2, 0);
		cv.setPaletteColor(i + 64 * 1, 128 + i * 2, 128 + i * 2, 0);
		cv.setPaletteColor(i + 64 * 2, 255, 255, i * 4);
		cv.setPaletteColor(i + 64 * 3, 255, 255, 255);
	}	

	draw();
});

var angle = 0;
var radius = 20;
function draw() {
	angle += 1;
	if (angle > 360) angle -= 360;

	for (var i = 0; i < 30; i++) {
		var x0 = 10 + i * 10;
		var y0 = Math.floor(30 + radius * Math.sin(Math.PI / 180 * (i * 18 + angle)));
		var x1 = 10 + (i + 1) * 10;
		var y1 = Math.floor(30 + radius * Math.sin(Math.PI / 180 * ((i + 1) * 18 + angle)));

		cv.line(x0, y0, x1, y1, 255);
	}

	for (var i = 0; i < 30; i++) {
		var x0 = 10 + i * 10;
		var y0 = Math.floor(90 + radius * Math.sin(Math.PI / 180 * (i * 18 + angle)));
		var x1 = 10 + (i + 1) * 10;
		var y1 = Math.floor(90 + radius * Math.cos(Math.PI / 180 * ((i + 1) * 18 + angle)));

		cv.line(x0, y0, x1, y1, 255);
	}

	for (var i = 0; i < 30; i++) {
		var x0 = 10 + i * 10;
		var y0 = Math.floor(150 + radius * Math.cos(Math.PI / 180 * (i * 18 + angle)));
		var x1 = 10 + (i + 1) * 10;
		var y1 = Math.floor(150 + radius * Math.cos(Math.PI / 180 * ((i + 1) * 18 + angle)));

		cv.line(x0, y0, x1, y1, 255);
	}

	cv.flare(5.05);
	cv.flip();

	requestAnimationFrame(draw);
}