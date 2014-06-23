---
layout: post
title: "Multiple Animations"
description: "Just before WWDC I answered an interesting question on Stack Overflow asking where to update the model value when following Core Animation best practices. It may sound like a simple question but it touches on deep topics like implicit vs. explicit animations, stand-alone vs. backing layers, and multiple animations. I'm not going to reiterate the whole question and answer here, but I'm going to start with the same question."
category: 
tags: [Core Animation] 
---

Just before WWDC I answered [an interesting question][question] on Stack Overflow asking _where_ to update the model value when following Core Animation best practices. It may sound like a simple question but it touches on deep topics like implicit vs. explicit animations, stand-alone vs. backing layers, and multiple animations. I'm not going to reiterate the _whole_ question and answer here, but I'm going to start with the same question. The original question and answer still contain useful information, so if you are interested I can recommend it as a complement to this post. 

---

Let's start with some quick background to get everyone on the same page. Not removing an animation after it finishes is considered bad practice. I've written about it [in the context of clear code][clearCode] and [a follow-up gist][gist] explaining why I don't think there is any reason to do it. There are plenty of people in the community that also talk about it, so I hope that we can all accept that it _is_ a bad practice and start doing it "the other way".

The "other" way is to update the model value by setting the property being animated to its final value. This means that once the animation finishes and is removed, the model both is and appears to be in the correct state. The question then is: where _exactly_ is it best practice to update the value when adding an animation? Before creating the animation? Before adding the animation to the layer? Or after adding the animation to the object?

{% highlight objc %}
// 1. Before configuring the animation?
var myAnimation = CABasicAnimation(keyPath: "position.x")
myAnimation.toValue  = 250
myAnimation.duration = 1.0

// 2. Before adding the animation?
view.layer.addAnimation(myAnimation, forKey: "move to the right")
// 3. After adding the animation?
{% endhighlight %}

The only meaningful distinction to Core Animation is whether the model is updated before or after adding the explicit animation, so from that perspective, the first and second case can be treated as one case: the "before" case. Exactly where before adding the animation that the model is updated only affects how the animation values are configured. If the model is updated before configuring the animation, the old state might need to be saved first, so that the animation can be configured to animate from the old state to the new state. Since there is no real technical difference between the two cases (1 and 2), we should only optimize for clarity. I usually find that code that configures the animation before updating the model is easier to follow but there are cases where the opposite is true. In the end it comes down to personal preference.

That leaves us with only two cases to compare: before adding the animation and after adding the animation. This is when things start to get interesting. Depending on if we are animating a stand-alone layer or a backing layer (a layer that is attached to a view), we will see some differences between the before and after cases. This has to do with the way that layers implicitly animate property changes and the way that views disable this default layer behavior. Before explaining the difference between the two, let's look at what an implicit animation is and what the default layer behavior is. 

When a layer property changes, the layers looks for an appropriate "action" to run for that change. An action is an object that conforms to the `CAAction` protocol. In practice, it's going to be a subclass of `CAAnimation`. The steps that the layer takes to look for the action is described in detail in the documentation for the `actionForKey:` method on CALayer. 

The layer starts by asking its delegate which can return with one out of three things:

 1. An action to run
 2. `nil` to keep looking  
 3. `NSNull` to stop looking

Next, the layer looks for the property as the key in its `actions` dictionary. It can end up in one out of three cases:

 1. An action to run is found for that key.
 2. That key doesn't exist, telling the layer to keep looking.
 3. `NSNull` is found for that key, telling the layer to stop looking.

