---
layout: post
title: "Optimized for Touch"
description: "In todays world of mobile devices with touch screens we all know that we shouldn't make interface elements to small or pack them to close to each other because they will be hard to hit but some elements just look bulky when we try and make them bigger. In those cases we can use transparency to get small elements with big tappable areas."
category: 
tags: [UIKit]
---

In todays world of mobile devices with touch screens we all know that we shouldn't make interface elements to small or pack them too close to each other because they will be hard to hit. [The HIG][hig] clearly says that they shouldn't be any smaller than 44 by 44 points.

> 44 x 44 points is the comfortable minimum size of a tappable UI element.

# Making small things big

In some cases though, what we are drawing on screen is much smaller than that. In such cases we use transparency and cheat! We can make a big, mostly transparent interface element with a small visible element in the center. The full transparent area will be the touch target without the element looking big and bulky. Take for example the native slider and page control. Both of these are visually much smaller than 44 points and still you don't get frustrated trying to tap on them[^tapOnPageControl]. 

There are many ways for you to achieve the same thing with your own customized controls. For single icon buttons it's as easy as giving the button a larger size. The image is going to stay centered making it look like a small button but it will have a large tappable area.

    CGRect tappableRect = CGRectMake(50, 100, 44, 44);
    UIButton *settings = [[UIButton alloc] initWithFrame:tappableRect];
    [settings setImage:[UIImage imageNamed:@"gear"]
              forState:UIControlStateNormal];
              
<figure>
<div role="img" aria-label="An icon that looks like a gear. To the left, only the icon. To the right, the gear together with a minimal tappable area." style="margin-bottom: 46%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 217 99" width="100%">
<path d="M36.1521201,52.3932622 C35.7787193,52.3932622 35.4120985,52.364445 35.0543921,52.3089289 L33.2067637,55.2944117 L29.8271816,53.6460794 L31.0784461,50.2539848 C30.6424803,49.8055166 30.2662914,49.2994043 29.9626151,48.7482893 L26.2724738,49.2175933 L25.4266287,45.5538356 L29.1914368,44.2756972 C29.2789656,43.7347476 29.428941,43.2145217 29.6337939,42.7225284 L26.7517507,39.8653114 L29.1180769,36.9431419 L32.6991597,39.2908096 C33.0613567,39.0884377 33.4433935,38.9169159 33.8416444,38.7798397 L34.2720553,34.507041 L38.0321849,34.507041 L38.4625957,38.7798397 C38.8608373,38.9169126 39.2428655,39.0884296 39.6050805,39.2908096 L43.1861633,36.9431419 L45.5524894,39.8653114 L42.6704467,42.7225281 C42.8752988,43.2145209 43.0252751,43.73475 43.1128031,44.2756971 L46.8776115,45.5538356 L46.0317664,49.2175933 L42.3416267,48.7482895 C42.0379488,49.2994037 41.6617593,49.8055151 41.2257929,50.2539817 L42.4770586,53.6460794 L39.0974765,55.2944117 L37.2498481,52.3089288 C36.8921394,52.3644452 36.5255197,52.3932622 36.1521201,52.3932622 Z M36.1521201,47.7272914 C37.450034,47.7272914 38.5022011,46.6827784 38.5022011,45.3943061 C38.5022011,44.1058338 37.450034,43.0613207 36.1521201,43.0613207 C34.8542062,43.0613207 33.8020391,44.1058338 33.8020391,45.3943061 C33.8020391,46.6827784 34.8542062,47.7272914 36.1521201,47.7272914 Z M36.1521201,47.7272914" id="Oval 1" fill="#303841"></path>
        <path d="M161,23 L161,67 L205,67 L205,23 L161,23 Z M161,23" id="Rectangle 8" stroke="#FCB829" stroke-width="2" fill-opacity="0.502154182" fill="#FCB829"></path>
        <path d="M183,52.3932622 C182.626599,52.3932622 182.259978,52.364445 181.902272,52.3089289 L180.054644,55.2944117 L176.675062,53.6460794 L177.926326,50.2539848 C177.49036,49.8055166 177.114171,49.2994043 176.810495,48.7482893 L173.120354,49.2175933 L172.274509,45.5538356 L176.039317,44.2756972 C176.126845,43.7347476 176.276821,43.2145217 176.481674,42.7225284 L173.599631,39.8653114 L175.965957,36.9431419 L179.54704,39.2908096 C179.909237,39.0884377 180.291273,38.9169159 180.689524,38.7798397 L181.119935,34.507041 L184.880065,34.507041 L185.310476,38.7798397 C185.708717,38.9169126 186.090745,39.0884296 186.45296,39.2908096 L190.034043,36.9431419 L192.400369,39.8653114 L189.518327,42.7225281 C189.723179,43.2145209 189.873155,43.73475 189.960683,44.2756971 L193.725491,45.5538356 L192.879646,49.2175933 L189.189507,48.7482895 C188.885829,49.2994037 188.509639,49.8055151 188.073673,50.2539817 L189.324938,53.6460794 L185.945356,55.2944117 L184.097728,52.3089288 C183.740019,52.3644452 183.3734,52.3932622 183,52.3932622 Z M183,47.7272914 C184.297914,47.7272914 185.350081,46.6827784 185.350081,45.3943061 C185.350081,44.1058338 184.297914,43.0613207 183,43.0613207 C181.702086,43.0613207 180.649919,44.1058338 180.649919,45.3943061 C180.649919,46.6827784 181.702086,47.7272914 183,47.7272914 Z M183,47.7272914" id="Oval 1 copy" fill="#303841"></path>
        <text id="visible on sceen" fill="#000000" font-family="Avenir Next" font-size="18" font-weight="normal" x="0" y="20.5879517">
            <tspan>visible on sceen</tspan>
        </text>
        <text id="tappable area" fill="#FCB829" font-family="Avenir Next" font-size="18" font-weight="normal" x="104" y="93.5879517">
            <tspan>tappable area</tspan>
        </text>
