---
layout: post
title: "Thoughts on iOS Accessibility"
description: "
With discussions on custom controls versus standard controls and if Apple is doing enough to make iOS fully accessible, I wanted to contribute with my experiences and my thoughts on all of this as a developer in Apple's ecosystem. "
category: 
tags: [Opinions, Accessibility] 
---

With discussions on custom controls versus [standard controls][standard] and [if Apple is doing enough to make iOS fully accessible][review], I wanted to contribute with my experiences and my thoughts on all of this as a developer in Apple's ecosystem. 

Some resources online will tell you that all you need to do to be accessible is to label all your elements and you will be fine, while others will tell you that it's a lot of work to make an app accessible. In reality it's never black and white like that. An app isn't either accessible or not. There are many ways for an app to be unaccessible to the point where it's completely unusable but there is also a difference between usable, easy to use, and intuitive. I'll get back to that last one.

As a non-native English speaker, I read the word "accessible" as "capable of being accessed," meaning that it's _useable_. It's much better than the Swedish word which literally would be translated into "adapted for the disabled". That is pretty much saying that it was built first, with accessibility tacked on afterwards. I much prefer [Natalia Berdys][@batalia]'s term "inclusive design," which puts usability for _everyone_ front and center. 

If it wasn't obvious by [the opening video to WWDC 2012][wwdc12] or Tim Cook [saying that he doesn't consider “the bloody ROI.”][ROI],  Apple is not only taking accessibility very seriously but they _care_. The standard controls on both OS X and iOS offer really great and powerful interaction whether or not you can see what's on the screen. And they keep improving year after year. For example, did you know that as of iOS 7, handwriting recognition is one of the built-in [input methods for text][text input]? That convenience features like swipe-to-delete works with VoiceOver? That the camera app will tell you [how many faces are in the shot][camera]?

Perhaps Apple's biggest fault is not pushing developers on their platform to care as much as they do. 

As developers, we get a lot of great accessibility in our apps for free-ish just by using standard controls. These controls behave and work well, but they are general controls and they still need context so that the user can make sense of the information they represent. For example, the standard slider control can be used to represent many things, and the value "57" can mean almost anything. By labeling the slider with "Volume" and the value as "57%", there is context to the information that the slider represents (the volume). 

But standard controls don't always look, feel, or behave as what we have in mind for our apps. It's hard enough to become a hit in the App Store, and having to look plain or uncostumized makes it even more difficult. Sometimes we can subclass and customize a standard control which means that we get to build on top of what's already there. But sometimes there isn't a standard control that does what we want so even if we wanted to use one, we couldn't. Custom controls is a reality and is always going to be. As with everything else, it's not black and white. Apps will use some standard controls and some custom controls and the ratio is going to differ from app to app.

I, _personally_, believe that developers don't just _choose_ to ignore accessibility in the controls and apps that they build. It's about not knowing that it even exists and (once we know that) knowing how it should work. Most of us use our devices extensively but very, very few developers _rely_ on these features. There is good documentation and an entire programming guide dedicated to accessibility on iOS. But if StackOverflow has tought me one thing, it's that developers don't like reading documentation. Just because the information is out there doesn't mean that people find it. And unless it's something you encounter, how would you know to even look for it? That's why I think that it's great that this is being discussed very heavily right now, even though mainstream media's headlines tend to be a bit sensationalistic. It raises awareness. 

I've written apps that weren't accessible. I've written apps with missing labels on everything where it wasn't the side effect of customizing a standard control. Even today, after being well accustomed with the APIs and being able to navigate through a couple of apps without looking at my phone (or with screen curtain turned on), I still don't know how an app or a custom control should behave. I know what I can do and how to do it, but I don't know what I _should_ do. I don't know how a _real_ user of the app would expect it to work. You could say that we are all "real" users of our apps, but in this case I would disagree. I am a "fake" VoiceOver user. I don't use it enough to have a feeling of what works well in different situations. In fact, I would argue that I know enough to be dangerous, sometimes making decisions with confidence that turn out do be the opposite of what people wanted.

That is why I decided to ask for feedback (of course asking for permission to do so first) from the community of blind and low-vision users. It's too early to tell how it's going to work in the long run but the communication so far has been great[^me] both externally and internally. It has already tought me new things and I hope that it will continue to do so. 

[^me]: The only possible downside I've seen so far is that for the first time I feel that I might need to say that what you read on this blog, twitter, and even than forum thread where I asked for feedback is all me and my own opinions and not necessary my employer's.

Little over a year ago, the CocoaHeads group in Stockholm had a meet up about accessibility where [Marthin][@marthinfreij] (the organizer) had invited a blind user to talk about _using_ these features. It had such an impact on me that I wrote [a blog post][drawRect] about accessibility on my way home and published it the very next day. If you are running or regularly attending a meet up yourself, you could do the same thing. And if you are a user, you can look for local meet ups and see if you can come and talk. I'm sure that everyone involved will be very happy with it. 

[This year at WWDC][intuitive] and previous years, Apple talked about intuitive user experiences. Part of making an intuitive experience is to be familiar and follow platform conventions. The same is true, possibly even more so, when it comes to accessibility. The system, Apple's apps and the standard controls work the same way and provide a consistent and familiar experience to the user. By mimicking the behavior of these apps and controls, our apps can meet the user's expectations and in doing so, create an app that behaves as they expect it to. 

There are of course lots of subtleties that are hard to get right the first, or even second time around. But without looking at these apps for guidance, I don't see how we can be platform savvy and create an experience that the user expects. It's what we do when we design the graphical interface so why not do the same when we are designing for everyone? 

---

My point in writing this is to do what I can to spread the word that this is something we need to care about in the developer community. 

If you are new to accessibility on iOS, there are plenty of good resources out there. Matt Gemmell wrote [a great overview][gemmell] a couple of years back, Mattt Thompson has [a more developer focused overview][nshipster], there are [plenty of WWDC sessions][videos] about accessibility, and there is of course the [Accessibility Programming Guide for iOS][programmingGuide].

As for my part, I know from my own experience that it can be hard knowing both what to do and how to do it. So I'm doing two smaller blog posts alongside this one, that aim to cover what the native experience is and how to implement it. I don't currently know what a third post would be about (maybe about keyboard keys or text input), but once I do it will likely follow the same format.
 


[standard]: http://inessential.com/2014/07/10/standard_controls
[review]: http://www.marco.org/2014/07/10/app-review-should-test-accessibility
[@batalia]: https://twitter.com/batalia
[text input]: https://www.apple.com/au/accessibility/ios/voiceover/
[ROI]: http://www.theguardian.com/environment/2014/mar/03/tim-cook-climate-change-sceptics-ditch-apple-shares
[wwdc12]: https://www.youtube.com/watch?v=Cx0KocApWjQ
[camera]: https://www.apple.com/ios/accessibility-tips/
[@marthinfreij]: https://twitter.com/marthinfreij
[drawRect]: http://ronnqvi.st/making-drawrect-accessible/
[intuitive]: https://developer.apple.com/videos/wwdc/2014/

[gemmell]: http://mattgemmell.com/accessibility-for-iphone-and-ipad-apps/
[nshipster]: http://nshipster.com/uiaccessibility/
[programmingGuide]: https://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/iPhoneAccessibility/Introduction/Introduction.html
[videos]: http://asciiwwdc.com/search?q=accessibility
