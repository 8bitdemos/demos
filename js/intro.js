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

	bmpTitle = getTextBitmap('8bitdemos', 32);
	//bmpSubtitle = getTextBitmap('satan worship and shit', 16);
}

//var offset = -200;
function draw() {
	//offset += 1;
	//if (offset > bmpSubtitle.width) offset = -200;

	beats(10);
	lightning(20, 300);
	drawBitmap(bmpTitle, Math.floor((320 - bmpTitle.width) / 2), Math.floor((180 - bmpTitle.height) / 2));
	//drawBitmap(bmpSubtitle, Math.floor((320 - bmpSubtitle.width) / 2), Math.floor(115 - bmpSubtitle.height / 2), offset, 128);

	flare();
	cv.flip();
	requestAnimationFrame(draw);
}

function lightning(x0, x1) {
	if (lightning.count === undefined) {
		lightning.count = 0;
	}

	lightning.count += 1;
	if (lightning.count % 30 == 0) {
		for (var k = 0; k < randomInt(1, 4); k++) {
			var x = x0;
			var y = 90;
			var ox = x, oy = y;
			while (x < x1) {
				x = clamp(x + randomInt(20, 40), 1, x1);
				y = clamp(y + randomInt(-10, 10), 1, 178);
				if (x >= x1) y = 90;
				cv.line(ox, oy, x, y, 255);
				ox = x;
				oy = y;
			}
		}
	}
}

function beats(height) {
	var x = 16 + 12 + randomInt(0, 12) * 24;
	var h = randomInt(0, clamp(height, 0, 18));
	for (var i = 1; i <= h; i++) {
		hline(x - 8, x + 8, 180 - i * 10);
	}
}

function hline(x0, x1, y) {
	for (var x = x0; x <= x1; x++) {
		cv.putPixel(x, y, 255);
	}
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

function box(x0, y0, x1, y1) {
	for (var j = y0; j <= y1; j++) {
		for (var i = x0; i <= x1; i++) {
			cv.putPixel(i, j, 255);
		}
	}
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

function drawBitmap(bitmap, x, y, offset, width) {	
	var x0 = (offset !== undefined) ? clamp(offset, 0, bitmap.width) : 0;
	var x1 = (width !== undefined) ? clamp(offset + width, 0, bitmap.width) : bitmap.width;

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

function getTextBitmap(text, fontSize) {
	var me = getTextBitmap;
	if (me.canvas === undefined) {
		me.canvas = document.createElement('canvas');
		me.canvas.width = 320;
		me.canvas.height = 180;
		me.canvas.style.backgroundColor = '#000';
		me.ctx = me.canvas.getContext('2d');
		me.ctx.globalCompositeOperation = 'source-over';
		me.ctx.textBaseline = 'top';
		me.ctx.fillStyle = '#fff';
	}

	var canvas = me.canvas;
	var ctx = me.ctx;

	ctx.clearRect(0, 0, 320, 180);

	ctx.font = fontSize + 'px Arial, Helvetica, sans-serif';
	ctx.fillText(text, 0, 0);

	var width = Math.ceil(ctx.measureText(text).width);
	fontSize = Math.ceil(fontSize);

	var bitmap = { width: width, height: fontSize };
	bitmap.data = new Uint8Array(width * fontSize);
	var data = ctx.getImageData(0, 0, width, fontSize);
	for (var i = 0; i < width * fontSize; i++) {
		bitmap.data[i] = data.data[i * 4];
	}	

	return bitmap;
}