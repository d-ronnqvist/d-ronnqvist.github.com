---
layout: post
title: "Working with Dates"
description: "As programmers we have to deal with dates and times in many real life situations: \"are there any calendar events today?\", \"how many days until the new iPhone comes out?\", \"sort these messages by when they were posted\", \"set an alarm for tomorrow morning at 7\". At first glance these tasks can seem simple but dates have a lot of subtleties that can easily be overlooked."
category: 
tags: [Foundation, Date & Time, iOS, OS X]
---

<style>{% include style-working-with-dates.css %}</style>

As programmers we have to deal with dates and times in many real life situations: "are there any calendar events today?", "how many days until the new iPhone comes out?", "sort these messages by when they were posted", "set an alarm for tomorrow morning at 7". At first glance these tasks can seem simple but dates have a lot of subtleties that can easily be overlooked. 

Let's start with a simple one: *months don't have the same number of days*. This may not seem like such an issue so let me give an example. If you add one month to January 16 you would end up with February 16, right? So far, so good. What date do you end up with if you add one month to January *31*? There is no February 31 so the next best thing would be February 28 (or 29 on a leap year just to make it more complicated[^leapYear]). Now if we add another month we'd end up with March *28* even though March has 31 days. What is even more annoying is that if we go back and add *two* months to January 31 we'd end up with March *31*. Adding time in smaller intervals is not *always* the same as adding it in one big calculation. <span class="math">1+1≠2</span> for many of the calendrical components.

Most developers wouldn't do their own calculations with months but still many overlook that one day does not always equal 24 hours. Let me say that again: one day does *not always* equal 24 hours. A lot of countries have daylights saving time (of course [not all on the same day][DLS/Country]) and twice a year it will cause your alarm to go off an hour early or late if you are not careful. By now I hope that you are convinced that rolling your own date calculations is a bad idea. Instead we should use `NSDate`s when working with dates. 

# What does a date look like?

`NSDate` is a great *model* class for dates[^dateString]. Emphasis on "model"  since there are many ways to represent a date in text[^dateAsText] and other user interfaces but the actual data behind the date doesn't make much sense to most people (usually it's the number of seconds since new year 1970 or some other year). We use a `NSDateFormatter` to create a meaningful textual representation for the UI. Just as with date calculations, think twice before rolling your own formatter. Dates and times are formatted differently in different languages and some calendars (there are more then one) [can have 13 months][chineseCalendar], some calendars have leap months (`NSDateComponent` has a `isLeapMonth` method since iOS 6 and OS X 10.8) and other things you'd rather not know about.

`NSDateFormatter` can be configured in two ways: by using predefined styles for date and time or by specifying the format string yourself. When using the predefined styles you pass a `NSDateFormatterStyle` (...NoStyle, ...ShortStyle, ...MediumStyle, ...LongStyle, ...FullStyle) to the `dateStyle` and `timeStyle` properties. The [official documetation][formatterStyle] has good concrete examples of how each style affect both date and time. This solution can be good when converting a date to a string (a date can always be converted to any valid format) but converting back to a date won't work unless the string matches the format. In cases where you want to format a date in a custom way or need to parse a string whose format you can't control[^internetDates] you can write you own format strings. The [official specification][dateformat] is a useful reference once you know how to read and write these. Let's start by pointing out some of the most common format components (there are more). I'll be formatting the date 1987-08-27 15:24:03 in all examples.


|format    |result  |
|---------:|-------:|
|yy        |87      |
|yyyy      |1987    |
|M         |8       |
|MM        |08      |
|MMM       |Aug     |
|MMMM      |August  |
|dd        |27      |
|HH        |15      |
|hh        |03      |
|a         |PM      |
|mm        |24      |
|m         |24      |
|ss        |03      |
|s         |3       |


Just as with "M" and "MM", you can control the padding with zeroes for "dd", "HH", "hh", "mm" and "ss" by using either one or two letters. This can be combined in almost any way and together with other symbols like "-", ":", "/" or "(" as seen below:

|format               |result              | 
|:--------------------|:-------------------|
|yyyy-MM-dd HH:mm:ss  |1987-08-27 15:24:03 |
|h:mm a dd/MMM (yy)   |3:24 PM 27/Aug (87)[^neverDoThis] |

