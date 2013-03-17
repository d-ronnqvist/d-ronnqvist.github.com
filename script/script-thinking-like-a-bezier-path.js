selected_control_point = 0;

var dragTouch = function(e) {
	if (!selected_control_point) return;
	
	var currentElement = document.getElementById("interactive-curve");
	var totalOffsetX = 0;
	var totalOffsetY = 0;
	do{
		totalOffsetX += currentElement.offsetLeft;
		totalOffsetY += currentElement.offsetTop;
	}
	while(currentElement = currentElement.offsetParent)
	
	var t = e.touches[0];
	
	var x = t.pageX - totalOffsetX;
	var y = t.pageY - totalOffsetY;
	
	e.preventDefault();
		
	dragSelectedToPoint(x, y);
}

var drag = function(e) {
	if (selected_control_point == 0) return;
	
	var x = e.offsetX;
	var y = e.offsetY;
	
	dragSelectedToPoint(x, y);
}

var dragSelectedToPoint = function(x, y) {
	var svg = document.getElementById("interactive-curve");
	var height = parseFloat(svg.getAttribute("height"));
	var width  = parseFloat(svg.getAttribute("width"));
	
	var r = parseFloat(document.getElementById("ControlPoint1").getAttribute("r"));
	r+=4.0;

	if (x < r) x = r;
	if (y < r) y = r;
	if (x > width-r) x = width-r;
	if (y > height-r) y = height-r;
	


	selected_control_point.setAttribute("cx", x);
	selected_control_point.setAttribute("cy", y);
	
	var id = selected_control_point.id;
	var lineId = "line"+id;
	
	var line = document.getElementById(lineId);
	
	var x1 = parseFloat(line.getAttribute("x1"));
	var y1 = parseFloat(line.getAttribute("y1"));
	var angle = Math.atan((x1-x)/(y1-y));
	var sign = 1;
	if (y>y1) { sign = -1; }
	line.setAttribute("x2", x+(r-4)*Math.sin(angle)*sign);
	line.setAttribute("y2", y+(r-4)*Math.cos(angle)*sign);
	
	var curve = document.getElementById("curve");
	var path = curve.getAttribute("d");
	var components = path.split(" ");
	
	if (id.slice(-1) == "1") {
		// first control point
		components[4] = x
		components[5] = y
	} else {
		// second control point
		components[6] = x
		components[7] = y
	}
	
	var path = curve.setAttribute("d", components.join(" "));
}

var selectElementTouch = function(e) {
	selected_control_point = event.touches[0].target;
}

var selectElement = function(e) {
	selected_control_point = (e && e.target) || (window.event && window.event.srcElement);
}

var deselectElement = function() {
	selected_control_point = 0;
}

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
