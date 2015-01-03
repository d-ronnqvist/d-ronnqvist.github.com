---
layout: post
title: "About the anchorPoint"
description: "While browsing Stack Overflow over the past few weeks there was many occasions when I wanted to say: “Go read this blog post about the anchorPoint, it will explain things to you.” Luckily I can say that now."
category: 
tags: [CoreAnimation]
---


We're all familiar with the geometry of views. Usually we interact with them by setting or getting the frame to have the view appear where we want it on screen. The frame is actually a derived property, stored as the bounds and center of the view. When you set the frame of a view it sets the bounds and the center and when you later ask for the frame it gets calculated from those values. 

Layers work almost the same, they have properties for the frame (derived), bounds, position and anchor point. By default the anchor point is in the center of the layer, in which case the position corresponds to the center property of the view. But the anchor point can be moved and then the above statement is no longer true. 

The anchor point is defined in the unit coordinate space of the bounds which means that its x and y value both go from 0 to 1 within the bounds of the layer. The x value is 0 at the left edge of the layer and 1 at the right edge and similarly for the y value. Note that the screen coordinate space is different between iOS and OS X. On iOS, y increases downwards while it increases upwards on OS X. So the anchor point (0, 0) is either in the _top_ left or _bottom_ left depending on your platform. 

#Why is there an anchor point?

All transforms are applied relative to the anchor point, by default it is the center of the layer.  Scaling down makes the layer shrink in all directions keeping the same position. Applying a rotation makes the view turn around the center. This is the same behavior as you get when applying an affine transform on a view but layers are more powerful than that. If the anchor point was changed to the lower left corner and the same scale and rotation transforms were applied we would get very different effects.

<figure>
<div role="img" aria-label="How changing the anchor point affects scaling." style="margin-bottom: 45%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 395 97" width="100%">
<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
    <g id="Layer" sketch:type="MSLayerGroup" transform="translate(2.000000, 2.000000)">
        <path d="M0,0 L151.616,0 L151.616,87.7289 L0,87.7289 L0,0 L0,0 Z" id="Shape" stroke="#BAC0C5" stroke-width="3" stroke-dasharray="5" sketch:type="MSShapeGroup"></path>
        <text id="before" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="7.3788" y="20.96448">before</tspan>
        </text>
        <path d="M33.7307,19.4001 L117.676,19.4001 L117.676,68.1142 L33.7307,68.1142 L33.7307,19.4001 L33.7307,19.4001 Z" id="Shape" stroke="#FCB92C" stroke-width="3" fill-opacity="0.8" fill="#FEE3AB" sketch:type="MSShapeGroup"></path>
        <text id="after" fill="#FCB92C" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="37.9449" y="41.66519">after</tspan>
        </text>
        <path d="M147.372,3.49095 L125.008,15.9395" id="Shape" stroke="#4A4A4A" stroke-width="3" sketch:type="MSShapeGroup"></path>
        <path d="M135.234,17.6999 L120.514,17.8856 L129.194,5.7952 L135.234,17.6999 L135.234,17.6999 Z" id="Shape" fill="#4A4A4A" sketch:type="MSShapeGroup"></path>
        <path d="M69.6394,43.666 C69.6394,41.0314 71.7752,38.8955 74.4099,38.8955 C77.0445,38.8955 79.1803,41.0314 79.1803,43.666 C79.1803,46.3007 77.0445,48.4365 74.4099,48.4365 C71.7752,48.4365 69.6394,46.3007 69.6394,43.666 L69.6394,43.666 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3" sketch:type="MSShapeGroup"></path>
        <path d="M16.2663,69.9146 L30.9553,68.933 L22.9417,81.4752 L16.2663,69.9146 L16.2663,69.9146 Z" id="Shape" fill="#4A4A4A" sketch:type="MSShapeGroup"></path>
        <path d="M26.5505,71.8459 L3.3877,84.8665" id="Shape" stroke="#4A4A4A" stroke-width="3" sketch:type="MSShapeGroup"></path>
        <path d="M239.292,0 L390.908,0 L390.908,87.7289 L239.292,87.7289 L239.292,0 L239.292,0 Z" id="Shape" stroke="#BAC0C5" stroke-width="3" stroke-dasharray="5" sketch:type="MSShapeGroup"></path>
        <text id="before" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="246.671" y="20.96448">before</tspan>
        </text>
        <path d="M239.338,39.0004 L323.283,39.0004 L323.283,87.7145 L239.338,87.7145 L239.338,39.0004 L239.338,39.0004 Z" id="Shape" stroke="#FCB92C" stroke-width="3" fill-opacity="0.8" fill="#FEE3AB" sketch:type="MSShapeGroup"></path>
        <text id="after" fill="#FCB92C" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="243.552" y="61.26559">after</tspan>
        </text>
        <path d="M386.664,3.49095 L333.618,33.7647" id="Shape" stroke="#4A4A4A" stroke-width="3" sketch:type="MSShapeGroup"></path>
        <path d="M340.749,37.0196 L326.029,37.2053 L334.709,25.1149 L340.749,37.0196 L340.749,37.0196 Z" id="Shape" fill="#4A4A4A" sketch:type="MSShapeGroup"></path>
        <path d="M239.771,83.0878 C242.405,83.0878 244.541,85.2237 244.541,87.8583 C244.541,90.493 242.405,92.6288 239.771,92.6288 C237.136,92.6288 235,90.493 235,87.8583 C235,85.2237 237.136,83.0878 239.771,83.0878 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3" sketch:type="MSShapeGroup"></path>
    </g>
