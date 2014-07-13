---
layout: post
title: "Accessible Sliders and Adjustable Controls"
description: "Setting numerical values is something many apps have to deal with, whether it's the changing the volume or display brightness, scrubbing through a song or a video, rating a great app, or something completely different. The two standard components we have for this task are sliders and steppers. There are reasons to extend these controls to provide app specific functionality like custom callouts, range selection, circular sliders, etc. and there are plenty of custom slider like controls out there. 

Whenever we choose to write a custom control, we're likely to lose the built-in accessibility of the standard control. In the case of sliders, the ability to easily adjust its value. "
category: 
tags: [Accessibility, VoiceOver] 
---

Setting numerical values is something many apps have to deal with, whether it's the changing the volume or display brightness, scrubbing through a song or a video, rating a great app, or something completely different. The two standard components we have for this task are sliders and steppers. There are reasons to extend these controls to provide app specific functionality like custom callouts, range selection, circular sliders, etc. and there are plenty of custom slider like controls out there. 

Whenever we choose to write a custom control, we're likely to lose the built-in accessibility of the standard control. In the case of sliders, the ability to easily adjust its value. 

If we create a new project, drag out a standard unconfigured slider and run the application, VoiceOver is going to read "50%. Adjustable. Swipe up or down with one finger to adjust the value." Swiping up or down changes the value in 10 percentage point increments and reads the new value. We're able to interact with the slider but it's not obvious what the value corresponds to. Go back to Interface Builder and set an accessibility label in the Identity Inspector (⌥⌘3) (or the `accessibilityLabel` property in code) to a string that describes what the value represents, for example "Volume", and run the application again. 

This time when we focus on the slider, VoiceOver reads "Volume. 50%. Adjustable. Swipe up or down with one finger to adjust the value" and when we swipe up or down it reads only the new value. We already know that we are interacting with the "Volume" slider, it doesn't have to read that again. With just a minimal configuration, this is the behavior that we are getting with the standard controls and this is the least that we should be aiming for in our custom controls.

The interaction of the slider comes from the "adjustable" trait and the way that the value is read comes from the `accessibilityValue` property. Reading the percentage is a decent default way of formatting the value but for more specialized purposes we can do much better. For example, the track position of the music player reads "1 minute 58 seconds of 4 minutes 7 seconds".

---

Let's say that we have a custom star rating control where the user can slider their finger across to select either 1, 2, 3, 4, or 5 stars and we've decided to make it work just as well as the native slider. It's a completely custom control and we decided to subclass UIControl when we originally built it.

We start off by making the control accessible and giving it a label to describe what the values represent:

{% highlight objc %}
// Make the control accessible
- (BOOL)isAccessibilityElement
{
    return YES;
}

// A label describing what the values represent
- (NSString *)accessibilityLabel
{
    return @"Rating";
}
{% endhighlight %}

To get the same behavior as the standard slider, we add the "adjustable" trait:

{% highlight objc %}
// Add the adjustable trait
- (UIAccessibilityTraits)accessibilityTraits
{
    return [super accessibilityTraits] | UIAccessibilityTraitAdjustable;
}
{% endhighlight %}
	
Now, whenever the user slides up or down, there are two methods that will be called on the rating control: `accessibilityIncrement` and `accessibilityDecrement`. All we need to do inside those is to increase and decrease the value of our rating control. Since we are changing the rating by one star each time, we simply add or remove `1` from the current rating:

{% highlight objc %}
// Change the rating
- (void)accessibilityIncrement
{
    self.rating++;
}

- (void)accessibilityDecrement
{
    self.rating--;
}
{% endhighlight %}

Doing only this will not give the full behavior of the standard slider. The user still needs to focus on something else and come back for the new value to be read. This is because we didn't update the `accessibilityValue` when the rating changes. In the setter for the rating (which we have already implemented to clamp the value between 1 and 5), we set the accessibility value to a string that describes the current value. For example "3 stars":

{% highlight objc %}
- (void)setRating:(NSInteger)rating
{
    // clamp to the range 1-5
    rating = MAX(rating, 1);
    rating = MIN(rating, 5);
    
    _rating = rating;
    [self setNeedsDisplay];
    
    // A nice description of the new value for VoiceOver to read
    if (rating == 1) {
        self.accessibilityValue = @"1 star";
    } else {
        self.accessibilityValue = 
          [NSString stringWithFormat:@"%ld stars", (long)rating];
    }
}
{% endhighlight %}
	
Now when we run the application again and swipe up or down. VoiceOver reads "Rating. 2 stars. Adjustable. Swipe up or down with one finger to adjust the value" as the user selects the control and  "3 stars", "4 stars", "5 stars" as the user increments the value.

There is another very nice part of the adjustable trait that we get for free. If the user tries to increment the value when it has reached its maximum value, the user is going to hear a soft "dong" sound indicating that the adjustable value has reached its limits. This happens because the increment or decrement methods were called but the accessibilityValue didn't change to a new string.

---

The adjustable trait can be found in parts of the system. It doesn't have to be used for numerical values like this. For example, the index collection in UITableView uses the adjustable trait to allow the user to quickly navigate between sections. As the user swipes up or down the value changes from "A" to "B" to "C" and so on, and the user is able to quickly navigate through a long list of items with just a couple of swipes. 
