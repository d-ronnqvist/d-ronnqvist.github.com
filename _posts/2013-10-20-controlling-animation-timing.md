---
layout: post
title: "Controlling Animation Timing"
description: "There is a protocol called CAMediaTiming which is implemented by CAAnimation, the base class of CABasicAnimation and CAKeyframeAnimation. It is where all the timing related properties – like duration, beginTime and repeatCount – come from. All in all the protocol defines eight properties that can be combines in a number of ways to precisely control timing. The documentation is only a few sentences per property so you could probably read it all and the actual header way faster than this article but I feel that timing is better explained with visualizations."
category: 
tags: [Core Animation]
---

<style>{% include controlling-animation-timing.css %}</style>

There is a protocol called CAMediaTiming which is implemented by CAAnimation, the base class of CABasicAnimation and CAKeyframeAnimation. It is where all the timing related properties – like `duration`, `beginTime` and `repeatCount` – come from. All in all the protocol defines eight properties that can be combines in a number of ways to precisely control timing. The documentation is only a few sentences per property so you could probably read it all and the actual header way faster than this article but I feel that timing is better explained with visualizations.

# Visualizing CAMediaTiming

To show the different timing related properties, both on their own and in combination, I'm animating a color from orange to blue. The block shows the progress of the animation from start to finish (orange to blue) and the ticks on the timeline are one second apart. You can look at any point on the timeline to see what the current color would be *X* seconds into the animation. For example, `duration` is visualized below. 

The duration is set to 1.5 seconds so the animation takes a second and a half to animate all the way to blue.


<figure>
<code>
duration=1.5
</code>
<div role="img" aria-label="Setting the duration to 1.5 seconds makes the animation take 1.5 seconds" style="margin-bottom: 30%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 470 73" width="100%">
    <defs>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-1">
            <stop stop-color="#ffb900" offset="0%"></stop>
            <stop stop-color="#4aa5e3" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g stroke="#222F39" stroke-width="2" fill="none">
        <rect d="M1,1 L1,73 L469,73 L469,1 L1,1 Z M0,0" x="0" y="0" width="470" height="73"></rect>
        <path d="M118.5,0 L118.5,74" ></path>
        <path d="M236.5,0 L236.5,74" ></path>
        <path d="M352.5,0 L352.5,74" ></path>
    </g>
    <rect id="path-2" x="4" y="4" width="175" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
</svg>
</div>
</div>
</figure>
<figcaption>Setting the duration to 1.5 seconds</figcaption>

By default `CAAnimation`s are removed from the layer upon completion. This is also visualized above. Once the animation reaches the final value it is removed from the layer. If the color of the layer would have been orange (the start value) the color would have returned to the orange value. In this visualization the color property of the layer is white so you can also see that two seconds after the animation was added to the layer it will be white again because the animation is finished by then. 

If we also visualize the beginTime of the animation then this will make more sense. 

<figure>
<code>
duration=1.5, beginTime=1.0
</code>
<div role="img" aria-label="Setting the duration to 1.5 seconds and begin time to 1.0 makes the animation end after 2.5 seconds" style="margin-bottom: 30%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 470 73" width="100%">
    <defs>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-1">
            <stop stop-color="#ffb900" offset="0%"></stop>
            <stop stop-color="#4aa5e3" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g stroke="#222F39" stroke-width="2" fill="none">
        <rect d="M1,1 L1,73 L469,73 L469,1 L1,1 Z M0,0" x="0" y="0" width="470" height="73"></rect>
        <path d="M118.5,0 L118.5,74" ></path>
        <path d="M236.5,0 L236.5,74" ></path>
        <path d="M352.5,0 L352.5,74" ></path>
    </g>
    <rect id="path-2" x="120" y="4" width="175" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
</svg>
</div>
</div>
</figure>
<figcaption>Setting the duration to 1.5 seconds and begin time to 1.0</figcaption>

The durations is set to 1.5 seconds and the beginTime is set to the current time (`CACurrentMediaTime()`) plus 1 second so the animation ends after two and a half seconds. After the animation is added to the layer it takes a second for it start and visually appear. The rest is just <span class="math">1+1.5=2.5</span>. 

To get the animation to show the `fromValue` before it has begun (as set using the `beginTime`) you can configure it to fill backwards. This is done by setting the `fillMode` to `kCAFillModeBackwards`[^removedOnCompletion]. 

