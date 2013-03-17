var correctInstructions = function() {
	if ("ontouchstart" in window) {
		// A touch device
		
		var instruction = document.getElementsByClassName("hintText");
		for (var i in instruction) {
			instruction[i].firstChild.nodeValue = "Tap the code below";
		}
	}
}

var leaveCodeFunction = function(rootId) {
	var root = document.getElementById(rootId)

	root.getElementById("hoverHint").setAttribute("style", "opacity:1;");

	for (var i = 0 ; i<=50 ; i++ ) {
		var step = root.getElementById("step"+i);
		var dot = root.getElementById("dot"+i);
		if (dot) dot.setAttribute("class", "dot");
		if (step) step.removeAttribute("class");
		
		if (!dot && !step && i>0) break;
	}
}

var hoverCodeFunction = function(e, rootId) {
    var targ;
    if (!e) var e = window.event;
    if (e.target) targ = e.target;
    else if (e.srcElement) targ = e.srcElement;
    if (targ.nodeType == 3) // defeat Safari bug
        targ = targ.parentNode;

    if (targ.className == "hoverCode") return;

	if (targ.className == "cgpath" || targ.className == "uibezier") {
		targ = targ.parentNode;
	}
	
	if (targ.className == "codeHighlight") {
		targ = targ.parentNode.parentNode;
	}
	
    var hoverId = targ.id;
    var hoverNumber = parseInt(hoverId.substring(5));
    
    var root = document.getElementById(rootId);
    
    root.getElementById("hoverHint").setAttribute("style", "opacity:0;");
    
    for (var i = 0 ; i<=50 ; i++ ) {
   	
    	var step = root.getElementById("step"+i);
    	var dot = root.getElementById("dot"+i);
    	
    	if (!dot && !step && i>0) break;
    	
    	if (dot) dot.setAttribute("class", "dot");
    	if (i < hoverNumber) {
    		if (step) step.setAttribute("class", "previous");  
    	}
    	else if (i == hoverNumber ) {
    		if (dot) dot.setAttribute("class", "currentDot");
    		if (step) step.setAttribute("class", "current");
    	} 
    	else {
    		if (step) step.setAttribute("class", "upcoming");
    	}
    	
    }
    
}

var selectUIBezierPath = function() {
	var bezierSegments = document.getElementsByClassName("uibezierSegment");
	for (var i in bezierSegments) {
		bezierSegments[i].className = "uibezierSegment segment selectedSegment";
	}
	var cgpathSegments = document.getElementsByClassName("cgpathSegment");
	for (var i in cgpathSegments) {
		cgpathSegments[i].className = "cgpathSegment segment";
	}
	
	var bezierCode = document.getElementsByClassName("uibezier");
	for (var line in bezierCode) {
		bezierCode[line].className = "uibezier";
	}
	var cgpathCode = document.getElementsByClassName("cgpath");
	for (var line in cgpathCode) {
		cgpathCode[line].className = "cgpath hidden";
	}
}

var selectCGPath = function() {
	var bezierSegments = document.getElementsByClassName("uibezierSegment");
	for (var i in bezierSegments) {
		bezierSegments[i].className = "uibezierSegment segment";
	}
	var cgpathSegments = document.getElementsByClassName("cgpathSegment");
	for (var i in cgpathSegments) {
		cgpathSegments[i].className = "cgpathSegment segment selectedSegment";
	}
	
	var bezierCode = document.getElementsByClassName("uibezier");
	for (var line in bezierCode) {
		bezierCode[line].className = "uibezier hidden";
	}
	var cgpathCode = document.getElementsByClassName("cgpath");
	for (var line in cgpathCode) {
		cgpathCode[line].className = "cgpath";
	}
}
