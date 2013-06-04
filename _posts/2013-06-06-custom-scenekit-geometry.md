---
layout: post
title: "Custom SceneKit geometry"
description: "SceneKit offers a wide range of built in geometry like cubes, cylinders, pyramids, spheres, torus, etc., that can be used to for example create beautiful 3D bar charts. More advanced geometry (and even full scenes) like an environment for a game or an interior design application can be created by a designer in their favorite 3D modeling software to be modified and rendered by your application. In addition to these two options SceneKit can be used to generate geometry from a list of points. This comes in very handy when doing 3D graphs and visualizations."
category: 
tags: [SceneKit, Cocoa, 3D]
---

<style>{% include custom-scenekit-geometry.css %}</style>

SceneKit offers a wide range of built in geometry like cubes, cylinders, pyramids, spheres, torus, etc., that can be used to for example create beautiful 3D bar charts. More advanced geometry (and even full scenes) like an environment for a game or an interior design application can be created by a designer in their favorite 3D modeling software to be modified and rendered by your application. In addition to these two options SceneKit can be used to generate geometry from a list of points. This comes in very handy when doing 3D graphs and visualizations. 

A brief look at the documentation reveals that there is a method on `SCNGeometry` for creating a new geometry. 

    + (id)geometryWithSources:(NSArray *)sources 
                     elements:(NSArray *)elements; 

It takes two arrays of `SCNGeometrySource` objects and `SCNGeometryElement` objects. A brief look at these two classes can be a scary experience. It certainly isn’t obvious how to proceed unless you already know one or two things about 3D computer graphics[^notObvious]. Let us instead take a closer look at 3D geometry in general and see where that gets us.

[^notObvious]: If you have some familiarity with for example OpenGL I hope that you will see the strong similarities in the rest of this article. 

# 3D geometry

Geometry in 3D (and 2D as well for that matter) can be defined through a series of points. A cube, for example, has one point for each corner, 8 different points in total (four on top and for below).

<figure>
<div style="margin-bottom: 90%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 384 347" width="100%">
<path d="M66,64 C73.1797021,64 79,58.1797021 79,51 C79,43.8202979 73.1797021,38 66,38 C58.8202979,38 53,43.8202979 53,51 C53,58.1797021 58.8202979,64 66,64 Z M66,64" id="Oval 1" fill="#FFB900"></path>
<path d="M149.5,316 C157.508129,316 164,309.508129 164,301.5 C164,293.491871 157.508129,287 149.5,287 C141.491871,287 135,293.491871 135,301.5 C135,309.508129 141.491871,316 149.5,316 Z M149.5,316" id="Oval 1 copy" fill="#FFB900"></path>
<path d="M211.5,182 C216.194421,182 220,178.194421 220,173.5 C220,168.805579 216.194421,165 211.5,165 C206.805579,165 203,168.805579 203,173.5 C203,178.194421 206.805579,182 211.5,182 Z M211.5,182" id="Oval 1 copy 2" fill="#FFB900"></path>
<path d="M87,216 C92.5228478,216 97,211.522848 97,206 C97,200.477152 92.5228478,196 87,196 C81.4771522,196 77,200.477152 77,206 C77,211.522848 81.4771522,216 87,216 Z M87,216" id="Oval 1 copy 3" fill="#FFB900"></path>
<path d="M305.5,250 C311.851275,250 317,244.851275 317,238.5 C317,232.148725 311.851275,227 305.5,227 C299.148725,227 294,232.148725 294,238.5 C294,244.851275 299.148725,250 305.5,250 Z M305.5,250" id="Oval 1 copy 4" fill="#FFB900"></path>
<path d="M136.5,106 C147.269553,106 156,97.2695532 156,86.5 C156,75.7304468 147.269553,67 136.5,67 C125.730447,67 117,75.7304468 117,86.5 C117,97.2695532 125.730447,106 136.5,106 Z M136.5,106" id="Oval 1 copy 5" fill="#FFB900"></path>
<path d="M216,50 C221.522848,50 226,45.5228478 226,40 C226,34.4771522 221.522848,30 216,30 C210.477152,30 206,34.4771522 206,40 C206,45.5228478 210.477152,50 216,50 Z M216,50" id="Oval 1 copy 6" fill="#FFB900"></path>
<path d="M334.5,78 C343.060414,78 350,71.060414 350,62.5 C350,53.939586 343.060414,47 334.5,47 C325.939586,47 319,53.939586 319,62.5 C319,71.060414 325.939586,78 334.5,78 Z M334.5,78" id="Oval 1 copy" fill="#FFB900"></path>
</svg>
</div>
</div>
</figure>
<figcaption>The eight corners of a 3D cube.</figcaption>