</g>
</svg>
</div>
</div>
</figure>
<figcaption>How changing the anchor point affects scaling.</figcaption>


<figure>
<div role="img" aria-label="How changing the anchor point affects rotation." style="margin-bottom: 50%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 473 187" width="100%">
<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
    <g id="rotation" sketch:type="MSLayerGroup" transform="translate(2.000000, 1.000000)">
        <path d="M0,64.568 L151.616,64.568 L151.616,152.297 L0,152.297 L0,64.568 L0,64.568 Z" id="Shape" stroke="#BAC0C5" stroke-width="3" stroke-dasharray="5" sketch:type="MSShapeGroup"></path>
        <text id="before" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="7.3788" y="85.5325">before</tspan>
        </text>
        <path d="M31.7882,184 L31.7882,32.6503 L119.618,32.6503 L119.618,184 L31.7882,184 L31.7882,184 Z" id="Shape" stroke="#FCB92C" stroke-width="3" fill-opacity="0.8" fill="#FEE3AB" sketch:type="MSShapeGroup"></path>
        <text id="after" fill="#FCB92C" sketch:type="MSTextLayer" transform="translate(45.357100, 147.228500) rotate(-90.000000) translate(-45.357100, -147.228500) " font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="15.1286" y="153.7285">after</tspan>
        </text>
        <path d="M68.7121,100.896 L54.9559,106.14 L58.9415,91.8001 L68.7121,100.896 L68.7121,100.896 Z" id="Shape" fill="#4A4A4A" sketch:type="MSShapeGroup"></path>
        <path d="M70.429,107.741 C70.429,105.106 72.5648,102.97 75.1995,102.97 C77.8341,102.97 79.9699,105.106 79.9699,107.741 C79.9699,110.375 77.8341,112.511 75.1995,112.511 C72.5648,112.511 70.429,110.375 70.429,107.741 L70.429,107.741 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3" sketch:type="MSShapeGroup"></path>
        <path d="M62.9824,97.023 C65.5156,94.529 68.886,92.8506 72.6992,92.4709 C81.5672,91.5877 89.4721,98.061 90.3552,106.929 C90.9823,113.225 87.9011,119.036 82.8873,122.193" id="Shape" stroke="#4A4A4A" stroke-width="3" sketch:type="MSShapeGroup"></path>
        <path d="M317.707,64.5415 L469.323,64.5415 L469.323,152.27 L317.707,152.27 L317.707,64.5415 L317.707,64.5415 Z" id="Shape" stroke="#BAC0C5" stroke-width="3" stroke-dasharray="5" sketch:type="MSShapeGroup"></path>
        <text id="before" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="325.086" y="85.506">before</tspan>
        </text>
        <path d="M229.978,152.262 L229.978,0.91252 L317.808,0.91252 L317.808,152.262 L229.978,152.262 L229.978,152.262 Z" id="Shape" stroke="#FCB92C" stroke-width="3" fill-opacity="0.8" fill="#FEE3AB" sketch:type="MSShapeGroup"></path>
        <text id="after" fill="#FCB92C" sketch:type="MSTextLayer" transform="translate(243.547000, 111.859500) rotate(-90.000000) translate(-243.547000, -111.859500) " font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="209.6875" y="118.3595">after</tspan>
        </text>
        <path d="M311.52,145.078 L297.764,150.321 L301.75,135.981 L311.52,145.078 L311.52,145.078 Z" id="Shape" fill="#4A4A4A" sketch:type="MSShapeGroup"></path>
        <path d="M313.237,151.922 C313.237,149.287 315.373,147.151 318.008,147.151 C320.642,147.151 322.778,149.287 322.778,151.922 C322.778,154.556 320.642,156.692 318.008,156.692 C315.373,156.692 313.237,154.556 313.237,151.922 L313.237,151.922 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3" sketch:type="MSShapeGroup"></path>
        <path d="M305.791,141.204 C308.324,138.71 311.694,137.032 315.508,136.652 C324.375,135.769 332.28,142.242 333.164,151.11 C333.791,157.406 330.709,163.217 325.696,166.374" id="Shape" stroke="#4A4A4A" stroke-width="3" sketch:type="MSShapeGroup"></path>
    </g>