</svg>
</div>
</div>
</figure>
<figcaption>The larger tappable area of a small button with a single image.</figcaption>

All cases may not be as easy as simply making the control bigger. Perhaps custom drawing depends on the frame it is being drawn into or the control has a visible background that shouldn't be any bigger. Custom drawing can be done in a smaller rectangle by using `CGRectInset(rect, x, y)` before the drawing code to create a smaller rectangle to get the measurements from.

For the case with backgrounds and other such elements, we *could* (but shouldn't) wrap the control in another view and attach gesture recognizers and actions for control events to it. This would work since we could let still let the original control be the target for those messages. However, it's much better for encapsulation to make the control itself bigger and have smaller private subviews for backgrounds, etc. that depend on the size of the control. That way nothing outside of the control need to know about these details.

	- (id)initWithFrame:(CGRect)aRect {
        self = [super initWithFrame:aRect];
        if (self) {
            CGRect smallerRect = CGRectInset(aRect, 5, 5);
            _background = [[UIImageView alloc] initWithFrame:smallerRect]; 
            _background.image = [UIImage imageNamed:@"background"];
            [self addSubview:_background];
        }
        return self;
    }

[^tapOnPageControl]: If you didn't know that you *can* tap on a page control, now you know. It matters if you tap on the left or right side of it.

# One step further

Looking back at what the HIG really says about touch targets, the  *minimum* comfortable size is 44 by 44 points. We can make them even bigger if we want to and make them slightly easier to hit. Microsoft has [some interesting numbers about touch sizes and successful hit percentages][msft] in their documentation for Windows 8 apps. They found that for a 5 by 5 mm touch target about 3% of the touches missed. Similarly for a 7 by 7 mm target about 1% missed and for a 9 by 9 mm target about 0.5% missed. Let's quickly translate these into points sizes[^mm].

[^mm]: All measurements are in mm since there is no predefined screen resolution for Windows tablets.

The original iPhone had a 163 dpi display. The retina versions have more pixels but the same number of *points* per inch. 25.4 mm per inch divided by 163 points per inch gives a point size of 0.1558282 mm. This gives us the sizes in points:

<table style="margin: 0 auto 25px;">
<tr>
	<td style="text-align:left;">5 mm</td>
	<td style="text-align:left;">≈</td>
	<td style="text-align:left;">32 points</td>
</tr>
<tr>
	<td style="text-align:left;">7 mm</td>
	<td style="text-align:left;">≈</td>
	<td style="text-align:left;">45 points</td>
</tr>
<tr>
	<td style="text-align:left;">9 mm</td>
	<td style="text-align:left;">≈</td>
	<td style="text-align:left;">58 points</td>
</tr>
</table>


Some may point out that the original iPad actually have a lower amount of points per inch which means that we *could* make smaller elements and have the same "precision". However, since the iPad has a physically larger display the finger moves over a larger distances making taps more imprecise. Also, the iPad mini has the same resolution as the original iPhone so unless you want to upset all the mini owners out there it is better to stick with the same *point sizes* for both iPhone and iPad.

Using the exact same approaches as above we could make elements even bigger as long as there is room on the screen. If you make the size just right, users won't notice the difference but only be pleasantly surprised that they hit the buttons they are tapping. If however you make these elements way to big then users are going to notice what you are doing and the illusion is broken. 

The "optimal" size for a control depends on many things like proximity to other elements, shape and the type of interaction (tap vs gesture) so there isn't really one magical number I can give you. The only way to find what works best for you is to test many different sizes and see what *feels* right. 

# Off-center

In some cases the touch area can't be in all directions as it might overlap with other touch areas. Instead of just cutting away the overlap we can sometimes move the two views apart, giving them their full size. 

In my own experience, we as users make *slight* adjustments (only a few points) when trying to hit two small elements that are close to each other compared to if the same elements are far from each other. If there is plenty of space we tend to aim for the center but if they are close to each other we tend to over-compensate slightly and aim for the edge that is furthest away from the other element to avoid hitting it. 

<figure>
<div role="img" aria-label="An illustration that when two small icons are far from each other the user tend to aim for the center of each icon but if two small icons are close to each other then the user aims for the side that is furthest away from the other icon." style="margin-bottom: 73%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 180 131" width="100%">
<path d="M38.9999997,41.5 L31.3587923,45.5172214 L32.8181327,37.0086107 L26.6362652,30.9827794 L35.1793971,29.7413886 L39.0000002,22 L42.8206055,29.7413906 L51.3637368,30.9827855 L45.1818667,37.0086123 L46.6412074,45.5172216 L38.9999997,41.5 Z M38.9999997,41.5" id="Star 1" fill="#FCB829"></path>
        <path d="M144.5,46 C149.194421,46 153,42.6421358 153,38.5 C153,34.3578642 147,27 144.5,23 C142,27 136,34.3578642 136,38.5 C136,42.6421358 139.805579,46 144.5,46 Z M144.5,46" id="Oval 1" fill="#52A6E1"></path>
        <g id="Group" transform="translate(30.000000, 26.000000)" stroke-width="2">
            <path d="M9,15 C12.3137087,15 15,12.3137087 15,9 C15,5.68629134 12.3137087,3 9,3 C5.68629134,3 3,5.68629134 3,9 C3,12.3137087 5.68629134,15 9,15 Z M9,15" id="Oval 2" stroke="#303841" fill="none"></path>
            <path d="M8.99999993,0.426208467 L8.99999976,4.44072255 M17.6411742,9.0673829 L13.6266601,9.06738272 M8.99999976,17.7085572 L8.99999993,13.6940431 M0.358825502,9.06738272 L4.37333958,9.0673829" id="Line" stroke="#2F3740" stroke-linecap="square"></path>
        </g>
        <path d="M73.9999997,126.5 L66.3587923,130.517221 L67.8181327,122.008611 L61.6362652,115.982779 L70.1793971,114.741389 L74.0000002,107 L77.8206055,114.741391 L86.3637368,115.982786 L80.1818667,122.008612 L81.6412074,130.517222 L73.9999997,126.5 Z M73.9999997,126.5" id="Star 1 copy" fill="#FCB829"></path>
        <path d="M112.5,131 C117.194421,131 121,127.642136 121,123.5 C121,119.357864 115,112 112.5,108 C110,112 104,119.357864 104,123.5 C104,127.642136 107.805579,131 112.5,131 Z M112.5,131" id="Oval 1 copy" fill="#52A6E1"></path>
        <g id="Group copy" transform="translate(61.000000, 111.000000)" stroke-width="2">
            <path d="M9,15 C12.3137087,15 15,12.3137087 15,9 C15,5.68629134 12.3137087,3 9,3 C5.68629134,3 3,5.68629134 3,9 C3,12.3137087 5.68629134,15 9,15 Z M9,15" id="Oval 2" stroke="#303841" fill="none"></path>
            <path d="M8.99999993,0.426208467 L8.99999976,4.44072255 M17.6411742,9.0673829 L13.6266601,9.06738272 M8.99999976,17.7085572 L8.99999993,13.6940431 M0.358825502,9.06738272 L4.37333958,9.0673829" id="Line" stroke="#2F3740" stroke-linecap="square"></path>
        </g>
        <text id="aims for the center" fill="#2F3740" font-family="Avenir Next" font-size="14" font-weight="normal" x="14" y="15">
            <tspan>aims for the center</tspan>
        </text>
        <text id="avoids the other but" fill="#2F3740" font-family="Avenir Next" font-size="14" font-weight="normal" x="10" y="100">
            <tspan>avoids the other button</tspan>
        </text>
</svg>
</div>
</div>
</figure>
<figcaption>An illustration of how we as users sometimes overcompensates slightly when two elements are close to each other.</figcaption>

For users who do this we can extend the touch targets more on the side that is furthest away from the other control. We can use `CGRectIntersection(frame1, frame2)` to get the amount of overlap for the two frames and use that to position them side by side. This will visually move them apart so we need to move their content back together again. If the visual elements of the controls are subviews of the main control view (as described above) then we can shift the view in one direction and the visual elements in the other direction using the `transform` and `sublayerTransform` properties of the main views layer.

    CGRect overlap = CGRectIntersection(leftView.frame, rightView.frame);
    CGFloat xOverlap = CGRectGetWidth(overlap);
    
    CATransform3D moveLeft  = CATransform3DMakeTranslation(-xOverlap/2.0, 0, 0);
    CATransform3D moveRight = CATransform3DInvert(moveLeft);
    
    leftView.layer.transform = moveLeft;
    leftView.layer.sublayerTransform = moveRight;
    
    rightView.layer.transform = moveRight;
    rightView.layer.sublayerTransform = moveLeft;
    
The image below shows the break down of the nudge back and forth.

<figure>
<div role="img" aria-label="Two icons that are close to each other and have tappable areas that overlap. The tappable areas are then moved apart so that they don't overlap. The icons are then moved back together so that they end up in the initial position." style="margin-bottom: 79%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 280 220" width="100%">
<path d="M80,6 L80,50 L124,50 L124,6 L80,6 Z M80,6" id="Rectangle 1" stroke="#FCB829" stroke-width="2" fill-opacity="0.502154182" fill="#FCB829"></path>
        <path d="M116,6 L116,50 L160,50 L160,6 L116,6 Z M116,6" id="Rectangle 1 copy" stroke="#FCB829" stroke-width="2" fill-opacity="0.502154182" fill="#FCB829"></path>
        <path d="M102,34.5 L94.3587923,38.5172214 L95.8181327,30.0086107 L89.6362652,23.9827794 L98.1793971,22.7413886 L102,15 L105.820606,22.7413906 L114.363737,23.9827855 L108.181867,30.0086123 L109.641207,38.5172216 L102,34.5 Z M102,34.5" id="Star 1 copy" fill="#303841"></path>
        <path d="M138.5,39 C143.194421,39 147,35.6421358 147,31.5 C147,27.3578642 141,20 138.5,16 C136,20 130,27.3578642 130,31.5 C130,35.6421358 133.805579,39 138.5,39 Z M138.5,39" id="Oval 1 copy" fill="#303841"></path>
        <path d="M75,85 L75,129 L119,129 L119,85 L75,85 Z M75,85" id="Rectangle 1 copy" stroke="#FCB829" stroke-width="2" fill-opacity="0.502154182" fill="#FCB829"></path>
        <path d="M121,85 L121,129 L165,129 L165,85 L121,85 Z M121,85" id="Rectangle 1 copy 2" stroke="#FCB829" stroke-width="2" fill-opacity="0.502154182" fill="#FCB829"></path>
        <path d="M95.9999997,113.5 L88.3587923,117.517221 L89.8181327,109.008611 L83.6362652,102.982779 L92.1793971,101.741389 L96.0000002,94 L99.8206055,101.741391 L108.363737,102.982786 L102.181867,109.008612 L103.641207,117.517222 L95.9999997,113.5 Z M95.9999997,113.5" id="Star 1 copy 2" fill="#303841"></path>
        <path d="M143.5,118 C148.194421,118 152,114.642136 152,110.5 C152,106.357864 146,99 143.5,95 C141,99 135,106.357864 135,110.5 C135,114.642136 138.805579,118 143.5,118 Z M143.5,118" id="Oval 1 copy 2" fill="#303841"></path>
        <path d="M75,168 L75,212 L119,212 L119,168 L75,168 Z M75,168" id="Rectangle 1 copy 2" stroke="#FCB829" stroke-width="2" fill-opacity="0.502154182" fill="#FCB829"></path>
        <path d="M121,168 L121,212 L165,212 L165,168 L121,168 Z M121,168" id="Rectangle 1 copy 3" stroke="#FCB829" stroke-width="2" fill-opacity="0.502154182" fill="#FCB829"></path>
        <path d="M102,196.5 L94.3587923,200.517221 L95.8181327,192.008611 L89.6362652,185.982779 L98.1793971,184.741389 L102,177 L105.820606,184.741391 L114.363737,185.982786 L108.181867,192.008612 L109.641207,200.517222 L102,196.5 Z M102,196.5" id="Star 1 copy 3" fill="#303841"></path>
        <path d="M138.5,201 C143.194421,201 147,197.642136 147,193.5 C147,189.357864 141,182 138.5,178 C136,182 130,189.357864 130,193.5 C130,197.642136 133.805579,201 138.5,201 Z M138.5,201" id="Oval 1 copy 3" fill="#303841"></path>
        <path d="M113.5,0.5 L113.5,219.502289" id="Line" stroke="#52A6E1" stroke-linecap="round"></path>
        <path d="M73.5,0.5 L73.5,219.502289" id="Line copy" stroke="#52A6E1" stroke-linecap="round"></path>
        <text id="move layers apart" fill="#000000" font-family="Avenir Next" font-size="14" font-weight="normal" x="121" y="81.1239624">
            <tspan>move layers apart</tspan>
        </text>
        <text id="move sublayers toget" fill="#000000" font-family="Avenir Next" font-size="14" font-weight="normal" x="121" y="163.623962">
            <tspan>move sublayers together</tspan>
        </text>
</svg>
</div>
</div>
</figure>
<figcaption>An illustration of how the layers are translated apart and their sublayers translated back together.</figcaption>

Just as with growing the tappable areas: if you go to far users are going to notice and it's going to feel really strange instead. Experimentation is the key to finding what works in your app but you probably shouldn't go much further than 6 or so points (about 1 mm).

- - - - - - - - - - - 

All of this doesn't apply to all controls in all apps and having to play tricks with visual elements to make them easier to touch can be though of as a "design smell". That said, I have used this technique in previous projects and generally been happy with the results. Further more, I find that thinking about the tappable areas help make an interface that is less annoying to use. 

Do you disagree with me? Great! Tell me all about it on [twitter][twitter]! I'd love to hear your opinions on the topic.


[hig]: http://developer.apple.com/library/ios/documentation/UserExperience/Conceptual/MobileHIG/Characteristics/Characteristics.html#//apple_ref/doc/uid/TP40006556-CH7-SW1 (iOS Human Interface Guidelines: Platform Characteristics)

[msft]: http://msdn.microsoft.com/en-us/library/windows/apps/hh465415.aspx (Touch interaction design for Windows Store apps)

[twitter]: https://twitter.com/davidronnqvist (@davidronnqvist on Twitter) 