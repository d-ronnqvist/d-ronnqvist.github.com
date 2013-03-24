---
layout: post
title: "Translate rotate translate?"
description: "When working with transforms and wanting to rotate around some other point than center or origo you hear that you need to translate (move), then rotate and then translate back. Let me explain what that means."
category: 
tags: [CoreAnimation, Transforms]
---

<style>{% include style-translate-rotate-translate.css %}</style>

When working with transforms and wanting to rotate around some other point than center or origo you hear that you need to translate (move), then rotate and then translate back. Let explain what that means.

## Behind the scenes

When you apply a transform to a view the coordinates of that views corners gets multiplied by a transformation matrix to calculate their new positions. When you apply multiple transforms to a view the matrixes for the different transforms are multiplied with the corners of your view in the order that they should be applied[^matrixMultiplication]. The important thing to take away from this is that the order is important. Translating first and then rotating does not give the same result as rotating first and then translating. The reason for this is that matrixes are not commutative, which means that <span class="math">M<sub>trans</sub> × M<sub>rotate</sub> ≠ M<sub>rotate</sub> × M<sub>trans</sub></span>. 

[^matrixMultiplication]: In reality the different transformation matrixes are being multiplied _in the order they should be applied_ to get a single transformation matrix that reflects all the transformations in total. 

Don’t worry! You don’t need to understand matrixes to apply transforms as long as you know that order matters. The animations below illustrate how the order of translating and rotating makes a difference.

<figure id="transformBreakdown" style="height: 270px;"><div class="resetButton" onclick="resetAnimation(this)" style="-webkit-animation-delay: 11s;">◀◀</div>
<div class="viewBox marking">begin</div>
<div class="viewBox marking" style="-webkit-transform: translate(-2px, -2px) translateX(-200px) rotateZ(-30deg) translate(200px)">end</div>
<svg><path d="M 322,80 a 40,120 0 0 1 27,100" fill="none" stroke="black" stroke-width="2" stroke-dasharray="5,5" transform="translate(-50,3)"></path><path d="M -5,8 L 0,0 L 5,8" fill="none" stroke="black" stroke-width="2" transform="translate(271, 81) rotate(-35 0 0)"></path></svg><div class="viewBox transformBreakdownAnimation">view</div>			
  <ol id="transformSteps"><li><code>translate</code></li>
    <li><code>rotate</code></li>
    <li><code>translate</code></li>
  </ol></figure>
  <figcaption>A view being translated, rotated and translated back.</figcaption>

## Creating such a transform in code

Both Core Animation and Core Graphics provide nice abstractions for working with transforms. In Core Graphics we have 2D affine transforms called `CGAffineTransform` and in Core Animation we have 3D transforms called `CATransform3D`. In the rest of the post I'm going to use the 3D transforms but it all applies to affine transforms as well. 

You can create a new rotation transform by calling `CATransform3DMakeRotation(…)` or even rotate an existing transform using `CATransform3DRotate(…)`. Translating and scaling has similar methods. That's means that our three step transform is three lines of code (excluding two variables for the angle and the distance):

    CGFloat thirtyDegrees = 30.0 * M_PI / 180.0;
    CGFloat distanceToRotationPoint = 100.0;
    CATransform3D rotation = 
        CATransform3DMakeTranslation(-distanceToRotationPoint, 0.0, 0.0);
    rotation = 
        CATransform3DRotate(rotation, -thirtyDegrees, 0.0, 0.0, 1.0);
    rotation = 
        CATransform3DTranslate(rotation, distanceToRotationPoint, 0.0, 0.0);
    
If we set that as the transform of our view we will see that it has moved to the correct position, just as if it was rotated around a pointer other than its center. 

## Animating a rotation

Being able to set a rotation transform is cool and all but we want to animate the rotation as well. So we create a basic animation from the identity matrix (meaning no transformation) to our translate-rotate-translate transform and add it to a layer.
   
    CABasicAnimation *rotate = 
        [CABasicAnimation animationWithKeyPath:@"transform"];
    rotate.fromValue = [NSValue valueWithCATransform3D:CATransform3DIdentity];
    rotate.toValue = [NSValue valueWithCATransform3D:externalRotation];
    rotate.duration = 1.0;    
    
    [rotatingLayer addAnimation:rotate forKey:@"myRotationAnimation"];

