/*jslint white: true */
/*global XMLHttpRequest, document, Float32Array */

(function (global) {
    "use strict";

    var readFile, gl, onVertexShaderLoad, vertexShader,
            onFragmentShaderLoad, fragmentShader, main,
            formerOnload;

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
    formerOnload = function () {
        gl = document.getElementById("canvas_3_2").getContext(
                "experimental-webgl");

        // Request vertex shader source.
        readFile("webgl/3_2/square.vert", onVertexShaderLoad);
    };

    onVertexShaderLoad = function (shaderSource) {

        // Once vertex shader source is loaded, create vertex
        // shader object for it; compile it.
        vertexShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertexShader, shaderSource);
        gl.compileShader(vertexShader);

        // Request fragment shader source.
        readFile("webgl/3_2/square.frag", onFragmentShaderLoad);
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
                vertexPositionAttribute;

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

        // Clear the canvas.
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Specify which buffer vertex data will come from, and how
        // that data should be interpreted; then draw the square.
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(vertexPositionAttribute, 3, gl.FLOAT,
                false, 12, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    formerOnload();
}(this));

