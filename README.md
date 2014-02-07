To simulate Mode 13h, a small (and as of yet, highly unoptimized) lib called Canvas256 is used.

Canvas256 provides a 320x180 (16:9) HTML5 canvas, which can be manipulated in 256-color palette mode (palette effects such as old school fire are doable).

The demos have been tested on (best results in descending order):

* Mozilla Firefox 27
* Apple Safari 7
* Internet Explorer 11
* Google Chrome 32

Currently (and to the best of my knowledge), only FF and Safari support nearest-neighbor interpolation. IE and Chrome instead use bilinear interpolation, which doesn't look as crisp.

Feedback is welcome at 8bitdemos@gmail.com.