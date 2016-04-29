---
layout: default
no_math: true
title: JavaScript (Part 2)
lesson: 2
summary:
    "Continuing on from the previous lesson, this lesson
    shows how to create objects with members that act like
    public or private, instance or class members would in a
    typical object-oriented programming language."
---

# JavaScript (Part 2)

Continuing on from the previous lesson, this lesson shows how
to create objects with members (i.e., fields and methods)
that behave the way public and private instance members, and
public and private class (i.e., static) members, would in a
language like Java.

## Using Functions to Create Objects with Private Members

In a typical object-oriented programming language, the distinction
made between a class and an object goes something like this:  a
class is a blueprint; an object is a thing created based on that
blueprint.  So you can expect the object to have whatever members
are specified in the blueprint...etc.  But there's another way to
think about the distinction:  a class is a bit of code you can
look at in a text editor; an object is a thing that's created when
your program runs, based on that code.  When you create an object,
memory is allocated for the new object.  When you create another
object, although it might be based on the same class, you have to
allocate more memory for it.  Each object has its own memory, to
store its own unique state.

So what does it means to say that, in JavaScript, a function is an
object?  Not just that the function can have member fields and
methods, but that the function is *created*, not defined.  The
function is not (just) a
bit of code you can look at in a text editor, it's a thing that gets
created when your program runs.  And when the function object is
created, memory is allocated to store its unique state.  The fact
that functions have state, in JavaScript, means that they can
remember things from one invocation to the next.

To illustrate this, here's yet another version of the second
example from the section on immediate functions.

~~~javascript
(function () {
    var name;

    name = "David";

    hello = function () {
        console.log(name);
        name = "Dave";
    };
}());

hello();  // prints "David"
hello();  // prints "Dave"
~~~

A function created this way, so that it includes as part of its
state a variable declared outside it, is called a *closure*.  Notice
that, even though `hello` is being called outside the immediate
function that contains its definition (i.e., the statement that
creates it), it still has access to the `name` variable.  `hello`
behaves like a public method with access to a private field, a
standard pattern in a typical object-oriented language like Java.

Here's the `PigPlayer` constructor again, this time using
closures to make `holdAmount` and `score` private fields.

~~~javascript
PigPlayer = function (holdAmountArg) {
    var holdAmount, score;

    if (!(this instanceof PigPlayer)) {
        return new PigPlayer(holdAmountArg);
    }

    holdAmount = holdAmountArg;
    score = 0;

    this.getScore = function () { return score; };

    this.takeTurn = function () {
        var turnScore = 0, rollScore;

        while (turnScore < holdAmount) {
            rollScore = Math.floor(Math.random() * 6) + 1;

            if (rollScore > 1) {
                turnScore += rollScore;
            } else {
                turnScore = 0;
                break;
            }
        }

        score += turnScore;
    }
}
~~~

To clarify what's going on here...  The `getScore` function
includes a reference to `PigPlayer`'s `score` field; the `takeTurn`
function includes references to both `score` and `holdAmount`.
Because `score` and `holdAmount` are declared within `PigPlayer`,
you might expect they'd be deallocated when `PigPlayer` returns
and they go out of scope.  But they are kept around for the sake
of `score` and `takeTurn`, because they'll be needed if these
functions are called later.

`holdAmount` and `score` act like private fields would
in a language like Java---they aren't directly accessible from
outside the object, but they persist as part of the object's
state, accessible to the object's methods (and therefore
indirectly accessible outside the object).  We'll take this
idea further in the next section, considering how we can create
variables and functions that act like private or public members
of an object, and also static vs. instance members.

*Exercise #: Write a function (or more than one) to read multiple files
concurrently.  It should create `XMLHttpRequest` objects and
call `send` for all the files, not waiting for one to finish
loading before sending the request for another.  In addition,
it should be able to determine when all of the files are loaded,
and should at that point call a callback function passed in as
an argument.*[^1]

*Here's how it might look to call your function.*

~~~javascript
printResponses = function (responses) {
    var i;

    for (i = 0; i < responses.length(); i++) {
        console.log(responses[i]);
    }
};

