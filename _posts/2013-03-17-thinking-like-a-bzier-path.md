---
layout: post
title: "Thinking like a Bézier path"
description: "Bézier paths are a powerful part of computer graphics. They allow the construction of any vector shape that can later be rendered in any resolution. Construction of a Bézier path can initially seem strange but after breaking them down into the lines, curves and arcs they are composed of can help us understand them."
category:
tags: [Core Graphics, Bézier path, math]
---

<style>{% include style-thinking-like-a-bezier-path.css %}</style>

Rounded corners is a very common visual style on iOS. Since every view on iOS is backed by a layer, it can be acheived in just one line of code.

    myView.layer.cornerRadius = myCornerRadius;

But that wont work if we only want to round one corner. The `cornerRadius` property on [`CALayer`][calayer] is not like CSS. There is no `topLeftCornerRadius` or equivalent property. This cannot be done with a simple property change. We can however create a [`UIBezeirPath`][uibezierpath] that is a rectangle with any combination of corners rounded. That path can then be used to either mask our layer or be drawn directly inside `drawRect:`.

    UIBezierPath *path = 
        [UIBezierPath bezierPathWithRoundedRect:rect
                              byRoundingCorners:UIRectCornerTopLeft 
                                    cornerRadii:CGSizeMake(radius, radius)

But what if we wanted to round two corners with two different radii? Looking at [the documentation for `UIBezeirPath`][uibezierpath] there is no convenience method that seems to do that for us. We need to construct the path ourselves and to do that we need to think like a Bézier path.

# Break down
Construction of a Bézeir path is very similar to using pen and paper to draw the same shape[^pen&paper]. So if you want to follow along at home I suggest you grab a pen and paper.

 Lets start by drawing the full path. In my example I’m going to draw a rectangle with a smaller rounded corner in the upper left and a bigger rounded corner in the upper right.

<figure>
<div style="margin: auto; width: 370px; height: 220px; display: block; padding: 35px 0;">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="370" height="220">
<path d="M10 210 L 10 40 
		 A 30 30, 0, 0, 1, 40 10
		 L 360 10 L 360 130
		 A 80 80, 0, 0, 1, 280 210 Z" stroke="#222E39" stroke-width="2" fill="#4594D9"/>
</svg>
</div>
</figure>
<figcaption>The shape of a rectangle with one small rounded corner and one large rounded corner.</figcaption>

The path consists of a few straight lines and two arcs. We start by sketching out the rectangular shape, ignoring the rounded corners for now. Next we draw a full circle in the two corners that should be rounded and mark the center of those circles. Finally we mark all the points where the path changes from one line to another or from a line to an arc. 

Now we have all the necessary points and can start translating out sketch into a Bézier path. You can visualize the path as we go on another sheet of paper. It should look something like this for now:

<figure>
<div style="margin: auto; width: 370px; height: 220px; display: block; padding: 35px 0;">
<svg xmlns="http://www.w3.org/2000/svg" version="1.1" width="370" height="220">

<path d="M 10 210 L 10 10 L 360 10 L 360 210 Z" fill="none" stroke="#222E39" stroke-width="2" stroke-dasharray="6,8" />

<circle cx="40" cy="40" r="30" stroke="#222E39" stroke-width="2" fill="none" stroke-dasharray="4,5"/>
<path d="M10 40 L 40 40 L 40 10" stroke="#222E39" stroke-width="2" fill="none" stroke-dasharray="4,5"/>

<circle cx="280" cy="130" r="80" stroke="#222E39" stroke-width="2" fill="none" stroke-dasharray="6,8"/>
<path d="M360 130 L 280 130 L 280 210" stroke="#222E39" stroke-width="2" fill="none" stroke-dasharray="6,8"/>

<g stroke="#4594D9" stroke-width="3.5" fill="none" style="-webkit-svg-shadow:0px 1px 2px rgba(0,0,0,0.5);">
<circle cx="10"  cy="210" r="6" />
<circle cx="10"  cy="40"  r="6" />
<circle cx="40"  cy="10"  r="6" />
<circle cx="360" cy="10"  r="6" />
<circle cx="360" cy="130" r="6" />
<circle cx="280" cy="210" r="6" />
</g>

<g fill="rgb(255,171,25)" style="-webkit-svg-shadow:0px 1px 2px rgba(0,0,0,0.5);">
<circle cx="40"  cy="40"  r="5" />
<circle cx="280" cy="130" r="5" />
</g>

</svg>
</div>
</figure>
<figcaption>The path broken down into its basic components. Blue circles are where the path changes from line to line or line to curve. Orange dots are the center of the circles that define the rounded corners.</figcaption>

## Describing the path

A path starts by _moving to some point_. You can choose any point you like. I’m choosing the lower left corner (for no specific reason). Move your pen to that point on the paper. From that point you can go either clockwise or anti-clockwise. I’m choosing clockwise (again for no specific reason). The next thing clockwise from the point I just moved to is a line to the point just before the first arc so I _add a line to that point_.  Draw a line from where the pen is to that point.

The next thing from that point is an arc. It arcs around the center point of that circle for 90˚ (<span class="math"><sup>π</sup>/<sub>2</sub></span>. If the angle <span class="math">0</span> were to the right and the angle increased clockwise this means that this arc goes from <span class="math">π</span> (straight left) to <span class="math"><sup>3π</sup>/<sub>2</sub></span> (straight up). So I _add an arc around the center of the circle from <span class="math">π</span> to <span class="math"><sup>3π</sup>/<sub>2</sub></span> clockwise_. Draw a line along the circle from the left-most point to the top-most point.

From there the next thing is another line, then another arc and finally two more lines. Applying the same reasoning and doing the same drawing as above should have completed your path and drawn the full shape on your piece of paper. 

You may have noticed the empahized three things in the breakdown of the path above: move to point, add a line to point and add arc around point. These equate to the methods `moveToPoint:`, `addLineToPoint:` and `addArcWithCenter:radius:startAngle:endAngle:clockwise:` on `UIBezierPath` or their counterparts for `CGPaths`: `CGPathMoveToPoint()`, `CGPathAddLineToPoint()` and `CGPathAddArc()`. This is the construction of a shape in the termonology of a Bézier path. We are thinking like a Bézier path.

By translating the steps we took above, one by one, into their counterparts in code we have the necessary code to draw this shape. 



<figure>
<div style="margin: auto; width: 370px; height: 220px; display: block; padding: 35px 0;">
<svg id="path-breakdown-naive" xmlns="http://www.w3.org/2000/svg" version="1.1" width="370" height="220">

<path d="M10 210 L 10 40 
		 A 30 30, 0, 0, 1, 40 10
		 L 360 10 L 360 130
		 A 80 80, 0, 0, 1, 280 210 Z" stroke="#222E39" stroke-width="2" fill="none" opacity="0.3" stroke-dasharray="6,8"/>

<g id="steps" stroke="#222E39" stroke-width="2" fill="none">

<line id="step2" x1="10" y1="210" x2="10" y2="40" />
<path id="step3" d="M10 40 A 30 30, 0, 0, 1, 40 10" />

<line id="step4" x1="40" y1="10" x2="360" y2="10"  />
<line id="step5" x1="360" y1="10" x2="360" y2="130"  />
<path id="step6" d="M360 130 A 80 80, 0, 0, 1, 280 210"  />

<line id="step7" x1="280" y1="210" x2="10" y2="210" />

</g>

<g id="dots" fill="#ffba00" style="-webkit-svg-shadow:0px 1px 2px rgba(0,0,0,0.5);">
<circle class="dot" id="dot1" cx="10"  cy="210" r="6" />
<circle class="dot" id="dot2" cx="10"  cy="40"  r="6" />
<circle class="dot" id="dot3" cx="40"  cy="10"  r="6" />
<circle class="dot" id="dot4" cx="360" cy="10"  r="6" />
<circle class="dot" id="dot5" cx="360" cy="130" r="6" />
<circle class="dot" id="dot6" cx="280" cy="210" r="6" /> 
</g>

<g id="hoverHint">
<text class="hintText" x="60" y="90"  fill="#222E39" font-family="Avenir Next" font-size="24" font-weight="500" >Hover the code below</text>
<text x="60" y="120" fill="#222E39" font-family="Avenir Next" font-size="24" font-weight="500" >to visualize the path</text>
<text x="60" y="150" fill="#222E39" font-family="Avenir Next" font-size="24" font-weight="500" >breakdown ...</text>

</g>

</svg>
</div>

<div class="segmentedControl">
<div class="segment selectedSegment uibezierSegment" onclick="selectUIBezierPath()">UIBezierPath</div><div class="segment cgpathSegment" onclick="selectCGPath()">CGPath</div>
</div> 

<pre class="hoverCode" onmouseover="hoverCodeFunction(event, 'path-breakdown-naive')" onmouseout="leaveCodeFunction('path-breakdown-naive')"><code>
<span id="hover0"><span class="uibezier">UIBezierPath *path = <span class="codeHighlight">[UIBezierPath bezierPath]</span>;</span><span class="cgpath hidden">CGMutablePathRef path = <span class="codeHighlight">CGPathCreateMutable()</span>;</span>
</span><span id="hover1"><span class="uibezier">[path <span class="codeHighlight">moveToPoint</span>:lowerLeftCorner];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathMoveToPoint</span>(path, NULL, 
                  lowerLeftCorner.x, lowerLeftCorner.y);</span>
</span><span id="hover2"><span class="uibezier">[path <span class="codeHighlight">addLineToPoint</span>:upperLeftBeforeArc];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathAddLineToPoint</span>(path, NULL, 
                     upperLeftBeforeArc.x, upperLeftBeforeArc.y);</span>
</span><span id="hover3"><span class="uibezier">[path <span class="codeHighlight">addArcWithCenter</span>:upperLeftCircleCenter
                <span class="codeHighlight">radius</span>:smallRadius
            <span class="codeHighlight">startAngle</span>:straightLeftAngle
              <span class="codeHighlight">endAngle</span>:straightUpAngle
             <span class="codeHighlight">clockwise</span>:YES];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathAddArc</span>(path, NULL,
             upperLeftCircleCenter.x, upperLeftCircleCenter.y,
             smallRadius,        // radius
             straightLeftAngle,  // start angle
             straightUpAngle,    // end angle
             NO);                // clockwise</span>
</span><span id="hover4"><span class="uibezier">[path <span class="codeHighlight">addLineToPoint</span>:upperRightCorner];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathAddLineToPoint</span>(path, NULL, 
                     upperRightCorner.x, upperRightCorner.y);</span>
</span><span id="hover5"><span class="uibezier">[path <span class="codeHighlight">addLineToPoint</span>:lowerRightBeforeArc];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathAddLineToPoint</span>(path, NULL, 
                     lowerRightBeforeArc.x, lowerRightBeforeArc.y);</span>
</span><span id="hover6"><span class="uibezier">[path <span class="codeHighlight">addArcWithCenter</span>:lowerRightCircleCenter
                <span class="codeHighlight">radius</span>:largeRadius
            <span class="codeHighlight">startAngle</span>:straightRightAngle
              <span class="codeHighlight">endAngle</span>:straightDownAngle
             <span class="codeHighlight">clockwise</span>:YES];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathAddArc</span>(path, NULL,
             lowerRightCircleCenter.x, lowerRightCircleCenter.y,
             largeRadius,        // radius
             straightRightAngle, // start angle
             straightDownAngle,  // end angle
             NO);                // clockwise</span></span><span id="hover7">
<span class="uibezier">[path <span class="codeHighlight">closePath</span>];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathCloseSubpath</span>(path);</span>
</span></code></pre>

</figure>
<figcaption>Our first breakdown </figcaption>



# A slightly smarter path
But wait. We are not done yet. Bézier paths are smarter than this and to think like a Bézier path we want to be as clever as one. Some of the lines of code we just wrote are unnecessary. 

When we are drawing and arc and specifying the `startAngle`, we are implicitly giving all the necessary information to know the starting point of that arc so the path doesn’t need the explicit line to that point. It can add the line by itself. This means that we can remove the “add line”-calls before doing our arcs. The second thing is when we are finishing off the path. Our final step is to add a line back to the point where we started but the path already knows _where_ it started so we don’t need to tell it again. We can just tell it to close off the path by calling `closePath` (or `CGPathCloseSubpath()`).

Let’s look at our revied drawing code.


<figure>
<div style="margin: auto; width: 370px; height: 220px; display: block; padding: 35px 0;">
<svg id="path-breakdown-smart" xmlns="http://www.w3.org/2000/svg" version="1.1" width="370" height="220">

<path d="M10 210 L 10 40 
		 A 30 30, 0, 0, 1, 40 10
		 L 360 10 L 360 130
		 A 80 80, 0, 0, 1, 280 210 Z" stroke="#222E39" stroke-width="2" fill="none" opacity="0.3" stroke-dasharray="6,8"/>

<g id="steps" stroke="#222E39" stroke-width="2" fill="none">

<path id="step2" d="M10 210 L 10 40 A 30 30, 0, 0, 1, 40 10" />

<line id="step3" x1="40" y1="10" x2="360" y2="10"  />
<path id="step4" d="M360 10 L 360 130 A 80 80, 0, 0, 1, 280 210"  />
<line id="step5" x1="280" y1="210" x2="10" y2="210" />

</g>

<g id="dots" fill="#ffba00" style="-webkit-svg-shadow:0px 1px 2px rgba(0,0,0,0.5);">
<circle class="dot" id="dot1" cx="10"  cy="210" r="6" />
<circle class="dot" id="dot2" cx="40"  cy="10"  r="6" />
<circle class="dot" id="dot3" cx="360" cy="10"  r="6" />
<circle class="dot" id="dot4" cx="280" cy="210" r="6" />
</g>

<g id="hoverHint">
<text class="hintText" x="60" y="90"  fill="#222E39" font-family="Avenir Next" font-size="24" font-weight="500" >Hover the code below</text>
<text x="60" y="120" fill="#222E39" font-family="Avenir Next" font-size="24" font-weight="500" >to visualize the path</text>
<text x="60" y="150" fill="#222E39" font-family="Avenir Next" font-size="24" font-weight="500" >breakdown ...</text>

</g>

</svg>
</div>

<div class="segmentedControl">
<div class="segment selectedSegment uibezierSegment" onclick="selectUIBezierPath()">UIBezierPath</div><div class="segment cgpathSegment" onclick="selectCGPath()">CGPath</div>
</div> 

<pre class="hoverCode" onmouseover="hoverCodeFunction(event, 'path-breakdown-smart')" onmouseout="leaveCodeFunction('path-breakdown-smart')"><code>
<span id="hover0"><span class="uibezier">UIBezierPath *path = <span class="codeHighlight">[UIBezierPath bezierPath]</span>;</span><span class="cgpath hidden">CGMutablePathRef path = <span class="codeHighlight">CGPathCreateMutable()</span>;</span>
</span><span id="hover1"><span class="uibezier">[path <span class="codeHighlight">moveToPoint</span>:lowerLeftCorner];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathMoveToPoint</span>(path, NULL,
                  lowerLeftCorner.x, lowerLeftCorner.y);</span>
</span><span id="hover2"><span class="uibezier">[path <span class="codeHighlight">addArcWithCenter</span>:upperLeftCircleCenter
                <span class="codeHighlight">radius</span>:smallRadius
            <span class="codeHighlight">startAngle</span>:straightLeftAngle
              <span class="codeHighlight">endAngle</span>:straightUpAngle
             <span class="codeHighlight">clockwise</span>:YES];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathAddArc</span>(path, NULL,
             upperLeftCircleCenter.x, upperLeftCircleCenter.y,
             smallRadius,        // radius
             straightLeftAngle,  // start angle
             straightUpAngle,    // end angle
             NO);                // clockwise</span>
</span><span id="hover3"><span class="uibezier">[path <span class="codeHighlight">addLineToPoint</span>:upperRightCorner];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathAddLineToPoint</span>(path, NULL, 
                     upperRightCorner.x, upperRightCorner.y);</span>
</span><span id="hover4"><span class="uibezier">[path <span class="codeHighlight">addArcWithCenter</span>:lowerRightCircleCenter
                <span class="codeHighlight">radius</span>:largeRadius
            <span class="codeHighlight">startAngle</span>:straightRightAngle
              <span class="codeHighlight">endAngle</span>:straightDownAngle
             <span class="codeHighlight">clockwise</span>:YES];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathAddArc</span>(path, NULL,
             lowerRightCircleCenter.x, lowerRightCircleCenter.y,
             largeRadius,        // radius
             straightRightAngle, // start angle
             straightDownAngle,  // end angle
             NO);                // clockwise</span></span><span id="hover5">
<span class="uibezier">[path <span class="codeHighlight">closePath</span>];</span><span class="cgpath hidden"><span class="codeHighlight">CGPathCloseSubpath</span>(path);</span>
</span></code></pre>

</figure>
<figcaption>Our first breakdown </figcaption>



The best part is that it doesn’t get much harder than this. Once you’ve learnt to break down one path you can apply the same tools and divide it into lines, arc and curves. One by one, in any combination. The more you do the better you’ll get at it. But we missed curves and curves are awesome. Curves are the center of you favorite vector drawing program. They draw a _curved_ line to another point, bending _towards_ two “control points” on its way there. I said bending towards because the curve doesn’t go all the way to neither of the two control points. 
 
There is a little bit of math involved in how the path is drawn between the four points (the start point, 2 control points and the end point) but unless you are interested you will never have to use it. I am interested so I will gladly explain the math. Feel free to skip ahead if you are afraid that you might learn something.
 
###  Curves

A curve is being added to our path form the current point to an end point. Just like when adding a line to the path, the curve starts off at the current point and ends up at the point we are moving to. In between it first approaches one of the control point the further it comes from the first point, then it slowly starts to steer off towards the second control point until it again starts steering off towards the end point more and more.

> Image

Given a variable **t**, that expresses how far long from start to finish along the curve we have moved, we can set up the following equation to describe the curve. 
 
start * (1-t)^3 + c1 * t(1-t)^2 + c2 * t^2(1-t) + end * t^3  
 
 When **t** is 0 the curve is at the start point since all the other terms are multiplied by 0. In the same way, when **t** is 1 the curve is at the end point. The interesting thing happens when **t** goes from 0 to 1. Say for example that **t** is **0.1**. In that case the equation becomes
 
start * (0.9)^3 + c1 * 0.1(0.9)^2 + c2 * 0.1^2(0.9) + end * 0.1^3  
 
start * 0.729 + c1 * 0.081 + c2 * 0.009 + end * 0.001  
 
 At this point the curve takes most of its value from the start point (that it is very close to), a little bit of its value from the first control point and almost nothing from the rest. When **t** increases to **0.2** the values change so that the curve approaches the first control point more and more. 
 
 start * 0.512 + c1 * 0.128 + c2 * 0.032 + end * 0.008
 
At some point the curves starts approaching the second control point instead and later, as **t** approaches **1**, the curve will starts approaching the end point. It’s matematically simple but gives a smooth curve from one point to another. 

#### Adding curves to our breakdown list

Curves fit quite nicely in the list of things we can break down a path into. Just like a line it goes from the current point _to another point_. Then to define the curve we also have to specify the two control points. Just remember that two control points can at most do an “S”-shape. If the curve wiggles three times it’s actually more than one curve and need to be broken down into more than one curve 

> IMage
 
 
 > Add that to our break down reportoar.
 
 Make a joke about the power of bezier paths being at our fingertips (given the amount of pen and paper we are going to use the first few times)
 
 


[calayer]: http://www.apple.com “CALayer documentation”

[uibezierpath]: http://www.apple.com “UIBezierPath documentation”

[^pen&paper]: _Constructing_ a Bézier path is like drawing it. Drawing the shape (filling or stroking it) is somehting slightly different.

<script src="/script/script-thinking-like-a-bezier-path.js" type="text/javascript" onload="correctInstructions()"> </script>
