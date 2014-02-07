'use strict';

var Canvas256 = function() {
	this.appendToBody = true;
	this.canvas = undefined;
};

Canvas256.prototype = (function() {
	var screenWidth = 320;
	var screenHeight = 180;
	var aspectRatio = screenWidth / screenHeight;

	var windowWidth;
	var windowHeight;
	var widthRatio;
	var heightRatio;

	var screenCanvas;
	var screenCtx;
	var bufferCanvas;
	var bufferCtx;

	var bufferData;
	var bufferColor;

	var palette = {};
	var paletteChanged = false;

	return {
		init: function() {
			this.initCanvases();						
			this.initPalette();

			if (this.appendToBody) {
				var that = this;
				$(window).resize(function() { that.onResize(); });

				this.onResize();
			}

			this.clear();
		},

		initCanvases: function() {
			screenCanvas = document.createElement('canvas');
			screenCanvas.width = screenWidth;
			screenCanvas.height = screenHeight;
			screenCanvas.style.backgroundColor = 'rgba(0, 0, 0, 1)';
			this.canvas = screenCanvas;

			if (this.appendToBody) {
				$(document.body).append(screenCanvas);
			}

			screenCtx = screenCanvas.getContext('2d');
			screenCtx.globalCompositeOperation = 'source-over';
			screenCtx.webkitImageSmoothingEnabled = false;
			screenCtx.oImageSmoothingEnabled = false;
			screenCtx.msImageSmoothingEnabled = false;
			screenCtx.mozImageSmoothingEnabled = false;
			screenCtx.imageSmoothingEnabled = false;
			screenCtx.save();

			bufferCanvas = document.createElement('canvas');
			bufferCanvas.width = screenWidth;
			bufferCanvas.height = screenHeight;
			bufferCanvas.style.backgroundColor = 'rgba(0, 0, 0, 1)';

			bufferCtx = bufferCanvas.getContext('2d');
			bufferCtx.globalCompositeOperation = 'source-over';
			bufferCtx.webkitImageSmoothingEnabled = false;
			bufferCtx.oImageSmoothingEnabled = false;
			bufferCtx.msImageSmoothingEnabled = false;
			bufferCtx.mozImageSmoothingEnabled = false;
			bufferCtx.imageSmoothingEnabled = false;
			bufferCtx.save();

			bufferColor = new Uint8Array(screenWidth * screenHeight);
		},

		calculateScreenInfo: function() {
			windowWidth = window.innerWidth;
			windowHeight = window.innerHeight;
			widthRatio = windowWidth / screenWidth;
			heightRatio = windowHeight / screenHeight;
		},

		resizeCanvasCSS: function() {
			var width = Math.floor(windowHeight * aspectRatio);
			var left = Math.floor((windowWidth - width) / 2);
			$(screenCanvas).css('width', width).css('height', windowHeight).css('left', left);
		},

		onResize: function() {
			this.calculateScreenInfo();
			this.resizeCanvasCSS();
		},

		putPixel: function(x, y, color) {
			var c = palette[color];
			var k = (y * screenWidth + x) * 4;
			
			bufferData.data[k] = c.r;
			bufferData.data[k + 1] = c.g;
			bufferData.data[k + 2] = c.b;
			bufferData.data[k + 3] = c.a;

			bufferColor[y * screenWidth + x] = color;
		},

		getPixel: function(x, y) {
			return bufferColor[y * screenWidth + x];
		},

		setPaletteColor: function(color, r, g, b) {
			palette[color].r = r;
			palette[color].g = g;
			palette[color].b = b;

			paletteChanged = true;
		},

		getPaletteColor: function(color) {
			return palette[color];
		},

		line: function(x0, y0, x1, y1, color) {
			// bresenham's line algorithm from wikipedia

			var dx = Math.abs(x1 - x0);
			var dy = Math.abs(y1 - y0);
			var sx = (x0 < x1) ? 1 : - 1;
			var sy = (y0 < y1) ? 1 : - 1;
			var err = dx - dy;

			while (true) {
				this.putPixel(x0, y0, color);
				if (x0 === x1 && y0 === y1) break;
				var e2 = 2 * err;
				if (e2 > -dy) {
					err -= dy;
					x0 += sx;
				}
				if (x0 === x1 && y0 === y1) {
					this.putPixel(x0, y0, color);
					break;
				}
				if (e2 < dx) { 
					err += dx;
					y0 += sy;
				}
			}
		},

		clear: function(color) {					
			var c = (color !== undefined) ? palette[color] : 0;

			bufferCtx.fillStyle = 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + c.a + ')';
			bufferCtx.fillRect(0, 0, screenWidth, screenHeight);

			bufferData = bufferCtx.getImageData(0, 0, screenWidth, screenHeight);

			for (var i = 0; i < screenWidth * screenHeight; i++) {
				bufferColor[i] = color;
			}
		},

		flip: function() {
			this.applyPaletteChanges();

			bufferCtx.putImageData(bufferData, 0, 0);
			screenCtx.drawImage(bufferCanvas, 0, 0);
		},

		applyPaletteChanges: function() {
			if (paletteChanged) {
				for (var i = 0; i < screenWidth * screenHeight; i++) {
					var c = palette[bufferColor[i]];
					bufferData.data[i * 4] = c.r;
					bufferData.data[i * 4 + 1] = c.g;
					bufferData.data[i * 4 + 2] = c.b;
					bufferData.data[i * 4 + 3] = c.a;
				}
				paletteChanged = false;				
			}
		},

		hline: function(x0, x1, y, color) {
			for (var x = x0; x <= x1; x++) {
				this.putPixel(x, y, color);
			}
		},

		clamp: function(x, min, max) {
			if (x < min) return min;
			if (x > max) return max;
			return x;
		},

		check: function(name, x) {
			var me = this.check;
			if (me[name] === undefined) {
				me[name] = { min: x, max: x };
			}
			else {
				if (x < me[name].min) {
					me[name].min = x;
				}
				else
				if (x > me[name].max) {
					me[name].max = x;
				}
			}
		},

		box: function(x, y, w, h, color) {
			for (var j = y; j <= y + h; j++) {
				for (var i = x; i <= x + w; i++) {
					this.putPixel(i, j, color);
				}
			}
		},

		randomInt: function(min, max) {
			return Math.floor(min + Math.random() * Math.abs(min - max));
		},

		getTextBitmap: function(text, fontSize) {
			var me = this.getTextBitmap;
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
		},

		flare: function(factor) {
			for (var j = 1; j < 179; j++) {
				for (var i = 1; i < 319; i++) {
					var c = this.getPixel(i, j) + this.getPixel(i - 1, j) + this.getPixel(i + 1, j) + 
						this.getPixel(i, j + 1) + this.getPixel(i, j - 1);
					c = Math.floor(c / factor);
					this.putPixel(i, j, c);
				}
			}
		},

		initPalette: function() {
			// default vga palette
			var s;
			s += "0000000000a800a80000a8a8a80000a800a8a85400a8a8a85454545454fc54fc5454fcfcfc5454fc54fcfcfc54fcfcfc0000001414142020202c2c2c";
			s += "383838444444505050606060707070808080909090a0a0a0b4b4b4c8c8c8e0e0e0fcfcfc0000fc4000fc7c00fcbc00fcfc00fcfc00bcfc007cfc0040";
			s += "fc0000fc4000fc7c00fcbc00fcfc00bcfc007cfc0040fc0000fc0000fc4000fc7c00fcbc00fcfc00bcfc007cfc0040fc7c7cfc9c7cfcbc7cfcdc7cfc";
			s += "fc7cfcfc7cdcfc7cbcfc7c9cfc7c7cfc9c7cfcbc7cfcdc7cfcfc7cdcfc7cbcfc7c9cfc7c7cfc7c7cfc9c7cfcbc7cfcdc7cfcfc7cdcfc7cbcfc7c9cfc";
			s += "b4b4fcc4b4fcd8b4fce8b4fcfcb4fcfcb4e8fcb4d8fcb4c4fcb4b4fcc4b4fcd8b4fce8b4fcfcb4e8fcb4d8fcb4c4fcb4b4fcb4b4fcc4b4fcd8b4fce8";
			s += "b4fcfcb4e8fcb4d8fcb4c4fc0000701c007038007054007070007070005470003870001c700000701c007038007054007070005470003870001c7000";
			s += "00700000701c007038007054007070005470003870001c70383870443870543870603870703870703860703854703844703838704438705438706038";
			s += "707038607038547038447038387038387044387054387060387070386070385470384470505070585070605070685070705070705068705060705058";
			s += "705050705850706050706850707050687050607050587050507050507058507060507068507070506870506070505870000040100040200040300040";
			s += "400040400030400020400010400000401000402000403000404000304000204000104000004000004010004020004030004040003040002040001040";
			s += "202040282040302040382040402040402038402030402028402020402820403020403820404020384020304020284020204020204028204030204038";
			s += "2040402038402030402028402c2c40302c40342c403c2c40402c40402c3c402c34402c30402c2c40302c40342c403c2c40402c3c402c34402c30402c";
			s += "2c402c2c40302c40342c403c2c40402c3c402c34402c3040000000000000000000000000000000000000000000000000";

			var k = 0;
			for (var i = 0; i < 256; i++) {
				palette[i] = {};
				palette[i].r = parseInt(s.substr(k, 2), 16);
				palette[i].g = parseInt(s.substr(k + 2, 2), 16);
				palette[i].b = parseInt(s.substr(k + 4, 2), 16);
				palette[i].a = 255;
				k += 6;
			}
		},
	};
}());