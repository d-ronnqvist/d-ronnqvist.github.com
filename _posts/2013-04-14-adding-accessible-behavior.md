---
layout: post
title: "Adding accessible behavior"
description: "There is more to an app with <em>great</em> accessibility than just labels, hints and traits. The app needs to have the correct behavior as well. When it comes to implementing accessibility on iOS the golden rule is “do it the same way that Apple is doing it”. You may have your opinions about the visual appearance of some of the built in controls but they behave great. It’s also not only the behavior of the individual controls that matter but the bigger picture.
"
category: 
tags: [Accessibility, VoiceOver, User Interface]
---


There is more to an app with _great_ accessibility than just labels, hints and traits. The app needs to have the correct behavior as well. When it comes to implementing accessibility on iOS the golden rule is “do it the same way that Apple is doing it”. You may have your opinions about the visual appearance of some of the built in controls but they behave great. It’s also not only the behavior of the individual controls that matter but the bigger picture.

Take modal views, action sheets or popovers as an example. They display new content on top of the other content and prevents your from reaching what is underneath until they are dismissed. This is not just about visually obscuring the content. If you for example tap on a button outside a popover the action of the button does not trigger, the only thing that happens is that the popover is dismissed. _That_ is the behavior.

# The native accessibility behavior

If you haven’t tried using these elements with VoiceOver you may be surprised by how well they behave. If you have used them you may never have though of their behavior because it is just what you expect. When a modal view[^modal-alternative] is displayed on screen, the focus shifts to the first accessibility element inside the modal view. Swiping left or right takes you to the previous or next element inside the modal view but you can’t swipe to get to an element outside the modal view. 

Tapping outside the modal view prompts you to “double tap to dismiss” (e.g. take action on the selected accessibility element to dismiss). When the modal view dismisses the elements that were previously behind it are reachable again and one of them is selected. But if the user was truly blind, how would he/she know where to tap to dismiss the modal view? 

VoiceOver on iOS has a gesture for doing that called the “escape gesture”. It is global gesture that takes you back one step from where ever you are. If a modal view or a popover is open it is dismissed. In a navigation controller it pops the current view controller and takes you back to the previous view controller. 

The truly interesting thing is that it is a _global_ gesture. Unlike (almost) all the other gestures in VoiceOver it doesn’t matter which accessibility element is selected. There is one other such global gesture called the “magic tap” but I’m getting ahead of myself. Global gestures comes later, we are still talking about modal views for accessibility.

If you are using and customizing the native popovers and modal views in UIKit then you get the accessibility behavior explained above for free, just like that. If you are rolling your own solutions then there is a little bit of work, but not very much, to have the same great behavior. 

# Implementing accessible modal views

The secret to getting the same modal behavior as the native UIKit components is a property called `accessibilityViewIsModal`:

>  When the value of this property is `YES`, VoiceOver ignores the elements within the sibling views of the receiving view

If your view hierarchy is reasonable it should be as simple as finding the suitable view to make modal in order to ignore it’s siblings and their children. By “reasonable” I mean that the modal view is not embedded in several layers of container views to create shadows, vignettes, etc. If it’s embedded in container views then it has no sibling views to ignore. In that case you probably want the top most container (the one that contains other containers if there are more than one) to be modal since it is the one that has sibling views.

If your view hierarchy is messy and you can’t change it you can still find the suitable container view and mark it as a modal accessibility view. All its subviews will still be accessible but all its siblings will be ignored by VoiceOver. In **Figure 1** (below) you can hover or tap the view hierarchy or the views themselves to make them modal and see which views would be ignored by that. 


{% include adding-accessible-behavior-modal-widget.html %}
<figcaption>A view hierarchy that illustrates the effect of modal accessibility views. The <span style="color: #ffba00; text-shadow: 0 1px 1px rgba(0,0,0,0.5);">orange view</span> is the one marked as modal and the  <span style="color: #abc0c3; text-shadow: 0 1px 1px rgba(0,0,0,0.5);">gray views</span> are the ones that are ignored because of the modal view.</figcaption>

# Accessibility notifications

You may also have noticed the beeping sound that happens when a native modal view appears or disappears. It informs the user that the screen has changed and that new elements are on screen. Besides the sound the new content is also selected. 

This is called accessibility notifications and you can post them yourself by calling `UIAccessibilityPostNotification(...);`. The function takes two arguments: one for the kind of notification and one as the argument to the notification. The notification we are interested in for telling the user that the screen has changed is `UIAccessibilityScreenChangedNotification`. As the argument you can send the accessibility element that VoiceOver should select.

Another very handy notification is `UIAccessibilityAnnouncementNotification` which takes a string as the argument to read as an announcement to the user. The announcement can be any text you want. Just be careful not to constantly announce stuff. A sighted user may be able to look away but VoiceOver only speaks one thing at a time.

## Responding to accessibility notifications

There are some accessibility notifications that you don’t post to VoiceOver, UIKit posts them to you. One very handy and probably the most common one is `UIAccessibilityVoiceOverStatusChanged` which is posted when VoiceOver is turned on or off. 

Together with `UIAccessibilityIsVoiceOverRunning();` it can be used to customize the user interface for when VoiceOver is running. For example a button could be added to the interface to replace a gesture that would not be available when VoiceOver is on (like a normal swipe gesture).

Just like normal notifications you observe them using the default notification center.

    [[NSNotificationCenter defaultCenter] 
        addObserver:self
           selector:@selector(updateUserInterfaceForVoiceOver:)
               name:UIAccessibilityVoiceOverStatusChanged
             object:nil];

# Global gestures

## Escape

To perform the global “escape gesture” as a user you draw a "Z" with two fingers anywhere on the screen. Go play around with it in some of the built in applications and see how useful it is. The best part is that it is as easy to implement as it is to use. There is just one method to implement:

    - (BOOL)accessibilityPerformEscape;

You can implement it anywhere in the responder chain. What is interesting here is that the next responder of your view controllers view is the controller itself so to make a gesture that is applicable to all the views that a controller manages you could do the implementation in your controller, even though it is not an accessibility element itself.

In the implementation, the controller (or the view) dismisses itself or do whatever escape action that is suitable for its context and then return `YES` to stop the call from reaching the next responder. This means that you can also do nothing and return `NO` to let the next responder handle the call. So instead of letting the controller dismiss itself it could propagate the call to the presenting controller and have it handle the escape. 

## Magic tap

The second global gesture is called the “magic tap”[^magic-tap-name] and is used for doing the obvious (and almost always time sensitive) action for the given context. For example, the native phone app uses it to answer or hang up a phone call. To perform the action a user would double tap with two fingers anywhere on the screen. Implementing it in your app is just as easy as the escape gesture. You just implement `accessibilityPerformMagicTap` somewhere in the responder chain and return `YES` to stop it from propagating.

You could have different magic tap actions for different parts of your app but you should note that most apps don’t have it at all. There should really be one _obvious_ action for you to consider it. 

-----------

The [sample code][code] from my presentation on accessibility at the CocoaHeads Stockholm meet up in May shows how most of this can be implemented in a small project (slides are also in the repository). You can search for the string `/// DEMO` in the project to quickly find all relevant parts.

[^magic-tap-name]: Yes, that is the actual name in the API.

[^modal-alternative]: The same goes for action sheets or popovers as well.

[code]: https://github.com/d-ronnqvist/cocoaheads-accessibility-samplecode "Accessibility sample code from CocoaHeads Stockholm in March"

<script src="/script/script-adding-accessible-behavior.js" type="text/javascript" > </script>