<figure>
<code>
duration=1.5, beginTime=1.0, fillMode=back
</code>
<div role="img" aria-label="Fill mode can be used to display the fromValue before the animation starts" style="margin-bottom: 30%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 470 73" width="100%">
    <defs>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-1">
            <stop stop-color="#ffb900" offset="0%"></stop>
            <stop stop-color="#4aa5e3" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g stroke="#222F39" stroke-width="2" fill="none">
        <rect d="M1,1 L1,73 L469,73 L469,1 L1,1 Z M0,0" x="0" y="0" width="470" height="73"></rect>
        <path d="M118.5,0 L118.5,74" ></path>
        <path d="M236.5,0 L236.5,74" ></path>
        <path d="M352.5,0 L352.5,74" ></path>
    </g>
    <rect id="path-2" x="4" y="4" width="120" height="65" stroke="none" fill="#ffb900"></rect>
    <rect id="path-2" x="120" y="4" width="175" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
</svg>
</div>
</div>
</figure>
<figcaption>Fill mode can be used to display the fromValue before the animation starts</figcaption>

The `autoreverses` property causes the animation to go from the start value to the end value and do the same animation in reverse taking it back to the start value. This means that if effectively takes twice as long.

<figure>
<code>
duration=1.5, autoreverses
</code>
<div role="img" aria-label="Autoreverses makes the animation return to the start after reaching the end" style="margin-bottom: 30%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 470 73" width="100%">
    <defs>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-1">
            <stop stop-color="#ffb900" offset="0%"></stop>
            <stop stop-color="#4aa5e3" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-2">
            <stop stop-color="#4aa5e3" offset="0%"></stop>
            <stop stop-color="#ffb900" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g stroke="#222F39" stroke-width="2" fill="none">
        <rect d="M1,1 L1,73 L469,73 L469,1 L1,1 Z M0,0" x="0" y="0" width="470" height="73"></rect>
        <path d="M118.5,0 L118.5,74" ></path>
        <path d="M236.5,0 L236.5,74" ></path>
        <path d="M352.5,0 L352.5,74" ></path>
    </g>
    <rect id="path-2" x="4" y="4" width="175" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
    <rect id="path-2" x="178" y="4" width="173" height="65" stroke="none" fill="url(#linearGradient-2)"></rect>
</svg>
</div>
</div>
</figure>
<figcaption>Autoreverses makes the animation return to the start after reaching the end</figcaption>

Compare that to `repeatCount` which can repeat the animation twice (as seen below) or any number of times (you can even use fractional repeat counts like 1.5 to do one and a half animation). Once the animation reaches it's final value it immediately jumps back to the initial value and starts over.

<figure>
<code>
duration=1.5, repeatCount=2.0
</code>
<div role="img" aria-label="Repeat count causes the animation to run more than once" style="margin-bottom: 30%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 470 73" width="100%">
    <defs>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-1">
            <stop stop-color="#ffb900" offset="0%"></stop>
            <stop stop-color="#4aa5e3" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g stroke="#222F39" stroke-width="2" fill="none">
        <rect d="M1,1 L1,73 L469,73 L469,1 L1,1 Z M0,0" x="0" y="0" width="470" height="73"></rect>
        <path d="M118.5,0 L118.5,74" ></path>
        <path d="M236.5,0 L236.5,74" ></path>
        <path d="M352.5,0 L352.5,74" ></path>
    </g>
    <rect id="path-2" x="4" y="4" width="175" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
    <rect id="path-2" x="178" y="4" width="173" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
</svg>
</div>
</div>
</figure>
<figcaption>Repeat count causes the animation to run more than once</figcaption>

Similar to repeat count, but rarely ever used, is repeat duration. It will simply repeat the animation for a given duration (2 seconds shown below). Passing a repeat duration that is less than the animation duration will cause the animation to end early (after the repeat duration).
 
<figure>
<code>
duration=1.5, repeatDuration=2.0
</code>
<div role="img" aria-label="Repeat count causes the animation to run more than once" style="margin-bottom: 30%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 470 73" width="100%">
    <defs>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-1">
            <stop stop-color="#ffb900" offset="0%"></stop>
            <stop stop-color="#4aa5e3" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-2a">
            <stop stop-color="#ffb900" offset="0%"></stop>
            <stop stop-color="rgb(172,176,125)" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g stroke="#222F39" stroke-width="2" fill="none">
        <rect d="M1,1 L1,73 L469,73 L469,1 L1,1 Z M0,0" x="0" y="0" width="470" height="73"></rect>
        <path d="M118.5,0 L118.5,74" ></path>
        <path d="M236.5,0 L236.5,74" ></path>
        <path d="M352.5,0 L352.5,74" ></path>
    </g>
    <rect id="path-2" x="4" y="4" width="175" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
    <rect id="path-2" x="179" y="4" width="58" height="65" stroke="none" fill="url(#linearGradient-2a)"></rect>
