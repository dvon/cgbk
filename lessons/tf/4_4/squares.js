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
        gl = document.getElementById("canvas_4_4").getContext(
                "experimental-webgl");

        // Request vertex shader source.
        readFile("tf/4_4/squares.vert", onVertexShaderLoad);
    };

    onVertexShaderLoad = function (shaderSource) {

        // Once vertex shader source is loaded, create vertex
        // shader object for it; compile it.
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, shaderSource);
        gl.compileShader(vertexShader);

        // Request fragment shader source.
        readFile("tf/4_4/squares.frag", onFragmentShaderLoad);
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
                colorUniform, xTranslationUniform;

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

        // Get references to shaders' uniform variables.
        scaleFactorUniform = gl.getUniformLocation(shaderProgram,
                "scaleFactor");
        xTranslationUniform = gl.getUniformLocation(shaderProgram,
                "xTranslation");
        colorUniform = gl.getUniformLocation(shaderProgram, "color");

        // Set up for drawing from vertex buffer.
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT,
                false, 12, 0);

        // Clear the canvas.
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Apply a scaling transformation:  make everything bigger.
        gl.uniform1f(scaleFactorUniform, 1.25);

        // Set vertex shader's "xTranslation" variable so that square
        // is moved 0.5 to the left.
        gl.uniform1f(xTranslationUniform, -0.5);

        // Draw the square (orange).
        gl.uniform3f(colorUniform, 1.0, 0.6, 0.1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Make everything normal size, center it, draw square (yellow).
        gl.uniform1f(scaleFactorUniform, 1.0);
        gl.uniform1f(xTranslationUniform, 0.0);
        gl.uniform3f(colorUniform, 1.0, 0.9, 0.1);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // Make everything smaller, move 0.5 right, draw square (blue).
        gl.uniform1f(scaleFactorUniform, 0.75);
        gl.uniform1f(xTranslationUniform, 0.5);
        gl.uniform3f(colorUniform, 0.1, 0.3, 0.8);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    wasOnload();
    
}(this));