<figure style="height: 270px;"><div class="resetButton" onclick="resetAnimation(this)" style="-webkit-animation-delay: 3s;">◀◀</div>
<div class="viewBox marking">begin</div>
<div class="viewBox marking" style="-webkit-transform: translate(-2px, -2px) translateX(-200px) rotateZ(-30deg) translate(200px)">end</div>
<svg><path d="M 322,80 a 40,120 0 0 1 27,100" fill="none" stroke="black" stroke-width="2" stroke-dasharray="5,5" transform="translate(-50,3)"></path><path d="M -5,8 L 0,0 L 5,8" fill="none" stroke="black" stroke-width="2" transform="translate(271, 81) rotate(-35 0 0)"></path></svg><div class="viewBox apply45deg">view</div></figure>
<figcaption>Animating to the translate-rotate-translate transform.</figcaption>
   
Something is not right. It may not look very strange for small rotation like this one but if we slow down the animation a little and make a rotation of more than <span class="math"><sup>π</sup>/<sub>2</sub></span> (90º) it will be obvious what is happening. The view moves from the start position to the end position in _a straight line_! It doesn't rotate around that point, it's just strange. 

<figure style="height: 320px"><div class="resetButton" onclick="resetAnimation(this)" style="-webkit-animation-delay: 5s;">◀◀</div>
<div style="-webkit-transform: translate(150px, 70px); height: 320px;">
<div class="viewBox marking">begin</div>
<div class="viewBox marking" style="-webkit-transform: translate(-2px, -2px) translateX(-200px) rotateZ(-135deg) translate(200px)">end</div>
<div class="halfcircle"> </div>
<div class="arrowhead"> </div>
<div class="viewBox apply135deg">view</div>	
</div></figure>	
<figcaption>Animating a bigger rotation to see what is wrong.</figcaption>

## Making it work

Lets take a step back and see how this can be solved. If you start thinking that it worked fine for small angles so let's just do a key frame for every angle. Please just stop and don't do that. 

Let's look at alternatives. There is a property on the view layer called the anchor point that can change which point the transform is being applied relative to[^idev]. If we can change the anchor point to the point we want to rotate around we won't have to deal with translating back and forth, we just rotate. There are some caveats though. Changing the anchor point changes how the frame is drawn relative the position which causes the view to move on screen. 

To counter the frame moving we can change the position of the layer to the point we are rotating around. That way the view/layer will appear in the same frame as before.

    CGPoint rotationPoint = // The point we are rotating around
    
    CGFloat minX   = CGRectGetMinX(view.frame);
    CGFloat minY   = CGRectGetMinY(view.frame);
    CGFloat width  = CGRectGetWidth(view.frame);
    CGFloat height = CGRectGetHeight(view.frame);
    
    CGPoint anchorPoint =  CGPointMake((rotationPoint.x-minX)/width,
                                       (rotationPoint.y-minY)/height);
    
    view.layer.anchorPoint = anchorPoint;
    view.layer.position = rotationPoint; 

If we are using Auto Layout it becomes a bit more complicated. The answers to [this question on Stack Overflow][SO-autolayout] show some of the many ways that it can be done. The rest of the code for this post will assume you are not using Auto Layout. If you are, I refer you to the those answers. 

Now that have changed the point we are transforming relative to, we don't have to translate back and forth so the animation code becomes very simple.

    CABasicAnimation *rotate = 
        [CABasicAnimation animationWithKeyPath:@"transform.rotation.z"];
    rotate.toValue = @(-M_PI_2); // The angle we are rotating to
    rotate.duration = 1.0;
    
    [view.layer addAnimation:rotate forKey:@"myRotationAnimation"];
    
And the view finally rotates around the point we were expecting it to.

<figure style="height: 345px"><div class="resetButton" onclick="resetAnimation(this)" style="-webkit-animation-delay: 5s;">◀◀</div>
<div style="-webkit-transform: translate(150px, 90px); height: 345px;">
<div class="viewBox marking">begin</div>
<div class="viewBox marking" style="-webkit-transform: translate(-2px, -2px) translateX(-200px) rotateZ(-135deg) translate(200px)">end</div>
<div class="halfcircle"> </div>
<div class="arrowhead"> </div>
<div class="viewBox apply135deg-anchor" style="-webkit-transform-origin-x: -145px">view</div>	
</div></figure>
<figcaption>Finally rotating around the point we wanted.</figcaption>

<script src="/script/script-translate-rotate-translate.js" type="text/javascript" onload="checkVisibility()"> </script>
<script>var body = document.getElementsByTagName("body")[0]; body.onscroll=checkVisibility(); body.onresize=checkVisibility();</script>

[^idev]: You can read more about the anchor point in [my article for iDeveloper.tv](http://blog.ideveloper.tv/understanding-the-anchor-point/)

[SO-autolayout]: http://stackoverflow.com/q/12943107/608157 "How do I adjust the anchor point of a CALayer, when Auto Layout is being used? (Stack Overflow)"