</svg>
</div>
</div>
</figure>
<figcaption>Repeat duration makes the animation repeat for a given duration</figcaption>

These can all be combined to repeat a reversing animation a number of times or a given duration. 

<figure>
<code>
duration=0.5, repeatCount=2.5, autoreverses
</code>
<div role="img" aria-label="Repeat count causes the animation to run more than once" style="margin-bottom: 30%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 470 73" width="100%">
    <defs>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-1">
            <stop stop-color="#ffb900" offset="0%"></stop>
            <stop stop-color="#4aa5e3" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-2">
            <stop stop-color="#4aa5e3" offset="0%"></stop>
            <stop stop-color="#ffb900" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g stroke="#222F39" stroke-width="2" fill="none">
        <rect d="M1,1 L1,73 L469,73 L469,1 L1,1 Z M0,0" x="0" y="0" width="470" height="73"></rect>
        <path d="M118.5,0 L118.5,74" ></path>
        <path d="M236.5,0 L236.5,74" ></path>
        <path d="M352.5,0 L352.5,74" ></path>
    </g>
    <rect id="path-2" x="4" y="4" width="58" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
    <rect id="path-2" x="62" y="4" width="58" height="65" stroke="none" fill="url(#linearGradient-2)"></rect>
    
    <rect id="path-2" x="119" y="4" width="58" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
    <rect id="path-2" x="177" y="4" width="58" height="65" stroke="none" fill="url(#linearGradient-2)"></rect>
  
    <rect id="path-2" x="234" y="4" width="58" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
</svg>
</div>
</div>
</figure>
<figcaption>These can all combined</figcaption>

One of the more interesting timing related properties is speed. By setting the duration to 3 seconds but the speed to 2 the animation will effectively take just one and a half second because it runs twice as fast[^fun]. 

<figure>
<code>
duration=3.0, speed=2.0
</code>
<div role="img" aria-label="Setting the duration to 1.5 seconds makes the animation take 1.5 seconds" style="margin-bottom: 30%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 470 73" width="100%">
    <defs>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-1">
            <stop stop-color="#ffb900" offset="0%"></stop>
            <stop stop-color="#4aa5e3" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g stroke="#222F39" stroke-width="2" fill="none">
        <rect d="M1,1 L1,73 L469,73 L469,1 L1,1 Z M0,0" x="0" y="0" width="470" height="73"></rect>
        <path d="M118.5,0 L118.5,74" ></path>
        <path d="M236.5,0 L236.5,74" ></path>
        <path d="M352.5,0 L352.5,74" ></path>
    </g>
    <rect id="path-2" x="4" y="4" width="175" height="65" stroke="none" fill="url(#linearGradient-1)"></rect>
</svg>
</div>
</div>
</figure>
<figcaption>A speed of 2 makes animation go twice as fast so 3 seconds only take 1.5 seconds</figcaption>

If only a simple animation was configured then you could have just divided the beginTime and duration yourself to get the same result but the power of the `speed` property comes from two facts: 

 1. Animation speed is hierarchical
 2. CAAnimation is not the only class which implement CAMediaTiming

### Hierarchical speed

An animation with the speed 1.5 that is part of an animation group with speed 2 will effectively run 3 times as fast. 

### Other implementations of CAMediaTiming 

CAMediaTiming is a protocol that CAAnimation implements but the same protocol is also implemented by CALayer, the base class of all Core Animation layers. This means that you can set the speed of a layer to 2.0 and all animations that are added to it will run twice as fast. This also works with the timing hierarchy so an animation with speed 3 on a layer with speed 0.5 will run at 1.5 times normal.

Controlling the speed of an animation or a layer can also be used to pause the animation by setting the speed to 0. Together with `timeOffset` this can control an animation from an external mechanism like a slider which will be shown later in this article. 

The `timeOffset` property is very strange at first. As the name suggests it offsets the time that is used to calculate the state of the animation. This is best visualized. Below is an animation with a 3 second duration that is offset 1 second. 

