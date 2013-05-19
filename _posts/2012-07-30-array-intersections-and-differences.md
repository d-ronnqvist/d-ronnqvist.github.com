---
layout: post
title: "Array intersections and differences"
description: "In maths and computer science we sometimes use sets, unordered collections of unique entries. NSMutableSet has good basic support for set-operations like unions, intersections, relative complements (also called difference) with operations like unionSet:, minusSet: and intersectSet:. There is also support for subsets. The other extremely common data type is an array, an ordered collection of entries. We don't usually talk about array intersections or array complements but they can sometimes come to good use. While there is no built in methods for this, NSPredicate makes it really easy."
category: 
tags: [Objective-C, NSArray, NSPredicate]
---

In maths and computer science we sometimes use sets, unordered collections of unique entries. [`NSMutableSet`][mutableSet] has good basic support for set-operations like unions, intersections, relative complements (also called difference) with operations like [`unionSet:`][union], [`minusSet:`][minus] and [`intersectSet:`][intersect]. There is also support for subsets.

The other extremely common data type is an array, an ordered collection of entries. We don't usually talk about "array intersections" or "array complements" but they can sometimes come to good use. While there is no built in methods for this, [`NSPredicate`][predicate] makes it really easy.

It is not clearly defined if the union of two arrays should be contain duplicates or not. As we will see, we can easily achieve both. 

# Examples
Imagine that we have two arrays: <span class="math">(3,4,5,6,7)</span> and  <span class="math">(0,2,4,6,8)</span> and what to know the intersection and the relative complement between these.
## Array intersection
The intersection of two collections is the entries that exist in both of them.

<figure>
<div style="margin-bottom: 67%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 300 220" width="100%">
<defs>
  <mask id="intersect">
    <circle cx="100" cy="100" r="90" fill="black" />
    <circle cx="200" cy="100" r="90" fill="white" />
  </mask>
</defs>

<circle cx="100" cy="100" r="90" fill="rgb(255,171,25)" mask="url(#intersect)" />

<circle cx="100" cy="100" r="90" stroke="#222E39" stroke-width="2" fill="none" />
<circle cx="200" cy="100" r="90" stroke="#222E39" stroke-width="2" fill="none" />

<text x="70" y="72" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >7</text>
<text x="33" y="120" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >5</text>
<text x="78" y="167" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >3</text>

<text x="143" y="89" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >4</text>
<text x="131" y="135" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >6</text>

<text x="210" y="73" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >0</text>
<text x="240" y="120" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >2</text>
<text x="195" y="165" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >8</text>
	 
</svg>

</div>
</div>
</figure>
<figcaption>The intersect of two sets.</figcaption>

With arrays this can be achieved by filtering either of the arrays (preferably the smaller for performance reasons) to only include objects that exist in the other array. A predicate that will do this reads as clearly as this:

    NSPredicate *intersectPredicate = 
        [NSPredicate predicateWithFormat:@"SELF IN %@", otherArray];
    NSArray *intersect = 
        [firstArray filteredArrayUsingPredicate:intersectPredicate];

## Relative complement
For the relative complement (the difference) the order matters. It helps to think of it as a subtraction, we remove the common entries from either array.


<figure>
<div style="margin-bottom: 67%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 300 220" width="100%">
<defs>
  <mask id="complement">
    <circle cx="100" cy="100" r="90" fill="white" />
    <circle cx="200" cy="100" r="90" fill="black" />
  </mask>
</defs>

<circle cx="100" cy="100" r="90" fill="rgb(255,171,25)" mask="url(#complement)" />

<circle cx="100" cy="100" r="90" stroke="#222E39" stroke-width="2" fill="none" />
<circle cx="200" cy="100" r="90" stroke="#222E39" stroke-width="2" fill="none" />

<text x="70" y="72" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >7</text>
<text x="33" y="120" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >5</text>
<text x="78" y="167" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >3</text>

<text x="143" y="89" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >4</text>
<text x="131" y="135" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >6</text>

<text x="210" y="73" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >0</text>
<text x="240" y="120" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >2</text>
<text x="195" y="165" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >8</text>
	 
</svg>

</div>
</div>
</figure>
<figcaption>The relative complement of two sets.</figcaption>

This is only a slight modification from the example above. This time we want to keep the entries that does *not* exist in the other array:

    NSPredicate *relativeComplementPredicate = 
        [NSPredicate predicateWithFormat:@"NOT SELF IN %@", otherArray];
    NSArray *relativeComplement = 
        [firstArray filteredArrayUsingPredicate:relativeComplementPredicate];

## Union
The union of two sets is the entires for both the first and the second set. Sets only contain unique values but arrays don't always do that. The question is if the "union" of two arrays should add the intersect twice or not.


<figure>
<div style="margin-bottom: 67%;">
<div style="margin: auto; width: 100%; height: 0px;">
<svg class="autoscaled-svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 300 220" width="100%">

<circle cx="100" cy="100" r="90" fill="rgb(255,171,25)" />
<circle cx="200" cy="100" r="90" fill="rgb(255,171,25)" />

<circle cx="100" cy="100" r="90" stroke="#222E39" stroke-width="2" fill="none" />
<circle cx="200" cy="100" r="90" stroke="#222E39" stroke-width="2" fill="none" />

<text x="70" y="72" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >7</text>
<text x="33" y="120" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >5</text>
<text x="78" y="167" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >3</text>

<text x="143" y="89" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >4</text>
<text x="131" y="135" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >6</text>

<text x="210" y="73" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >0</text>
<text x="240" y="120" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >2</text>
<text x="195" y="165" fill="#222E39" font-family="Avenir Next" font-size="42" font-weight="400" >8</text>
	 
</svg>

</div>
</div>
</figure>
<figcaption>The union of two sets.</figcaption>

### Adding all objects
The method `arrayByAddingObjectsFromArray:` makes this trivial:

    NSArray *union = 
        [firstArray arrayByAddingObjectsFromArray:otherArray];

### Only adding the intersect once
The filled circles (known as Venn diagrams) come to great aid here. We can easily see that what we want is the relative complement added to all the entries in the second array. 

    // Calculating the relative complement was shown above ...
    NSArray *union = 
        [relativeComplement arrayByAddingObjectsFromArray:otherArray]; 

Note that this still allows for duplicate entries since either of the two arrays can contain an entry more then once. Also the intersect can contain the same entry more then once.


[mutableSet]: https://developer.apple.com/library/mac/#documentation/Cocoa/Reference/Foundation/Classes/nsmutableset_Class/Reference/NSMutableSet.html "NSMutableSet documentation"

[union]: https://developer.apple.com/library/mac/#documentation/Cocoa/Reference/Foundation/Classes/nsmutableset_Class/Reference/NSMutableSet.html#//apple_ref/occ/instm/NSMutableSet/unionSet: "unionSet: documentation"

[minus]: https://developer.apple.com/library/mac/#documentation/Cocoa/Reference/Foundation/Classes/nsmutableset_Class/Reference/NSMutableSet.html#//apple_ref/occ/instm/NSMutableSet/minusSet: "minusSet: documentation"

[intersect]: https://developer.apple.com/library/mac/#documentation/Cocoa/Reference/Foundation/Classes/nsmutableset_Class/Reference/NSMutableSet.html#//apple_ref/occ/instm/NSMutableSet/intersectSet: "intersectSet: documentation"

[predicate]: https://developer.apple.com/library/mac/#documentation/Cocoa/Reference/Foundation/Classes/NSPredicate_Class/Reference/NSPredicate.html "NSPredicate documentation"

