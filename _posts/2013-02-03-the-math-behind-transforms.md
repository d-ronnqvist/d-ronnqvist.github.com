---
layout: post
title: "The math behind transforms"
description: "We have objects on our screen that are visually defined by the fours corners of the rectangle they lie within. Even objects that are not rectangles themselves can be contained by a rectangle. We know that applying a transform to this object on screen causes it to change its position, size or rotation on screen. The transform is used to calculate the new positions of the four corners and everything inside the rectangle stretches to fill the rectangle just as before the transform. Our goal is to understand how the new positions are being calculated for different kinds of transforms."
category: 
tags: [Math, Transforms, Programming]
---

<style>{% include style-math-behind-transforms.css %}</style>

In my previous post I talked about the transforms involved in rotating a view around an external point but I also said that you don’t need to understand matrices to work with transforms. If you didn’t accept that and still wanted to know how matrices make transforms work then this post is for you.

This post does not aim to cover all of linear algebra, just enough to understand transforms. 

# Our goal

We have objects on our screen that are visually defined by the four corners of the rectangle they lie within. Even objects that are not rectangles themselves can be contained by a rectangle. We know that applying a transform to this object on screen causes it to change its position, size or rotation on screen. The transform is used to calculate the new positions of the four corners and everything inside the rectangle stretches to fill the rectangle just as before the transform. Our goal is to understand how the new positions are being calculated for different kinds of transforms.

# Math, a lot of math

Don't let that section title scare you. You came here to learn, remember?

## Math in more than one dimension

In "normal" math, that everyone should be familiar with, we have numbers. Sometimes when we want to make calculations but don't know all the numbers beforehand we substitute them with letters and are able to make calculations with those letters instead. If we drew a line we could represent these numbers on that line as the distance to the right of "origo", the point representing zero. The "to the right"-part enables us to represent negative numbers by placing them left of origo.  

Addition of two numbers can be illustrated as drawing an arrow with the length of the first number from origo and another arrow with the length of the second number beginning at the end of the first arrow. The sum of the two numbers is the arrow that goes from origo to the end of the second arrow. This can be seen in the image below (with <span class="math">a = 2</span> and <span class="math">b = 3</span>). 

<figure><svg xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="scale(1.6) translate(25, 50)"><svg xmlns="http://www.w3.org/2000/svg" version="1.1"><line x1="10" y1="30" x2="280" y2="30" stroke="#222E39" stroke-width="2"></line><line x1="30" y1="30" x2="280" y2="30" stroke="#222E39" stroke-width="10" stroke-dasharray="2, 23"></line><line x1="80" y1="32" x2="280" y2="32" stroke="#222E39" stroke-width="16" stroke-dasharray="2, 123"></line><path d="M290 30 l-12 -8 l0 16 Z"></path><text x="20" y="18" fill="#222E39" style="word-spacing: 9px;" font-family="Avenir Next" font-weight="500">-2 -1</text><text x="76" y="18" fill="#222E39" style="word-spacing: 11px;" font-family="Avenir Next" font-weight="500">0&nbsp;1 2&nbsp;3 4&nbsp;5 6&nbsp;7</text><line x1="80" y1="53" x2="125" y2="53" stroke="#4594D9" stroke-width="2"></line><path d="M130 53 l-8 -6 l0 12 Z" fill="#4594D9"></path><text x="100" y="50" fill="#4594D9" font-family="Avenir Next" font-weight="500">a</text><line x1="130" y1="53" x2="200" y2="53" stroke="#4594D9" stroke-width="2"></line><path d="M205 53 l-8 -6 l0 12 Z" fill="#4594D9"></path><text x="160" y="50" fill="#4594D9" font-family="Avenir Next" font-weight="500">b</text><line x1="80" y1="70" x2="200" y2="70" stroke="#4594D9" stroke-width="2"></line><path d="M205 70 l-8 -6 l0 12 Z" fill="#4594D9"></path><text x="125" y="85" fill="#4594D9" font-family="Avenir Next" font-weight="500">a+b</text></svg></g></svg><figcaption>An illustration of two numbers being added.</figcaption></figure>

The same works for negative numbers (for example <span class="math">a = 4</span> and <span class="math">b = -6</span>) as can be seen below. 