<figure>
<code>
duration=3.0, timeOffset=1.0
</code>
<div role="img" aria-label="Repeat count causes the animation to run more than once" style="margin-bottom: 30%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 470 73" width="100%">
    <defs>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-4">
            <stop stop-color="rgb(196,179,97)" offset="0%"></stop>
            <stop stop-color="#4aa5e3" offset="100%"></stop>
        </linearGradient>
        <linearGradient x1="0%" y1="50%" x2="100%" y2="50%" id="linearGradient-5">
            <stop stop-color="#ffb900" offset="0%"></stop>
            <stop stop-color="rgb(196,179,97)" offset="100%"></stop>
        </linearGradient>
    </defs>
    <g stroke="#222F39" stroke-width="2" fill="none">
        <rect d="M1,1 L1,73 L469,73 L469,1 L1,1 Z M0,0" x="0" y="0" width="470" height="73"></rect>
        <path d="M118.5,0 L118.5,74" ></path>
        <path d="M236.5,0 L236.5,74" ></path>
        <path d="M352.5,0 L352.5,74" ></path>
    </g>
    <rect id="path-2" x="4" y="4" width="233" height="65" stroke="none" fill="url(#linearGradient-4)"></rect>
<rect id="path-2" x="237" y="4" width="115" height="65" stroke="none" fill="url(#linearGradient-5)"></rect>

</svg>
</div>
</div>
</figure>
<figcaption>You can offset the entire animation but it will still run all parts of it</figcaption>

The animation starts off one second into the transition from orange to blue and runs the final two seconds until it becomes completely blue. Then it jumps back to be completely orange and does the first second of the color transition. It is as if we cut away the first second of the animation and moved it to the end. 

This property in itself has almost no use but it can be combined with a paused animation (speed = 0) to control the "current time". A paused animation is stuck at the first frame. If you look at the very first color in the offset animation (above) you can see that it's the color value one second into the color transition. By setting the time offset to another value you get that time into the transition.  

If you want more of these timing illustrations, I made a little [cheat sheet][cheatsheet].
 
# Controlling animation timing 

Used together, `speed` and `timeOffset` can control the current "time" of an animation. There is almost no code involved but the concept can be tricky (I hope the illustrations helps with that part). For convenience I set the duration of the animation to 1.0. This is because the time offset is in absolute values. Doing this means that a time offset of 0.0 is at 0% into the animation (at the beginning) and a time offset of 1.0 is at 100% into the animation (at the end). 

## Slider

Starting really simple, we create a basic animation for the background color of a layer and add it to that layer. We set the speed of the layer to 0 to pause the animation.

{% highlight objc %}
CABasicAnimation *changeColor =   [CABasicAnimation animationWithKeyPath:@"backgroundColor"];changeColor.fromValue = (id)[UIColor orangeColor].CGColor;changeColor.toValue   = (id)[UIColor blueColor].CGColor;
changeColor.duration  = 1.0; // For convenience
[self.myLayer addAnimation:changeColor
                   forKey:@"Change color"];
    
self.myLayer.speed = 0.0; // Pause the animation
{% endhighlight %}

Then in the action method for when the slider is dragged we set the current value of the slider (also configured to go from 0 to 1) as the time offset of the layer 