fileNames = ["hello.txt", "salut.txt", "hola.txt"];
readFiles(fileNames, printResponses);
~~~

*Hint:  One approach to solving this problem would be to put an
immediate function inside a loop, in order to limit the scope of
variables declared within that function to just the code within
the loop, as shown here.*

~~~javascript
j = 1;

for (i = 0; i < 5; i++) {
    (function () {
        var j = 2;
        console.log(j);  // prints "2" (5 times)
    }());
}

console.log(j);  // prints "1"
~~~

*Hint (continued): Unfortunately JSList doesn't allow you to
create a function
inside a loop; it would usually be a wasteful mistake.  A way to
work around this would be to create a
function that creates and returns a new function, and to call the
function-creating function from within a loop.  The example
below illustrates this.*

~~~javascript
j = 1;

createJPrinter = function () {
    return function () {
        var j = 2;
        console.log(j);
    };
};

for (i = 0; i < 5; i++) {
    jPrinter = createJPrinter();
    jPrinter();  // prints "2" (5 times)
}

console.log(j);  // prints "1"
~~~


## Public, Private, Static

If you add a variable to `this` in a constructor, it acts
like a public instance field.  Similarly, if you add a function
to `this` in a constructor, it acts like a public instance method.

~~~javascript
PigPlayer = function (holdAmountArg) {

    if (!(this instanceof PigPlayer)) {
        return new PigPlayer(holdAmountArg);
    }

    // public instance field
    this.holdAmount = holdAmountArg;

    // public instance method
    this.increaseHold = function (amount) {
        this.holdAmount += amount;
    };
};

p = new PigPlayer(25);
console.log(p.holdAmount);  // prints "25"
p.increaseHold(10);
console.log(p.holdAmount);  // prints "35"
~~~

If you add a variable or function within the constructor but don't
assign it to `this`, it will act like a private field or method.

~~~javascript
PigPlayer = function (holdAmountArg) {
    var holdAmount, score, rollDice;

    if (!(this instanceof PigPlayer)) {
        return new PigPlayer(holdAmountArg);
    }

    // private instance fields
    holdAmount = holdAmountArg;
    score = 0;

    // public instance method
    this.getScore = function () { return score; };

    // private instance method
    rollDice = function () {
        return Math.floor(Math.random() * 6) + 1;
    };

    // public instance method
    this.takeTurn = function () {
        var turnScore = 0, rollScore;

        while (turnScore < holdAmount) {
            rollScore = rollDice();

            if (rollScore > 1) {
                turnScore += rollScore;
            } else {
                turnScore = 0;
                break;
            }
        }

        score += turnScore;
    };
};

p = new PigPlayer(25);
console.log(p.holdAmount);  // prints "undefined"
p.takeTurn();
console.log(p.getScore());  // prints updated score...
~~~

Notice a couple things about the code above...  The third to last
line prints `undefined` because `holdAmount` isn't accessible
directly as a member of `p`.  But `holdAmount` is still part of
`p`'s state; it's accessed indirectly when `takeTurn` is called.
So `holdAmount` acts like a private instance field.

Also notice the `rollDice` method, marked by the comment above it
as a private instance method.  Actually it could have been marked
as a private *static* method instead, since it doesn't access any
instance fields or methods, i.e., it doesn't use `this`.  What if
it did?  You would probably expect that, if `p.takeTurn()` were
used to call `takeTurn` and, within `takeTurn`, `rollDice` were
called---you'd expect that if `rollDice` used `this` that it would
refer to `p`.  But it wouldn't.  In JavaScript, if you call a
function from an object variable (`x.doSomething()`), `this` is
assigned the object (`x`) within the function; but if you don't
(`doSomething()`), `this` still points to a global object.  And
this is true even for `rollDice` in the example above.