<figure><svg xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="scale(1.6) translate(25, 40)"><line x1="10" y1="30" x2="280" y2="30" stroke="#222E39" stroke-width="2"></line><line x1="30" y1="30" x2="280" y2="30" stroke="#222E39" stroke-width="10" stroke-dasharray="2, 23"></line><line x1="80" y1="32" x2="280" y2="32" stroke="#222E39" stroke-width="16" stroke-dasharray="2, 123"></line><path d="M290 30 l-12 -8 l0 16 Z"></path><text x="20" y="18" fill="#222E39" style="word-spacing: 9px;" font-family="Avenir Next" font-weight="500">-2 -1</text><text x="76" y="18" fill="#222E39" style="word-spacing: 11px;" font-family="Avenir Next" font-weight="500">0&nbsp;1 2&nbsp;3 4&nbsp;5 6&nbsp;7</text><line x1="80" y1="53" x2="175" y2="53" stroke="#4594D9" stroke-width="2"></line><path d="M180 53 l-8 -6 l0 12 Z" fill="#4594D9"></path><text x="125" y="50" fill="#4594D9" font-family="Avenir Next" font-weight="500">a</text><line x1="35" y1="60" x2="180" y2="60" stroke="#4594D9" stroke-width="2"></line><path d="M30 60 l8 -6 l0 12 Z" fill="#4594D9"></path><text x="105" y="75" fill="#4594D9" font-family="Avenir Next" font-weight="500">b</text><line x1="80" y1="80" x2="35" y2="80" stroke="#4594D9" stroke-width="2"></line><path d="M30 80 l8 -6 l0 12 Z" fill="#4594D9"></path><text x="43" y="95" fill="#4594D9" font-family="Avenir Next" font-weight="500">a+b</text></g></svg><figcaption>An illustration of two numbers being subtracted.</figcaption></figure>

In a similar fashion we can represent multiplication as taking either of the arrows and adding it to the end of _itself_ the same number of times as the length of the other arrow.

It gets a bit silly drawing numbers like this when we all know how to add simple numbers so let's take things one step further. If we call the line that we drew arrows along an _axis_ and we add another axis perpendicular to the one we already had then we get a _plane_. Any point on this plane can now be defined by two coordinates, one for each axis. We call the horizontal axis the x-axis and the vertical axis the y-axis. Now we can describe any point on this plane by its x and y value. This plane is just like the screen of our devices. 

<figure style="height: 480px;"><svg xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="scale(1.35) translate(55, 16)"><line x1="10" y1="225" x2="280" y2="225" stroke="#222E39" stroke-width="2"></line><line x1="30" y1="225" x2="280" y2="225" stroke="#222E39" stroke-width="10" stroke-dasharray="2, 23"></line><line x1="80" y1="225" x2="280" y2="225" stroke="#222E39" stroke-width="20" stroke-dasharray="2, 123"></line><path d="M290 225 l-12 -8 l0 16 Z"></path><line x1="81" y1="300" x2="81" y2="30" stroke="#222E39" stroke-width="2"></line><line x1="81" y1="276" x2="81" y2="40" stroke="#222E39" stroke-width="10" stroke-dasharray="2, 23"></line><line x1="81" y1="226" x2="81" y2="40" stroke="#222E39" stroke-width="20" stroke-dasharray="2, 123"></line><path d="M81 20 l-8 12 l16 0 Z"></path><line x1="81" y1="225" x2="155" y2="126" stroke="#4594D9" stroke-width="3"></line><circle cx="155" cy="126" r="4" fill="black"></circle><path d="M155 126 l-12 -7 l0 14 Z" fill="#4594D9" transform="rotate(-53.13 155 126)"></path><text x="162" y="130" fill="#4594D9" font-family="Avenir Next" font-size="20" font-weight="500">(x, y)</text><text x="20" y="250" fill="#222E39" style="word-spacing: 6px;" font-family="Avenir Next" font-weight="500">-2 -1</text><text x="101" y="250" fill="#222E39" style="word-spacing: 11px;" font-family="Avenir Next" font-weight="500">1&nbsp;2 3&nbsp;4 5&nbsp;6 7</text><text x="65" y="40" fill="#222E39" style="writing-mode: tb; glyph-orientation-vertical: 0;" font-family="Avenir Next" font-weight="500" letter-spacing="3px">7654321</text><text x="59" y="256" fill="#222E39" style="word-spacing: 9px;" font-family="Avenir Next" font-weight="500">-1</text><text x="59" y="280" fill="#222E39" style="word-spacing: 9px;" font-family="Avenir Next" font-weight="500">-2</text></g></svg><figcaption>An arrow pointing to a coordinate in a 2D plane.</figcaption></figure>

The arrow in this plane is unlike the arrows along the line above since they require two numbers to describe instead of one. We call these new arrows _vectors_ and the old arrows _scalars_. If we want to we can draw the same scalars as we did before along the x-axis but when that arrow is represented in this plane it is no longer a scalar. Instead it is a vector with a y-coordinate of 0. 

Just as we did with the scalars we can represent the addition of two vectors as placing either of them at the point of the other. The result of the addition is the vector that points to the same point as the second vector now does. You may notice that vector addition works by adding the two x components together into a new x component and the y components together into a new y component. It works in both directions, adding either vector to the other, you can try it on a piece of paper if you want to. 