</g>
</svg>
</div>
</div>
</figure>
<figcaption>How changing the anchor point affects rotation.</figcaption>


Layers also support 3D transforms so you could move the anchor point to the edge and apply a rotation around the y axis (hold your open hand straight up and twist it back and forth) to create an effect that looks like an opening door.

# But something else is happening...

If you've experimented with the anchor point before you may have been confused by one thing. When you change the anchor point, the layer actually moves as well. This is because the anchor point and the position is always the same point, only in different coordinate spaces (the anchor point in the bounds's unit coordinate space and the position in the super layer's coordinate space). Since the frame (where the layer appears on screen) is being calculated from the bounds, position and anchor point and only one of them changes then the frame will also have to change. 

<figure>
<div role="img" aria-label="How the frame changes when the anchor point changes." style="margin-bottom: 52%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 409 180" width="100%">
<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
    <g id="Layer_4" sketch:type="MSLayerGroup" transform="translate(0.000000, -4.000000)">
        <text id="superlayer" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="18" font-weight="420">
            <tspan x="234.982" y="47.018">superlayer</tspan>
        </text>
        <path d="M1.9198,25.015 L154.331,25.015 L154.331,150.071 L1.9198,150.071 L1.9198,25.015 L1.9198,25.015 Z" id="Shape" stroke="#BAC0C5" stroke-width="3" fill-opacity="0.327417346" fill="#BAC0C5" sketch:type="MSShapeGroup"></path>
        <text id="superlayer" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="18" font-weight="420">
            <tspan x="8.8657" y="47.018">superlayer</tspan>
        </text>
        <path d="M14.5664,75.526 L125.291,75.526 L125.291,139.014 L14.5664,139.014 L14.5664,75.526 L14.5664,75.526 Z" id="Shape" stroke="#FCB92C" stroke-width="3" fill-opacity="0.8" fill="#FEE3AB" sketch:type="MSShapeGroup"></path>
        <text id="layer" fill="#FCB92C" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="18" font-weight="420">
            <tspan x="20.051" y="94.612">layer</tspan>
        </text>
        <path d="M65.0641,107.978 C65.0641,105.343 67.1999,103.208 69.8346,103.208 C72.4692,103.208 74.6051,105.343 74.6051,107.978 C74.6051,110.613 72.4692,112.749 69.8346,112.749 C67.1999,112.749 65.0641,110.613 65.0641,107.978 L65.0641,107.978 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3" sketch:type="MSShapeGroup"></path>
        <path d="M380.448,25.015 L380.448,150.071 L228.036,150.071 L228.036,25.015 L380.448,25.015 Z" id="Shape" stroke="#BAC0C5" stroke-width="3" fill-opacity="0.327417346" fill="#BAC0C5" sketch:type="MSShapeGroup"></path>
        <path d="M296.006,44.851 L406.73,44.851 L406.73,108.339 L296.006,108.339 L296.006,44.851 L296.006,44.851 Z" id="Shape" stroke="#FCB92C" stroke-width="3" fill-opacity="0.8" fill="#FEE3AB" sketch:type="MSShapeGroup"></path>
        <text id="layer" fill="#FCB92C" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="18" font-weight="420">
            <tspan x="301.49" y="63.938">layer</tspan>
        </text>
        <path d="M291.181,107.978 C291.181,105.343 293.317,103.208 295.951,103.208 C298.586,103.208 300.722,105.343 300.722,107.978 C300.722,110.613 298.586,112.749 295.951,112.749 C293.317,112.749 291.181,110.613 291.181,107.978 L291.181,107.978 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3" sketch:type="MSShapeGroup"></path>
        <text id="anchor-point-=-(0.5,-0.5)" fill="#000000" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="15" font-weight="normal">
            <tspan x="0.8772" y="15.842">anchor point = (0.5, 0.5)</tspan>
        </text>
        <text id="anchor-point-=-(0.0," fill="#000000" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="15" font-weight="normal">
            <tspan x="226.891" y="15.842">anchor point = (0.0, 1.0)*</tspan>
        </text>
        <text id="*-=-iOS-coordinates" fill="#000000" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="15" font-weight="normal">
            <tspan x="232.754" y="182.848">* = iOS coordinates</tspan>
        </text>
    </g>
</g>
</svg>
</div>
</div>
</figure>
<figcaption>How the frame changes when the anchor point changes.</figcaption>


