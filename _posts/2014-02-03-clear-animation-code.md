---
layout: post
title: "Clear* Animation Code"
description: "This post is going to be a little bit different. Instead of showing some niche animation technique or giving detailed explanations of how it works, it's about how to write clear animation code. More precisely it's about what I think is clear, readable code and how I approach writing it. "
category: 
tags: [Core Animation]
---

<span style="font-weight: 900; text-align: right; height: 60px; display: block;">✱ = clear to me</span>

This post is going to be a little bit different. Instead of showing some niche animation technique or giving detailed explanations of how it works, it's about how to write clear animation code. More precisely it's about what *I* think is clear, readable code and how I approach writing it. 

I welcome anyone to follow any number of "guidelines" or "best practices"  (or whatever you want to call it) that I mention for any reason, <span style="font-weight: 700;">except for the fact that I said them</span>[^bold]. If the only reason that you do something is that *someone else* said so, then you are missing the point. There is never a rule without an exception and if you don't understand the reasoning that led to that rule then you may end up following it like a religion when it doesn't make any sense doing so. Information gets outdated, new API is introduced and what was the recommended way yesterday may not be the recommended way tomorrow.

Remember, the point is to write clear, concise and readable code. If it the code doesn't read clearly to you, then you should find something else that works better for you[^bestForYou].

[^bold]: Yes, that deserves the emphasis of being very bold (and the paragraph of text that follows it).

[^bestForYou]: Did I mention that these tips are what work for *me* and that you should evaluate them before jumping head first?

---------------

As software developers, complexity is probably the most difficult thing we have to deal with and the best way of doing so is to write good, readable code. That includes having a good architecture and other higher level best practices such as loosely coupled code, objects with a single responsibility, etc. but that is not what this is about. This is about the nitty gritty details of individual lines of code. It is about writing readable code that clearly conveys its purpose.

(These topics come in no order of importance)

# Don't use more advanced API without a reason

There is pretty much always more than one way of doing something in code. Higher level API is built on top of lower level API and offer the core functionality in an easier to use and probably more concise package. It's not that you can't do the same things with the lower level APIs, quite the opposite, but why should you if you don't have to? The same is true for animations. UIView animations is built on top of Core Animation and offer a more convenient API for animating view and sometimes even layer properties. Say for example that you are animating the position of a view. The two most reasonable alternatives are:

	[UIView animateWithDuration:0.5
	                 animations:^{
	                     myView.center = newPosition;
	                 }];

and	:
	
	CABasicAnimation *move =
	   [CABasicAnimation animationWithKeyPath:@"position"];
	move.duration = 0.5;
	move.fromValue = [NSValue valueWithCGPoint:myView.center];
	
	myView.center = newPosition;
	[myView.layer addAnimation:move forKey:@"move my view"];

When I look at code like this, I don't care much about the complexity of the API and I certainly don't care about the number of lines of code, that is a stupid measurement for almost all things. I care about the **expectations** that the code gives me when I read it and how well it meets them. I start to read the very first line of code and as soon as I've identified that this is an animation block, then I know more or less what the limits of the API are and I know that the rest of the animation code (which my eyes haven't gotten to yet) is going to change one or more view properties and animate them as a group. Similarly, when I read the first line and see that it's a basic animation of the position then I *expect* the rest of the code to do something more complex, maybe it's a relative animation, uses a custom timing function or something else, but I expect it to be a reason for not using a higher level API. 

The very same thing is applies to basic animations vs. keyframe animations. Even thought they are both CAAnimation subclasses I consider keyframe animations to be more advanced since they can do everything that basic animations can and more. I expect a basic animation to be used to animate a layer property from once value to another. If there was a need to animate between more than two values, then that would be a reason to use a keyframe animation instead. For example, animating the 3D rotation of a layer can be done with both a basic animation:

	CABasicAnimation *rotate = 
	  [CABasicAnimation animationWithKeyPath:@"transform.rotation.y"];
	rotate.fromValue = @0;
	rotate.toValue   = @(M_PI);
	rotate.duration  = 1.5;
	[myLayer addAnimation:rotate forKey:@"rotate around Y"];
	
and a keyframe animation:
	
	CAKeyframeAnimation *rotate = 
	  [CAKeyframeAnimation animationWithKeyPath:@"transform.rotation.y"];
	rotate.values   = @[@0, @(M_PI)];
	rotate.keyTimes = @[@0, @1];
	rotate.duration = 1.5;
	[myLayer addAnimation:rotate forKey:@"rotate around Y"];

Reading the first line of the basic animation I can see that it animates a layer key path that is part of [the Core Animation extensions][KVC-CA-extensions], which in itself is enough of a reason to not use UIView animations and I can tell that it's going to animate from one value to another because that is the limitations of a basic animation. However, the first line of the keyframe animation indicates that there will be a more than two values. Thus, what the code indicates or seems to be doing at first doesn't match what the code actually does. In other words, the code isn't as *clear* as it could have been. 

