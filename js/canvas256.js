var Canvas256 = function() {
	this.fitToWindow = true;
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

			var that = this;
			$(window).resize(function() { that.onResize(); });

			this.onResize();			
			this.clear();
		},

		initCanvases: function() {
			screenCanvas = document.createElement('canvas');
			screenCanvas.width = screenWidth;
			screenCanvas.height = screenHeight;
			screenCanvas.style.backgroundColor = 'rgba(0, 0, 0, 1)';
			$(document.body).append(screenCanvas);

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
			if (this.fitToWindow) {
				this.calculateScreenInfo();
				this.resizeCanvasCSS();
			}
			else {
				$(screenCanvas).css('width', screenWidth * 2).css('height', screenHeight * 2);
			}
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
			palette[color].r = Math.floor(r);
			palette[color].g = Math.floor(g);
			palette[color].b = Math.floor(b);

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

		initPalette: function() {
			palette[0] = { r: 0, g: 0, b: 0, a: 255 };
			palette[1] = { r: 0, g: 0, b: 168, a: 255 };
			palette[2] = { r: 0, g: 168, b: 0, a: 255 };
			palette[3] = { r: 0, g: 168, b: 168, a: 255 };
			palette[4] = { r: 168, g: 0, b: 0, a: 255 };
			palette[5] = { r: 168, g: 0, b: 168, a: 255 };
			palette[6] = { r: 168, g: 84, b: 0, a: 255 };
			palette[7] = { r: 168, g: 168, b: 168, a: 255 };
			palette[8] = { r: 84, g: 84, b: 84, a: 255 };
			palette[9] = { r: 84, g: 84, b: 252, a: 255 };
			palette[10] = { r: 84, g: 252, b: 84, a: 255 };
			palette[11] = { r: 84, g: 252, b: 252, a: 255 };
			palette[12] = { r: 252, g: 84, b: 84, a: 255 };
			palette[13] = { r: 252, g: 84, b: 252, a: 255 };
			palette[14] = { r: 252, g: 252, b: 84, a: 255 };
			palette[15] = { r: 252, g: 252, b: 252, a: 255 };
			palette[16] = { r: 0, g: 0, b: 0, a: 255 };
			palette[17] = { r: 20, g: 20, b: 20, a: 255 };
			palette[18] = { r: 32, g: 32, b: 32, a: 255 };
			palette[19] = { r: 44, g: 44, b: 44, a: 255 };
			palette[20] = { r: 56, g: 56, b: 56, a: 255 };
			palette[21] = { r: 68, g: 68, b: 68, a: 255 };
			palette[22] = { r: 80, g: 80, b: 80, a: 255 };
			palette[23] = { r: 96, g: 96, b: 96, a: 255 };
			palette[24] = { r: 112, g: 112, b: 112, a: 255 };
			palette[25] = { r: 128, g: 128, b: 128, a: 255 };
			palette[26] = { r: 144, g: 144, b: 144, a: 255 };
			palette[27] = { r: 160, g: 160, b: 160, a: 255 };
			palette[28] = { r: 180, g: 180, b: 180, a: 255 };
			palette[29] = { r: 200, g: 200, b: 200, a: 255 };
			palette[30] = { r: 224, g: 224, b: 224, a: 255 };
			palette[31] = { r: 252, g: 252, b: 252, a: 255 };
			palette[32] = { r: 0, g: 0, b: 252, a: 255 };
			palette[33] = { r: 64, g: 0, b: 252, a: 255 };
			palette[34] = { r: 124, g: 0, b: 252, a: 255 };
			palette[35] = { r: 188, g: 0, b: 252, a: 255 };
			palette[36] = { r: 252, g: 0, b: 252, a: 255 };
			palette[37] = { r: 252, g: 0, b: 188, a: 255 };
			palette[38] = { r: 252, g: 0, b: 124, a: 255 };
			palette[39] = { r: 252, g: 0, b: 64, a: 255 };
			palette[40] = { r: 252, g: 0, b: 0, a: 255 };
			palette[41] = { r: 252, g: 64, b: 0, a: 255 };
			palette[42] = { r: 252, g: 124, b: 0, a: 255 };
			palette[43] = { r: 252, g: 188, b: 0, a: 255 };
			palette[44] = { r: 252, g: 252, b: 0, a: 255 };
			palette[45] = { r: 188, g: 252, b: 0, a: 255 };
			palette[46] = { r: 124, g: 252, b: 0, a: 255 };
			palette[47] = { r: 64, g: 252, b: 0, a: 255 };
			palette[48] = { r: 0, g: 252, b: 0, a: 255 };
			palette[49] = { r: 0, g: 252, b: 64, a: 255 };
			palette[50] = { r: 0, g: 252, b: 124, a: 255 };
			palette[51] = { r: 0, g: 252, b: 188, a: 255 };
			palette[52] = { r: 0, g: 252, b: 252, a: 255 };
			palette[53] = { r: 0, g: 188, b: 252, a: 255 };
			palette[54] = { r: 0, g: 124, b: 252, a: 255 };
			palette[55] = { r: 0, g: 64, b: 252, a: 255 };
			palette[56] = { r: 124, g: 124, b: 252, a: 255 };
			palette[57] = { r: 156, g: 124, b: 252, a: 255 };
			palette[58] = { r: 188, g: 124, b: 252, a: 255 };
			palette[59] = { r: 220, g: 124, b: 252, a: 255 };
			palette[60] = { r: 252, g: 124, b: 252, a: 255 };
			palette[61] = { r: 252, g: 124, b: 220, a: 255 };
			palette[62] = { r: 252, g: 124, b: 188, a: 255 };
			palette[63] = { r: 252, g: 124, b: 156, a: 255 };
			palette[64] = { r: 252, g: 124, b: 124, a: 255 };
			palette[65] = { r: 252, g: 156, b: 124, a: 255 };
			palette[66] = { r: 252, g: 188, b: 124, a: 255 };
			palette[67] = { r: 252, g: 220, b: 124, a: 255 };
			palette[68] = { r: 252, g: 252, b: 124, a: 255 };
			palette[69] = { r: 220, g: 252, b: 124, a: 255 };
			palette[70] = { r: 188, g: 252, b: 124, a: 255 };
			palette[71] = { r: 156, g: 252, b: 124, a: 255 };
			palette[72] = { r: 124, g: 252, b: 124, a: 255 };
			palette[73] = { r: 124, g: 252, b: 156, a: 255 };
			palette[74] = { r: 124, g: 252, b: 188, a: 255 };
			palette[75] = { r: 124, g: 252, b: 220, a: 255 };
			palette[76] = { r: 124, g: 252, b: 252, a: 255 };
			palette[77] = { r: 124, g: 220, b: 252, a: 255 };
			palette[78] = { r: 124, g: 188, b: 252, a: 255 };
			palette[79] = { r: 124, g: 156, b: 252, a: 255 };
			palette[80] = { r: 180, g: 180, b: 252, a: 255 };
			palette[81] = { r: 196, g: 180, b: 252, a: 255 };
			palette[82] = { r: 216, g: 180, b: 252, a: 255 };
			palette[83] = { r: 232, g: 180, b: 252, a: 255 };
			palette[84] = { r: 252, g: 180, b: 252, a: 255 };
			palette[85] = { r: 252, g: 180, b: 232, a: 255 };
			palette[86] = { r: 252, g: 180, b: 216, a: 255 };
			palette[87] = { r: 252, g: 180, b: 196, a: 255 };
			palette[88] = { r: 252, g: 180, b: 180, a: 255 };
			palette[89] = { r: 252, g: 196, b: 180, a: 255 };
			palette[90] = { r: 252, g: 216, b: 180, a: 255 };
			palette[91] = { r: 252, g: 232, b: 180, a: 255 };
			palette[92] = { r: 252, g: 252, b: 180, a: 255 };
			palette[93] = { r: 232, g: 252, b: 180, a: 255 };
			palette[94] = { r: 216, g: 252, b: 180, a: 255 };
			palette[95] = { r: 196, g: 252, b: 180, a: 255 };
			palette[96] = { r: 180, g: 252, b: 180, a: 255 };
			palette[97] = { r: 180, g: 252, b: 196, a: 255 };
			palette[98] = { r: 180, g: 252, b: 216, a: 255 };
			palette[99] = { r: 180, g: 252, b: 232, a: 255 };
			palette[100] = { r: 180, g: 252, b: 252, a: 255 };
			palette[101] = { r: 180, g: 232, b: 252, a: 255 };
			palette[102] = { r: 180, g: 216, b: 252, a: 255 };
			palette[103] = { r: 180, g: 196, b: 252, a: 255 };
			palette[104] = { r: 0, g: 0, b: 112, a: 255 };
			palette[105] = { r: 28, g: 0, b: 112, a: 255 };
			palette[106] = { r: 56, g: 0, b: 112, a: 255 };
			palette[107] = { r: 84, g: 0, b: 112, a: 255 };
			palette[108] = { r: 112, g: 0, b: 112, a: 255 };
			palette[109] = { r: 112, g: 0, b: 84, a: 255 };
			palette[110] = { r: 112, g: 0, b: 56, a: 255 };
			palette[111] = { r: 112, g: 0, b: 28, a: 255 };
			palette[112] = { r: 112, g: 0, b: 0, a: 255 };
			palette[113] = { r: 112, g: 28, b: 0, a: 255 };
			palette[114] = { r: 112, g: 56, b: 0, a: 255 };
			palette[115] = { r: 112, g: 84, b: 0, a: 255 };
			palette[116] = { r: 112, g: 112, b: 0, a: 255 };
			palette[117] = { r: 84, g: 112, b: 0, a: 255 };
			palette[118] = { r: 56, g: 112, b: 0, a: 255 };
			palette[119] = { r: 28, g: 112, b: 0, a: 255 };
			palette[120] = { r: 0, g: 112, b: 0, a: 255 };
			palette[121] = { r: 0, g: 112, b: 28, a: 255 };
			palette[122] = { r: 0, g: 112, b: 56, a: 255 };
			palette[123] = { r: 0, g: 112, b: 84, a: 255 };
			palette[124] = { r: 0, g: 112, b: 112, a: 255 };
			palette[125] = { r: 0, g: 84, b: 112, a: 255 };
			palette[126] = { r: 0, g: 56, b: 112, a: 255 };
			palette[127] = { r: 0, g: 28, b: 112, a: 255 };
			palette[128] = { r: 56, g: 56, b: 112, a: 255 };
			palette[129] = { r: 68, g: 56, b: 112, a: 255 };
			palette[130] = { r: 84, g: 56, b: 112, a: 255 };
			palette[131] = { r: 96, g: 56, b: 112, a: 255 };
			palette[132] = { r: 112, g: 56, b: 112, a: 255 };
			palette[133] = { r: 112, g: 56, b: 96, a: 255 };
			palette[134] = { r: 112, g: 56, b: 84, a: 255 };
			palette[135] = { r: 112, g: 56, b: 68, a: 255 };
			palette[136] = { r: 112, g: 56, b: 56, a: 255 };
			palette[137] = { r: 112, g: 68, b: 56, a: 255 };
			palette[138] = { r: 112, g: 84, b: 56, a: 255 };
			palette[139] = { r: 112, g: 96, b: 56, a: 255 };
			palette[140] = { r: 112, g: 112, b: 56, a: 255 };
			palette[141] = { r: 96, g: 112, b: 56, a: 255 };
			palette[142] = { r: 84, g: 112, b: 56, a: 255 };
			palette[143] = { r: 68, g: 112, b: 56, a: 255 };
			palette[144] = { r: 56, g: 112, b: 56, a: 255 };
			palette[145] = { r: 56, g: 112, b: 68, a: 255 };
			palette[146] = { r: 56, g: 112, b: 84, a: 255 };
			palette[147] = { r: 56, g: 112, b: 96, a: 255 };
			palette[148] = { r: 56, g: 112, b: 112, a: 255 };
			palette[149] = { r: 56, g: 96, b: 112, a: 255 };
			palette[150] = { r: 56, g: 84, b: 112, a: 255 };
			palette[151] = { r: 56, g: 68, b: 112, a: 255 };
			palette[152] = { r: 80, g: 80, b: 112, a: 255 };
			palette[153] = { r: 88, g: 80, b: 112, a: 255 };
			palette[154] = { r: 96, g: 80, b: 112, a: 255 };
			palette[155] = { r: 104, g: 80, b: 112, a: 255 };
			palette[156] = { r: 112, g: 80, b: 112, a: 255 };
			palette[157] = { r: 112, g: 80, b: 104, a: 255 };
			palette[158] = { r: 112, g: 80, b: 96, a: 255 };
			palette[159] = { r: 112, g: 80, b: 88, a: 255 };
			palette[160] = { r: 112, g: 80, b: 80, a: 255 };
			palette[161] = { r: 112, g: 88, b: 80, a: 255 };
			palette[162] = { r: 112, g: 96, b: 80, a: 255 };
			palette[163] = { r: 112, g: 104, b: 80, a: 255 };
			palette[164] = { r: 112, g: 112, b: 80, a: 255 };
			palette[165] = { r: 104, g: 112, b: 80, a: 255 };
			palette[166] = { r: 96, g: 112, b: 80, a: 255 };
			palette[167] = { r: 88, g: 112, b: 80, a: 255 };
			palette[168] = { r: 80, g: 112, b: 80, a: 255 };
			palette[169] = { r: 80, g: 112, b: 88, a: 255 };
			palette[170] = { r: 80, g: 112, b: 96, a: 255 };
			palette[171] = { r: 80, g: 112, b: 104, a: 255 };
			palette[172] = { r: 80, g: 112, b: 112, a: 255 };
			palette[173] = { r: 80, g: 104, b: 112, a: 255 };
			palette[174] = { r: 80, g: 96, b: 112, a: 255 };
			palette[175] = { r: 80, g: 88, b: 112, a: 255 };
			palette[176] = { r: 0, g: 0, b: 64, a: 255 };
			palette[177] = { r: 16, g: 0, b: 64, a: 255 };
			palette[178] = { r: 32, g: 0, b: 64, a: 255 };
			palette[179] = { r: 48, g: 0, b: 64, a: 255 };
			palette[180] = { r: 64, g: 0, b: 64, a: 255 };
			palette[181] = { r: 64, g: 0, b: 48, a: 255 };
			palette[182] = { r: 64, g: 0, b: 32, a: 255 };
			palette[183] = { r: 64, g: 0, b: 16, a: 255 };
			palette[184] = { r: 64, g: 0, b: 0, a: 255 };
			palette[185] = { r: 64, g: 16, b: 0, a: 255 };
			palette[186] = { r: 64, g: 32, b: 0, a: 255 };
			palette[187] = { r: 64, g: 48, b: 0, a: 255 };
			palette[188] = { r: 64, g: 64, b: 0, a: 255 };
			palette[189] = { r: 48, g: 64, b: 0, a: 255 };
			palette[190] = { r: 32, g: 64, b: 0, a: 255 };
			palette[191] = { r: 16, g: 64, b: 0, a: 255 };
			palette[192] = { r: 0, g: 64, b: 0, a: 255 };
			palette[193] = { r: 0, g: 64, b: 16, a: 255 };
			palette[194] = { r: 0, g: 64, b: 32, a: 255 };
			palette[195] = { r: 0, g: 64, b: 48, a: 255 };
			palette[196] = { r: 0, g: 64, b: 64, a: 255 };
			palette[197] = { r: 0, g: 48, b: 64, a: 255 };
			palette[198] = { r: 0, g: 32, b: 64, a: 255 };
			palette[199] = { r: 0, g: 16, b: 64, a: 255 };
			palette[200] = { r: 32, g: 32, b: 64, a: 255 };
			palette[201] = { r: 40, g: 32, b: 64, a: 255 };
			palette[202] = { r: 48, g: 32, b: 64, a: 255 };
			palette[203] = { r: 56, g: 32, b: 64, a: 255 };
			palette[204] = { r: 64, g: 32, b: 64, a: 255 };
			palette[205] = { r: 64, g: 32, b: 56, a: 255 };
			palette[206] = { r: 64, g: 32, b: 48, a: 255 };
			palette[207] = { r: 64, g: 32, b: 40, a: 255 };
			palette[208] = { r: 64, g: 32, b: 32, a: 255 };
			palette[209] = { r: 64, g: 40, b: 32, a: 255 };
			palette[210] = { r: 64, g: 48, b: 32, a: 255 };
			palette[211] = { r: 64, g: 56, b: 32, a: 255 };
			palette[212] = { r: 64, g: 64, b: 32, a: 255 };
			palette[213] = { r: 56, g: 64, b: 32, a: 255 };
			palette[214] = { r: 48, g: 64, b: 32, a: 255 };
			palette[215] = { r: 40, g: 64, b: 32, a: 255 };
			palette[216] = { r: 32, g: 64, b: 32, a: 255 };
			palette[217] = { r: 32, g: 64, b: 40, a: 255 };
			palette[218] = { r: 32, g: 64, b: 48, a: 255 };
			palette[219] = { r: 32, g: 64, b: 56, a: 255 };
			palette[220] = { r: 32, g: 64, b: 64, a: 255 };
			palette[221] = { r: 32, g: 56, b: 64, a: 255 };
			palette[222] = { r: 32, g: 48, b: 64, a: 255 };
			palette[223] = { r: 32, g: 40, b: 64, a: 255 };
			palette[224] = { r: 44, g: 44, b: 64, a: 255 };
			palette[225] = { r: 48, g: 44, b: 64, a: 255 };
			palette[226] = { r: 52, g: 44, b: 64, a: 255 };
			palette[227] = { r: 60, g: 44, b: 64, a: 255 };
			palette[228] = { r: 64, g: 44, b: 64, a: 255 };
			palette[229] = { r: 64, g: 44, b: 60, a: 255 };
			palette[230] = { r: 64, g: 44, b: 52, a: 255 };
			palette[231] = { r: 64, g: 44, b: 48, a: 255 };
			palette[232] = { r: 64, g: 44, b: 44, a: 255 };
			palette[233] = { r: 64, g: 48, b: 44, a: 255 };
			palette[234] = { r: 64, g: 52, b: 44, a: 255 };
			palette[235] = { r: 64, g: 60, b: 44, a: 255 };
			palette[236] = { r: 64, g: 64, b: 44, a: 255 };
			palette[237] = { r: 60, g: 64, b: 44, a: 255 };
			palette[238] = { r: 52, g: 64, b: 44, a: 255 };
			palette[239] = { r: 48, g: 64, b: 44, a: 255 };
			palette[240] = { r: 44, g: 64, b: 44, a: 255 };
			palette[241] = { r: 44, g: 64, b: 48, a: 255 };
			palette[242] = { r: 44, g: 64, b: 52, a: 255 };
			palette[243] = { r: 44, g: 64, b: 60, a: 255 };
			palette[244] = { r: 44, g: 64, b: 64, a: 255 };
			palette[245] = { r: 44, g: 60, b: 64, a: 255 };
			palette[246] = { r: 44, g: 52, b: 64, a: 255 };
			palette[247] = { r: 44, g: 48, b: 64, a: 255 };
			palette[248] = { r: 0, g: 0, b: 0, a: 255 };
			palette[249] = { r: 0, g: 0, b: 0, a: 255 };
			palette[250] = { r: 0, g: 0, b: 0, a: 255 };
			palette[251] = { r: 0, g: 0, b: 0, a: 255 };
			palette[252] = { r: 0, g: 0, b: 0, a: 255 };
			palette[253] = { r: 0, g: 0, b: 0, a: 255 };
			palette[254] = { r: 0, g: 0, b: 0, a: 255 };
			palette[255] = { r: 0, g: 0, b: 0, a: 255 };
		},
	};
}());