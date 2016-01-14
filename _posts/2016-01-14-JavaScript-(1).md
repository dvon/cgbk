---
layout: default
---

# JavaScript (1)

These first lessons are meant to teach you (at least one
way) to use Javascript effectively, assuming you have learned basic
object-oriented programming in a language like Java.  Most of
the ideas here come from *JavaScript Patterns*, by Stoyan
Stefanov, and *JavaScript: The Good Parts*, by Douglas Crockford.

I suggest you used the Atom text editor, with the "jslint"
extension installed.  (You'll get a lot of error messages from
the early examples, however, so you might want to disable jslint
initially.)

## Objects

In JavaScript, you don't need a class to create an object.
Here's code to create an empty object called `player` and
then give it two fields, `holdAmount` and `score`.

~~~javascript
// Create a new empty object, assign it to player.
player = {};

// Add fields.
player.holdAmount = 20;
player.score = 0;
~~~

Here's code to add a method, `takeTurn`, which simulates a
turn in the dice game "Pig"
(<https://en.wikipedia.org/wiki/Pig_(dice_game)>).

~~~javascript
// Add a method.
player.takeTurn = function () {
    turnScore = 0;

    // Keep rolling until reaching holdAmount or rolling
    // a "pig" (rolling a 1), in which case any points
    // accumulated during the turn are lost, and the turn
    // ends.
    while (turnScore < player.holdAmount) {
        rollScore = Math.floor(Math.random() * 6) + 1;

        if (rollScore > 1) {
            turnScore += rollScore;
        } else {
            turnScore = 0;
            break;
        }
    }

    // Add points accumulated during the turn to overall
    // score.  (If a pig was rolled, only the points for
    // the turn are lost, not points from previous turns.)
    player.score += turnScore;
};
~~~

If you link to this code from a web page, you can run it in
a browser.  Here's a minimal web page (assuming the code
above is saved in "pig.js").

~~~html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <script src="pig.js"></script>
  </head>
  <body>
  </body>
</html>
~~~

If you save this as "pig.html" in the same folder where you
saved "pig.js," and then open "pig.html" in a web page, it
will run the JavaScript code above.  But you won't see
anything...until you add the code below, which uses `player` to
simulate a solitaire version of Pig and prints the results
in the browser's developer console.

~~~javascript
// Play a solitaire version of Pig.  (How many turns will it
// take to reach 100 points?)

turnCount = 0;

while (player.score < 100) {
    player.takeTurn();
    turnCount++;
}

console.log(player.score + " points in " + turnCount + " turns.");
~~~

1.  *Enter the code above, saved in "pig.html" and "pig.js," in
the same folder.  Open "pig.html" in a web browser.  In Chrome,
you will be able to see the output if you choose
"More Tools...Developer Tools...Console,"
starting from the options menu in the upper right.  You'll also
see error messages if you made any mistakes entering the code.
Assuming it's working correctly, you should see a score of at
least 100, earned in something like 10 to 15 turns.*

## Functions

In JavaScript, you don't need a class to create an object, as
the code above illustrates.  But what if you want to create two
similar objects, objects that would be instances of a single
class in a typical object-oriented programming language?  You
could just repeat a big chunk of the code above, first creating
`player` and adding the fields and method, and then creating
`player2` and adding the same fields and the same method.  But
there is a better way.  You can define a function that creates
a Pig player object, and then each time you need one you can
call the function.

~~~javascript
PigPlayer = function (holdAmount) {
    var player = {};    // var makes player local.

    player.holdAmount = holdAmount;
    player.score = 0;

    player.takeTurn = function () {
        turnScore = 0;

        while (turnScore < player.holdAmount) {
            rollScore = Math.floor(Math.random() * 6) + 1;

            if (rollScore > 1) {
                turnScore += rollScore;
            } else {
                turnScore = 0;
                break;
            }
        }

        player.score += turnScore;
    };

    return player;
};
~~~

Here's how you'd use the `PigPlayer` function to create two
objects you can use to simulate a two-player game of Pig.

~~~javascript
p = PigPlayer(15);
q = PigPlayer(25);

while (p.score < 100 && q.score < 100) {
    p.takeTurn();
    q.takeTurn();
}

if (p.score > q.score) {
    console.log("First player won " + p.score + " to " +
            q.score + ".");
} else if (p.score < q.score) {
    console.log("First player lost " + p.score + " to " +
            q.score + ".");
} else {
    console.log("The two players tied at " + p.score + ".");
}
~~~

Notice the use of `var` in the second line of the `PigPlayer`
function.  By default JavaScript makes every new variable
global.  If you declare the variable with `var`, however, its
scope will be limited to the function in which it's declared.

