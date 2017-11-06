---
layout: post
title: "Custom activity indicators using a replicator layer"
description: "This week I found an actual use for CAReplicatorLayer, not just a place where I could make use if it but a place where it was a really good fit: Custom activity indicators AKA spinners. Lets go trough the process."
category: 
tags: [Objective-C, Activity Indicator, Core Animation, CAReplicatorLayer, CAShapeLayer]
---

> **Disclaimer:**
> No loops or images were harmed in the making of this activity indicator. 

This week I found an actual use for [`CAReplicatorLayer`][replicator], not just a place where I could make use if it but a place where it was a really good fit: 

_Custom activity indicators_ AKA _spinners_. Lets go trough the process.

# Basic steps

First, you create one spinner marker, in my case an elongated rounded rectangle just like the original activity indicator only much bigger. 

Then, for the magic, create a replicator layer and set its instance transform to a slight rotation Set an appropriate instance count and once you add the spinner marker to the replicator layer, slightly offset from the center, you will have a circle of spinner markers. 

The spinner is not moving yet so we'll have to fix that. 

# _Indicating_ activity
My first though was to set the instance alpha on the replicator to cause each spinner to have a slightly lower alpha and then rotate the replicator layer itself using a keyframe animation with discrete calculation mode to make it spin. That will work and was actually my first implementation. Though, when I decided to write about it I realized that there was a much more clever way to achieve the same effect[^1] that was less code and no loops.

Instead of setting the instance alpha offset, I set the instance delay (meaning that all changes I apply to the spinner markers happens with a certain delay between each marker) and then apply an opacity animation from 1 to 0. This causes each marker to jump to fully opaque and slowly fade to fully transparent.

# Coding time

_I defined some constants, their values will be available in the end._

We start by creating a the layer that will be our spinner marker and customize its appearance.

	CALayer * marker = [CALayer layer];
	[marker setBounds:CGRectMake(0, 0, kDefaultThickness, kDefaultLength)];
	[marker setCornerRadius:kDefaultThickness*0.5];
	[marker setBackgroundColor:[kDefaultColor CGColor]];
	[marker setPosition:CGPointMake(kDefaultHUDSide*0.5, kDefaultHUDSide*0.5+kDefaultSpread)];

Next, we create the replicator layer and center it in our view. I want the replicator to look like the volume HUD on iOS so I customize its size and appearance.

	CAReplicatorLayer * spinnerReplicator = [CAReplicatorLayer layer];
	[spinnerReplicator setBounds:CGRectMake(0, 0, kDefaultHUDSide, kDefaultHUDSide)];
	[spinnerReplicator setCornerRadius:10.0];
	[spinnerReplicator setBackgroundColor:[kDefaultHUDColor CGColor]];
	[spinnerReplicator setPosition:CGPointMake(CGRectGetMidX([self frame]), 
	                                           CGRectGetMidY([self frame]))];

All Spinner markers combined should make a complete circle in the activity indicator so we want the angle between them to be <span class="math" aria-label="2 pi, divided by capital N"><sup>2π</sup>&frasl;<sub><em>N</em></sub></span> with _N_ = number of markers. 

	CGFloat angle = (2.0*M_PI)/(kDefaultNumberOfSpinnerMarkers);
	CATransform3D instanceRotation = CATransform3DMakeRotation(angle, 0.0, 0.0, 1.0);
	[spinnerReplicator setInstanceCount:kDefaultNumberOfSpinnerMarkers];
	[spinnerReplicator setInstanceTransform:instanceRotation];

Finally, to create the animation we set the alpha of the spinner marker to 0 and set the instance delay to <span class="math" aria-label="capital T, divided by capital N"><sup><em>T</em></sup>&frasl;<sub><em>N</em></sub></span> with _T_ = animation time and _N_ = number of markers. Now we apply an opacity animation from one to zero (yes it may seem backwards but its what I meant).

	[spinnerReplicator addSublayer:marker];
	[[self layer] addSublayer:spinnerReplicator];
	    
	[marker setOpacity:0.0];
	CABasicAnimation * fade = [CABasicAnimation animationWithKeyPath:@"opacity"];
	[fade setFromValue:[NSNumber numberWithFloat:1.0]];
	[fade setToValue:[NSNumber numberWithFloat:0.0]];
	[fade setTimingFunction:[CAMediaTimingFunction functionWithName:kCAMediaTimingFunctionLinear]];
	[fade setRepeatCount:HUGE_VALF];
	[fade setDuration:kDefaultSpeed];
	CGFloat markerAnimationDuration = kDefaultSpeed/kDefaultNumberOfSpinnerMarkers;
	[spinnerReplicator setInstanceDelay:markerAnimationDuration];
	[marker addAnimation:fade forKey:kMarkerAnimationKey];

Believe it or not, that's actually it. Run the above code and you will have your own custom activity indicator. No images, no loops, pure awesome. By changing up the marker layer slightly we can create some very custom looks for our activity indicator. We've used only constant values in this example but you could easily create a custom control where these would be settable properties instead.

	// Default values
	#define kDefaultNumberOfSpinnerMarkers 12
	#define kDefaultSpread 35.0
	#define kDefaultColor ([UIColor whiteColor])
	#define kDefaultThickness 8.0
	#define kDefaultLength 25.0
	#define kDefaultSpeed 1.0
	
	// HUD defaults
	#define kDefaultHUDSide 160.0
	#define kDefaultHUDColor ([UIColor colorWithWhite:0.0 alpha:0.5])
	
	#define kMarkerAnimationKey @"MarkerAnimationKey"

# Some sample activity indicators

If you run the above code you will see an indicator that looks something like this.

![Custom Activity Indicator](/images/custom-activity-indicator.png)

If you look closely at the beginning of the animation, you can see that it actually starts of with no visible indicators and then shows them one by one on the first "rotation".

![Beginning of animation](/images/indicator-start.png)

## Changing the marker layer

You can easily customize the activity indicator by changing some colors around or adding your own layer as the spinner marker layer. If you use a [`CAShapeLayer`][shapeLayer], you can easily create some really funny indicators for your own app.

![Waiting for love indicator](/images/waiting-for-love-indicator.png)

![Night sky indicator](/images/star-loader.png)


[^1]: It's actually even a better visual effect since you get the nice starting animation on the first "rotation" and the spinner markers fade more smoothly.

[shapeLayer]: https://developer.apple.com/library/mac/#documentation/GraphicsImaging/Reference/CAShapeLayer_class/Reference/Reference.html "CAShapeLayer documentation"

[replicator]: https://developer.apple.com/library/mac/#documentation/GraphicsImaging/Reference/CAReplicatorLayer_class/Reference/Reference.html "CAReplicatorLayer documentation"