You might ask where does the new UIView keyframe animations fit into this and my only answer is that I don't know what to expect of it so I rarely use it. I'm *not* saying that you shouldn't use it, that it's buggy, or that it's banned[^banned] from my codebase. I'm just saying that when I see that code being used I don't know what to expect of it and I have to look at more closely to see what it's doing, therefore it doesn't convey information to me as effectively as its alternatives (at least not yet). 

This same principle works in the other direction as well. You can nest animation blocks to animate a property between more than two values, for example animating the background color form red to green to blue:

	[UIView animateWithDuration:0.3 animations:^{
	    myView.backgroundColor = [UIColor redColor];
	} completion:^(BOOL finished) {
	    [UIView animateWithDuration:0.3 animations:^{
	        myView.backgroundColor = [UIColor blueColor];
	    } completion:^(BOOL finished) {
	        [UIView animateWithDuration:0.3 animations:^{
	            myView.backgroundColor = [UIColor greenColor];
	        }];
	    }];
	}];

I care only a little bit about the fact that it's harder to tell how long the full animation is going to take since that information has been spread out between multiple lines of code. The real problem is that I need to look closely at each animation block to verify that it's only *one* property on *one* view that is changing. It could just as well have looked like this:

{% highlight objc %}
[UIView animateWithDuration:.3 animations:^{
    myView.backgroundColor = [UIColor redColor];
} completion:^(BOOL finished) {
    [UIView animateWithDuration:.3 animations:^{
        // another view is changing
        otherView.backgroundColor = [UIColor blueColor];
    } completion:^(BOOL finished) {
        [UIView animateWithDuration:.3 animations:^{
            // another property is changing
            myView.alpha = 0.0;
        }];
    }];
}];
{% endhighlight %}

On the other hand, the same animation as a keyframe does clearly show that it's only the "backgroundColor" property that changes and that it's only applies to "myView":

{% highlight objc %}
CAKeyframeAnimation *changeColor =
  [CAKeyframeAnimation animationWithKeyPath:@"backgroundColor"];
changeColor.values = @[(id)[UIColor redColor].CGColor,
                       (id)[UIColor greenColor].CGColor,
                       (id)[UIColor blueColor].CGColor];
changeColor.duration = 0.9;
// If it should keep the last value after the animation
myView.backgroundColor = [UIColor blueColor]; 

[myView.layer addAnimation:changeColor forKey:@""];
{% endhighlight %}

# Be as precise as you can

Core Animation adds [some nice Key-Value Coding additions][KVC-CA-extensions] that allow you to provide another useful piece of information; what you are *not* animating. When you specify that you are animating the "opacity" property, you are implicitly saying that you are not animating the "backgroundColor", the "cornerRadius", the "transform", the "position", etc. We usually don't stop to think about all the possible key paths that are not animating. Not, unless the key path is very precise. Consider a basic animation that moves a layer up or down. It's accurate to say that the "position" is changing but it's more informative to say that "position.y" is changing. When we see such a key path we know right away that the animation is constrained to moving up and down. As an added bonus it saves you from having to use the long-winded NSValue wrappers by allowing you to use NSNumber literals instead. 

You get even more benefits from this when animating transforms. A position only has two possibilities (changing x and y) but a transform can be used for many, many things. Specifying a key path like "transform.rotation.y", really narrows it down to the exact transform: a rotation around the y-axis.

Even though these key paths are meant for Core Animation, the same principle of being as precise as possible applies to UIView animations as well. If you are only changing the position, then why animate the full frame property?

# Use groups to avoid repeating yourself

Having the same piece of information in more than one place violates the general principe: don't repeat yourself (DRY). If you are animating two or more properties together, then you can use an animation group and put all the common configuration (like duration and timing functions) there so that it applies to all animations in that group. The individual animations can provide their own configurations if they don't want to use the groups default values:

{% highlight objc %}
CABasicAnimation *fade = 
  [CABasicAnimation animationWithKeyPath:@"opacity"];
fade.toValue = @0.0;
// the rest of the configuration comes from the group

CABasicAnimation *flip = 
  [CABasicAnimation animationWithKeyPath:@"transform.rotation.y"];
flip.toValue = @(M_PI_2);
// the rest of the configuration comes from the group

CAAnimationGroup *fadeAndFlip = [CAAnimationGroup animation];
fadeAndFlip.animations = @[fade, flip];
fadeAndFlip.duration = 1.0;
fadeAndFlip.timingFunction =
  [CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionEaseIn];

// Only because the view is disappearing (see next topic)
fadeAndFlip.fillMode = kCAFillModeForwards;
fadeAndFlip.removedOnCompletion = NO;
fadeAndFlip.delegate = self;

[myView.layer addAnimation:fadeAndFlip
                    forKey:@"fade out and flip over"];
{% endhighlight %}

# Create explicit animations as if they were purely decorative