<figure style="height: 480px;"><svg xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="scale(1.35) translate(55, 16)"><line x1="10" y1="225" x2="280" y2="225" stroke="#222E39" stroke-width="2"></line><line x1="30" y1="225" x2="280" y2="225" stroke="#222E39" stroke-width="10" stroke-dasharray="2, 23"></line><line x1="80" y1="225" x2="280" y2="225" stroke="#222E39" stroke-width="20" stroke-dasharray="2, 123"></line><path d="M290 225 l-12 -8 l0 16 Z"></path><line x1="81" y1="300" x2="81" y2="30" stroke="#222E39" stroke-width="2"></line><line x1="81" y1="276" x2="81" y2="40" stroke="#222E39" stroke-width="10" stroke-dasharray="2, 23"></line><line x1="81" y1="226" x2="81" y2="40" stroke="#222E39" stroke-width="20" stroke-dasharray="2, 123"></line><path d="M81 20 l-8 12 l16 0 Z"></path><text x="20" y="250" fill="#222E39" style="word-spacing: 6px;" font-family="Avenir Next" font-weight="500">-2 -1</text><text x="101" y="250" fill="#222E39" style="word-spacing: 11px;" font-family="Avenir Next" font-weight="500">1&nbsp;2 3&nbsp;4 5&nbsp;6 7</text><text x="65" y="40" fill="#222E39" style="writing-mode: tb; glyph-orientation-vertical: 0;" font-family="Avenir Next" font-weight="500" letter-spacing="3px">7654321</text><text x="59" y="256" fill="#222E39" style="word-spacing: 9px;" font-family="Avenir Next" font-weight="500">-1</text><text x="59" y="280" fill="#222E39" style="word-spacing: 9px;" font-family="Avenir Next" font-weight="500">-2</text><line x1="81" y1="225" x2="176" y2="154" stroke="#4594D9" stroke-width="3"></line><path d="M180 151 l-12 -7 l0 14 Z" fill="#4594D9" transform="rotate(-36.86989 180 151)"></path><line x1="180" y1="151" x2="105" y2="101" stroke="#4594D9" stroke-width="3"></line><path d="M105 101 l-12 -7 l0 14 Z" fill="#4594D9" transform="rotate(-146.3099 105 101)"></path><text x="150" y="172" fill="#4594D9" font-family="Avenir Next" font-size="20" font-weight="500" style="writing-mode: tb; glyph-orientation-vertical: 0;" letter-spacing="-21px">→a</text><text x="147" y="90" fill="#4594D9" font-family="Avenir Next" font-size="20" font-weight="500" style="writing-mode: tb; glyph-orientation-vertical: 0;" letter-spacing="-17px">→b</text><line x1="81" y1="225" x2="105" y2="101" stroke="#4594D9" stroke-width="3"></line><circle cx="105" cy="101" r="4" fill="black"></circle><path d="M105 101 l-12 -7 l0 14 Z" fill="#4594D9" transform="rotate(-78.69 105 101)"></path><text x="46" y="154" fill="#4594D9" stroke="white" stroke-width="4" font-family="Avenir Next" font-size="20" font-weight="500" letter-spacing="5px">→→</text><text x="46" y="154" fill="#4594D9" font-family="Avenir Next" font-size="20" font-weight="500" letter-spacing="5px">→→</text><text x="50" y="165" fill="#4594D9" stroke="white" stroke-width="4" font-family="Avenir Next" font-size="20" font-weight="500">a+b</text><text x="50" y="165" fill="#4594D9" font-family="Avenir Next" font-size="20" font-weight="500">a+b</text></g></svg><figcaption>An illustration of two vectors being added together.</figcaption></figure>
Adding one vector to itself over and over is just like the multiplication we did with scalars. In a plane like this we call it scalar multiplication since we are multiplying our vector with a scalar. 

Multiplying a vector with another vector gets a little bit trickier to wrap our heads around. What does it really mean to multiply a vector with another vector? Considering that vector addition added the two x and y components it shouldn’t surprise us that the two x and y components are multiplied. What likely is a surprise however, is that the result of these multiplications in then added into _a scalar_. That is right, the multiplication of two vectors is a scalar. This kind of multiplication is most often called the “dot product“ since a dot is used for the multiplication sign. 

There are other very powerful operations that we can do with vectors like calculating the cross product. While this is a _very_ important part of linear algebra and 3D computer graphics, it is not necessary for understanding transforms so we will skip it for this article. 

We build upon our 2D plane by adding another axis that is perpendicular to both axes and call it the z-axis[^cross-product]. We now have a full Cartesian coordinate system that can be used to represent any point in 3D space using its x, y and z coordinates. 

[^cross-product]: This is in fact one of the things that the cross product of two vectors is used to calculate.

Unlike last time we added a dimension to our space we still call the arrow that points to a coordinate in space a vector. Sometimes for differentiation we call these vectors 3D vectors, but a vector can really have any amount of values as long as they are in a single row or single column but never both. 

If a vector were to have both rows and columns it wouldn't be a vector any more. It would be a _matrix_. Matrices are as far as we will go here. In other scientific areas there are things with one more dimension than a matrix, called a tensor. 

There is no good way of visually representing a matrix in a plane or space like we did for a vector so we will skip that for now. Instead let us focus on how they add and multiply. 

Addition of two matrices is simply a new matrix with every value being the addition of the corresponding values for that row and column in the original two matrices. The only interesting thing to note is that two matrices can only be added together of they have the same size, i.e. the same number of rows and columns. 

