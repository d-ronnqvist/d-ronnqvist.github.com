---
layout: post
title: "Swipe-to-delete for VoiceOver"
description: "If you've haven't seen it before, there is a cool accessibility feature in UITableView that allows the user to toggle between different actions. It's really very elegant and it's a powerful and convenient implementation for VoiceOver users on iOS. One could say that it's the VoiceOver version of the swipe-to-delete feature. If we've written a custom gesture to delete cells, then chances are that we've broken this behvaior. Luckily, it's not that difficult to put it back."
category: 
tags: [Accessibility, VoiceOver] 
---

If you've haven't seen it before, there is a cool accessibility feature in UITableView that allows the user to toggle between different actions. It's really very elegant and it's a powerful and convenient implementation for VoiceOver users on iOS. One could say that it's the VoiceOver version of the swipe-to-delete feature.

To try it out yourselves, open one of the built in apps like Mail or Notes and turn on VoiceOver. If you are afraid to accidentally delete some of your important notes or email, you can also create a new Master-Detail Application in Xcode and run it on your device. Navigate to one of the cells and use the "Rotor" (rotate with two fingers on the screen) to find the "Actions" item. Now you can swipe up and down do toggle between "Activate Item (default action)" and "Delete". If you now double tap, the cell gets deleted instead of selected. 

<figure><div class="box-background"><img src="/images/rotor.png" alt="The Rotor showing the Actions item"></div>
</figure>
<figcaption>The Rotor showing the Actions item</figcaption>

This is the default behavior and you get this accessibility out of the box with UITableView. The only problem with the default implementation is that we might want to create a custom way of deleting our table view cells or we might want to support multiple different actions, so we've written a custom thing. If we write something custom, it's likely that we've accidentally broken the native accessible actions. (I know I've done it). 

If your app has a table view with custom delete actions. Open your app, turn on VoiceOver, select a cell and use the "Rotor" to see if the "Actions" item is there. If it's not, then you (just as I had done) have probably broken the native behavior.

---

To get this behavior back I created an new Master-Detail Application and changed the code until I had broken it, so that I knew how to turn it off so that I could make the same changes in reverse in the real app. It's actually quite simple:

 1. The row needs to be editable
 2. There needs to be able a way to handle the deletion.

This is what these things mean in code:

# 1. The row needs to be editable

The table view data source needs to return YES for `tableView:canEditRowAtIndexPath:`. If this doesn't work well together with the custom implementation, we can return `NO` when VoiceOver is off and return `YES` otherwise for rows that should be deletable.

{% highlight objc %}
- (BOOL)tableView:(UITableView *)tableView canEditRowAtIndexPath:(NSIndexPath *)indexPath
{
    // If this conflicts with the custom gesture / control 
    // you can return NO when VoiceOver is not running.
    if (!UIAccessibilityIsVoiceOverRunning()) {
        return NO;
    }
    
    BOOL shouldBeEditable = /* Determine if the cell should be deletable or not (based on your business logic) */;
    return shouldBeEditable;
}
{% endhighlight %}

# 2. There needs to be able a way to handle the deletion.

If there isn't a way to handle the deletion, UIKit will not add the Actions to the Rotor. Unsurprisingly, this is done in just the same way that the swipe-to-delete feature, by implementing `-tableView:commitEditingStyle:forRowAtIndexPath:`. It's even documented in (not the Rotor part, but the swipe-to-delete part)

> To enable the swipe-to-delete feature of table views (wherein a user swipes horizontally across a row to display a Delete button), you must implement this method.

---

From what I've seen, these two steps are all it takes to re-enable the native delete action in a table view that uses a custom gesture / control to delete cells.
 
