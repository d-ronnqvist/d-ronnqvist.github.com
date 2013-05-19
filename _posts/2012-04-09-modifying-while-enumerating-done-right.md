---
layout: post
title: "Modifying while enumerating, done right"
description: "I've seen so many people trying to or asking how to modify collections while enumerating them. Sometimes they don't even notice that they are doing it.  Depending on where you are coming from it is sometimes called iterating but the problem remains the same: it is not allowed to modify a collection (a set, an array or a dictionary) while enumerating over it."
category: 
tags: [Objective-C, Sorting, Filtering, Collections, Enumeration]
---

I've seen so many people trying to or asking how to modify collections while enumerating them. Sometimes they don't even notice that they are doing it.  Depending on where you are coming from it is sometimes called iterating but the problem remains the same: *it is not allowed to modify a collection (a set, an array or a dictionary) while enumerating over it.*

Let me clarify that for you: you can modify the objects *inside* the collection all you want while enumerating over the collection. It is modifying the collection (adding or removing objects or changing the order where applicable) that is forbidden. 

# What you are actually trying to do

When people are doing this they're often trying to either filter or sort the collection. There are other use-cases for modifying a collection while enumerating but they are far less common so I'll concentrate on these two. Generally the code we are talking about look something like this, using fast enumeration in Objective-C 2.0:

	for (id object in collection) {
	    // remove object or change order of objects
	}

If you are using the new block-based APIs, it would look something like this:

	[array enumerateObjectsUsingBlock:^(id obj, NSUInteger idx, BOOL *stop) {
	    // Remove object of change order of objects
	}];
   

# Making it work

Neither of the above will work. To make them work you would have to store the objects or indices of the objects and remove them after the enumeration. Using fast enumeration on a set it would look like this:

	NSMutableSet *set = // ...
	NSMutableSet *objectsToRemove = [[NSMutableSet alloc] init];
	for (MyPerson *person in set) {
	    if ([person age] < 18) [objectsToRemove addObject:number];
	}
	[set minusSet:objectsToRemove];

Using block-based enumeration on a array, it would look like this:

	NSMutableArray *array = // ...
	NSMutableIndexSet *indicesForObjectsToRemove = 
	    [[NSMutableIndexSet alloc] init];
	[array enumerateObjectsUsingBlock:^(MyPerson *person, 
	                                    NSUInteger idx, 
	                                    BOOL *stop) {
	    if ([person age] < 18) [indicesForObjectsToRemove addIndex:idx];
	}];
	[array removeObjectsAtIndexes:indicesForObjectsToRemove];

**But stop right there!** Even though the above code will work *it's still not the right way of doing things*. When you write code like this, you have most likely been distracted by the nitty-gritty details of the algorithm you have in mind or previous experiences that tell you: "this is how it's done". A line of code should first and foremost *speak its intention* as clearly as possible, performance and everything else comes second[^1]. 

# Pseudocode to the rescue

So let's take a step back, and look at the pseudocode for the above example. It would look something like either of these two examples, using different wordings:

1. `remove all objects from collection where "age" < 18`
2. `filter collection for objects where "age" >= 18`

The second example speaks more clearly to me because it puts the focus on *keeping* the people who are old enough to drink[^3] (`age >= 18` vs `age < 18`). So that's what we are aiming for in clarity when filtering. If we look at the pseudocode for sorting the collection of people by their name would look something like this:

    sort collection by "name" as ascending

Though looking at it, it's almost too simple even for pseudocode. How would you go about sorting people who have the same last name but different first names? The pseudocode should probably be modified to look something like this:

    sort collection by "lastName" as ascending then "firstName" as ascending 

That's probably enough pseudocode for one day so lets look at some "real" code instead

In Objective-C you would take `"lastName" as ascending` and create a [NSSortDecriptor][2]. Then you would pass an array of sort descriptors to your people array and tell it to sort itself with one sort descriptor after another, like this: 

    NSArray *sortedArray = [array sortedArrayUsingDescriptors:@[
      [NSSortDescriptor sortDescriptorWithKey:@"lastName" ascending:YES],
      [NSSortDescriptor sortDescriptorWithKey:@"firstName" ascending:YES]
    ]];

There is also block-based APIs for sorting where you pass a block of code that compares individual pairs of objects and returns a NSComparisonResult. The code for sorting people would look something like this:

    NSArray *sortedArray = 
      [array sortedArrayUsingComparator:^(MyPerson *person1, 
                                          MyPerson *person2) {
        NSComparisonResult lastNameComparison = 
          [[person1 lastName] compare:[person2 lastName]];
            
        if (lastNameComparison != NSOrderedSame) return lastNameComparison;
        return [[person1 firstName] compare:[person2 firstName]];
    }];
  
It becomes quite clear when you look at the two code snippets above that you are sorting the list of people by their last name and then by their first name. Now, let's have a look at filtering a collection. The code that most closely resembles our pseudocode above is using a [NSPredicate][3] to filter the array:

	[array filterUsingPredicate:[NSPredicate predicateWithFormat:@"age>=18"]];

Predicates are very powerful when it comes to filtering collections[^2] but if you prefer blocks there are alternative ways to filter collections:

	NSSet *newSet = 
	  [set objectsPassingTest:^BOOL(MyPerson *person, BOOL *stop) {
	   return ([person age] >= 18);
	}];

The two code snippets above read very clearly, even if your not familiar with Objective-C and that's really the power behind them. They are also very short and leave very little room for corner case logic errors. Objective-C is full of these hidden treasures. As soon you feel like you are writing to much code for something really common you should take a step back and ask yourself what, at a higher level, you really are trying to write. 
	
[^1]: As Knuth would have said: "premature optimizations is the root of all evil".	

[^2]:  Expect an upcoming post on some of these powers in the future. 

[^3]: In Sweden and many other countries you are allowed to drink at 18. 

***************

For those of you who are interested, there is an excellent resource for querying the Objective-C collections (NSSet, NSArray, NSDictionary): [Syntax for Objective-C Queries][1] on GitHub. If you find yourself having to query collections for their content then I strongly suggest that you check it out. 

  [1]: https://github.com/acburk/SOCQ "Syntax for Objective-C Queries - GitHub page"
  [2]: https://developer.apple.com/library/mac/#documentation/Cocoa/Reference/Foundation/Classes/NSSortDescriptor_Class/Reference/Reference.html "NSSortDescriptor Class Reference"
  [3]: https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSPredicate_Class/Reference/NSPredicate.html "NSPredicate Class Reference"