Creating these two formatters is as easy as creating a new formatter and assigning a `dateFormat` string. Then you can use `stringFromDate:` to format the date as a string.

{% highlight obj-c %}
NSDateFormatter *resonableFormatter = [NSDateFormatter new];
resonableFormatter.dateFormat = @"yyyy-MM-dd HH:mm:ss";

NSDateFormatter *avoidThisFormatter = [NSDateFormatter new];
avoidThisFormatter.dateFormat = @"h:mm a dd/MMM (yy)";
{% endhighlight %}

Parsing a date from a string (or converting from one formatter string to another) can be done with a similar method `dateFromString:`. For example, todays date one the second (sort of crazy) format above can be converted to the more reasonable format like this:

{% highlight objc %}
NSString *strangeDateString = @"8:10 PM 18/Sep (13)";
// Use the correct formatter to parse the date
NSDate *dateFromString = 
  [avoidThisFormatter dateFromString:strangeDateString];
// Use the other formatter to create a new string
NSString *resonableString = 
  [resonableFormatter stringFromDate:dateFromString]);
{% endhighlight  %}

[^neverDoThis]: Please, never format your dates like this.

# Working with days

So, days should be used when working with dates and can be converted to and from strings when necessary but what does "working with dates" actually look like? 

Since date objects are really just seconds since a given date they can't really do much more than compare agains each other without additional information. That information comes from an `NSCalendar`. It abstracts away the actual details of the actual calendar. If you need to know those details you can get them by calling `minimumRangeOfUnit:` and `maximumRangeOfUnit:` which for the Gregorian calendar and the "Day calendar unit" will return 1-28 (for February) and and 1-31 (for January, March, May, July, August, October, December).

`NSCalendar` is what allows dates to work with calendrical calculations like days, weeks, months or combinations thereof. The data structure to group a number of days, weeks, months, etc. is called `NSDateComponents`. For example: the date component for "one week, three days and seven hours" would be created like

{% highlight objc %}
NSDateComponents *example = [NSDateComponents new];
example.weekOfYear = 1; // weekOfYear is best practice (see below)
example.day  	   = 3;
example.hour 	   = 7;
{% endhighlight %}

It is very clear what we are dealing with which is the main reason why I like it so much. 

Note the usage of `weekOfYear`. There is some ambiguity to the term "week" since it could be interpreted as both "week of year" (e.g. week 32) and "week of month" (e.g second week of May). Apple recommend that you use the `weekOfYear` or `weekOfMonth` components instead for this very reason. Both have been available since iOS 5 and OS X 10.7 so there shouldn't be any issues with older versions for most of you.

As far as calculations go: let's start small and add one day to the current date and time. When presenting the results of all these computations I'm using the Gregorian calendar with Swedish locale where applicable (like for daylight savings time). 

{% highlight obj-c %}
NSDateComponents *oneDay = [NSDateComponents new];
oneDay.day  = 1;

NSDate *now = [NSDate date];
NSCalendar *calender = [NSCalendar currentCalendar];
NSDate *sameTimeTomorrow = [calender dateByAddingComponents:oneDay
                                                     toDate:now
                                                    options:0];
{% endhighlight %}

When I run this today (September 18 20:10) the output is (September 19 20:10) just as expected. Similarly if I were to add the `oneDay` component to October 26 12:34 (thus crossing the end of daylight saving time (2013-10-27 03:00)) the result would be October 27 12:34, also as expected. However, adding 24 hours to October 26 12:34 will give you October 27 **11**:34 because that does not take daylight savings into account. Point is, when adding one day you should be adding *one day*.

# Is it today?

Another common problem when working with dates is to find out if a given date is sometime today or filter through a collection of dates to find the ones that are today. Of course "today" can be substituted with tomorrow or any other day but the problem is still the same. One approach that works out okay when checking just a single date is to extract the year, month and day date components and checking that they are the same as the date components of today. 

{% highlight objc %}
NSUInteger yearMonthDay = NSYearCalendarUnit  |
                          NSMonthCalendarUnit |
                          NSDayCalendarUnit;
