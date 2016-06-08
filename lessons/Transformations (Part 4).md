---
layout: default
title: Transformations (Part 4)
lesson: 7
summary: (Still working on this one...)
---

# Transformations (Part 4)

In this lesson we derive a more complex transformation with a
very specific purpose, simulating a perspective effect, where
distant objects appear smaller and near objects appear larger.
We'll also incorporate the aspect ratio correction into this
transformation, so it will take us from the coordinate system of
the overall 3D scene to WebGL's canonical view volume.  Thinking
of it another way, it will determine the six planes that form
the boundaries of the scene.

## Perspective Normalization Transformation

As we've said before, WebGL limits the scene to what's inside
the canonical view volume, a 2x2x2 cube with its near bottom left
corner at $(-1, -1, -1)$ and its far top right corner at
$(1, 1, 1)$.  3D vertices located within the canonical view volume
are *projected*---mapped to 2D vertices on a plane---so that they
can be used to determine the colors of pixels on a 2D screen.
WebGL uses what's called a *symmetric parallel projection* to
map 3D vertices in the scene to 2D vertices on the *view plane*,
which is then mapped to the pixels on the HTML `canvas` element.
The projection is *symmetric* because the viewpoint faces straight
down the $z$ axis, with an equal amount of the scene above and
below, and an equal amount right and left.  The projection is
*parallel* because the $x$ and $y$ values of a projected point
match the $x$ and $y$ values of the original.  So if you drew
lines from projected points to their original locations, those
lines would all be parallel.  (Need a diagram here eventually!)

What if you don't want the canonical view volume?  What if, instead
of a symmetric parallel projection, you want a *symmetric
perspective projection*?  (A perspective projection is what's
typically used in a 3D graphics program---near objects
are scaled larger; far objects are scaled smaller.)  You need
a *perspective normalization transformation*, which takes you
from a *frustum* shaped 3D scene to the canonical view volume's
cube shaped 3D scene.

What's a frustum?  A truncated rectangular pyramid.  Figure 8 is
meant to show how the frustum, on the left, is transformed to a
cube, on the right.  Notice that the back of the frustum is mapped
to the back of the cube; this requires that the back be scaled
smaller.  And the front of the frustum is mapped to the front of
the cube; this requires that the front be scaled bigger.  If far
objects are scaled smaller, and near objects are scaled bigger,
we'll get a perspective effect.  We can also take care of the
aspect ratio with this transformation---notice that the frustum
is more wide than tall, but (obviously) the cube is not---and,
although figure 8 doesn't show it, we'll flip the $z$ axis
direction as well.  In summary, our scene will be defined in a
right-handed frustum with width and height that don't (necessarily)
match, and it will be transformed to fit in a left-handed
2x2x2 cube.

![From a Frustum to a Cube](frustum.png)

<!--
\begin{tikzpicture}

  \draw (0,0) -- (3,0) -- (3,2) -- (0,2) -- cycle;
  \draw (1,0.5) -- (7,0.5) -- (7,4.5) -- (1,4.5) -- cycle;
  \draw (0,0) -- (1,0.5);
  \draw (3,0) -- (7,0.5);
  \draw (3,2) -- (7,4.5);
  \draw (0,2) -- (1,4.5);

  \draw (10,0) -- (13,0) -- (13,3) -- (10,3) -- cycle;
  \draw (11,1) -- (14,1) -- (14,4) -- (11,4) -- cycle;
  \draw (10,0) -- (11,1);
  \draw (13,0) -- (14,1);
  \draw (13,3) -- (14,4);
  \draw (10,3) -- (11,4);

\end{tikzpicture}
-->

So what does the transformation look like?^[This section is based
on section 4.7 of Edward Angel and Dave Schreiner's book
*Interactive Computer Graphics:  A Top-Down Approach with
Shader-Based OpenGL*, 6th Edition.]
We'll start with the following four variables:

-   *near* is the distance from the view point to the front of the
    frustum.
-   *far* is the distance from the view point to the back of the
    frustum.
-   *right* is the distance, on the front of the frustum, from the
    center to the right edge.