These points in themselves do not make a cube. It is only through interpreting the points in some way that we get surfaces between some of the points which gives us the six faces of a solid cube. To create geometry the computer doesn’t only need the points. It also needs to know which points should go together to create surfaces. That is where triangles come in.

## Triangles 

Triangles are a central piece to 3D computer graphics since they are the smallest shape with a surface. A single point is just a point. Two points form a line. Three points form a surface. Four points (in a plane) form a bigger surface but that is really just two triangles. 

<figure>
<div style="margin-bottom: 65%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 294 192" width="100%">
<path d="M0,187 L67.3046875,0.05859375 L243.632812,15.21875 L0,187 Z M0,187" id="Triangle 1" fill="#4AA5E3"></path>
<path d="M9,192 L293.941406,192 L252.632812,20.21875 L9,192 Z M9,192" id="Triangle 1 copy" fill="#4AA5E3"></path>
</svg>
</div>
</div>
</figure>
<figcaption>The triangles that together form a quadrilateral.</figcaption>

On the other hand two triangles is much more than just a [quadrilateral (a surface with four corners)][Quadrilateral] plane. You can always create a triangle from three points (although the triangle may be at an angle) but four points need to be in the same plane to form a quadrilateral surface. 

Applied to our cube we will have two triangles for each side of the cube for a total of 12 triangles. Let’s take our eight corners and make triangles out of them.

## Indexed coordinates

We start by giving each point a number from 0 to 7 (we are programmers after all). The bottom surface has one triangle with the points <span class="math">0, 1, 2</span> and another with the points <span class="math">1, 2, 3</span>. In the same way the back of our cube has one triangle with the points <span class="math">2, 3, 6</span> and another with the points <span class="math">3, 6, 7</span>. 

<figure>
<div style="margin-bottom: 90%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 384 347" width="100%">
<path d="M66,64 C73.1797021,64 79,58.1797021 79,51 C79,43.8202979 73.1797021,38 66,38 C58.8202979,38 53,43.8202979 53,51 C53,58.1797021 58.8202979,64 66,64 Z M66,64" id="Oval 1" fill="#FFB900"></path>
<path d="M211.5,182 C216.194421,182 220,178.194421 220,173.5 C220,168.805579 216.194421,165 211.5,165 C206.805579,165 203,168.805579 203,173.5 C203,178.194421 206.805579,182 211.5,182 Z M211.5,182" id="Oval 1 copy 2" fill="#FFB900"></path>
<path d="M136.5,106 C147.269553,106 156,97.2695532 156,86.5 C156,75.7304468 147.269553,67 136.5,67 C125.730447,67 117,75.7304468 117,86.5 C117,97.2695532 125.730447,106 136.5,106 Z M136.5,106" id="Oval 1 copy 5" fill="#FFB900"></path>
<path d="M216,50 C221.522848,50 226,45.5228478 226,40 C226,34.4771522 221.522848,30 216,30 C210.477152,30 206,34.4771522 206,40 C206,45.5228478 210.477152,50 216,50 Z M216,50" id="Oval 1 copy 6" fill="#FFB900"></path>
<path d="M334.5,78 C343.060414,78 350,71.060414 350,62.5 C350,53.939586 343.060414,47 334.5,47 C325.939586,47 319,53.939586 319,62.5 C319,71.060414 325.939586,78 334.5,78 Z M334.5,78" id="Oval 1 copy" fill="#FFB900"></path>
<text id="3" fill="#000000" font-family="Avenir Next" font-size="15" font-weight="420" x="207.850586" y="178">
    <tspan>3</tspan>
</text>
<path d="M210.102783,178.469971 C205.755123,177.886475 204.720215,175.950073 204.720215,175.950073 C204.720215,175.950073 92.6429443,203.245972 86.9216309,204.737183 C93.9370117,205.467896 304.000549,236.739258 304.000549,236.739258 L216.269165,177.921143 C216.269165,177.921143 214.450443,179.053467 210.102783,178.469971 Z M210.102783,178.469971" id="Path 1" fill="#4AA5E3"></path>
<path d="M87,216 C92.5228478,216 97,211.522848 97,206 C97,200.477152 92.5228478,196 87,196 C81.4771522,196 77,200.477152 77,206 C77,211.522848 81.4771522,216 87,216 Z M87,216" id="Oval 1 copy 3" fill="#FFB900"></path>
<path d="M305.5,250 C311.851275,250 317,244.851275 317,238.5 C317,232.148725 311.851275,227 305.5,227 C299.148725,227 294,232.148725 294,238.5 C294,244.851275 299.148725,250 305.5,250 Z M305.5,250" id="Oval 1 copy 4" fill="#FFB900"></path>
<path d="M94.1369017,210.542358 C96.0066436,209.470318 96.0988157,208.927612 96.0988157,208.927612 C96.0988157,208.927612 286.149776,237.839661 294.01263,239.119629 C294.708374,241.662537 294.628479,242.132935 299.061848,244.922727 L148.972656,303.390624 L87.8762472,212.065013 C87.8762472,212.065013 92.2671595,211.614398 94.1369017,210.542358 Z M94.1369017,210.542358" id="Path 1" fill="#4AA5E3"></path>
<path d="M149.5,316 C157.508129,316 164,309.508129 164,301.5 C164,293.491871 157.508129,287 149.5,287 C141.491871,287 135,293.491871 135,301.5 C135,309.508129 141.491871,316 149.5,316 Z M149.5,316" id="Oval 1 copy" fill="#FFB900"></path>
<text id="0" fill="#000000" font-family="Avenir Next" font-size="20" font-weight="420" x="143" y="308">
    <tspan>0</tspan>