We can't have the anchor point move to the corner _and_ the frame stay the same without changing the position so that the frame calculations still are valid. We could calculate and set the correct position ourselves but if we know the frame then we can simply set it and have the correct position (given our anchor point) be calculated for us. Now the layer appears where we want it and the anchor point has moved to the corner.

It may seem strange and stupid that the frame should change if all you wanted was to change the point that the layer transforms relative to. You could argue over whether it makes more sense that the position changes or that the frame changes. You could also argue over whether or not the anchor point should affect the frame calculation at all. Couldn't the layer have a frame, bounds and center, just like the view so that the anchor point would only be related to the transform? If you stop and think about it for a while the current way starts to make more and more sense.

Say for example that you wanted to make an analog clock inside your app. After having set the anchor point of the hands, setting their position to anything _other_ than the center of the clock-face would simply feel wrong. The hands (in the coordinate space of the clock-face) are anchored in the center, just as they would be in the physical world. 

## Not only for transforms

As indicated by the clock example above, sometimes the center is not the anchor point you want to use. Have you ever subtracted half the width or height to calculate the position of that layer (or view)? By setting the anchor points to the edge and the positions to the same point you can align multiple layers no matter the size of their content. If the size increases or decreases you can still be sure that the views will stay aligned.

<figure>
<div role="img" aria-label="Three layers (or views) that are aligned using their anchor points" style="margin-bottom: 50%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 454 154" width="100%">
<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
    <g id="Layer_6" sketch:type="MSLayerGroup" transform="translate(0.500000, 1.000000)">
        <path d="M114.591,84.721 L205.562,84.721 L205.562,125.203 L114.591,125.203 L114.591,84.721 L114.591,84.721 Z" id="Shape" stroke="#BAC0C5" stroke-width="2.5" fill-opacity="0.327417346" fill="#BAC0C5" sketch:type="MSShapeGroup"></path>
        <text id="layer" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="18" font-weight="420">
            <tspan x="120.076" y="103.75">layer</tspan>
        </text>
        <path d="M362.122,83.455 L415.835,83.455 L415.835,138.604 L362.122,138.604 L362.122,83.455 L362.122,83.455 Z" id="Shape" stroke="#BAC0C5" stroke-width="2.5" fill-opacity="0.327417346" fill="#BAC0C5" sketch:type="MSShapeGroup"></path>
        <text id="layer" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="18" font-weight="420">
            <tspan x="367.606" y="102.485">layer</tspan>
        </text>
        <path d="M362.129,30.102 L452.001,30.102 L452.001,80.577 L362.129,80.577 L362.129,30.102 L362.129,30.102 Z" id="Shape" stroke="#BAC0C5" stroke-width="2.5" fill-opacity="0.327417346" fill="#BAC0C5" sketch:type="MSShapeGroup"></path>
        <text id="layer" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="18" font-weight="420">
            <tspan x="367.613" y="49.126">layer</tspan>
        </text>
        <path d="M287.917,13.632 L359.2,13.632 L359.2,151.002 L287.917,151.002 L287.917,13.632 L287.917,13.632 Z" id="Shape" stroke="#BAC0C5" stroke-width="2.5" fill-opacity="0.327417346" fill="#BAC0C5" sketch:type="MSShapeGroup"></path>
        <text id="layer" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="18" font-weight="420">
            <tspan x="294.222" y="33.894">layer</tspan>
        </text>
        <path d="M356.012,82.181 C356.012,79.546 358.148,77.41 360.783,77.41 C363.417,77.41 365.553,79.546 365.553,82.181 C365.553,84.816 363.417,86.951 360.783,86.951 C358.148,86.951 356.012,84.816 356.012,82.181 L356.012,82.181 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3" sketch:type="MSShapeGroup"></path>
        <path d="M170.29,0.936 L170.29,81.814 L114.586,81.814 L114.586,0.936 L170.29,0.936 Z" id="Shape" stroke="#BAC0C5" stroke-width="2.5" fill-opacity="0.327417346" fill="#BAC0C5" sketch:type="MSShapeGroup"></path>
        <text id="layer" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="18" font-weight="420">
            <tspan x="120.07" y="19.965">layer</tspan>
        </text>
        <path d="M0.88823,33.086 L111.613,33.086 L111.613,133.971 L0.88823,133.971 L0.88823,33.086 L0.88823,33.086 Z" id="Shape" stroke="#BAC0C5" stroke-width="2.5" fill-opacity="0.327417346" fill="#BAC0C5" sketch:type="MSShapeGroup"></path>
        <text id="layer" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="18" font-weight="420">
            <tspan x="6.3728" y="52.116">layer</tspan>
        </text>
        <path d="M108.317,83.533 C108.317,80.898 110.453,78.762 113.088,78.762 C115.722,78.762 117.858,80.898 117.858,83.533 C117.858,86.167 115.722,88.303 113.088,88.303 C110.453,88.303 108.317,86.167 108.317,83.533 L108.317,83.533 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3" sketch:type="MSShapeGroup"></path>
    </g>