NSDateComponents *components =
  [calendar components:yearMonthDay
              fromDate:someDate];
if (components.year  == expectedYear  &&
    components.month == expectedMonth &&
    components.day   == expectedDay) {
    // is today ...
}
{% endhighlight %}

However, if you are checking multiple dates it is probably better to find the dates that define the start and end of today and check which dates are between those dates. There is a somewhat strange method on NSCalendar called `rangeOfUnit:startDate:interval:forDate:` that can help out with this. The documentation says

> Returns by reference the starting time and duration of a given calendar unit that contains a given date.

"Returns by reference" mean that the `startDate` argument (`NSDate **`) and `interval` argument (`NSTimeInterval *`) will contain these two results. The actual return value is a `BOOL` for whether of not the calculation could be made. Since we want to know the start of the day we pass a new `NSDate **` for the `startDay` argument and the "day" calendar unit. 

{% highlight objc %}
// beginning of today
NSDate *beginDate = nil;
// remove everything after the day (i.e. hour, minute, second)
[calendar rangeOfUnit:NSDayCalendarUnit
            startDate:&beginDate
             interval:NULL
              forDate:[NSDate date]];
{% endhighlight %}

At the end of this calculation beginDate is "2013-09-18 00:00:00" (given that today is "2013-09-18 20:10:33"). By adding one day to beginDate we have the two dates that define the beginning and end of today. 

{% highlight objc %}
// end date that is one day after begin date
NSDateComponents *oneDay = [NSDateComponents new];
oneDay.day = 1;
NSDate *endDate = [calendar dateByAddingComponents:oneDay
                                            toDate:beginDate
                                           options:0];
{% endhighlight %}                                              
    
Every date that comes after the begin date and before the end date is sometime today. This comparison is very cheap to make since it only has to compare the underlying double values for the dates. We can create a very descriptive predicate for this check and use it to filter out all the dates that is sometime today.
    
    NSPredicate *todayPredicate = 
      [NSPredicate predicateWithFormat:@"(date >= %@) AND (date < %@)",
                                       beginDate,
                                       endDate];
  
    NSArray *datesThatAreToday =
      [manyDates filteredArrayUsingPredicate:todayPredicate];

The same predicate can of course be used to check a single date as well.

    BOOL isSometimeToday = [todayPredicate evaluateWithObject:someDate];

  
# How many days until Christmas?

Another common date and time problem is to calculate the time between two dates. The problem scales from "how long until the next train comes?" to "how many days until Christmas?" and beyond. It also scales back in time: "how many months old am I?". While you *can* get the time interval in seconds using only `timeIntervalSinceDate:` on one of the date objects, I hope that by now that you realise the kinds of problems you would face when trying to turn that into months. Instead we use NSCalendar to return the date components between the two dates using `components:fromDate:toDate:options:`. This method is both powerful and flexible. You get only the date components you ask for using the larger components first. For example "how many weeks and days until Christmas Eve[^christmas]" would look like this:

	NSDateComponents *untilChristmasEve =
	  [calendar components:NSWeekOfYearCalendarUnit|NSDayCalendarUnit
                  fromDate:today
                    toDate:christmasEve
                   options:0];
	
	NSLog(@"There are %zd weeks and %zd days until Christmas Eve.",
		  untilChristmasEve.weekOfYear, untilChristmasEve.day);


If you only pass the day calendar unit you will get the entire interval as days (97 days). 

# When is the first Monday in May? When is the next Wednesday?

One last kind of common date problem is finding a date with a specific calendrical constraint, like being a monday. The first example (the first Monday in May) has three explicit pieces of information ("first", "Monday", "May") and one implicit piece (assumed this year). When creating date components for this it is important that you include *all* this information. 

{% highlight objc %}
NSDateComponents *components = [NSDateComponents new];
components.weekdayOrdinal = 1; // first
components.weekday = 2;        // Monday
components.month   = 5;        // May
components.year    = 2013;     // (this year)

NSDate *firstMondayInMay = [calendar dateFromComponents:components];
{% endhighlight %}   

Without specifying the `weekdayOrdinal` the date components become ambiguous since there is more then one monday in May and the result won't be what you wanted (I got May 1 (not a Monday) when I tried). 