</text>
<text id="0, 1, 2" fill="#FFFFFF" font-family="Avenir Next" font-size="18" font-weight="420" x="152.5" y="255">
    <tspan>0, 1, 2</tspan>
</text>
<text id="1, 2, 3" fill="#FFFFFF" font-family="Avenir Next" font-size="17" font-weight="420" x="170" y="205">
    <tspan>1, 2, 3</tspan>
</text>
<text id="1" fill="#000000" font-family="Avenir Next" font-size="16" font-weight="420" x="301.061848" y="244">
    <tspan>1</tspan>
</text>
<text id="2" fill="#000000" font-family="Avenir Next" font-size="15" font-weight="420" x="83" y="211">
    <tspan>2</tspan>
</text>
<text id="4" fill="#000000" font-family="Avenir Next" font-size="30" font-weight="420" x="127" y="97">
    <tspan>4</tspan>
</text>
<text id="5" fill="#000000" font-family="Avenir Next" font-size="24" font-weight="420" x="327" y="71">
    <tspan>5</tspan>
</text>
<text id="7" fill="#000000" font-family="Avenir Next" font-size="16" font-weight="420" x="212" y="46">
    <tspan>7</tspan>
</text>
<text id="6" fill="#000000" font-family="Avenir Next" font-size="21" font-weight="420" x="59.7011719" y="58">
    <tspan>6</tspan>
</text>
</svg>
</div>
</div>
</figure>
<figcaption>The corners of a cube numbered and two triangles forming a surface for the bottom side of the cube.</figcaption>

If we continue in the same way for the rest of the sides we get a list of all the indices for all the triangles in the cube. At this point we actually have enough data to draw our cube on screen. 

# Creating geometry

The two pieces of data that we have are the points for the corners and the indices that make the points into triangles. In SceneKit terminology the points are the *source* of our geometry since they are the actual data. The cube is our only *element* with the list of indices as its data[^manyElements]. 

[^manyElements]: You can have multiple `SCNGeometryElement`s for a single geometry but that and its use-cases are far outside the scope of this article.

For a cube that extends half of its side in x, y and z (i.e. it is centered in origo <span class="math">(0, 0, 0)</span>) our list of points are

    SCNVector3 positions[] = {
        SCNVector3Make(-halfSide, -halfSide,  halfSide),
        SCNVector3Make( halfSide, -halfSide,  halfSide),
        SCNVector3Make(-halfSide, -halfSide, -halfSide),
        SCNVector3Make( halfSide, -halfSide, -halfSide),
        SCNVector3Make(-halfSide,  halfSide,  halfSide),
        SCNVector3Make( halfSide,  halfSide,  halfSide),
        SCNVector3Make(-halfSide,  halfSide, -halfSide),
        SCNVector3Make( halfSide,  halfSide, -halfSide)
    };
    
And the indices for all the triangles that takes these points and makes them into a cube
 
<pre><code>int indices[] = {
    <span class="comment">// bottom</span>
    0, 2, 1,
    1, 2, 3,
    <span class="comment">// back</span>
    2, 6, 3,
    3, 6, 7,
    <span class="comment">// left</span>
    0, 4, 2,
    2, 4, 6,
    <span class="comment">// right</span>
    1, 3, 5,
    3, 7, 5,
    <span class="comment">// front</span>
    0, 1, 4,
    1, 5, 4,
    <span class="comment">// top</span>
    4, 5, 6,
    5, 7, 6
};</code></pre>

You may notice that the order of some of the indices may not be what you expect. For example the first triangle has the indices `0, 2, 1` instead of `0, 1, 2`. This is because we want to control what is the front and back of the triangles. 

