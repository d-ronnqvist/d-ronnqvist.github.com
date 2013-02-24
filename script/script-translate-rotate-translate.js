function resetAnimation(sender) {
    var figureContainer=sender.parentNode;
    figureContainer.className = "replayAnimation";
	figureContainer.focus();
	figureContainer.className = '';
	figureContainer.blur();
}
	    
function checkVisibility() {
	var scrollOffset=window.pageYOffset; 
	var visibleHeight=window.innerHeight;
	
	var figures = document.getElementsByTagName('figure');
	for (var i in figures) {
		var figure = figures[i];
		var top = figure.offsetTop;
		var bottom = top+figure.offsetHeight;
		if((' '+figure.className+' ').indexOf(' pausedAnimation ') > -1) { // contains 'pausedAnimation'
			if (top>=scrollOffset && bottom<=scrollOffset+visibleHeight) {
				figure.className = figure.className.replace('pausedAnimation', '');  
			}      
		}
	}
}