Creating a date like this is fairly simple (as long as you remember to set enough date components) since it's an absolute date. Finding "the next" wednesday can be a little bit (but not much) harder since it's a relative date. 

We can get any existing date components from a date using `components:fromDate:` and modify them before using them creating a new date. The only thing we need to remember is that we stay in the same week when the weekday changes so we may end up with previous Wednesday instead. Another case is that we end up with the same day as today, like today (Sep 18 which is a Wednesday).

{% highlight objc %}
NSUInteger componentsFromToday = NSWeekdayCalendarUnit        |
                                 NSWeekdayOrdinalCalendarUnit |
                                 NSMonthCalendarUnit          |
                                 NSYearCalendarUnit;
NSDateComponents *todayComponents = 
  [calendar components:componentsFromToday
              fromDate:today];
todayComponents.weekday = 4;  // Wednesday;
todayComponents.hour    = 12; // (noon is good practice)
NSDate *nextWednesday = [calendar dateFromComponents:todayComponents]; 
// well... it could be the next Wednesday

if ([nextWednesday compare:today] != NSOrderedDescending) {
    // Ascending is the previous occurrence
    // Same      is not the "next" occurrence
    NSDateComponents *oneWeek = [NSDateComponents new];
    oneWeek.week = 1;
    nextWednesday = [calendar dateByAddingComponents:oneWeek
                                              toDate:nextWednesday
                                             options:0];
    // now it's definitely the next Wednesday
}
{% endhighlight %}

There are cases where you would think that this would break but luckily `NSCalendar` and `NSDateComponents` are clever enough to work even for weekdays which doesn't exist in that week. If you look at the last week of December you will see that it ends with a Tuesday so setting the weekday to Wednesday should be invalid. However when you create a date from the modified components you will end up with 2014-01-01 as you'd expect. Aren't you glad that you don't have to do that logic yourself?

--------

Code for all the examples that were shown or mentioned in this post can be found is [this GitHub gist][gist]. 

Are there other common date operations that you find yourself doing that I missed or do you think I did some of them wrong? Tell me about them. I know there is NSTimeZone but I rarely see it being misused.

As a final word: if you haven't already, look at all the shiny new things in `NSCalendar.h` and maybe dupe [rdar://14995171][radar] if you wan't more of it brought over to iOS. 
 
[radar]: https://openradar.appspot.com/radar?id=5813401443893248 "Radar #14995171"

[^christmas]: I'm using Dec 24 21:00 as Christmas Eve in this calculation. It is common in Sweden to celebrate the eve instead of the actual day.

[formatterStyle]: https://developer.apple.com/library/mac/documentation/Cocoa/Reference/Foundation/Classes/NSDateFormatter_Class/Reference/Reference.html#//apple_ref/doc/c_ref/NSDateFormatterStyle "NSDateFormatterStyle documentation"

[dateformat]: http://unicode.org/reports/tr35/tr35-6.html#Date_Format_Patterns "Date Format Patterns"

[^dateAsText]: There are also [many bad ways of writing numerical dates as text][xkcdDates]. 

[^leapYear]: Did you know that not all calendars have the same rules for leap years.

[^dateString]: Strings however are [not very good model objects for dates (number 7)][stringly].

[DLS/Country]: http://en.wikipedia.org/wiki/Daylight_saving_time_by_country "Daylight saving time per country (Wikipedia)"

[xkcdDates]: https://xkcd.com/1179/ "XKCD: ISO 8601 (date standard)"

[stringly]: http://www.codinghorror.com/blog/2012/07/new-programming-jargon.html "New Programming Jargon (link refers to #7)"

[chineseCalendar]: http://en.wikipedia.org/wiki/Chinese_calendar#Year_.28Ni.C3.A1n.E5.B9.B4.29 "Chinese Calendar (Wikipedia)"


[^internetDates]: I didn't know where to put it but there is a [good Q&A about formatting Internet-style date strings][qa1480].

[qa1480]: https://developer.apple.com/library/ios/qa/qa1480/_index.html "Technical Q&A QA1480 (about formatting Internet dates)"

[gist]: https://gist.github.com/d-ronnqvist/6600444 "Code for all the examples in this article"