Every surface has a front and a backside. The points on the front are specified in counter-clockwise order. It is a common optimization to never draw surfaces showing their back to the camera since they would be obscured by some other surface in any solid geometry. If you have issues with triangular holes or have transparent geometry you can configure the material to be double sided.  
    
## Creating the geometry object

Remember those classes that we couldn’t make sense of before. Let’s have a look at them now. 

The geometry source is the easiest one. We want to create a source for our geometries vertices. “Vertex” is the name for a corner in a polygon and that is what our points are to the triangles. We know that we have 8 points so we can create a geometry source like this:

    SCNGeometrySource *vertexSource =
      [SCNGeometrySource geometrySourceWithVertices:positions count:8];

The geometry element is slightly trickier but I’ll walk you through it. First we need our indices as an `NSData` object. The second parameter makes sure that the indices are read as a series of triangles. Finally pass the number of indices and their size.
    
    NSData *indexData = [NSData dataWithBytes:indices
                                       length:sizeof(indices)];
    
    SCNGeometryElement *element =
    [SCNGeometryElement geometryElementWithData:indexData
                                primitiveType:SCNGeometryPrimitiveTypeTriangles
                                 primitiveCount:12
                                  bytesPerIndex:sizeof(int)];
    
After we have created both the source and the element with can finally create our custom geometry.
    
    SCNGeometry *geometry = [SCNGeometry geometryWithSources:@[vertexSource]
                                                    elements:@[element]];

If you add this to your scene you should first be glad that you managed to create your custom 3D object and secondly be surprised of how bad it renders. It’s all black!

<figure>
<div style="margin-bottom: 85%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 529 457" width="100%">
<path d="M58.7863275,38.5143717 L295.190349,21.0473919 L480.688863,55.8287011 L435.993388,332.531057 L190.274995,433.677433 L91.8574127,282.188871 L58.7863275,38.5143717 Z M58.7863275,38.5143717" fill="#000000"></path>
</svg>
</div>
</div>
</figure>
<figcaption>The first rendering of the custom geometry. It's all black.</figcaption>

The problem with our geometry is that is has no normals so when light from the light sources hit our surface we can’t calculate the angle to determine how lit that up it should become. One of the other kinds of geometry sources we could create was a _source with normals_. It is created just like the source with vertices but first we need some normals.

# Normals

A normal, or surface normal, is a vector that points perpendicular to the surface. [Wikipedia][surfaceNormal] has some good illustrations of what it could look like.

Unfortunately for our cube, normals are specified per vertex and our cube reuses the same point three times. This means that we can’t specify three different normals for the three different usages. To give our cube proper normals for the lighting we need 24 vertices (3 × 8). I won’t bother including the code for the new vertices and normals since it’s just a long list of number but will instead refer you to [the sample project on GitHub][sampleCode].

Just as we created an array of `SCNVector3` for the vertices we create another array for the normals. Now that we have new vertices and normals we can create two new sources and a geometry object from them. Note that there are still only 12 indices even though some of them have changed. There are still only 12 triangles even though there are more vertices to choose from.

    SCNGeometrySource *vertexSource =
      [SCNGeometrySource geometrySourceWithVertices:positions
                                              count:24];
    SCNGeometrySource *normalSource =
      [SCNGeometrySource geometrySourceWithNormals:normals
                                             count:24];
    
    SCNGeometry *geometry =
      [SCNGeometry geometryWithSources:@[vertexSource, normalSource]
                              elements:@[element]];

Now that our cube has proper normals we can give it proper lighting

<figure><div class="box-background" style="background: white;"><img src="/images/result.png" alt="The custom geometry with proper normals rendered in a scene with a red spotlight."></div>
</figure>
<figcaption>The custom geometry with proper normals rendered in a scene with a red spotlight.</figcaption>

# Conclusion 

It may feel like we did very much for so little but what we learnt is a very powerful tool that can be used to generate _any_ geometry. Also, you may not have realized it but the entire discussion about triangles, front– and backside, surface normals and indices are very relevant when doing OpenGL.

One secondary lesson to take away from this is that you should either create your geometry using 3D modeling software or have the program generate the vertices and normals for you. I have just started [a small project on GitHub that does the latter for 3D graphs][DRMesh]. Feel free to learn from it, use it to make graphs and give me feedback on how to improve it.

[Quadrilateral]: http://en.wikipedia.org/wiki/Quadrilateral (Wikipedia article about Quadrilaterals.)

[surfaceNormal]: http://en.wikipedia.org/wiki/Surface_normal (Wikipedia article about Surface normals.)

[sampleCode]: (The sample project seen in this article.)

[DRMesh]: https://github.com/d-ronnqvist/DRMeshGeometry (My project for generating custom geometry for 3D graphs.)


