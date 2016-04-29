---
layout: default
title: Transformations (Part 1)
lesson: 4
summary:
    "This lesson introduces *transformations*---mathematical
    operations applied to every vertex in the scene---to get from
    one coordinate system to another."
---

# Transformations (Part 1)

Suppose you change the aspect ratio of the HTML file's `canvas`
element so that it no longer matches the $x$ to $y$ aspect ratio
of WebGL's canonical view volume.  (See the third exercise of the
previous lesson.)  For example, suppose the `width` of the `canvas`
is 400 and the `height` is 300.  If you put a square in the
3D scene it will be stretched horizontally:  it will show up as
a rectangle with height $\frac{3}{4}$ of its width.  To fix this,
you'd have to change the vertices of the square.  You'd have to
make it a rectangle with width $\frac{3}{4}$ of its height so
that it showed up as a square on the web page.

In this lesson we'll learn a better way to solve problems like
this.  We'll use *transformations*---mathematical operations
applied to every vertex in the scene---to get from one coordinate
system to another.  For example...

## A Square Square in a Rectangular Canvas

Rather than defining vertices for a rectangle, knowing they'll
be distorted to make a square, we can define the vertices of our square
in a coordinate system that makes sense for the square and then
apply a transformation that horizontally compresses everything in
the scene, to make up for the fact that everything would otherwise
be stretched horizontally.  This transformation takes us from one
coordinate system, the coordinate system that make sense for the
square, to another, the coordinate system of the *canonical view
volume*---the cube extending from $(-1, -1, -1)$ to $(1, 1, 1)$,
where WebGL expects the scene to be.

What would this transformation look like?  Assuming the origin is
in the center of the scene, we'd simply need to multiply the $x$
value of every vertex by $\frac{3}{4}$.  This would *scale* the
entire scene in the $x$ direction; i.e., compress it horizontally
(or stretch it, if we multiplied by a value $> 1$) without
changing its height or depth.  We need to apply this transformation
to every vertex in the scene, so the natural place to put it is in
the vertex shader, square.vert:

~~~glsl
attribute vec3 position;

void main(void) {
    gl_Position = vec4(position.x * (3.0 / 4.0), position.y,
            position.z, 1.0);
}
~~~

`position` is the position of the vertex in the coordinate system
that makes sense for the square; `gl_Position` is the position of
the vertex in the canonical view volume's coordinate system.  To
get from the first coordinate system to the second, $x$ values
are multiplied by $\frac{3}{4}$.  $y$ and $z$ values aren't
changed.

We also need to change square.html, as described
in the first paragraph of this lesson, so that the `width` of the
`canvas` element is 400 and its `height` is 300:

~~~html
<div id="content" style="width:400px">
    <canvas id="canvas" width="400" height="300"></canvas>
</div>
~~~

With these changes, our square shows up as a square, even though
the aspect ratio of the canvas doesn't match that of WebGL's
canonical view volume (figure 4.1).

<figure>
    <canvas id="canvas_4_1" width="400" height="300"></canvas>
    <figcaption>Figure #: A Square Square
        in a Rectangular Canvas</figcaption>
</figure>
<script src="tf/4_1/square.js"></script>

## Squares of Different Sizes

In the previous example we used a transformation when we needed to
get from one coordinate system to another.  Everything in the
scene was specified in a coordinate system that made sense for the
scene; everything in the scene was then processed through a
transformation to put it in the coordinate system of the canonical
view volume.

But what if there isn't a single coordinate system that makes
sense for everything in the scene?  What if it would be more
convenient to draw part of the scene using one coordinate system
and then change to a different coordinate system for drawing
another part of the scene?  It turns out that transformations
are commonly used in this way.  In this example, we'll draw the
square once, change the coordinate system so that everything
is scaled smaller, and then draw the square again.  The
coordinates of the vertices of the square won't change, but they
will be interpreted differently because the coordinate system
will be different.

Here's the updated vertex shader, square.vert:

~~~glsl
attribute vec3 position;
uniform float scaleFactor;

void main(void) {
    gl_Position = vec4(position.x * scaleFactor * (3.0 / 4.0),
            position.y * scaleFactor, position.z * scaleFactor, 1.0);
}
~~~

The vertex shader applies two transformations to every vertex.
The first is a general scaling transformation---make everything
bigger or smaller---represented by the `uniform` variable
`scaleFactor`.  The second is a specific $x$-only scaling
transformation to fix the aspect ratio---multiply all $x$ values by
$\frac{3}{4}$.

For this example we'll use a fragment shader, square.frag, that
allows us to set the color from the JavaScript part of the program,
so that we can draw each square a different color:

~~~glsl
uniform lowp vec3 color;

void main(void) {
    gl_FragColor = vec4(color, 1.0);
}
~~~

Here's the part of the JavaScript file that's different from the
last example, starting after the code that sets up the connection
between the vertex data and the vertex shader's `position`
variable.  (You'll also need to add the new variables to the `var`
statement at the beginning of `main`.)

~~~javascript
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
~~~

Since we're drawing the square three times in this
program (unlike previous examples in which it was drawn
just once), the setup code that only has to be done once has been
separated from the code that is repeated every time the square is
drawn.  This should also help you start to see where the order of
statements matters and where it doesn't.