After that the layer looks for an `actions` dictionary in the `style` dictionary (something that I've never used myself or seen any other developer use). It then checks if there are any specific actions for that class by calling `defaultActionForKey:`. If no action if found the layer uses the implicit action that is defined by Core Animation.

In the normal case, we end up with the implicit animation. This animation object is then added to layer, using the `addAnimation:forKey:` method, just like we would add an animation object ourselves. This all happens automatically, just by changing a property. Hence the name: _implicit_ animation. 

The important part to take away is that when a property of a stand-alone layer changes, an animation object is added to the layer automatically. 

For layers that are attached to views, things work differently. Every view on iOS has a backing layer and the view is always the layers delegate. This means that when the property changes, the view has first say for whether an animation should run or not. As we all know, views don't implicitly animate. This is because the view returns `NSNull` when asked to provide an action (except when inside of an animation block). You can read more about this interaction between the view and its backing layer in [my objc.io article][myObjc.ioArticle]. 

Getting back to updating the model and adding an explicit animation. In the case of the backing layer, the property change doesn't cause an animation so it doesn't matter if the layer is updated before or after adding the explicit animation. There is only going to be one animation anyway.

For the stand alone layer however, the property change causes and implicit animation to be added _and_ we are adding an explicit animation so the layer ends up with _two_ animations at the same time! This leads us to the next very interesting and deep topic: multiple animations.

# Multiple animations

It's no surprise that different properties can be animated at the same time but multiple animations for the _same_ property‽ Surely one must cancel out the other. Well, that is actually not the case. An animation is only canceled if another animation is added _for the same key_. So both animations are added to the layer, in order, and run until they are finished. It's easy to verify by becoming the delegate of both the implicit and explicit animation and logging the "flag" in the `animationDidStop:finished:` callback. Another, more visual way to see that both animations are running is to see how the animation looks in the two cases. If the model is updated first, then only the explicit animation can be seen. However, if the model is updated last so that the implicit animation added last, then the implicit animation can be seen running until completion and then the layer continues with the explicit animation as if it was running all along. 

<figure><div class="box-background"><img src="/images/before-vs-after.gif" alt="The two different animations when updating the model before and after adding the explicit animation."></div>
</figure>
<figcaption>The two different animations when updating the model before and after adding the explicit animation.</figcaption>

There are two things to note in the above figure:

1. When the implicit animation completes, the layer doesn't skip back to the beginning of the explicit animation.
2.  In both cases the explicit animation end after the same amount of time.

To better understand what is happening it is best to look at how the animation is rendered. 

_Disclaimer: I don't work at Apple and I haven't seen the source code for Core Animation. What I'm about to explained is based on information available in documentation, WWDC videos, or information based on observations and experimentation._

The animation object is created and configured by our application but the application process is not doing the actual rendering. Instead the animation is encoded together with a copy of the layer hierarchy and send over inter-process communication to the render server (which is part of the [BackBoard][BackBoard] daemon). With both a copy of the layer tree (called the "render tree") and the animations, the render server can perform each frame of the animation without having to communicate back and forth with our application process all the time.

For each frame the render server calculates the intermediate values for the animated properties for the specific time of that frame and applies them to the layers in the render tree. 

If there are multiple animations going on at the same time, they are all sent to the render server and all of their changes are applied to the render tree for each frame being rendered. If there are two (or more) animations for the same property, the first will apply its intermediate value and the next will apply its intermediate value on top of that, overwriting the first value. Even animations that are completed _but not removed_ apply their changes to the layers in the render tree, leading to [some unnecessary overhead][overhead].

Knowing this, our two cases with the order of the implicit and explicit animations can be explained and visualized as follows. 

In both cases the model value is changed to its new value at the start of the animation. It doesn't matter if it happens before or after the explicit animation, the model value is updated in the copy of the layer tree that gets sent to the render server. 

For the case where the model is updated first, the implicit animation is added to the layer first and the explicit animation is added after that. Since the implicit animation is much shorter than the explicit animation, the intermediate values ii applies to the render tree is always overwritten by the intermediate values of the explicit animation. After a short while, the implicit animation finishes and is removed and the explicit animation runs alone until it finishes, applying its intermediate values directly over the model values. When the explicit animation finishes, it gets removed and we are left seeing the model values (which matches the end value of the explicit animation). The result looks like a smooth animation from the old value to the new value and the implicit animation is never seen.

_Note: there may be implementation details and optimizations that detect that the property is being overwritten by another animation and does something smart about it, but this is how we can think of the work being done by the render server._

<figure>
<div role="img" aria-label="A breakdown of how the render server applies the implicit and explicit animations when the model is updated first." style="margin-bottom: 55%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 835 380" width="100%">
    <defs>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-1">
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#F4F4F7" offset="8.39736632%"></stop>
            <stop stop-color="#F4F4F7" offset="91.3127%"></stop>
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-2">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-3">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <g id="Group" sketch:type="MSLayerGroup" transform="translate(-144.000000, -56.000000)">
            <rect id="Rectangle-1" fill="#FFBA00" sketch:type="MSShapeGroup" x="459" y="206" width="412" height="70" rx="3"></rect>
            <rect id="Rectangle-4" fill="#FFBA00" sketch:type="MSShapeGroup" x="459" y="286" width="112" height="70" rx="3"></rect>
            <rect id="Rectangle-2" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="351" y="366" width="628" height="70"></rect>
            <rect id="Rectangle-6" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="351" y="56" width="628" height="70"></rect>
            <text id="model-value" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="142.05864" y="409">model value</tspan>
            </text>
            <text id="implicit-" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="221.604476" y="333.824097">implicit </tspan>
            </text>
            <text id="explicit" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="224.876" y="253.824097">explicit</tspan>
            </text>
            <text id="composite" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="169.76" y="101">composite</tspan>
            </text>
            <g id="Rectangle-8-+-Path-1-+-Rectangle-7" transform="translate(353.000000, 374.000000)" sketch:type="MSShapeGroup">
                <rect id="Rectangle-8" fill="url(#linearGradient-2)" x="605" y="0" width="21" height="3"></rect>
                <path d="M21,52.5 L113.5,52.5000017 L113.5,1.5 L605,1.5" id="Path-1" stroke="#2F3842" stroke-width="3" stroke-linejoin="round"></path>
                <rect id="Rectangle-7" fill="url(#linearGradient-3)" x="0" y="51" width="21" height="3"></rect>
            </g>
            <path d="M466.5,266.5 L863.5,215.5" id="Path-3" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
            <path d="M466.5,346.5 L563.5,295.5" id="Path-4" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
            <g id="Rectangle-8-+-Path-1-+-Rectangle-8" transform="translate(353.000000, 64.000000)" sketch:type="MSShapeGroup">
                <rect id="Rectangle-8" fill="url(#linearGradient-2)" x="605" y="0" width="21" height="3"></rect>
                <path d="M113.5,52.5000017 L113.5,1.5 L510.369141,1.5" id="Path-1" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15"></path>
                <rect id="Rectangle-7" fill="url(#linearGradient-3)" x="0" y="51" width="21" height="3"></rect>
            </g>
            <path d="M466.5,116.5 L563.5,65.5" id="Path-10" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15" sketch:type="MSShapeGroup"></path>
            <path d="M374,116.5 L466.5,116.500002 L863.5,65.5 L958,65.5" id="Path-8" stroke="#2F3842" stroke-width="3" stroke-linejoin="round" sketch:type="MSShapeGroup"></path>
        </g>
    </g>
</svg></div></div></figure>
<figcaption>A breakdown of how the render server applies the implicit and explicit animations when the model is updated first</figcaption>

For the case where the model is updated last, the implicit animation is added after the explicit animation. This means that in the beginning of the animation, the explicit animation sets its intermediate values and the implicit animation overwrites it with its own intermediate values. When the implicit animation finishes and is removed, the explicit animation is still just in the beginning, so for the next frame the property will be perceived as returning to an earlier value but it is actually showing the correct value for the explicit animation for that time. Just as before, when it's only the explicit animation left, it runs until completion at which point we are left seeing the model values. This animation doesn't look right at all. 

<figure>
<div role="img" aria-label="A breakdown of how the render server applies the implicit and explicit animations when the model is updated last." style="margin-bottom: 55%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 835 380" width="100%">
    <defs>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-1">
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#F4F4F7" offset="8.39736632%"></stop>
            <stop stop-color="#F4F4F7" offset="91.3127%"></stop>
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-2">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-3">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <g id="Group" sketch:type="MSLayerGroup" transform="translate(-144.000000, -56.000000)">
            <rect id="Rectangle-1" fill="#FFBA00" sketch:type="MSShapeGroup" x="459" y="286" width="412" height="70" rx="3"></rect>
            <rect id="Rectangle-4" fill="#FFBA00" sketch:type="MSShapeGroup" x="459" y="206" width="112" height="70" rx="3"></rect>
            <rect id="Rectangle-2" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="351" y="366" width="628" height="70"></rect>
            <rect id="Rectangle-6" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="351" y="56" width="628" height="70"></rect>
            <text id="model-value" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="142.05864" y="409">model value</tspan>
            </text>
            <text id="explicit-" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="224.196476" y="333.824097">explicit </tspan>
            </text>
            <text id="implicit" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="222.284" y="253.824097">implicit</tspan>
            </text>
            <text id="composite" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="169.76" y="101">composite</tspan>
            </text>
            <g id="Rectangle-8-+-Path-1-+-Rectangle-7" transform="translate(353.000000, 374.000000)" sketch:type="MSShapeGroup">
                <rect id="Rectangle-8" fill="url(#linearGradient-2)" x="605" y="0" width="21" height="3"></rect>
                <path d="M21,52.5 L113.5,52.5000017 L113.5,1.5 L605,1.5" id="Path-1" stroke="#2F3842" stroke-width="3" stroke-linejoin="round"></path>
                <rect id="Rectangle-7" fill="url(#linearGradient-3)" x="0" y="51" width="21" height="3"></rect>
            </g>
            <path d="M466.5,346.5 L863.5,295.5" id="Path-3" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
            <path d="M466.5,266.5 L563.5,215.5" id="Path-4" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
            <g id="Rectangle-8-+-Path-1-+-Rectangle-8" transform="translate(353.000000, 64.000000)" sketch:type="MSShapeGroup">
                <rect id="Rectangle-8" fill="url(#linearGradient-2)" x="605" y="0" width="21" height="3"></rect>
                <path d="M113.5,52.5000017 L113.5,1.5 L510.369141,1.5" id="Path-1" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15"></path>
                <rect id="Rectangle-7" fill="url(#linearGradient-3)" x="0" y="51" width="21" height="3"></rect>
            </g>
            <path d="M466.5,116.5 L564.688028,103.886425" id="Path-6" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15" sketch:type="MSShapeGroup"></path>
            <path d="M374,116.5 L466.5,116.500002 L564.5,65.5 L564.5,103.5 L863.5,65.5 L958,65.5" id="Path-8" stroke="#2F3842" stroke-width="3" stroke-linejoin="round" sketch:type="MSShapeGroup"></path>
        </g>
    </g>
</svg></div></div></figure>
<figcaption>A breakdown of how the render server applies the implicit and explicit animations when the model is updated last</figcaption>

So, which of the two is it best practice to update the model value?

It's actually a trick question because the answer it both neither place and either place. The best practice is actually to do the same thing as UIView is doing and disable the implicit animation. If we do that, then it doesn't matter it we update the model before or after. It's just personal preference. That said: I still like to update the model first:

	var myAnimation = CABasicAnimation(keyPath: "position.x")
	myAnimation.toValue  = newValue
	myAnimation.duration = 1.0
	
	CATransaction.begin()
	CATransaction.setDisableActions(true)
	view.layer.position.x = newValue
	CATransaction.commit()

	view.layer.addAnimation(myAnimation, forKey: "move along X")

#### Update:

As pointed out [on twitter][cancelImplicit], another way to achieve the correct behavior is to update the model first and use the key path as the key when adding the explicit animation. This works because the implicit animations already uses the key paths when added to the layer, meaning that the explicit animation cancel out the implicit animation. While this behavior has been consistent for years, I can't recall having seen it being documented anywhere. 

I still prefer to use a transaction because I think that it's clearer what it does. The task is to disable the implicit animation and the transaction does that directly by disabling the actions. To me, that is pretty much self documenting code. 

# Additive animations

It can seem odd to allow multiple animations for the same key path when it results in either strange animations or calculated values that are never seen, but it is actually what enables one of the more flexible and powerful features of CAAnimations: "additive" animations. Instead of overwriting the value in the render tree, an additive animation _adds_ to the value. It wouldn't make sense to configure this one animation to be additive and change the model value at the same time. The model would update to its new value right away and the additive animation would add to that:

<figure>
<div role="img" aria-label="An illustration of what would happen if the explicit animation from before was made additive" style="margin-bottom: 50%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 835 343" width="100%">
    <defs>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-1">
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#F4F4F7" offset="8.39736632%"></stop>
            <stop stop-color="#F4F4F7" offset="91.3127%"></stop>
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-2">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-3">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <rect id="Rectangle-5" fill="#26A3E6" sketch:type="MSShapeGroup" x="315" y="193" width="412" height="70" rx="3"></rect>
        <rect id="Rectangle-11" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="207" y="273" width="628" height="70"></rect>
        <rect id="Rectangle-12" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="207" y="43" width="628" height="70"></rect>
        <text id="model-value-2" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="-1.94135974" y="316">model value</tspan>
        </text>
        <text id="additive" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="65.504" y="240.824097">additive</tspan>
        </text>
        <text id="composite-2" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="25.76" y="88">composite</tspan>
        </text>
        <g id="Rectangle-8-+-Path-1-+-Rectangle-9" sketch:type="MSLayerGroup" transform="translate(209.000000, 281.000000)">
            <rect id="Rectangle-8" fill="url(#linearGradient-2)" sketch:type="MSShapeGroup" x="605" y="0" width="21" height="3"></rect>
            <path d="M21,52.5 L113.5,52.5000017 L113.5,1.5 L605,1.5" id="Path-1" stroke="#2F3842" stroke-width="3" stroke-linejoin="round" sketch:type="MSShapeGroup"></path>
            <rect id="Rectangle-7" fill="url(#linearGradient-3)" sketch:type="MSShapeGroup" x="0" y="51" width="21" height="3"></rect>
        </g>
        <path d="M322.5,253.5 L719.5,202.5" id="Path-5" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
        <rect id="Rectangle-8" fill="url(#linearGradient-2)" sketch:type="MSShapeGroup" x="814" y="51" width="21" height="3"></rect>
        <path d="M322.5,52.5 L719.369141,52.5" id="Path-1" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15" sketch:type="MSShapeGroup"></path>
        <rect id="Rectangle-7" fill="url(#linearGradient-3)" sketch:type="MSShapeGroup" x="209" y="102" width="21" height="3"></rect>
        <path d="M230,103.5 L322.5,103.500002 L322.5,52.5 L719.5,1.5 L719.5,52.5 L814,52.5" id="Path-13" stroke="#2F3842" stroke-width="3" stroke-linejoin="round" sketch:type="MSShapeGroup"></path>
    </g>
</svg></div></div></figure>
<figcaption>An illustration of what would happen if the explicit animation from before was made additive</figcaption>

Instead we would use a regular animation to perform the transition between the old and new values and then use additive animations to make changes to the animation as it is happening. This can be used to create very dynamic animations and even add to an ongoing animation. For example, to make a small deviation from the straight path between two points:

<figure>
<div role="img" aria-label="An illustration of how an additive animation adds to another animation." style="margin-bottom: 55%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 835 380" width="100%">
    <defs>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-1">
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#F4F4F7" offset="8.39736632%"></stop>
            <stop stop-color="#F4F4F7" offset="91.3127%"></stop>
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-2">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-3">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <rect id="Rectangle-13" fill="#26A3E6" sketch:type="MSShapeGroup" x="315" y="150" width="412" height="70" rx="3"></rect>
        <rect id="Rectangle-14" fill="#FFBA00" sketch:type="MSShapeGroup" x="315" y="230" width="412" height="70" rx="3"></rect>
        <rect id="Rectangle-15" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="207" y="310" width="628" height="70"></rect>
        <rect id="Rectangle-16" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="207" y="0" width="628" height="70"></rect>
        <text id="model-value-3" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="-1.78901599" y="353">model value</tspan>
        </text>
        <text id="regular-" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="80.926984" y="278">regular </tspan>
        </text>
        <text id="additive" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="65.050984" y="198">additive</tspan>
        </text>
        <text id="composite-3" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="25.306984" y="45">composite</tspan>
        </text>
        <g id="Rectangle-8-+-Path-1-+-Rectangle-11" sketch:type="MSLayerGroup" transform="translate(209.000000, 318.000000)">
            <rect id="Rectangle-8" fill="url(#linearGradient-2)" sketch:type="MSShapeGroup" x="605" y="0" width="21" height="3"></rect>
            <path d="M21,52.5 L113.5,52.5000017 L113.5,1.5 L605,1.5" id="Path-1" stroke="#2F3842" stroke-width="3" stroke-linejoin="round" sketch:type="MSShapeGroup"></path>
            <rect id="Rectangle-7" fill="url(#linearGradient-3)" sketch:type="MSShapeGroup" x="0" y="51" width="21" height="3"></rect>
        </g>
        <path d="M322.5,210.5 L421.216797,210.5 C454.35612,210.5 487.860677,180.5 521,180.5 C554.502604,180.5 587.639974,210.5 621.142578,210.5 L719.5,210.5" id="Path-14" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
        <path d="M322.5,290.5 L719.5,239.5" id="Path-15" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
        <g id="Rectangle-8-+-Path-1-+-Rectangle-12" sketch:type="MSLayerGroup" transform="translate(209.000000, 8.000000)">
            <rect id="Rectangle-8" fill="url(#linearGradient-2)" sketch:type="MSShapeGroup" x="605" y="0" width="21" height="3"></rect>
            <path d="M113.5,52.5000017 L113.5,1.5 L510.369141,1.5" id="Path-1" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15" sketch:type="MSShapeGroup"></path>
            <rect id="Rectangle-7" fill="url(#linearGradient-3)" sketch:type="MSShapeGroup" x="0" y="51" width="21" height="3"></rect>
        </g>
        <path d="M425.5,47 L615,22.5" id="Path-16" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15" sketch:type="MSShapeGroup"></path>
        <path d="M230,60.5 L322.5,60.5000017 C322.5,60.5000017 388.250512,52.0534621 421.125767,47.8301924 C448.868701,44.2662386 484.350276,9.708152 521.094619,4.98784577 C555.173973,0.609893324 590.339567,26.0923988 621.424847,22.0990755 C676.978363,14.9624774 719.5,9.5 719.5,9.5 L814,9.5" id="Path-17" stroke="#2F3842" stroke-width="3" stroke-linejoin="round" sketch:type="MSShapeGroup"></path>
    </g>
</svg></div></div></figure>
<figcaption>An illustration of how an additive animation adds to another animation</figcaption>

	let deviate = CABasicAnimation(keyPath: "position.y")
	deviate.additive  = true
	deviate.toValue   = 10
	deviate.fromValue = 0
	deviate.duration  = 0.25
	deviate.autoreverses   = true
	deviate.timingFunction = CAMediaTimingFunction(name: "easeInEaseOut")
	deviate.beginTime      = CACurrentMediaTime() + 0.25

This little trick can be used to acknowledge a users touch during an ongoing animation since it can be added to the running animation at any point.

Multiple additive animations can also be used together to create really complex animations that would be very difficult to with just a single animation: 

<figure>
<div role="img" aria-label="A complex animation created using multiple additive animations." style="margin-bottom: 65%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 835 466" width="100%">
    <defs>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-1">
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#F4F4F7" offset="8.39736632%"></stop>
            <stop stop-color="#F4F4F7" offset="91.3127%"></stop>
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-2">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-3">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <rect id="Rectangle-17" fill="#26A3E6" sketch:type="MSShapeGroup" x="315" y="236" width="412" height="70" rx="3"></rect>
        <rect id="Rectangle-18" fill="#FFBA00" sketch:type="MSShapeGroup" x="315" y="316" width="412" height="70" rx="3"></rect>
        <rect id="Rectangle-19" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="207" y="396" width="628" height="70"></rect>
        <rect id="Rectangle-20" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="207" y="6" width="628" height="70"></rect>
        <text id="model-value-4" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="-1.78901599" y="439">model value</tspan>
        </text>
        <text id="regular--2" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="80.926984" y="364">regular </tspan>
        </text>
        <text id="additive-2" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="65.050984" y="284">additive</tspan>
        </text>
        <text id="additive-3" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="65.050984" y="284">additive</tspan>
        </text>
        <text id="composite-4" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="25.306984" y="51">composite</tspan>
        </text>
        <g id="Rectangle-8-+-Path-1-+-Rectangle-13" sketch:type="MSLayerGroup" transform="translate(209.000000, 404.000000)">
            <rect id="Rectangle-8" fill="url(#linearGradient-2)" sketch:type="MSShapeGroup" x="605" y="0" width="21" height="3"></rect>
            <path d="M21,52.5 L113.5,52.5000017 L113.5,1.5 L605,1.5" id="Path-1" stroke="#2F3842" stroke-width="3" stroke-linejoin="round" sketch:type="MSShapeGroup"></path>
            <rect id="Rectangle-7" fill="url(#linearGradient-3)" sketch:type="MSShapeGroup" x="0" y="51" width="21" height="3"></rect>
        </g>
        <path d="M322.5,296.5 L421.216797,296.5 C454.35612,296.5 487.860677,266.5 521,266.5 C554.502604,266.5 587.639974,296.5 621.142578,296.5 L719.5,296.5" id="Path-19" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
        <rect id="Rectangle-21" fill="#26A3E6" sketch:type="MSShapeGroup" x="315" y="156" width="412" height="70" rx="3"></rect>
        <text id="additive-4" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
            <tspan x="65.050984" y="204">additive</tspan>
        </text>
        <path d="M322.5,216.5 C322.5,216.5 334.766927,206.5 340.900391,206.5 C347.488281,206.5 354.076172,216.5 360.664062,216.5 C367.458659,216.5 374.253255,206.5 381.047852,206.5 C387.575521,206.5 394.10319,216.5 400.630859,216.5 C407.33431,216.5 414.03776,206.5 420.741211,206.5 C427.442383,206.5 434.143555,216.5 440.844727,216.5 C447.720703,216.5 454.59668,206.5 461.472656,206.5 C467.830729,206.5 474.188802,216.5 480.546875,216.5 C487.361003,216.5 494.17513,206.5 500.989258,206.5 C507.670247,206.5 514.351237,216.5 521.032227,216.5 C527.558919,216.5 534.085612,206.5 540.612305,206.5 C547.309245,206.5 554.006185,216.5 560.703125,216.5 C567.405599,216.5 574.108073,206.5 580.810547,206.5 C587.397135,206.5 593.983724,216.5 600.570312,216.5 C607.289388,216.5 614.008464,206.5 620.727539,206.5 C627.520182,206.5 634.312826,216.5 641.105469,216.5 C647.652995,216.5 654.200521,206.5 660.748047,206.5 C667.220378,206.5 673.692708,216.5 680.165039,216.5 C687.17513,216.5 694.185221,206.5 701.195312,206.5 C707.296875,206.5 719.5,216.5 719.5,216.5" id="Path-23" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
        <path d="M322.5,376.5 L719.5,325.5" id="Path-20" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
        <g id="Rectangle-8-+-Path-1-+-Rectangle-14" sketch:type="MSLayerGroup" transform="translate(209.000000, 14.000000)">
            <rect id="Rectangle-8" fill="url(#linearGradient-2)" sketch:type="MSShapeGroup" x="605" y="0" width="21" height="3"></rect>
            <path d="M113.5,52.5000017 L113.5,1.5 L510.369141,1.5" id="Path-1" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15" sketch:type="MSShapeGroup"></path>
            <rect id="Rectangle-7" fill="url(#linearGradient-3)" sketch:type="MSShapeGroup" x="0" y="51" width="21" height="3"></rect>
        </g>
        <path d="M323,66.5 L716.5,16" id="Path-21" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15" sketch:type="MSShapeGroup"></path>
        <path d="M422.125767,53.8301924 C449.868701,50.2662386 485.350276,15.708152 522.094619,10.9878458 C556.173973,6.60989332 591.339567,32.0923988 622.424847,28.0990755" id="Path-24" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15" sketch:type="MSShapeGroup"></path>
        <path d="M230,66.5 L322.5,66.5000017 C322.5,66.5000017 330.0487,55.5302694 341.435118,54.0675305 C347.485361,53.2902953 354.619141,62.373865 362.279729,61.3897592 C368.260435,60.6214569 374.562235,49.8119058 380.920208,48.9951385 C387.809497,48.1101165 394.764739,57.2166218 401.448893,56.3579521 C408.184899,55.4926214 414.645593,44.6626581 420.48603,43.9123752 C423.09746,43.5769019 436.844703,49.9780213 441.576024,47.9820376 C447.968916,45.2850933 454.671561,32.5345085 461.618779,28.4233144 C468.031965,24.6281475 474.653569,30.5256805 481.432317,26.6610956 C487.83292,23.0120924 494.373623,9.57517157 501.011264,6.80927305 C507.917811,3.93132155 514.929309,11.779863 521.997133,10.8719057 C528.439408,10.0443086 534.928481,0.45159812 541.427528,1.59375773 C547.823067,2.71772672 554.228266,14.5533444 560.608034,16.6241062 C567.467296,18.8505038 574.29716,11.3487201 581.054012,13.5265329 C588.000022,15.7653131 594.868875,26.6654995 601.613192,27.5837268 C606.494141,28.2482597 619.561189,18.3384874 621.320585,18.1124694 C627.115852,17.3679892 633.937356,26.4916751 641.239913,25.5535632 C647.527434,24.7458463 654.171573,13.8923171 660.824346,13.0376787 C667.888202,12.1302312 674.961792,21.2215332 681.628561,20.3650968 C688.826065,19.4404804 695.549395,8.57677804 701.274381,7.84132649 C712.207781,6.43678379 719.5,15.5 719.5,15.5 L814,15.5" id="Path-26" stroke="#2F3842" stroke-width="3" stroke-linejoin="round" sketch:type="MSShapeGroup"></path>
    </g>
</svg></div></div></figure>
<figcaption>A complex animation created using multiple additive animations</figcaption>

For example, two keyframe animations with different paths can be combined to create an animation where one path loops around the other path, in this case a circle that loops around a heart:

<figure style="max-width: 300px;"><div class="box-background"><img src="/images/heartLoop.gif" alt="A repeating animation of one path (a circle) looping while following another path (a heart)"></div>
</figure>
<figcaption>A repeating animation of one path (a circle) looping while following another path (a heart)</figcaption>

There really isn't much code to such a complex animation but you can imagine how hard it would be to generate a single path for the same type of animation.

	let followHeartShape = CAKeyframeAnimation(keyPath: "position")
	followHeartShape.additive = true
	followHeartShape.path     = heartPath
	followHeartShape.duration = 5
	followHeartShape.repeatCount     = HUGE
	followHeartShape.calculationMode = "paced"
	
	let circleAround = CAKeyframeAnimation(keyPath: "position")
	circleAround.additive = true
	circleAround.path     = circlePath
	circleAround.duration = 0.275
	circleAround.repeatCount     = HUGE
	circleAround.calculationMode = "paced"
	
	layer.addAnimation(followHeartShape, forKey: "follow a heart shape")
	layer.addAnimation(circleAround,     forKey: "loop around")

---

Additive animations isn't used all that often but can be a great tool both for rich interaction and complex animations. The new playgrounds in Xcode 6 is a great way of experimenting with additive animations. Until XCPlayground becomes available for iOS, you can create an OS X playground and use `XCPShowView()` to display a live preview of the animating view. Note that views behave differently on iOS and OS X, but stand alone layers work the same.

If you want to use the playground with heart and circle animations as a starting point, it can be downloaded from [here][playground].

---

Just because I couldn't resists doing so, this is a visualization of what happens when an animation isn't removed upon completion. That is _one_ reason to avoid `removedOnCompletion` in the common case but the main reason is still that it the model value no longer reflects what't on screen, something that can lead to many strange bugs:

<figure>
<div role="img" aria-label="An illustration of of what happens when an animation isn't removed upon completion." style="margin-bottom: 55%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 835 380" width="100%">
    <defs>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-1">
            <stop stop-color="#BFBFBF" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#BFBFBF" stop-opacity="0" offset="16.965554%"></stop>
            <stop stop-color="#BFBFBF" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="98.8592564%" y1="50%" x2="0%" y2="50%" id="linearGradient-2">
            <stop stop-color="#FFBA00" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#FFBA00" offset="4.98076822%"></stop>
            <stop stop-color="#FFBA00" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-3">
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#F4F4F7" offset="8.39736632%"></stop>
            <stop stop-color="#F4F4F7" offset="91.3127%"></stop>
            <stop stop-color="#F4F4F7" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-4">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="2.67197484%"></stop>
            <stop stop-color="#2F3842" offset="97.0628245%"></stop>
            <stop stop-color="#2F3842" stop-opacity="0" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="100%" y1="50%" x2="0%" y2="50%" id="linearGradient-5">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-6">
            <stop stop-color="#2F3842" stop-opacity="0" offset="0%"></stop>
            <stop stop-color="#2F3842" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
        <g id="Group-2" sketch:type="MSLayerGroup" transform="translate(-133.000000, -10.000000)">
            <rect id="Rectangle-25" fill="url(#linearGradient-1)" sketch:type="MSShapeGroup" x="970" y="115" width="11" height="3" rx="1"></rect>
            <rect id="Rectangle-1" fill="url(#linearGradient-2)" sketch:type="MSShapeGroup" x="459" y="206" width="527" height="70" rx="3"></rect>
            <rect id="Rectangle-2" fill="url(#linearGradient-3)" sketch:type="MSShapeGroup" x="351" y="286" width="628" height="70"></rect>
            <rect id="Rectangle-6" fill="url(#linearGradient-3)" sketch:type="MSShapeGroup" x="351" y="56" width="628" height="70"></rect>
            <path d="M862,37.5 L862,367.5" id="Path-18" stroke="#BFBFBF" stroke-width="2" sketch:type="MSShapeGroup"></path>
            <text id="model-value" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="142.05864" y="329">model value</tspan>
            </text>
            <text id="not-removed-" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="131.028476" y="253.824097">not removed </tspan>
            </text>
            <text id="animation-finishes-" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="24" font-weight="normal" sketch:alignment="middle" fill="#979797">
                <tspan x="751.112" y="28.2160645">animation finishes </tspan>
            </text>
            <text id="composite" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="36" font-weight="420" sketch:alignment="right" fill="#1F2326">
                <tspan x="169.76" y="101">composite</tspan>
            </text>
            <rect id="Rectangle-25" fill="url(#linearGradient-4)" sketch:type="MSShapeGroup" x="353" y="345" width="626" height="3"></rect>
            <path d="M466.5,266.5 L863.5,215.5 L958.011904,215.5" id="Path-3" stroke="#2F3842" stroke-width="3" stroke-linecap="round" sketch:type="MSShapeGroup"></path>
            <rect id="Rectangle-8" fill="url(#linearGradient-5)" sketch:type="MSShapeGroup" x="958" y="64" width="21" height="3"></rect>
            <path d="M466.5,116.500002 L972,116.500002" id="Path-1" stroke="#BFBFBF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="15" sketch:type="MSShapeGroup"></path>
            <rect id="Rectangle-7" fill="url(#linearGradient-6)" sketch:type="MSShapeGroup" x="353" y="115" width="21" height="3"></rect>
            <rect id="Rectangle-9" fill="url(#linearGradient-5)" sketch:type="MSShapeGroup" x="958" y="214" width="21" height="3"></rect>
            <path d="M374,116.5 L466.5,116.500002 L863.5,65.5 L958,65.5" id="Path-8" stroke="#2F3842" stroke-width="3" stroke-linejoin="round" sketch:type="MSShapeGroup"></path>
        </g>
    </g>
</svg></div></div></figure>
<figcaption>An illustration of of what happens when an animation isn't removed upon completion</figcaption>
 

[question]: http://stackoverflow.com/q/23939398/608157
[clearCode]: http://ronnqvi.st/clear-animation-code/
[gist]: https://gist.github.com/d-ronnqvist/11266321
[myObjc.ioArticle]: http://www.objc.io/issue-12/view-layer-synergy.html
[BackBoard]: http://iphonedevwiki.net/index.php/Backboardd
[overhead]: https://twitter.com/andy_matuschak/status/464799423785336832
[playground]: https://github.com/d-ronnqvist/Additive-Animations-Playground
[cancelImplicit]: https://twitter.com/jlpiedrahita/status/481143435651715073