</g>
</svg>
</div>
</div>
</figure>
<figcaption>Three layers (or views) that are aligned using their anchor points.</figcaption>

# iPhoto for iOS

iPhoto for iOS gives us two beautiful examples of rotation around non-center anchor points. When choosing what kind of effect to apply to an image, the effect controls fan out like a swatch book and on selection they rotate back leaving you with the selected effect control visible at the bottom of the screen. 

<figure>
<div role="img" aria-label="The swatch book of effects in iPhoto for iOS." style="margin-bottom: 60%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 382 255" width="100%">
<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
    <g id="iphoto-effects" sketch:type="MSLayerGroup" transform="translate(1.000000, 1.000000)">
        <g id="Layer_2" stroke="#4A4A4A" stroke-width="3" sketch:type="MSShapeGroup">
            <path d="M0.7971,222.834 L379.252,222.834" id="Shape"></path>
            <path d="M0.8387,0.78615 L378.958,0.78615 L378.958,248.225 L0.8387,248.225 L0.8387,0.78615 L0.8387,0.78615 Z" id="Shape"></path>
        </g>
        <g id="Layer_3" transform="translate(136.000000, 70.000000)" sketch:type="MSShapeGroup">
            <path d="M0.321,147.321 L3.141,129.572 L184.445,158.382 L181.625,176.13 L0.321,147.321 L0.321,147.321 Z" id="Shape" stroke="#FCB92C" stroke-width="2" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M6.506,116.454 L12.565,99.535 L185.396,161.428 L179.337,178.347 L6.506,116.454 L6.506,116.454 Z" id="Shape" stroke="#FCB92C" stroke-width="2" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M18.302,87.267 L27.39,71.763 L185.766,164.597 L176.678,180.101 L18.302,87.267 L18.302,87.267 Z" id="Shape" stroke="#FCB92C" stroke-width="2" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M35.3,60.77 L47.102,47.218 L185.542,167.78 L173.74,181.333 L35.3,60.77 L35.3,60.77 Z" id="Shape" stroke="#FCB92C" stroke-width="2" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M56.911,37.88 L71.02,26.748 L184.733,170.867 L170.624,181.999 L56.911,37.88 L56.911,37.88 Z" id="Shape" stroke="#FCB92C" stroke-width="2" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M82.388,19.3887 L98.315,11.0627 L183.366,173.75 L167.44,182.076 L82.388,19.3887 L82.388,19.3887 Z" id="Shape" stroke="#FCB92C" stroke-width="2" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M110.85,5.9366 L128.043,0.7046 L181.488,176.331 L164.296,181.563 L110.85,5.9366 L110.85,5.9366 Z" id="Shape" stroke="#FCB92C" stroke-width="2" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M164.635,166.44 C164.635,163.805 166.771,161.67 169.405,161.67 C172.04,161.67 174.176,163.805 174.176,166.44 C174.176,169.075 172.04,171.211 169.405,171.211 C166.771,171.211 164.635,169.075 164.635,166.44 L164.635,166.44 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3"></path>
        </g>
    </g>
</g>
</svg>
</div>
</div>
</figure>
<figcaption>The swatch book of effects in iPhoto for iOS.</figcaption>


There is a similar rotation for brushes. By default all brushes lie next to each other on the tool bar and when it comes to selecting a brush they all fan together. A rotation is applied to each brush and all their positions are changed to the same point. This makes them look like a fan. This example is slightly more advanced since it involved more movement (both position and rotation). When selecting a brush the rotation is reversed and each brush gets their own position again so that they end up next to each other.