Matrix multiplication on the other hand is where things get interesting. In matrix multiplication the values of a row in the first matrix (hereafter called <span class="math">M<sub>A</sub></span>) is multiplied with the values of a column in the other matrix (hereafter called <span class="math">M<sub>B</sub></span>). Just like with the dot product (vector multiplication) this produces a scalar value which is the value for that specific row and column in the resulting matrix. Since the multiplication is done for every row, column pair of the two matrices the resulting matrix will have the same number of rows as <span class="math">M<sub>A</sub></span> and the same number of columns as <span class="math">M<sub>B</sub></span>. Important to note is that _order matters_[^order matters]. <span class="math">M<sub>A</sub> × M<sub>B</sub> ≠ M<sub>B</sub> × M<sub>A</sub></span>. 

[^order matters]: This is just like for the different transforms in the previous article. Rotation and then Translation is not the same as Translation and then Rotation.

The best way to understand matrix multiplication is to start with the empty result and fill in the value for each row and column one at a time. The resulting value for the first row and first column is the same as the dot product of the first row of <span class="math">M<sub>A</sub></span> and the first column of <span class="math">M<sub>B</sub></span>. Since we are calculating the dot product of <span class="math">M<sub>A</sub></span>’s rows and <span class="math">M<sub>B</sub></span>’s columns they need to have the same number of elements, i.e. <span class="math">M<sub>A</sub></span> needs to have the same number of columns and <span class="math">M<sub>B</sub></span> has rows. (No, that was not a typo. The number of elements in each row is the same as the number of columns and vice versa.) 

<figure id="matrixFigure"><table id="matrixOne" class="matrixTable"><tbody><tr><td>A<sub>1,1</sub></td>
<td>A<sub>1,2</sub></td>
</tr><tr><td>A<sub>2,1</sub></td>
<td>A<sub>2,2</sub></td>
</tr><tr><td>A<sub>3,1</sub></td>
<td>A<sub>3,2</sub></td>
</tr><tr><td>A<sub>4,1</sub></td>
<td>A<sub>4,2</sub></td>
</tr></tbody></table>
×
<table id="matrixTwo" class="matrixTable"><tbody><tr><td>B<sub>1,1</sub></td>
<td>B<sub>1,2</sub></td>
<td>B<sub>1,3</sub></td>
</tr><tr><td>B<sub>2,1</sub></td>
<td>B<sub>2,2</sub></td>
<td>B<sub>2,3</sub></td>
</tr></tbody></table>
=
<table id="matrixThree" class="matrixTable"><tbody><tr><td>C<sub>1,1</sub></td>
<td>C<sub>1,2</sub></td>
<td>C<sub>1,3</sub></td>
</tr><tr><td>C<sub>2,1</sub></td>
<td>C<sub>2,2</sub></td>
<td>C<sub>2,3</sub></td>
</tr><tr><td>C<sub>3,1</sub></td>
<td>C<sub>3,2</sub></td>
<td>C<sub>3,3</sub></td>
</tr><tr><td>C<sub>4,1</sub></td>
<td>C<sub>4,2</sub></td>
<td>C<sub>4,3</sub></td>
</tr></tbody></table><span id="multiplicationText">Hover the matrix C…</span>
<figcaption>A 4×2 matrix multiplied with a 2×3 matrix.</figcaption></figure>

If we think of a  _vector_ as a matrix with only one column then we can multiply a matrix with that vector and **transform it** into a new vector. This means that we have a mathematical way of transforming the points on our screen into other points.

# The identity matrix

Before actually changing the points of our view, let us figure out how we can multiply a matrix with a vector and have it be transformed into the exact same vector. We could just multiply it with the scalar 1 but we really want to use a matrix for this. For each row-column combination in the matrix we put a value at <span class="math">i, j</span> where <span class="math">i</span> is the row and <span class="math">j</span> is the column. Since our vector has three rows we need to have three columns and since we want the result to have three rows we need to have three rows as well leaving us with a matrix with three rows and three columns, often referred to as a 3×3 matrix. 

<figure id="matrixFigure" style="height: 175px"><table class="matrixTable" style="margin-left: 70px"><tbody><tr><td>M<sub>1,1</sub></td>
<td>M<sub>1,2</sub></td>
<td>M<sub>1,3</sub></td>
</tr><tr><td>M<sub>2,1</sub></td>
<td>M<sub>2,2</sub></td>
<td>M<sub>2,3</sub></td>
</tr><tr><td>M<sub>3,1</sub></td>
<td>M<sub>3,2</sub></td>
<td>M<sub>3,3</sub></td>
</tr></tbody></table>
×
<table class="matrixTable"><tbody><tr><td>x</td>
</tr><tr><td>y</td>
</tr><tr><td>z</td>
</tr></tbody></table>
=
<table class="matrixTable"><tbody><tr><td>x<sub>new</sub></td>
</tr><tr><td>y<sub>new</sub></td>
</tr><tr><td>z<sub>new</sub></td>
</tr></tbody></table><figcaption style="position: absolute; bottom: -45px;">A matrix multiplied with a vector to get a new vector.</figcaption></figure>

This matrix multiplication can also be described by these three equations.