-   *top* is the distance, on the front of the frustum, from the
    center to the top edge.

Now consider the following transformation:

> $\begin{bmatrix}
  x' \\\\\\\\
  y' \\\\\\\\
  z' \\\\\\\\
  1
  \end{bmatrix}
  =
  \begin{bmatrix}
  \frac{x}{-z} \\\\\\\\
  \frac{y}{-z} \\\\\\\\
  -\alpha + \frac{\beta}{-z} \\\\\\\\
  1
  \end{bmatrix}
  =
  \begin{bmatrix}
  x \\\\\\\\
  y \\\\\\\\
  \alpha z + \beta \\\\\\\\
  -z
  \end{bmatrix}
  =
  \begin{bmatrix}
  1 & 0 & 0 & 0 \\\\\\\\
  0 & 1 & 0 & 0 \\\\\\\\
  0 & 0 & \alpha & \beta \\\\\\\\
  0 & 0 & -1 & 0
  \end{bmatrix}
  \begin{bmatrix}
  x \\\\\\\\
  y \\\\\\\\
  z \\\\\\\\
  1
  \end{bmatrix}$

$x$ and $y$ are scaled by an amount proportional to $z$.  If $-z$
is larger, $x$ and $y$ will be scaled smaller; if $-z$ is smaller,
$x$ and $y$ will be scaled bigger.  This will give us a way to
get a perspective effect.  Also, $\alpha$ provides a way to
scale in the $z$ direction, and $\beta$ provides a way to
translate (by an amount proportional to $z$) in the $z$ direction.

Our goal is to get from the frustum to the cube.  If we put the
view point at the origin, the front of the frustum is at
$z=-\textit{near}$.  We want to map this to the front of the
canonical view volume, which is at $z=-1$.  If we set $\alpha$
and $\beta$...

> $\alpha = \frac{\textit{near} + \textit{far}}{
  \textit{near} - \textit{far}}$  
  $\beta = \frac{2 \times \textit{near} \times \textit{far}}{
  \textit{near} - \textit{far}}$

...and $z = -\textit{near}$, then:

> $z' = -\alpha + \frac{\beta}{\textit{near}}$  
  $z' = -\frac{\textit{near} + \textit{far}}{\textit{near} - \textit{far}} +
        \displaystyle\frac{\frac{2 \times \textit{near} \times \textit{far}}{\textit{near} - \textit{far}}}{\textit{near}}$  
  $z' = \frac{-\textit{near} - \textit{far} + 2 \times \textit{far}}{\textit{near} - \textit{far}}$  
  $z' = \frac{-\textit{near} + \textit{far}}{\textit{near} - \textit{far}}$  
  $z' = -1$

This takes care of the front of the frustum, which needed to be
mapped to the front of the canonical view volume.  What about the
back?  If, again, we put the view point at the origin, facing in
the negative $z$ direction, the back of the frustum is at
$z=-\textit{far}$.  We want to map this to the back of the
canonical view volume, which is at $z=1$.

If $z = -\textit{far}$ (and $\alpha$ and $\beta$ have the
values defined above):

> $z' = -\alpha + \frac{\beta}{\textit{far}}$  
  $z' = -\frac{\textit{near} + \textit{far}}{\textit{near} - \textit{far}} +
        \displaystyle\frac{\frac{2 \times \textit{near} \times \textit{far}}{\textit{near} - \textit{far}}}{\textit{far}}$  
  $z' = \frac{-\textit{near} - \textit{far} + 2 \times \textit{near}}{\textit{near} - \textit{far}}$  
  $z' = \frac{\textit{near} - \textit{far}}{\textit{near} - \textit{far}}$  
  $z' = 1$

This takes care of the back of the frustum.  (What a fortuitous
choice of $\alpha$ and $\beta$!)  If we've taken care
of the front and the back, we've taken care of $z$.  What about
$x$ and $y$?

