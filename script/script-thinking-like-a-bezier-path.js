selected_control_point = 0;

svg = document.getElementById("interactive-curve");
height = parseFloat(svg.getAttribute("height"));
width  = parseFloat(svg.getAttribute("width"));

r = parseFloat(document.getElementById("ControlPoint1").getAttribute("r"));

curve = document.getElementById("curve");

//lineId = "";
isFirstPoint = false;

previousScaleFactor = 1;

var dragTouch = function(e) {
	if (!selected_control_point) return;
	
	
//	var currentElement = svg;
//	var totalOffsetX = 0;
//	var totalOffsetY = 0;
//	do{
//		totalOffsetX += currentElement.offsetLeft;
//		totalOffsetY += currentElement.offsetTop;
//	}
//	while(currentElement = currentElement.offsetParent)
	
	var t = e.touches[0];
	
	var x = t.pageX - totalOffsetX;
	var y = t.pageY - totalOffsetY;
	
	e.preventDefault();
	
	if (selected_control_point.id == "sliderKnob") {
		dragSliderToPoint(x);
	} else {
		dragSelectedToPoint(x, y);
	}
}

var drag = function(e) {
	if (selected_control_point == 0) return;
	
	var x = e.offsetX;
	var y = e.offsetY;
	
	if (selected_control_point.id == "sliderKnob") {
		dragSliderToPoint(x);
	} else {
		dragSelectedToPoint(x, y);
	}
}

var dragSliderToPoint = function(x) {
	var minSliderX = 50  * previousScaleFactor;
	var maxSliderX = 500 * previousScaleFactor;
	

	if (x < minSliderX) x = minSliderX;
	if (x > maxSliderX) x = maxSliderX;
	
	var sx = 190; var sy = 80;
	var ex = 420; var ey = 250;
	
	var c1x = -30; var c1y = 350;
	var c2x = 450; var c2y = -20;
	
	var t = (x-minSliderX)/(maxSliderX-minSliderX);
	
	sx*=previousScaleFactor;
	sy*=previousScaleFactor;
	ex*=previousScaleFactor;
	ey*=previousScaleFactor;
	c1x*=previousScaleFactor;
	c1y*=previousScaleFactor;
	c2x*=previousScaleFactor;
	c2y*=previousScaleFactor;
	
	var px = sx*Math.pow(1-t, 3) + 3*c1x*t*Math.pow(1-t, 2) + 3*c2x*Math.pow(t,2)*(1-t) + ex*Math.pow(t, 3);
	var py = sy*Math.pow(1-t, 3) + 3*c1y*t*Math.pow(1-t, 2) + 3*c2y*Math.pow(t,2)*(1-t) + ey*Math.pow(t, 3);
	
	var point = document.getElementById("pathPoint");
	point.setAttribute("cx", px);
	point.setAttribute("cy", py);
	
	var halfScale = (1+previousScaleFactor)/2;
	var text = document.getElementById("sliderText");
	text.setAttribute("x", x-29*halfScale);
	text.firstChild.nodeValue = "t = "+t.toFixed(2);
	
	selected_control_point.setAttribute("cx", x);
}

var dragSelectedToPoint = function(x, y) {
	var rMargin = r+4/previousScaleFactor;
	if (x < rMargin) x = rMargin;
	if (y < rMargin) y = rMargin;
	if (x > width-rMargin) x = width-rMargin;
	if (y > height-rMargin) y = height-rMargin;
	
	var local_control_point = selected_control_point;
	var local_line = line;
	var local_curve = curve;
	
	local_control_point.setAttribute("cx", x);
	local_control_point.setAttribute("cy", y);
		
	var x1 = parseFloat(local_line.getAttribute("x1"));
	var y1 = parseFloat(local_line.getAttribute("y1"));
	var angle = Math.atan((x1-x)/(y1-y));
	var sign = 1;
	if (y>y1) { sign = -1; }
	local_line.setAttribute("x2", x+(r)*Math.sin(angle)*sign);
	local_line.setAttribute("y2", y+(r)*Math.cos(angle)*sign);
	
	var path = local_curve.getAttribute("d");
	var components = path.split(" ");
	
	if (isFirstPoint) {
		// first control point
		components[4] = x/previousScaleFactor;
		components[5] = y/previousScaleFactor;
	} else {
		// second control point
		components[6] = x/previousScaleFactor;
		components[7] = y/previousScaleFactor;
	}
	
	local_curve.setAttribute("d", components.join(" "));
}