<figure id="matrixFigure" style="height: 175px"><span style="font-size: 95px; line-height: 0; font-weight: 100; margin-left: 30px;">{</span>
<table class="matrixTable" style="border: none;"><tbody><tr><td>x<sub>new</sub></td>
<td>=</td>
<td>M<sub>1,1</sub> ⋅ x</td>
<td>+</td>
<td>M<sub>1,2</sub> ⋅ y</td>
<td>+</td>
<td>M<sub>1,3</sub> ⋅ z</td>
</tr><tr><td>y<sub>new</sub></td>
<td>=</td>
<td>M<sub>2,1</sub> ⋅ x</td>
<td>+</td>
<td>M<sub>2,2</sub> ⋅ y</td>
<td>+</td>
<td>M<sub>2,3</sub> ⋅ z</td>
</tr><tr><td>z<sub>new</sub></td>
<td>=</td>
<td>M<sub>3,1</sub> ⋅ x</td>
<td>+</td>
<td>M<sub>3,2</sub> ⋅ y</td>
<td>+</td>
<td>M<sub>3,3</sub> ⋅ z</td>
</tr></tbody></table><figcaption style="position: absolute; bottom: -45px;">The 3 equations for a matrix and vector multiplication.</figcaption></figure>

We quickly see that the values on the diagonal, where <span class="math">i</span> is equal to <span class="math">j</span>, are ones and that all other values are zeroes. This special matrix is called the _identity matrix_ and is often represented as the letter “I”. Now that we know how to construct a matrix that doesn’t modify the multiplied vector we can start looking at matrices that do.

# Transforming matrices

There are three basic kinds of transforms: scaling, translating and rotating. No matter which one we are talking about we can look at the transformed x, y, and z values separately by looking at each row of the matrix. 

## Scaling

Scaling a rectangle is very easy to describe: the rectangle changes its size by the scale factor without moving or losing its aspect ratio. This means that every corner increases its distance to the center without changing the angle. For this to happen, all components of the vector must increase by the same factor, the scale factor. If we were to make the rectangle twice as big we would want the resulting vector have all it’s x, y and z values twice that of the original vector. 

Going back to our three equations from above we see that all the values along the diagonal are now twos instead of ones (the zeroes are still zeroes). If we put different values along the diagonal (for example 2 for the first row and 1 for the other) we will see that the rectangle stretches and loses its aspect ratio, a fun scaling effect and a perfectly valid scaling transform along that axis.

No matter how we change the values along the diagonal the rectangle never moves so let’s look at how to move the rectangle. 

## Translating 

One way of moving the rectangle would be to _add_ a vector to all four points defining the corners which would create new vectors pointing to the new points. This works just fine but we really want to make it work with matrices because matrices can be multiplied with each other which will later prove to be very powerful. Looking at the equations for our 3×3 matrix we eventually realize that something is missing. We only have a means of specifying x, y and z multiplicands but we have no way to use a constant. 

So we add a constant for each of the three equations and see how that affects the matrix. Since we now have four elements being added in the equation we must have four columns in the matrix and thus also four rows in our vector. 

Don’t run off being scared that we introduced a fourth dimension or something. The fourth value of our vector is quite harmless, it’s 1. Our vector is now (x, y, z, 1). The fourth value isn’t used to represent our point in 3D space, it’s only used for matrix multiplication. We are not quite finished yet. Our resulting vector would lose its fourth row unless we made sure that the matrix also had a fourth row. 

Now we have a matrix of ones along the diagonal (we still want the fourth value of the vector to keeps its value after the multiplication) and three constants along the very right edge of the matrix. These three constants reflect the translation along each of the three axis. 

<figure id="matrixFigure" style="height: 205px"><table class="matrixTable" style="margin-left: 90px"><tbody><tr><td>1</td>
<td>0</td>
<td>0</td>
<td>C<sub>x</sub></td>
</tr><tr><td>0</td>
<td>1</td>
<td>0</td>
<td>C<sub>y</sub></td>
</tr><tr><td>0</td>
<td>0</td>
<td>1</td>
<td>C<sub>z</sub></td>
</tr><tr><td>0</td>
<td>0</td>
<td>0</td>
<td>1</td>
</tr></tbody></table>
×
<table class="matrixTable"><tbody><tr><td>x</td>
</tr><tr><td>y</td>
</tr><tr><td>z</td>
</tr><tr><td>1</td>
</tr></tbody></table>
=
<table class="matrixTable"><tbody><tr><td>x + C<sub>x</sub></td>
</tr><tr><td>y + C<sub>y</sub></td>
</tr><tr><td>z + C<sub>z</sub></td>
</tr><tr><td>1</td>
</tr></tbody></table><figcaption style="position: absolute; bottom: -45px; left: 100px;">A translation transformation matrix.</figcaption></figure>

Let’s revisit scaling to ensure that it still works for us with our new 4×4 matrix.

## Scaling again

We don’t want to move when we are scaling so the rightmost column is set to zeroes (except for the diagonal). We quickly realize that scaling still works with our new 4×4 matrix. This means that it’s time to go on to rotation.

# Rotating

Just like we could scale along only one axis we can also rotate around only one axis. In fact, we most often do. If you ask someone to describe a rotation on a screen without telling them which axis they will probably describe a flat rotation like the hands of a clock does. What axis would that be? 

A neat trick to figure out rotation along an axis is to take your right hand and curl your fingers without closing your hand and then point the thumb straight up. If you now point your thumb along the axis you are rotating along and turn your wrist your fingers will curve in the direction of the rotation. Alternatively you could place your hand so that your fingers curve like the rotation you had in mind to figure out the axis. You may notice that a clockwise and counter-clockwise rotations is done in the negative or positive direction along that axis. 

## A 2D rotation

The common flat rotation is done around the z-axis so z-values for the rotated points will remain unchanged but x- and -values _may_ change. I said “may change” since a 360º rotation around any angle takes us to the same point as before.

To figure out how the x and y values change in a rotation around the z-axis we look at the two vectors (1,0,0) and (0,1,0). If we draw a circle in the center of our x,y-plane with the same radius as the distance to our points, we expect the points to move along the edge of this circle. We can easily imagine a counter-clockwise rotation of θ for both of these vectors and draw two new vectors that point to our expected end result. Basic trigonometry (sine and cosine) helps us express how the new points relate to the old points. 

<figure style="height: 400px;"><svg xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="scale(1.15) translate(30 20)"><g transform="translate(50 0)"><line x1="10" y1="175" x2="280" y2="175" stroke="#222E39" stroke-width="2"></line><path d="M290 175 l-12 -8 l0 16 Z"></path><line x1="131" y1="300" x2="131" y2="30" stroke="#222E39" stroke-width="2"></line><path d="M131 20 l-8 12 l16 0 Z"></path><circle cx="131" cy="175" r="100" stroke="#222E39" stroke-width="2" fill="none" stroke-dasharray="8,10"></circle><path d="M161 175 q 0 -8 -3 -14" stroke="#222E39" stroke-width="2" fill="none"></path><path d="M161 175 q 0 -8 -3 -14" stroke="#222E39" stroke-width="2" fill="none" transform="rotate(-90 131 175)"></path><line x1="217.6" y1="175" x2="217.6" y2="125" stroke="rgb(255,171,25)" stroke-width="2" stroke-dasharray="6,8 "></line><line x1="131" y1="125" x2="217.6" y2="125" stroke="rgb(255,171,25)" stroke-width="2" stroke-dasharray="6,8 "></line><line x1="81" y1="175" x2="81" y2="88.4" stroke="rgb(255,171,25)" stroke-width="2" stroke-dasharray="6,8 "></line><line x1="131" y1="88.4" x2="81" y2="88.4" stroke="rgb(255,171,25)" stroke-width="2" stroke-dasharray="6,8 "></line><line x1="131" y1="175" x2="227" y2="175" stroke="#4594D9" stroke-width="3"></line><path d="M231 175 l-12 -7 l0 14 Z" fill="#4594D9"></path><text x="235" y="202" fill="#4594D9" font-family="Avenir Next" font-size="20" font-weight="500">(1, 0, 0)</text><line x1="131" y1="175" x2="131" y2="78" stroke="#4594D9" stroke-width="3"></line><path d="M131 75 l-12 -7 l0 14 Z" fill="#4594D9" transform="rotate(-90 131 75)"></path><text x="135" y="70" fill="#4594D9" font-family="Avenir Next" font-size="20" font-weight="500">(0, 1, 0)</text><g transform="rotate(-30 131 175)"><line x1="131" y1="175" x2="227" y2="175" stroke="rgb(255,171,25)" stroke-width="3"></line><path d="M231 175 l-12 -7 l0 14 Z" fill="rgb(255,171,25)"></path><line x1="131" y1="175" x2="131" y2="78" stroke="rgb(255,171,25)" stroke-width="3"></line><path d="M131 75 l-12 -7 l0 14 Z" fill="rgb(255,171,25)" transform="rotate(-90 131 75)"></path></g><text x="165" y="172" fill="#222E39" font-family="Avenir Next" font-size="20" font-weight="500">θ</text><text x="115" y="142" fill="#222E39" font-family="Avenir Next" font-size="20" font-weight="500">θ</text><text x="222" y="120" fill="rgb(255,171,25)" font-family="Avenir Next" font-size="20" font-weight="500">(cos θ, sin θ, 0)</text></g><text x="0" y="80" fill="rgb(255,171,25)" font-family="Avenir Next" font-size="20" font-weight="500">(-sin θ, cos θ, 0)</text></g></svg><figcaption>The rotation of two vectors</figcaption></figure>

The transformed x-only-vector gives the values for the first column of our rotation matrix and the transformed y-only-vector gives us the values for the second column of our rotation matrix. The third or fourth columns don’t alter the transformed vector so these are the same as for an identity matrix. The resulting rotation matrix is thus:

<figure id="matrixFigure" style="height: 205px;"><table class="matrixTable" style="margin-left: 10px"><tbody><tr><td>cos θ</td>
<td>-sin θ</td>
<td>0</td>
<td>0</td>
</tr><tr><td>sin θ</td>
<td>cos θ</td>
<td>0</td>
<td>0</td>
</tr><tr><td>0</td>
<td>0</td>
<td>1</td>
<td>0</td>
</tr><tr><td>0</td>
<td>0</td>
<td>0</td>
<td>1</td>
</tr></tbody></table>
×
<table class="matrixTable"><tbody><tr><td>x</td>
</tr><tr><td>y</td>
</tr><tr><td>z</td>
</tr><tr><td>1</td>
</tr></tbody></table>
=
<table class="matrixTable"><tbody><tr><td>cos θ⋅x</td><td>-</td><td>sin θ⋅y</td>
</tr><tr><td>sin θ⋅x</td><td>+</td><td>cos θ⋅y </td>
</tr><tr><td></td><td>z</td><td></td>
</tr><tr><td></td><td>1</td><td></td>
</tr></tbody></table><figcaption style="position: absolute; bottom: -45px; left: 60px;">The rotation matrix for a rotation around the z-axis.</figcaption></figure>

To verify that this matrix works for a vector with both x and y components is left as an exercise for the reader. Pick a new vector with both x and y components and use the above matrix to calculate the rotated vector. Finally draw the rotated vector in a 2D plane to that the end result meets our expectations.

## 3D rotations and perspective

By applying the same techniques to rotations around the x-axis and y-axis we can figure out their rotation transforms (seen below).

<figure id="matrixFigure" style="height: 500px;"><span style="margin-left: 90px">R<sub>x</sub>(θ) = </span>
<table class="matrixTable" style="margin-bottom: 30px"><tbody><tr><td>1</td>
<td>0</td>
<td>0</td>
<td>0</td>
</tr><tr><td>0</td>
<td>cos θ</td>
<td>-sin θ</td>
<td>0</td>
</tr><tr><td>0</td>
<td>sin θ</td>
<td>cos θ</td>
<td>0</td>
</tr><tr><td>0</td>
<td>0</td>
<td>0</td>
<td>1</td>
</tr></tbody></table><br><span style="margin-left: 90px">R<sub>y</sub>(θ) = </span>
<table class="matrixTable" style="margin-bottom: 30px"><tbody><tr><td>cos θ</td>
<td>0</td>
<td>sin θ</td>
<td>0</td>
</tr><tr><td>0</td>
<td>1</td>
<td></td>
<td>0</td>
</tr><tr><td>-sin θ</td>
<td>0</td>
<td>cos θ</td>
<td>0</td>
</tr><tr><td>0</td>
<td>0</td>
<td>0</td>
<td>1</td>
</tr></tbody></table><br><span style="margin-left: 90px">R<sub>z</sub>(θ) = </span>
<table class="matrixTable" style="margin-bottom: 30px"><tbody><tr><td>cos θ</td>
<td>-sin θ</td>
<td>0</td>
<td>0</td>
</tr><tr><td>sin θ</td>
<td>cos θ</td>
<td>0</td>
<td>0</td>
</tr><tr><td>0</td>
<td>0</td>
<td>1</td>
<td>0</td>
</tr><tr><td>0</td>
<td>0</td>
<td>0</td>
<td>1</td>
</tr></tbody></table><br><figcaption style="position: absolute; bottom: -45px; left: 60px;">The individual rotation matrices for all three axes.</figcaption></figure>

While the point is correctly transformed in 3D space it doesn’t look like a 3D rotation at all. This is because the 3D point is projected to the 2D screen without perspective. If you would go back and scale or translate the z-value you would experience the same problem (though there you would see no difference at all). This is not how we expect 3D objects to look. We expect objects far away to appear smaller and objects up close to appear bigger.

It turns out that computer graphics has one more trick up its sleeve. We always make sure that the fourth value of our vector is 1. If it isn’t then we divide the whole vector with that value so that it becomes 1 (we use scalar division so every value is divided individually). That means that the transformation matrix with <span class="math">1, 1, 1, 2</span> on the diagonal will scale <span class="math">x,y,z</span> by <span class="math">0.5</span> (since it’s <span class="math"><sup>1</sup>/<sub>2</sub></span>). To create the illusion of perspective we want to get a larger-than-one fourth value of our vector for distant points and a smaller-than-one value for nearby points. To achieve that we want some constant value in the third row and fourth column of our transformation matrix, since it’s going to be multiplied with our z-value. What constant value? The short answer is: a value that makes the perspective _look_ good.

One way of thinking about it is that the views we are transforming are a few hundred points wide/high so a rotation is going to cause the far-off points to be a few hundred points away from us. Since a change from 1 to 2 halved the size of the view on screen and we are talking about <span class="math">c⋅z</span> where <span class="math">z</span> is a few hundred we probably want <span class="math">z</span> to be <span class="math"><sup>1</sup>/<sub>a few hundred</sub></span>. To no surprise a typical value for this constant could be <span class="math"><sup>-1</sup>/<sub>500</sub></span>. The minus sign comes from he fact that the z-axis points _into_ the screen instead of out of the screen. 

Another way of thinking about this is to image that the screen is a certain distance, d, from where we are looking (abstractly speaking). The distance is in some made up unit which is not at all related to how far our eyes are from the screen in real life. Since the screen is two dimensional everything needs to be projected onto that screen. The point we are looking from and the point we are looking at stays fixed in 3D space but we can decide how far off the screen is. If we move the screen closer to us then we get more perspective  and if we move it away from us then we get less perspective.

<figure><svg xmlns="http://www.w3.org/2000/svg" version="1.1"><g transform="scale(1.25) translate(30 15)"><line x1="10" y1="100" x2="350" y2="100" stroke="#222E39" stroke-width="2"></line><path d="M355 100 l-12 -8 l0 16 Z"></path><line x1="50" y1="100" x2="300" y2="40" stroke="rgb(255,171,25)" stroke-width="2" stroke-dasharray="8,10"></line><line x1="170" y1="125" x2="170" y2="20" stroke="rgb(255,171,25)" stroke-width="2"></line><line x1="300" y1="100" x2="300" y2="40" stroke="#4594D9" stroke-width="6"></line><line x1="170" y1="100" x2="170" y2="70" stroke="#4594D9" stroke-width="4"></line><text x="360" y="115" fill="#222E39" font-family="Avenir Next" font-size="20" font-weight="500">z</text><text x="290" y="115" fill="#4594D9" font-family="Avenir Next" font-size="20" font-weight="500" transform="rotate(45 290 115)">object</text><text x="170" y="115" fill="#4594D9" font-family="Avenir Next" font-size="20" font-weight="500" transform="rotate(45 170 115)">projection</text><text x="90" y="40" fill="rgb(255,171,25)" font-family="Avenir Next" font-size="20" font-weight="400">“screen”</text><circle cx="50" cy="100" r="5" fill="#222E39"></circle><text x="40" y="85" fill="#222E39" font-family="Avenir Next" font-size="20" font-weight="500">us</text><path d="M50 130 q0 10 30 10 q30 0 30 10 q0 -10 30 -10 q30 0 30 -10" stroke="#222E39" stroke-width="2" fill="none"></path><text x="103" y="170" fill="#222E39" font-family="Avenir Next" font-size="20" font-weight="500">d</text></g></svg><figcaption>The size of an object on our “screen”.</figcaption></figure>

The constant for our perspective depends on the distance to our screen as <sup>-1</sup>/<sub>d</sub>. This is just the same as we had before. It is only another explanation of what that value means. A greater denumerator means a greater distance to the screen which means less perspective. As mentioned above, it turns out that 500 units is a suitable distance to the “screen”.

# Combining multiple transforms

One of the truly powerful things with transformation matrices is how they can be applied one after another and how they can be combined (also known as concatenated). You may remember from the previous post that the order of the transformations matter. Rotating and then translating is not the same as translating and then rotating. By now this should sound very familiar to you. Matrix multiplication works the exact way and a transform is just a matrix, remember. It turns out that you can take two transformation matrices and multiply them and you will get a new transformation matrix that describes the total transformation in a single multiplication.

Lets take an example. We want to translate, then rotate and then translate the four corners of a small view (the same transform we did in the previous post). The resulting matrix of the multiplication is

<figure id="matrixFigure" style="height: 200px;"><span style="margin-left: 10px">T<sub>x</sub>(-c) × R<sub>z</sub>(θ) × T<sub>x</sub>(c) = </span>
<table class="matrixTable"><tbody><tr><td>cos θ</td>
<td>-sin θ</td>
<td>0</td>
<td>c⋅cos θ - c</td>
</tr><tr><td>cos θ</td>
<td>sin θ</td>
<td>0</td>
<td>c⋅sin θ</td>
</tr><tr><td>0</td>
<td>0</td>
<td>1</td>
<td>0</td>
</tr><tr><td>0</td>
<td>0</td>
<td>0</td>
<td>1</td>
</tr></tbody></table><figcaption style="position: absolute; bottom: -45px; left: 30px;">The multiplied transforms to translate-rotate-translate.</figcaption></figure>

Given some arbitrary angle, translation distance and corners we can calculate the new points for our corners after the transformation. By drawing the new corners in our coordinate system we can see that the rectangle ends up where we expect it to. Inputting values into the matrix and drawing the transformed corners are left as an exercise for the reader.

In just the same way we can take any number of transforms and multiply them in the order they should be applied to pre-calculate the one transformation matrix that encapsulates the total transformation of all the others.

#### **Update**

Thanks [Richard Turton](http://twitter.com/richturton) for correcting my English.

-----------------

After reading all of that I hope that you no longer feel that transforms are little pieces of black magic being applied to your views. If you have any feedback, comments or corrections I would love to hear them. I’m [@davidronnqvist](http://twitter.com/davidronnqvist) in Twitter and [@ronnqvist](https://alpha.app.net/ronnqvist) on ADN.

<script src="/script/script-math-behind-transforms.js" type="text/javascript" onload="setUpTableHover()"> </script>