<figure>
<div role="img" aria-label="The two states of the brushes in iPhoto for iOS." style="margin-bottom: 54%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 410 169" width="100%">
<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
    <g id="iphoto-brushes" sketch:type="MSLayerGroup" transform="translate(-1.000000, 0.000000)">
        <g id="Layer">
            <g id="Group" transform="translate(0.915450, 0.420000)"></g>
        </g>
        <g id="Layer_2" transform="translate(2.000000, 1.000000)" stroke-width="2" sketch:type="MSShapeGroup">
            <path d="M232.642,102.044 L407.354,102.044" id="Shape" stroke="#4A4A4A"></path>
            <path d="M370.615,87.809 L379.024,96.951 L328.02,143.867 L319.611,134.725 L370.615,87.809 L370.615,87.809 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M356.459,78.209 L367.009,84.767 L330.424,143.623 L319.874,137.066 L356.459,78.209 L356.459,78.209 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M340.251,72.749 L352.171,76.244 L332.674,142.745 L320.754,139.25 L340.251,72.749 L340.251,72.749 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M323.172,71.826 L335.593,72.003 L334.608,141.296 L322.187,141.119 L323.172,71.826 L323.172,71.826 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M306.47,75.509 L318.484,72.354 L336.083,139.383 L324.068,142.537 L306.47,75.509 L306.47,75.509 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M291.362,83.527 L302.094,77.272 L336.992,137.144 L326.26,143.399 L291.362,83.527 L291.362,83.527 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M278.953,95.297 L287.618,86.397 L337.268,134.744 L328.602,143.644 L278.953,95.297 L278.953,95.297 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M0.05391,102.044 L174.766,102.044" id="Shape" stroke="#4A4A4A"></path>
            <path d="M232.607,0.0494 L407.567,0.0494 L407.567,113.912 L232.607,113.912 L232.607,0.0494 L232.607,0.0494 Z" id="Shape" stroke="#4A4A4A"></path>
            <path d="M44.9184,97.513 L57.3401,97.513 L57.3401,166.814 L44.9184,166.814 L44.9184,97.513 L44.9184,97.513 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M47.846,160.686 C47.846,158.971 49.2363,157.581 50.9514,157.581 C52.6665,157.581 54.0568,158.971 54.0568,160.686 C54.0568,162.401 52.6665,163.792 50.9514,163.792 C49.2363,163.792 47.846,162.401 47.846,160.686 L47.846,160.686 Z" id="Shape" stroke="#46A5E2" fill-opacity="0.8" fill="#B5DBF3"></path>
            <path d="M59.8787,97.513 L72.3004,97.513 L72.3004,166.814 L59.8787,166.814 L59.8787,97.513 L59.8787,97.513 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M62.8063,160.686 C62.8063,158.971 64.1966,157.581 65.9117,157.581 C67.6268,157.581 69.0171,158.971 69.0171,160.686 C69.0171,162.401 67.6268,163.792 65.9117,163.792 C64.1966,163.792 62.8063,162.401 62.8063,160.686 L62.8063,160.686 Z" id="Shape" stroke="#46A5E2" fill-opacity="0.8" fill="#B5DBF3"></path>
            <path d="M74.3824,97.513 L86.8041,97.513 L86.8041,166.814 L74.3824,166.814 L74.3824,97.513 L74.3824,97.513 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M77.3099,160.686 C77.3099,158.971 78.7003,157.581 80.4154,157.581 C82.1304,157.581 83.5208,158.971 83.5208,160.686 C83.5208,162.401 82.1304,163.792 80.4154,163.792 C78.7003,163.792 77.3099,162.401 77.3099,160.686 L77.3099,160.686 Z" id="Shape" stroke="#46A5E2" fill-opacity="0.8" fill="#B5DBF3"></path>
            <path d="M89.0047,97.513 L101.426,97.513 L101.426,166.814 L89.0047,166.814 L89.0047,97.513 L89.0047,97.513 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M91.9323,160.686 C91.9323,158.971 93.323,157.581 95.038,157.581 C96.753,157.581 98.143,158.971 98.143,160.686 C98.143,162.401 96.753,163.792 95.038,163.792 C93.323,163.792 91.9323,162.401 91.9323,160.686 L91.9323,160.686 Z" id="Shape" stroke="#46A5E2" fill-opacity="0.8" fill="#B5DBF3"></path>
            <path d="M103.599,97.513 L116.021,97.513 L116.021,166.814 L103.599,166.814 L103.599,97.513 L103.599,97.513 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M106.526,160.686 C106.526,158.971 107.917,157.581 109.632,157.581 C111.347,157.581 112.737,158.971 112.737,160.686 C112.737,162.401 111.347,163.792 109.632,163.792 C107.917,163.792 106.526,162.401 106.526,160.686 L106.526,160.686 Z" id="Shape" stroke="#46A5E2" fill-opacity="0.8" fill="#B5DBF3"></path>
            <path d="M117.91,97.513 L130.331,97.513 L130.331,166.814 L117.91,166.814 L117.91,97.513 L117.91,97.513 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M120.837,160.686 C120.837,158.971 122.228,157.581 123.943,157.581 C125.658,157.581 127.048,158.971 127.048,160.686 C127.048,162.401 125.658,163.792 123.943,163.792 C122.228,163.792 120.837,162.401 120.837,160.686 L120.837,160.686 Z" id="Shape" stroke="#46A5E2" fill-opacity="0.8" fill="#B5DBF3"></path>
            <path d="M132.579,97.513 L145.001,97.513 L145.001,166.814 L132.579,166.814 L132.579,97.513 L132.579,97.513 Z" id="Shape" stroke="#FCB92C" fill-opacity="0.9" fill="#FEE3AB"></path>
            <path d="M135.507,160.686 C135.507,158.971 136.897,157.581 138.612,157.581 C140.327,157.581 141.718,158.971 141.718,160.686 C141.718,162.401 140.327,163.792 138.612,163.792 C136.897,163.792 135.507,162.401 135.507,160.686 L135.507,160.686 Z" id="Shape" stroke="#46A5E2" fill-opacity="0.8" fill="#B5DBF3"></path>
            <path d="M325.174,134.88 C325.174,133.165 326.565,131.775 328.28,131.775 C329.995,131.775 331.385,133.165 331.385,134.88 C331.385,136.596 329.995,137.986 328.28,137.986 C326.565,137.986 325.174,136.596 325.174,134.88 L325.174,134.88 Z" id="Shape" stroke="#46A5E2" fill-opacity="0.8" fill="#B5DBF3"></path>
            <path d="M0.01869,0.0494 L174.978,0.0494 L174.978,113.912 L0.01869,113.912 L0.01869,0.0494 L0.01869,0.0494 Z" id="Shape" stroke="#4A4A4A"></path>
        </g>
    </g>