In this code, if you take out `var` the result is that the
first player doesn't get any points.  Why?  The second time
`PigPlayer` is called, the `player` object created by the first
call is overwritten by the second.  After this happens, any
time the first player's `takeTurn` method is called it
updates the second player's `player` object's `score` field
rather than that of the first player, so the second player
gets whatever points should have been given to the first.

2.  *Write a modified version of the code above, with `var`
taken out and additional `console.log` statements added, to
clearly show the error explained in the previous paragraph.*

## Constructors

As shown in the previous example, you can define a function that
returns a new object, something like a constructor in a typical
object-oriented language.  JavaScript actually provides a special
syntax designed for this---designed to create constructor
functions, using `new` and `this` in a way you might expect to
see in a Java program.  Here's our Pig program
again, this time using a proper JavaScript constructor.  (Notice
that `takeTurn`'s variables `turnScore` and `rollScore` have been
declared with `var` to make them local to that function.)

~~~javascript
PigPlayer = function (holdAmount) {
    this.holdAmount = holdAmount;
    this.score = 0;

    this.takeTurn = function () {
        var turnScore = 0, rollScore;

        while (turnScore < this.holdAmount) {
            rollScore = Math.floor(Math.random() * 6) + 1;

            if (rollScore > 1) {
                turnScore += rollScore;
            } else {
                turnScore = 0;
                break;
            }
        }

        this.score += turnScore;
    };
};

p = new PigPlayer(15);
q = new PigPlayer(25);

while (p.score < 100 && q.score < 100) {
    p.takeTurn();
    q.takeTurn();
}

if (p.score > q.score) {
    console.log("First player won " + p.score + " to " +
            q.score + ".");
} else if (p.score < q.score) {
    console.log("First player lost " + p.score + " to " +
            q.score + ".");
} else {
    console.log("The two players tied at " + p.score + ".");
}
~~~

`PigPlayer` is called with `new` when `p` and `q` are created.
When you call a function with `new` in JavaScript, a new empty
object will be created and assigned to a local variable `this`
inside the function.  Within the function you can add fields and
methods to `this`, the new object, and at the end of the function
`this` will be returned automatically (as long as the function
doesn't have a `return` statement).

This is cool...it makes the code look a lot like what you'd see
in a Java program.  But what would happen if you forgot to use
`new` when you called the function?  You might guess that you'd
get an error, since the function tries to add things to `this`,
but `this` would be undefined, right?  Not exactly.  If `new` is
omitted no new object is created and assigned to `this`, but
`this` isn't undefined, it refers to a *global* object.  So
anything added to `this` in the constructor ends up being a new
global variable.

Besides `this` referring to a global object (so that anything
added to `this` becomes a new global), when `new` is omitted the
function no longer automatically returns `this`.  For the code
above, that's a very good thing, because it means it means omitting
`new` will generate an error message.  `p` (and `q` as well) ends
up being `undefined`, since `PigPlayer` doesn't return anything,
which means `p.score` will generate an error.  But it would be
possible to write a program in which a missing `new` doesn't
generate an error---but does interfere with pre-existing global
variables.  This would be a very bad thing.

Fortunately it's possible to write a constructor function in a
way that makes it work correctly even if `new` is omitted, as
shown here.

~~~javascript
PigPlayer = function (holdAmount) {

    // If "new" is omitted when this function is called, "this"
    // will refer to a global object and therefore won't be an
    // instance of PigPlayer.  In that case, replace the bad
    // function call with one that uses "new".
    if (!(this instanceof PigPlayer)) {
        return new PigPlayer(holdAmount);
    }

    this.holdAmount = holdAmount;
    this.score = 0;

    this.takeTurn = function () {
        var turnScore = 0, rollScore;

        while (turnScore < this.holdAmount) {
            rollScore = Math.floor(Math.random() * 6) + 1;

            if (rollScore > 1) {
                turnScore += rollScore;
            } else {
                turnScore = 0;
                break;
            }
        }

        this.score += turnScore;
    };
};
~~~

3. *Write a modified version of the Pig game code above, without the
check for `new`, with "`return this;`" at the end of the
constructor, and without `new` in the statements that create new
`PigPlayer` objects.  Add output statements to show that now the
two players both get each other's points, so that they always
tie.*

4. *In this example, if the earlier version of the constructor
without the check for `new` is called without `new`, you end up
getting an error message because the constructor returns
`undefined`.  Describe a situation where a missing `new`, and
resulting global `this`, might pollute the global scope without
triggering an error.*
