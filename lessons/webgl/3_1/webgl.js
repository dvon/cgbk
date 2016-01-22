/*global document */

(function (global) {
    "use strict";
    
    var canvas, gl;
    
    canvas = document.getElementById("canvas_3_1");
    gl = canvas.getContext("experimental-webgl");
    
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

}(this));