var selectElementTouch = function(e) {
	selected_control_point = event.touches[0].target;
	var id = selected_control_point.id
	isFirstPoint = (id.slice(-1) == "1");
	var lineId = "line"+id;
	line = document.getElementById(lineId);
	
	var currentElement = svg;
	totalOffsetX = 0;
	totalOffsetY = 0;
	do{
		totalOffsetX += currentElement.offsetLeft;
		totalOffsetY += currentElement.offsetTop;
	}
	while(currentElement = currentElement.offsetParent)
}

var selectElement = function(e) {
	selected_control_point = (e && e.target) || (window.event && window.event.srcElement);
	
	var id = selected_control_point.id
	isFirstPoint = (id.slice(-1) == "1");
	var lineId = "line"+id;
	line = document.getElementById(lineId);
}

var deselectElement = function() {
	selected_control_point = 0;
}

var correctInstructions = function() {
	if ("ontouchstart" in window) {
		// A touch device
		
		document.addEventListener("orientationchange", updateOrientation);
		updateOrientation();
		
		var instruction = document.getElementsByClassName("hintText");
		for (var i in instruction) {
			instruction[i].firstChild.nodeValue = "Tap the code below";
		}
	}
}



function updateOrientation() {
//	switch(window.orientation) {
//		case 0: // portrait, home bottom
//		case 180: // portrait, home top
//			alert("portrait H: "+$(window).height()+" W: "+$(window).width());       
//			break;
//		case -90: // landscape, home left
//		case 90: // landscape, home right
//			alert("landscape H: "+$(window).height()+" W: "+$(window).width());
//			break;
//	}
//}
//
//var resizeSVG = function() {

	var svg = document.getElementById("interactive-curve");
	var svg2 = document.getElementById("interactive-slider");
	var fig = svg.parentNode.parentNode;
	var scaleFactor = fig.clientWidth / parseFloat(svg.getAttribute("width"));
	
	if (previousScaleFactor != 1) {
		scaleSVGElements(svg, 1/previousScaleFactor);
		scaleSVGElements(svg2, 1/previousScaleFactor);
	}
	
	scaleSVGElements(svg, scaleFactor);
	scaleSVGElements(svg2, scaleFactor);
	
	previousScaleFactor = scaleFactor;
	
	height = parseFloat(svg.getAttribute("height"))*scaleFactor;
	width  = parseFloat(svg.getAttribute("width"))*scaleFactor;
	r = parseFloat(document.getElementById("ControlPoint1").getAttribute("r"));
}

var scaleSVGElements = function(svg, factor) {
	var halfScale = (1+factor)/2;

	for (var i in svg.childNodes) {
		var node = svg.childNodes[i];
		if (node.nodeType != 3) {
			if (node.tagName == "path") { 
				node.setAttribute('transform-origin', '0%, 0%');
				node.setAttribute("transform", "scale("+factor+")")
			} else if (node.tagName == "g") {
				node.setAttribute("stroke-width", parseFloat(node.getAttribute("stroke-width"))*halfScale);
				scaleSVGElements(node, factor);
			} else if (node.tagName == "line") {
				node.setAttribute("x1", parseFloat(node.getAttribute("x1"))*factor);
				node.setAttribute("y1", parseFloat(node.getAttribute("y1"))*factor);
				node.setAttribute("x2", parseFloat(node.getAttribute("x2"))*factor);
				node.setAttribute("y2", parseFloat(node.getAttribute("y2"))*factor);
			} else if (node.tagName == "circle") {
				node.setAttribute("cx", parseFloat(node.getAttribute("cx"))*factor);
				node.setAttribute("cy", parseFloat(node.getAttribute("cy"))*factor);
				node.setAttribute("r", parseFloat(node.getAttribute("r"))*halfScale);
				
			} else if (node.tagName == "text") {
				node.setAttribute("x", parseFloat(node.getAttribute("x"))*factor);
				node.setAttribute("y", parseFloat(node.getAttribute("y"))*factor);
				node.setAttribute("font-size", parseFloat(node.getAttribute("font-size"))*halfScale);
			}
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