</g>
</svg>
</div>
</div>
</figure>
<figcaption>The two states of the brushes in iPhoto for iOS.</figcaption>

<figure><div class="box-background"><img src="/images/iPhoto-animation.gif" alt="The actual animation between the two states of the brushes in iPhoto for iOS."></div>
</figure>
<figcaption>The actual animation between the two states of the brushes in iPhoto for iOS.</figcaption>

# Thinking outside the box

So far the anchor point has always been within the bounds of the layer but it doesn't have to. Within the bounds of the layer the values go from 0 to 1. 

What would a x-value of 2 mean? Starting from the left edge, 1 is the full width of the layer so a value of 2 would mean 2 full widths of the layer to the right from the left edge. This is the same as 1 full width of the layer to the right from the right edge. Similarly a value of -1 would mean being anchored the full width of the layer to the left of the left edge. As mentioned above, the frame of the layer moves when the anchor point changes so it is quite easy to accidentally move the layer off-screen when using anchor points outside the range of 0 to 1.

All this doesn't make much sense for positioning, we very rarely want to align things a distance proportional to their size from a point but we sometimes want to _transform_ relative to a points outside our own bounds. Doing a rotation around a points outside the bound without using the anchor point would require calculating the circular path ourselves and using a key-frame animation for the position with that path. For a true rotation we would also have to apply a rotation of the layer (relative to its center). If we instead changed the anchor point we would only rotate and be done with it. 

<figure>
<div role="img" aria-label="Rotation relative to a point outside the layers bounds." style="margin-bottom: 65%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 304 253" width="100%">
<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
    <g id="Layer_3" sketch:type="MSLayerGroup" transform="translate(0.000000, 2.000000)">
        <path d="M229.179,207.406 C229.906,152.357 213.645,112.042 184.443,76.1565" id="Shape" stroke="#BAC0C5" stroke-width="3" stroke-dasharray="5" sketch:type="MSShapeGroup"></path>
        <path d="M183.498,86.1252 L182.868,74.3296 L194.454,76.8813" id="Shape" stroke="#BAC0C5" stroke-width="3" sketch:type="MSShapeGroup"></path>
        <path d="M150.215,160.941 L301.831,160.941 L301.831,248.67 L150.215,248.67 L150.215,160.941 L150.215,160.941 Z" id="Shape" stroke="#BAC0C5" stroke-width="3" stroke-dasharray="5" sketch:type="MSShapeGroup"></path>
        <text id="before" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="157.594" y="181.906">before</tspan>
        </text>
        <path d="M13.7562,198.463 L0,203.707 L3.9855,189.367 L13.7562,198.463 L13.7562,198.463 Z" id="Shape" fill="#4A4A4A" sketch:type="MSShapeGroup"></path>
        <path d="M15.473,205.307 C15.473,202.673 17.6088,200.537 20.2435,200.537 C22.8782,200.537 25.014,202.673 25.014,205.307 C25.014,207.942 22.8782,210.078 20.2435,210.078 C17.6088,210.078 15.473,207.942 15.473,205.307 L15.473,205.307 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3" sketch:type="MSShapeGroup"></path>
        <path d="M8.0265,194.59 C10.5596,192.096 13.9301,190.418 17.7433,190.038 C26.611,189.155 34.516,195.628 35.399,204.496 C36.026,210.792 32.945,216.603 27.931,219.76" id="Shape" stroke="#4A4A4A" stroke-width="3" sketch:type="MSShapeGroup"></path>
        <path d="M97.072,91.4741 L217.696,0.05889 L270.745,70.058 L150.122,161.473 L97.072,91.4741 L97.072,91.4741 Z" id="Shape" stroke="#FCB92C" stroke-width="3" fill-opacity="0.8" fill="#FEE3AB" sketch:type="MSShapeGroup"></path>
        <text id="after" fill="#FCB92C" sketch:type="MSTextLayer" transform="translate(135.430387, 80.429859) rotate(-37.156931) translate(-135.430387, -80.429859) " font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="105.128173" y="86.9298587">after</tspan>
        </text>
    </g>
