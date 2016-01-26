/*jslint white: true */
/*global XMLHttpRequest, document, Float32Array */

(function (global) {
    "use strict";

    var readFile, gl, onVertexShaderLoad, vertexShader,
            onFragmentShaderLoad, fragmentShader, main,
            wasOnload;

    readFile = function (path, callback) {
        var r = new XMLHttpRequest();

        r.onreadystatechange = function () {
            if (r.readyState === 4 && r.status === 200) {
                callback(r.responseText);
            }
        };

        r.open("GET", path, true);
        r.send();
    };

    // global.onload = function () {
    wasOnload = function () {
        gl = document.getElementById("canvas_4_2").getContext(
                "experimental-webgl");

        // Request vertex shader source.
        readFile("tf/4_2/squares.vert", onVertexShaderLoad);
    };

    onVertexShaderLoad = function (shaderSource) {

        // Once vertex shader source is loaded, create vertex
        // shader object for it; compile it.
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, shaderSource);
        gl.compileShader(vertexShader);

        // Request fragment shader source.
        readFile("tf/4_2/squares.frag", onFragmentShaderLoad);
    };

    onFragmentShaderLoad = function (shaderSource) {

        // Once fragment shader source is loaded...
        fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, shaderSource);
        gl.compileShader(fragmentShader);

        // Continue with the rest of the program.
        main();
    };

    main = function () {
        var shaderProgram, vertexData, vertexBuffer,
                vertexPositionAttribute, scaleFactorUniform,
                colorUniform;

        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Set up shader program (based on compiled vertex
        // and fragment shaders).
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);
        gl.useProgram(shaderProgram);

        // Put vertex data (coordinates for the four corners of a
        // square) in a buffer where the vertex shader will have
        // access to it.
        vertexData = [
                -0.5,  0.5,  0.0,    // x = -0.5, y = 0.5, z = 0.0
                 0.5,  0.5,  0.0,
                -0.5, -0.5,  0.0,
                 0.5, -0.5,  0.0 ];
        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData),
                gl.STATIC_DRAW);

        // Set things up so that it will be possible to copy data
        // from a buffer to the vertex shader variable "position."
        vertexPositionAttribute = gl.getAttribLocation(shaderProgram,
                "position");
        gl.enableVertexAttribArray(vertexPositionAttribute);

        // Get references to vertex shader "scaleFactor" variable and
        // fragment shader "color" variable.
        scaleFactorUniform = gl.getUniformLocation(shaderProgram,
                "scaleFactor");
        colorUniform = gl.getUniformLocation(shaderProgram, "color");

        // Set up for drawing from vertex buffer.  (In the old version,
        // where the square was drawn just once, this statement came
        // right before calling gl.drawArrays.  But it only needs to
        // happen once, even if the square is drawn multiple times, so
        // I've moved it to the part of the code where we're setting
        // things up.)
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT,
                false, 12, 0);

        // Clear the canvas.
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // In the old version gl.bindBuffer was called here.  But it
        // wasn't really necessary, since there's only one vertex data
        // buffer in the program and gl.bindBuffer would have already
        // been called for it at this point.

        // Set vertex shader's "scaleFactor" variable so that square
        // is scaled to 1.25 times its original size.
        gl.uniform1f(scaleFactorUniform, 1.25);

        // Set fragment shader's "color" variable to orange.
        gl.uniform3f(colorUniform, 1.0, 0.6, 0.1);

        // Draw the square.
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Set vertex shader's "scaleFactor" variable so that square
        // is scaled to its original size, set fragment shader's
        // "color" variable to yellow, and draw the square.
        gl.uniform1f(scaleFactorUniform, 1.0);
        gl.uniform3f(colorUniform, 1.0, 0.9, 0.1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Set vertex shader's "scaleFactor" variable so that square
        // is scaled to 0.75 times its original size, set fragment
        // shader's "color" variable to blue, and draw the square.
        gl.uniform1f(scaleFactorUniform, 0.75);
        gl.uniform3f(colorUniform, 0.1, 0.3, 0.8);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    wasOnload();
    
}(this));