The frustum is symmetric, and the width of the canonical view
volume is $2$.  The width of the front of the frustum is
$2 \times \textit{right}$.  So $x$ ranges from $-\textit{right}$
to *right* at the front of the frustum.  The width of the
frustum, as it expands from front to back, is proportional to
$z$.  As shown in figure 9, $x$ ranges from
$-\textit{right} \times \frac{\textit{far}}{\textit{near}}$ to
$\textit{right} \times \frac{\textit{far}}{\textit{near}}$ at
the back of the frustum.  And, for any $z$ along the way (from
the front to the back), $x$ ranges from
$-\textit{right} \times \frac{z}{-\textit{near}}$ to
$\textit{right} \times \frac{z}{-\textit{near}}$.

![Looking Down (i.e., in the negative $y$ direction) on the Frustum](top_view_frustum.png)

<!--
\begin{tikzpicture}
  \draw[->] (0,0) -- (-2,0) node[left] {$z$};
  \draw[->] (0,0) -- (0,-2) node[below] {$x$};
  \draw[fill] (0,0) circle (0.05);
  \draw (-0.3,0) node[above] {$(0,0,0)$};

  \draw[dashed] (0,0) -- (3,1);
  \draw[fill] (3,1) circle (0.05);
  \draw (2.9,1.1) node[left] {$x=-\textit{right}$};

  \draw[dashed] (0,0) -- (3,-1);
  \draw[fill] (3,-1) circle (0.05);
  \draw (2.9, -1.1) node[left]{$x=\textit{right}$};

  \draw (3,1) -- (6,2) -- (6,-2) -- (3,-1) -- cycle;
  \draw[fill] (6,2) circle (0.05);
  \draw (6,2) node[right] {$x=-\textit{right} \times \frac{\textit{far}}{\textit{near}}$};
  \draw[fill] (6,-2) circle (0.05);
  \draw (6,-2) node[right] {$x=\textit{right} \times \frac{\textit{far}}{\textit{near}}$};

  \draw[fill] (4.5,1.5) circle (0.06);
  \draw[very thick,<->] (5.1,1.7) -- (3.9,1.3);
  \draw (3.4,1.6) node[above] {$x=-\textit{right} \times \frac{z}{-\textit{near}}$};

  \draw[fill] (4.5,-1.5) circle (0.06);
  \draw[very thick,<->] (5.1,-1.7) -- (3.9,-1.3);
  \draw (3.4,-1.5) node[below] {$x=\textit{right} \times \frac{z}{-\textit{near}}$};

  \draw[<->] (0.2,0.05) -- (2.9,0.05);
  \draw (2,0) node[above] {$\textit{near}$};
  \draw[<->] (0.2,-0.05) -- (5.9,-0.05);
  \draw (4,0) node[below] {$\textit{far}$};
\end{tikzpicture}
-->

If $x$ ranges from
$-\textit{right} \times \frac{z}{-\textit{near}}$ to
$\textit{right} \times \frac{z}{-\textit{near}}$, along the
sides of the frustum, and we want $x$ to range from $-1$ to $1$
(the sides of the canonical view volume), we need to scale $x$
by $-\frac{\textit{near}}{\textit{right} \times z}$.  But the
transformation matrix above, which we showed could give us the
right result for $z$ if $\alpha$ and $\beta$ were chosen
appropriately, already scales $x$ by $\frac{1}{-z}$.  So we
just need to add an additional scaling factor, in the usual
(and available) "amount to scale $x$" position, of
$\frac{\textit{near}}{\textit{right}}$.

If we were to work through the analogous process for $y$, we'd
conclude that we need an additional scaling factor for $y$ as
well, in the "amount to scale $y$" position, of
$\frac{\textit{near}}{\textit{top}}$.  (This is left to you as
an exercise below.)  Putting these scaling factors into our
transformation matrix, together with the $\alpha$ and $\beta$
values chosen to take care of $z$, we've finally got the
perspective normalization matrix we need:

> $\begin{bmatrix}
  \frac{\textit{near}}{\textit{right}} & 0 & 0 & 0 \\\\\\\\
  0 & \frac{\textit{near}}{\textit{top}} & 0 & 0 \\\\\\\\
  0 & 0 & \frac{\textit{near} + \textit{far}}{\textit{near} - \textit{far}} & \frac{2 \times \textit{near} \times \textit{far}}{\textit{near} - \textit{far}} \\\\\\\\
  0 & 0 & -1 & 0
  \end{bmatrix}$