</g>
</svg>
</div>
</div>
</figure>
<figcaption>Rotation relative to a point outside the layers bounds.</figcaption>


We could also scale a layer relative to an outside point but we would have to keep in mind that everything about the layer scales relative to the anchor point, both the size and the distance. This means that if we scale to twice the size the distance would also double. 

<figure>
<div role="img" aria-label="Scaling relative to a point outside the layers bounds." style="margin-bottom: 45%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 441 139" width="100%">
<g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" sketch:type="MSPage">
    <g id="Layer_4" sketch:type="MSLayerGroup" transform="translate(1.000000, 2.000000)">
        <path d="M135.496,23.941 L287.112,23.941 L287.112,111.67 L135.496,111.67 L135.496,23.941 L135.496,23.941 Z" id="Shape" stroke="#BAC0C5" stroke-width="3" stroke-dasharray="5" sketch:type="MSShapeGroup"></path>
        <text id="before" fill="#BAC0C5" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="20" font-weight="420">
            <tspan x="142.875" y="44.906">before</tspan>
        </text>
        <path d="M0.7538,68.307 C0.7538,65.673 2.8896,63.537 5.5243,63.537 C8.1589,63.537 10.2947,65.673 10.2947,68.307 C10.2947,70.942 8.1589,73.078 5.5243,73.078 C2.8896,73.078 0.7538,70.942 0.7538,68.307 L0.7538,68.307 Z" id="Shape" stroke="#46A5E2" stroke-width="3" fill-opacity="0.8" fill="#B5DBF3" sketch:type="MSShapeGroup"></path>
        <path d="M205.254,0.172 L438.041,0.172 L438.041,134.869 L205.254,134.869 L205.254,0.172 L205.254,0.172 Z" id="Shape" stroke="#FCB92C" stroke-width="3" fill-opacity="0.8" fill="#FEE3AB" sketch:type="MSShapeGroup"></path>
        <text id="after" fill="#FCB92C" sketch:type="MSTextLayer" font-family="Avenir Next" font-size="28" font-weight="420">
            <tspan x="216.583" y="29.653">after</tspan>
        </text>
        <path d="M279.949,90.561 L216.312,126.576" id="Shape" stroke="#4A4A4A" stroke-width="3" sketch:type="MSShapeGroup"></path>
        <path d="M226.539,128.337 L211.818,128.523 L220.499,116.432 L226.539,128.337 L226.539,128.337 Z" id="Shape" fill="#4A4A4A" sketch:type="MSShapeGroup"></path>
        <path d="M418.167,7.431 L432.856,6.45 L424.842,18.992 L418.167,7.431 L418.167,7.431 Z" id="Shape" fill="#4A4A4A" sketch:type="MSShapeGroup"></path>
        <path d="M428.451,9.362 L372.909,39.997" id="Shape" stroke="#4A4A4A" stroke-width="3" sketch:type="MSShapeGroup"></path>
        <path d="M187.97,63.369 L201.17,69.887 L187.947,76.719 L187.97,63.369 L187.97,63.369 Z" id="Shape" fill="#4A4A4A" sketch:type="MSShapeGroup"></path>
        <path d="M193.763,70.007 L140.573,70.007" id="Shape" stroke="#4A4A4A" stroke-width="3" sketch:type="MSShapeGroup"></path>
    </g>
</g>
</svg>
</div>
</div>
</figure>
<figcaption>Scaling relative to a point outside the layers bounds.</figcaption>


# The anchor point is animatable

If you read through the documentation you will see that the anchor point is actually animatable. This means that you can have a fixed point in space (if the position doesn't change) that you can push the layer trough. You could of course do the same thing by animating the position instead (as long as transforms are not involved) but the anchor points allows you to describe the movement relative to the size, e.g. "I want the layer to move from the center all the way to the bottom".

# Finishing up

If you didn't know of the anchor point before reading this post, I hope that you learned enough to know when to use it.

If you've used the anchor point before but felt that its behavior was strange and have avoided using it since, I hope that this post explained some of that behavior and caused you to reconsider. 

Finally, if you knew all this, good for you :)