How can we get around this problem?  We'll look at two ways here.
First, `this` could be assigned to a local variable.  Second, we
could forget `this` altogether---just create a new object, assigned
to a local variable, and return that object at the end of the
constructor (instead of returning `this`, which is what happens
when you don't include a `return` statement).

Here's the first way.  (Unfortunately the convention is to use
`that` when you assign `this` to a local variable; it's confusing,
but I'm sticking to the convention here.)

~~~javascript
PigPlayer = function (holdAmountArg) {
    var that, holdAmount, score, rollDice;

    if (!(this instanceof PigPlayer)) {
        return new PigPlayer(holdAmountArg);
    }

    // Assign "this" to a local variable, for the sake of any
    // private (i.e., declared with "var" in this function)
    // methods that need to access public instance members.
    that = this;

    holdAmount = holdAmountArg;
    score = 0;

    that.getScore = function () { return score; };

    // If rollDice used "this" it would refer to a global object,
    // which would be (very) bad.  But if it used "that" it would
    // refer to the object rollDice was added to when it was
    // created, which would be good.
    rollDice = function () {...};

    that.takeTurn = function () {...};
};
~~~

And here's the second way.  I've called the new object variable
`pb`, for "public" (less to type, but also because `public` is a
keyword in JavaScript), since anything I add to `pb` will become
a public member of the object.  Notice that the `if` statement at
the beginning, to make sure `new` was used when the constructor
was called, is no longer necessary.  The point of making sure
`new` was used was to make sure `this` wouldn't refer to a global
object.  But this version of `PigPlayer` doesn't use `this` at all,
so it doesn't matter whether `new` is used to call it.

~~~javascript
PigPlayer = function (holdAmountArg) {
    var pb, holdAmount, score, rollDice;

    // Create a new empty object; assign it to pb, which will be
    // a container for public members.
    pb = {};

    holdAmount = holdAmountArg;
    score = 0;

    pb.getScore = function () { return score; };

    // Would be fine for a private instance method like rollDice
    // to refer to "pb".  (Compare to previous version...would not
    // have been fine for rollDice to refer to "this" in that
    // version.)
    rollDice = function () {...};

    pb.takeTurn = function () {...};

    // Instead of returning "this" (which would happen
    // automatically if PigPlayer were called with new and had
    // no return statement), return pb, the container object for
    // public members.
    return pb;
};
~~~

To make the code a little clearer, we can use `pv` as a container
for private members in the same way `pb` is used for public
members.

~~~javascript
PigPlayer = function (holdAmount) {
    var pb = {}, pv = {};

    pv.holdAmount = holdAmount;
    pv.score = 0;

    pb.getScore = function () { return pv.score; };

    pv.rollDice = function () {...};

    pb.takeTurn = function () {...};

    return pb;
};
~~~

What about static members?  In the following example, `numDice`
would act like a private static field.  It's created just once,
when the immediate function wrapping `PigPlayer` runs.  (This
is in contrast to `pb` and `pv` above, which are created every
time the constructor `PigPlayer` runs.)  Since it's not returned
there won't be a way to access it directly from outside a
`PigPlayer` object, and yet if it's accessed within a function
that's a member of the PigPlayer object (e.g., `pv.rollDice`)
a reference to it will be maintained as part of the state of
the object.  That is, it will act like a private static field.

~~~javascript
(function () {
    var numDice = 2;

    PigPlayer = function (holdAmount) {...};
}());
~~~

We have a container object for public instance members (`pb`),
and one for private instance members (`pv`).  Why not create one
for private static members like `numDice`?  And why not make
`rollDice` a (private) static method, since it doesn't need to
access any instance members?

~~~javascript
(function () {
    var ps = {};

    // private static field
    ps.numDice = 2;

    // private static method
    ps.rollDice = function () {
        var i, total = 0;

        for (i = 0; i < ps.numDice; i++) {
            total += Math.floor(Math.random() * 6) + 1;
        }

        return total;
    };

    PigPlayer = function (holdAmount) {...};
}());
~~~

One more possibility would be to include public static members.
In Java, these would be accessed via the class name (i.e.,
`Math.random`).  It's possible to do the same thing in JavaScript,
as illustrated by the example below.[^2]  (To avoid repetition I left
out parts of the code in the last few examples, but I've included
the whole thing here since this is the last version of the code.)

~~~javascript
(function () {
    var ps = {};

    // private static field
    ps.numDice = 2;

    // private static method
    ps.rollDice = function () {
        var i, total = 0;

        for (i = 0; i < ps.numDice; i++) {
            total += Math.floor(Math.random() * 6) + 1;
        }

        return total;
    };

    PigPlayer = function (holdAmount) {
        var pb = {}, pv = {};

        // private instance fields
        pv.holdAmount = holdAmount;
        pv.score = 0;

        // public instance methods
        pb.getScore = function () { return pv.score; };

        pb.takeTurn = function () {
            var turnScore = 0, rollScore;

            while (turnScore < pv.holdAmount) {
                rollScore = ps.rollDice();

                if (rollScore > ps.numDice) {
                    turnScore += rollScore;
                } else {
                    turnScore = 0;
                    break;
                }
            }

            pv.score += turnScore;
        };

        return pb;
    };

    // public static method
    PigPlayer.setNumDice = function (numDice) {
        ps.numDice = numDice;
    };
}());
~~~

It would be possible to add a public static field in the same way;
just add it as a member to `PigPlayer` after the `PigPlayer`
function.  There's just one possible problem to be aware of.
Suppose we defined `maxHold`, after `setNumDice`, in the following
way.

~~~javascript
PigPlayer.maxHold = 50;
~~~

As long as we always accessed `maxHold` via `PigPlayer`, everything
would be fine.  But what about this?

~~~javascript
p = new PigPlayer(20);
...
p.maxHold = 40;
~~~

Rather than changing the static field `PigPlayer.maxHold`, this
statement would add `maxHold` to `p` as a new public *instance*
field and initialize it to
40.  You wouldn't get any error message, the code just wouldn't
do what you intend.  Because of this you might want to avoid
public instance fields.  Instead, you could just use a variable
declared in such a way that its scope contains all
instances.

*Exercise #: Why is it that `setNumDice` isn't defined at the
beginning
with private static members?  Or what if `setNumDice` were
defined inside `PigPlayer`?  What difference would that make?*

_Exercise #: Translate the following Java class into a JavaScript
function,
following the pattern of the final version of `PigPlayer`
above:  use `ps` for any private static members, `pb` for
any public instance members, and `pv` for any private instance
members; add any public static members to the constructor object
(e.g., `PigPlayer`) after adding the constructor function.
(You may assume `SpriteDrawer` is defined somewhere else, i.e,
add it to your JSLint `/*global` line at the beginning of the
file.)_

~~~java
public class Sprite {

    private static int minX, minY, maxX, maxY;

    static {
        minX = minY = 0;
        maxX = 640;
        maxY = 480;
    }

    private String filename;
    private double xPos = 0, yPos = 0;
    private boolean movable;
    private boolean visible = true;

    public Sprite(String filename, double xPos, double yPos,
            boolean movable) {
        this.filename = filename;
        forceMove(xPos, yPos);
        this.movable = movable;
    }

    private void forceMove(double dx, double dy) {
        xPos += dx;
        yPos += dy;

        if (xPos < minX) xPos = minX;
        if (xPos > maxX) xPos = maxX;

        if (yPos < minY) yPos = minY;
        if (yPos > maxY) yPos = maxY;
    }

    public void move(double dx, double dy) {
        if (movable) forceMove(dx, dy);
    }

    public void hide() {
        visible = false;
    }

    public void show() {
        visible = true;
    }

    public void draw() {

        if (visible)
            SpriteDrawer.draw(filename, xPos, yPos);
    }

    public boolean checkCollision(Sprite that,
            double collisionDistance) {
        double dx = this.xPos - that.xPos;
        double dy = this.yPos - that.yPos;
        double distance = Math.sqrt(dx * dx + dy * dy);

        return distance <= collisionDistance;
    }
}
~~~
    
[^1]: In case you are worried about the possibility of a race condition, if for example you had multiple callback functions trying to modify a shared variable at the same time...you don't need to worry about that.  In JavaScript a function runs as an *atomic* piece of code, i.e., its execution won't be interleaved with that of another function. For more details: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop>.

[^2]: A different way to simulate public static members would be to use the `prototype` member automatically created for function objects and assigned to `this` when the function is invoked as a constructor (i.e., with `new`).  I've chosen not to do it this way, and to avoid a general discussion of how `prototype` works in Javascript, in order to keep this lesson from getting too long.