## Example 5:  A Slightly Different Purple Cube

Here's the perspective normalization transformation, rewritten
as a JavaScript function for our library file:

~~~javascript
// r - Distance, on near plane, from center to RIGHT side
//     clipping plane.
// t - Distance, on near plane, from center to TOP clipping
//     plane.
// n - Distance from origin (i.e., view point) to NEAR plane.
// f - Distance from origin (i.e., view point) to FAR plane.
//
// Start with current transformation, add a transformation
// to get from right-handed (not necessarily square)
// rectangular frustum to left-handed WebGL canonical view
// volume.
pb.perspectiveNormalization = function (r, t, n, f) {
    pv.multiplyBy(
        [ n / r, 0.0,   0.0,               0.0,
          0.0,   n / t, 0.0,               0.0,
          0.0,   0.0,   (n + f) / (n - f), 2 * n * f / (n - f),
          0.0,   0.0,  -1.0,               0.0 ]);
};
~~~

And here's a portion of the purple cube program modified to use
the perspective normalization function, so that it produces the
image shown in figure 10.

~~~javascript
// Start with an identity matrix.
tf = new Transform();

// Transform canonical view volume to a symmetric right-handed
// rectangular frustum, with the front five units from the origin
// and the back 15 units from the origin.  The front of the frustum
// will be 2 units wide and 1.5 units tall (4:3 aspect ratio).
tf.perspectiveNormalization(1, 0.75, 5, 15);

// Move the origin ten units forward, so that the scene will be
// centered in the frustum.  (Also adjust x and y so that cube
// appears in the center of the canvas.)
tf.translate(-0.6, -0.6, -10);

// Tilt the scene a little up and to the side, so that three
// faces of the cube are visible.
tf.rotateX(30);
tf.rotateY(-15);
~~~

The comments in the code above attempt to explain the
transformations, but it's worth adding that it can be very tricky
to get the parameters for the perspective normalization just right.
Too much perspective effect, and it looks as if the scene is
viewed through a fisheye lens; not enough, and it's hard to see
the objects as three dimensional.  Also, any change to adjust the
perspective effect also changes the zoom, so the objects may end
up very small or very large.

![A Slightly Different Purple Cube](example_05/screenshot.png)

@.  *Following the process above used to determine that the
    "amount to scale $x$" value in the perspective normalization
    transformation should be
    $\frac{\textit{near}}{\textit{right}}$,
    show that the "amount to scale $y$" value should be
    $\frac{\textit{near}}{\textit{top}}$.*

@.  *The perspective normalization transformation explained above
    works, but it has one (perhaps surprising) quirk:  the
    mapping from $z$ to $z'$ is not linear.  Show this by working
    out an example...*

-   *Fill in the values of the transformation matrix for a
    frustum with the _near_ plane at $z = -4$, the _far_ plane
    at $z = -8$, the _right_ side of the front at $x = 1$, and
    the _top_ of the front at $y = 1$.*
-   *Use this matrix to transform the points $(0,0,-4)$,
    $(0,0,-5)$, $(0,0-6)$, $(0,0,-7)$, and $(0,0,-8)$.*
-   *Plot your results on a line.  Notice that the intervals
    between transformed points get smaller as you move from
    the front of the frustum to the back.*

*Is this a problem?  In theory, no, because the ordering of $z$
values is preserved, so anything in front of something else
in the frustum will still be in front in the canonical view
volume (and will pass the depth test).  In practice, however,
the precision of the depth buffer is limited, so the accuracy
of the depth test will decrease as you go from the front of
the scene to the back.  This problem gets worse if the near
plane is too close to the view point and / or the far plane
is too far from the near plane.*

@.  *Based on what you've learned in this lesson, write a WebGL
    program that displays a (non-functioning) Rubik's Cube.
    Figure 11 shows a possible solution.*

![Rubik's Cube](exercise_04/screenshot.png)
