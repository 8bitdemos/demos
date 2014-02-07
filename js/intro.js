$(document).ready(function() {
	init();	
	draw();
});

var cv;
var bmpTitle;
var bmpSubtitle;

function init() {
	cv = new Canvas256();
	cv.init();

	for (var i = 0; i < 64; i++) {
		cv.setPaletteColor(i + 64 * 0, i * 2, 0, i * 2);
		cv.setPaletteColor(i + 64 * 1, 128 + i * 2, 0, 128 + i * 2);
		cv.setPaletteColor(i + 64 * 2, 255, i * 4, 255);
		cv.setPaletteColor(i + 64 * 3, 255, 255, 255);
	}

	bmpTitle = cv.getTextBitmap('8bitdemos', 32);
	//bmpSubtitle = cv.getTextBitmap('satan worship and shit', 16);
}

//var offset = -200;
function draw() {
	//offset += 1;
	//if (offset > bmpSubtitle.width) offset = -200;

	beats(10);
	lightning(20, 300);
	drawBitmap(bmpTitle, Math.floor((320 - bmpTitle.width) / 2), Math.floor((180 - bmpTitle.height) / 2));
	//drawBitmap(bmpSubtitle, Math.floor((320 - bmpSubtitle.width) / 2), Math.floor(115 - bmpSubtitle.height / 2), offset, 128);

	cv.flare(5.05);
	cv.flip();
	requestAnimationFrame(draw);
}

function lightning(x0, x1) {
	if (lightning.count === undefined) {
		lightning.count = 0;
	}

	lightning.count += 1;
	if (lightning.count % 30 == 0) {
		for (var k = 0; k < cv.randomInt(1, 4); k++) {
			var x = x0;
			var y = 90;
			var ox = x, oy = y;
			while (x < x1) {
				x = cv.clamp(x + cv.randomInt(20, 40), 1, x1);
				y = cv.clamp(y + cv.randomInt(-10, 10), 1, 178);
				if (x >= x1) y = 90;
				cv.line(ox, oy, x, y, 255);
				ox = x;
				oy = y;
			}
		}
	}
}

function beats(height) {
	var x = 16 + 12 + cv.randomInt(0, 12) * 24;
	var h = cv.randomInt(0, cv.clamp(height, 0, 18));
	for (var i = 1; i <= h; i++) {
		cv.hline(x - 8, x + 8, 180 - i * 10, 255);
	}
}

function drawBitmap(bitmap, x, y, offset, width) {	
	var x0 = (offset !== undefined) ? cv.clamp(offset, 0, bitmap.width) : 0;
	var x1 = (width !== undefined) ? cv.clamp(offset + width, 0, bitmap.width) : bitmap.width;

	if (width !== undefined) {
		for (var j = 0; j < bitmap.height; j++) {
			for (var i = x0; i < x1; i++) {
				var c = bitmap.data[j * bitmap.width + i];
				c = Math.floor(c * (1 - j / bitmap.height));
				cv.putPixel(x + i, y + j, c);
			}
		}
	}
	else {
		var k = 0;
		for (var j = 0; j < bitmap.height; j++) {
			for (var i = x0; i < x1; i++) {
				var c = bitmap.data[k];
				c = Math.floor(c * (1 - j / bitmap.height));
				cv.putPixel(x + i, y + j, c);
				k++;
			}
		}
	}
}