{% highlight objc %}
- (IBAction)sliderChanged:(UISlider *)sender {    self.myLayer.timeOffset = sender.value; // Update "current time"}
{% endhighlight %}

This gives the effect that as we drag the slider the current value of the animation changes and updates the background color of the layer.

<figure><div class="box-background"><img src="/images/slider.gif" alt="The color of the layer changes as the value of the slider changes"></div>
</figure>
<figcaption>The color of the layer changes as the value of the slider changes</figcaption>

## Pull to refresh

You can also use other mechanisms like scroll events to control animation timing. This can be used to create a very custom pull to refresh animation where the animation is progressing as the user pulls down until a threshold value where you start loading new data. The animation that the scroll event controlls in my example is the stroking of a path (animating the `strokeEnd` property of a shape layer) and when it reaches a threshold it will start another animations to signal that new data is loading. 

Instead of a slider to control the timing we use the amount that the scroll view is dragged down. This value will be in points so it has to be normalized to be used as a time offset but that is fine because we need a drag threshold to know when to load more data anyway. The code that handles pulling down the scroll view looks like this

	- (void)scrollViewDidScroll:(UIScrollView *)scrollView
	{
	    CGFloat offset = 
	      scrollView.contentOffset.y+scrollView.contentInset.top;
	    if (offset <= 0.0 && !self.isLoading) {
	        CGFloat startLoadingThreshold = 60.0;
	        CGFloat fractionDragged       = -offset/startLoadingThreshold;
	        
	        self.pullToRefreshShape.timeOffset = MAX(0.0, fractionDragged);
	        
	        if (fractionDragged >= 1.0) {
	            [self startLoading];
	        }
	    }
	}

and the animation being controlled looks like this

    CABasicAnimation *writeText = 
      [CABasicAnimation animationWithKeyPath:@"strokeEnd"];
    writeText.fromValue = @0;
    writeText.toValue = @1;
    
    CABasicAnimation *move = 
      [CABasicAnimation animationWithKeyPath:@"position.y"];
    move.byValue = @(-22);
    move.toValue = @0;
    
    CAAnimationGroup *group = [CAAnimationGroup animation];
    group.duration = 1.0;
    group.animations = @[writeText, move];
    
The result is that as you pull down you have direct control over the progress of the animation (i.e. the further you pull the more of the word "Load" is written). If you pull up again then the animation will move backwards. 

<figure><div class="box-background"><img src="/images/peak.gif" max-width="181px !important" alt="Directly controlling the pull to refresh control using scroll events"></div>
</figure>
<figcaption>Directly controlling the pull to refresh control using scroll events</figcaption>

Once you pass the threshold you start the actual load<em>ing</em> animation and load more data. My code for doing this looks like this.
I set that I'm loading to prevent timeOffset from being set in `scrollViewDidScroll:`, start the loading animation and adjust the content inset to prevent the scrollview from scrolling up past the loading indicator.

{% highlight objc %}
self.isLoading = YES;

// start the loading animation
[self.loadingShape addAnimation:[self loadingAnimation]
                         forKey:@"Write that word"];

CGFloat contentInset    = self.collectionView.contentInset.top;
CGFloat indicatorHeight = CGRectGetHeight(self.loadingIndicator.frame);
// inset the top to keep the loading indicator on screen
self.collectionView.contentInset = 
  UIEdgeInsetsMake(contentInset+indicatorHeight, 0, 0, 0);
self.collectionView.scrollEnabled = NO; // no further scrolling

[self loadMoreDataWithAnimation:^{
    // during the reload animation (where new cells are inserted)
    self.collectionView.contentInset = 
      UIEdgeInsetsMake(contentInset, 0, 0, 0);
    self.loadingIndicator.alpha = 0.0;
} completion:^{
    // reset everything
    [self.loadingShape removeAllAnimations];
    self.loadingIndicator.alpha = 1.0;
    self.collectionView.scrollEnabled = YES;
    self.pullToRefreshShape.timeOffset = 0.0; // back to the start
    self.isLoading = NO;
}];
{% endhighlight  %}    
    
The end result when you scroll down past the threshold looks like this

<figure><div class="box-background"><img src="/images/pull down.gif" alt="The full pull to refresh and loading animation"></div>
</figure>
<figcaption>The full pull to refresh and loading animation</figcaption>



Controlling an animation like that is a nice little detail to add to your application and you can do some advanced group animations like this one without writing crazy amounts of code. I didn't show it here but you can do the same kind of control with a gesture recognizer or any other direct control mechanism.

The sample pull-to-refresh project shown above can be found [on GitHub][samplecode].

[^fun]: Fun fact: a negative speed (like -1) will cause the animation to go backwards in "time".

[^removedOnCompletion]: You *can* use the fillMode property to fill forwards and get the animation to show the `toValue` after the duration has passed but the animation is going to be removed upon completion so only setting the fillMode would not be enough. You would also have to configure the animation to not be removed on completion by setting `removedOnCompletion = NO`. Just be aware that the animation only affects the visuals (the presentation layer) so [by doing these two things you have introduced a difference between the model and the view][peeve]. The same data (the animated property) exists in two places (the value of the property and what appears on screen) but now they are out of sync.

[peeve]: https://www.explosm.net/comics/2676/ (Cyanide & Happiness #2676 - My pet peeve)

[samplecode]: https://github.com/d-ronnqvist/blogpost-codesample-PullToRefresh (Sample project)

[cheatsheet]: http://ronnqvi.st/images/CAMedaiTiming%20cheat%20sheet.pdf (CAMediaTiming cheat sheet)