I originally wanted to call this topic "avoid removedOnCompletion = NO" but then I remembered two things: everything has its place and usefulness, and [as much as I'm annoyed by this][petPeeve] I'm even more annoyed by people shouting "you should never use X". Still, I wanted to explain what I find problematic about it and what I think the real problem is.

"What do you mean avoid removedOnCompletion? You just used it in the last example!" 

Yes, I did, and it was one of those cases where I find it ok to do so. Let my try and give some background on this one.

When a property is animated using Core Animation, the model value (the actual property or variable) doesn't change. Anyone who has tried to log values during an ongoing animation will have seen an effect of this. Instead the animations uses the model values to create a what is called "presentation" values (what you see on screen). This is first mentioned in the section "[Core Animation Basics][basics]" in the Core Animation Programming Guide[^longProgrammingGuides]:

> The data and state information of a layer object is decoupled from the visual presentation of that layer’s content onscreen. 

and is more or less what the section "Layer Trees Reflect Different Aspects of the Animation State" is about:

> Objects in the **presentation tree** contain the in-flight values for any running animations.

In short, during an animation the model values does not match what's on screen.

When an animation completes, it is automatically removed from the layer, making the layer appear on screen with the model value again. If the model value didn't change to be the same as the final value of the animation, then the layer is going to look like it jumps back to an old value. A too common[^stopSpreading] technique for the layer to appear in the right place after the animation has completed is to not remove it upon completion by setting the `removedOnCompletion` property to `NO` and the `fillMode` to `kCAFillModeForwards`. The problem with doing this is that the data that was only temporarily out of sync (between model and screen) is no longer just temporary.

When Apple introduced Core Animation in 2007, they used this (in [session 211][WWDC07S211]) to animate layer removal (such as fading out, moving off-screen, scaling down to nothing, etc.):

<blockquote>
<ul style="list-style-type: disc;">
<li>To animate layer removal, use animations with</br > <code>fillMode = forwards</code>, <code>removedOnCompletion = NO</code>
<ul style="list-style-type: disc;"><li>Animation delegate can remove the layer</li></ul>
</li>
</ul>
</blockquote>

"But look, even Apple is doing it!" 

The reason why it's not a problem to keep an animation that is for example fading out a layer, is that the layer itself isn't going to stick around. The animation delegate is going to remove it from the layer hierarchy all together and this is just a more convenient way to prevent an accidental frame where the layer would be fully visible before being removed.

In cases where the layer remains in the layer hierarchy, not removing the animation can have some severe side effect, like for example [not being able to tap on a button][1]. The reason is that there is no button where the user tapped, it is really positioned somewhere else. It just looks like it's there.

I've been thinking about this, trying to come up with the root cause of these problems, and I think it has to do with treating the animation *as* the change itself, which as I just explained, is not how Core Animation works. I've [previously][slides] given this recommendation to these problems:

> If the animation mysteriously went away, the model value should be the expected end state.

If all the animations in an app was removed then it should still work, buttons shouldn't accidentally be off screen. I've also come to phrase the same concept like this:

> The best animation code is written as if the animation was just decoration, if a value should change then a value should change.

Here are two examples of this thinking applied:

1. A view that slides down from off screen to the center of the screen have done a sort of transition. The view has a conceptually new position after the animation and thus, the position (or center) property should reflect this. The actual "sliding" should be designed after that fact. 

2. A badge that jumps up to get your attention will fall down again and end up in the same place as before. It doesn't have to change the value because nothing actually changes, it's only "decoration". 

Separating the animation from the change in model data like this matches my understanding of how Core Animation works and how it was meant to be used.


[^longProgrammingGuides]: At close to a hundred pages long, these guides can seem like a chore to get through, but they contain some good information if you are interested in the technologies.

[^banned]: You all know what I'm talking about.

[^stopSpreading]: I'm [trying][so-edit] to at least stop if from spreading further.
 
[basic-no-from-to]: http://stackoverflow.com/a/21318589/608157 (Moving a CALayer with position, not to and from values?)

[KVC-CA-extensions]: https://developer.apple.com/library/ios/Documentation/Cocoa/Conceptual/CoreAnimation_guide/Key-ValueCodingExtensions/Key-ValueCodingExtensions.html#//apple_ref/doc/uid/TP40004514-CH12-SW2 (Core Animation: Key-Value Coding Extensions)

[WWDC07S211]: http://adcdownload.apple.com//wwdc_2004/adc_on_itunes__wwdc07_sessions__leopard_innovations__pdfs/211.pdf (WWDC 2007 - Session 211: Adding Core Animation to your Application)

 [basics]: https://developer.apple.com/library/ios/documentation/cocoa/conceptual/coreanimation_guide/CoreAnimationBasics/CoreAnimationBasics.html (Core Animation Basics)
 
 [1]: http://stackoverflow.com/q/21159500/608157 (A question that I answered about broken hit testing.)

 [so-edit]: http://stackoverflow.com/posts/8021051/revisions (An edit on on of my most popular questions to try and stop removedOnCompletion=NO from spreading further.)
 
 [petPeeve]: http://explosm.net/comics/2676/ (Cyanide & Happiness #2676 - Pet peeve)
 
 [slides]: https://github.com/d-ronnqvist/CoreAnimation-Tricks-slides (Slides form my last talk about Core Animation as Cocoa Heads in Stockholm)