The point of this example is captured in the code repeated each
time the square is drawn.  (Comments here are different from the
code above, just to add to the explanation.)

~~~javascript
// Apply a scaling transformation:  make everything bigger.
gl.uniform1f(scaleFactorUniform, 1.25);
// Draw the square (orange).
gl.uniform3f(colorUniform, 1.0, 0.6, 0.1);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

// Apply a scaling transformation:  make everything normal size.
gl.uniform1f(scaleFactorUniform, 1.0);
// Draw the square (yellow).
gl.uniform3f(colorUniform, 1.0, 0.9, 0.1);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

// Apply a scaling transformation:  make everything smaller.
gl.uniform1f(scaleFactorUniform, 0.75);
// Draw the square (blue).
gl.uniform3f(colorUniform, 0.1, 0.3, 0.8);
gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
~~~

Figure 4.2 shows the resulting image.

<figure>
    <canvas id="canvas_4_2" width="400" height="300"></canvas>
    <figcaption>Figure #: Squares of
        Different Sizes</figcaption>
</figure>
<script src="tf/4_2/squares.js"></script>

*Exercise #: Create your own working version of this example.  Then modify
it so that the aspect ratio ($\frac{4}{3}$ in this case) is
sent from the JavaScript program to the vertex shader as a
uniform variable (like `scaleFactor`).  Then modify the
calculation in the shader so that $x$ coordinates are multiplied
by the reciprocal of the aspect ratio rather than a hard-coded
value of `(3.0 / 4.0)`.*

## Squares in Different Places

We've used transformations to change the coordinate system---for
everything in the scene and then for just a portion of the scene.
But up to this point we've always kept the origin in the center.
What if we wanted to draw multiple squares, not just different
sizes or colors, but in different locations?  We need a different
kind of transformation, one that moves the origin.  This is called
a *translation*.  Instead of multiplying, we add.  The vertex
shader code below translates every vertex by adding the value of
`xTranslation` to the $x$ coordinate value of the vertex.

~~~glsl
attribute vec3 position;
uniform float scaleFactor;
uniform float xTranslation;

void main(void) {
    vec3 scaledPosition, translatedPosition;

    scaledPosition = vec3(position.x * scaleFactor,
            position.y * scaleFactor, position.z * scaleFactor);

    translatedPosition = vec3(scaledPosition.x + xTranslation,
            scaledPosition.yz);

    gl_Position = vec4(translatedPosition.x * (3.0 / 4.0),
            translatedPosition.yz, 1.0);
}
~~~

Notice how swizzling is used here:  if you want a 2-element vector
with the `.y` and `.z` values from a `vec3` variable, you can use
`.yz`.

Here's the JavaScript code that sends values to `xTranslation` to
change the position of the squares:

~~~javascript
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
~~~

Figure 4.3 shows the image after these changes.

<figure>
    <canvas id="canvas_4_3" width="400" height="300"></canvas>
    <figcaption>Figure #: Squares in
        Different Places</figcaption>
</figure>
<script src="tf/4_3/squares.js"></script>

## Squares in Different Different Places

Look carefully at the image generated by the previous example.
Notice that the center of the orange square coincides with the
left edge of the yellow square, and the center of the blue
square coincides with the right edge of the yellow square.  This
means that, when the origin was moved `0.5` to the left, before
drawing the orange square, that distance was `0.5` in the
yellow square's coordinate system (the original coordinate
system).  And when the origin was moved `0.5` to the right,
before drawing the blue square, that distance also was `0.5` in
the yellow square's coordinate system.

Are translation distances always in the original coordinate
system?  No.  It's just because of the order transformations were
applied in the vertex shader.  If we reverse the order...

~~~glsl
attribute vec3 position;
uniform float scaleFactor;
uniform float xTranslation;

void main(void) {
    vec3 translatedPosition, scaledPosition;

    translatedPosition = vec3(position.x + xTranslation,
            position.yz);

    scaledPosition = vec3(translatedPosition.x * scaleFactor,
            translatedPosition.y * scaleFactor,
            translatedPosition.z * scaleFactor);

    gl_Position = vec4(scaledPosition.x * (3.0 / 4.0),
            scaledPosition.yz, 1.0);
}
~~~

...we get a different image (figure 4.4).

<figure>
    <canvas id="canvas_4_4" width="400" height="300"></canvas>
    <figcaption>Figure #: Squares in
        Different Different Places</figcaption>
</figure>
<script src="tf/4_4/squares.js"></script>

Look carefully now to see where the orange and blue squares are.
The right edge of the orange square coincides with the center of
the yellow; the left edge of the blue coincides with the center
of the yellow as well.  So when the origin was moved `0.5` to the
left, before drawing the orange square, that distance was `0.5`
in the *orange* square's coordinate system:  the orange square's
width, in its own coordinate system, is `1.0`; so if its right
edge is at the center of the scene, where the center of the
yellow square is, its center has been moved half its
width---`0.5`---in its own coordinate system.  Likewise the blue
square has been moved `0.5` to the right---`0.5` in the *blue*
square's coordinate system.

*Exercise #: Create your own variation on the image shown in Figure 4.4
(or 4.3, which is very similar).  Experiment with transformations,
predicting what will happen (especially when you change the
order of the transformations) and checking to see that you
understand correctly how they work.*
