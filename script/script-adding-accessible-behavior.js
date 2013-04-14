currentModal = 0;
currentModalHierarchy = 0;

function markAsModal(view) 
{
    if (currentModal != 0) {
    	removeModalMark(currentModal);
    	removeModalMark(currentModalHierarchy);
    }
    if (view.id.slice(-1) == "H") {
    	currentModal = document.getElementById(view.id.slice(0, -1));
    	currentModalHierarchy = view;
    } else {
    	currentModal = view;
    	currentModalHierarchy = document.getElementById(view.id+"H");
    }
	currentModal.className += " modal";
	currentModalHierarchy.className += " modal";
	markViewsInViewExcept(currentModal.parentNode, currentModal, true);
	markViewsInViewExcept(currentModalHierarchy.parentNode, currentModalHierarchy, true);
}

function removeModalMark(view) 
{
	currentModal.className = currentModal.className.replace(" modal", "");
	currentModalHierarchy.className = currentModalHierarchy.className.replace(" modal", "");
	
	markViewsInViewExcept(currentModal.parentNode, currentModal, false);
	markViewsInViewExcept(currentModalHierarchy.parentNode, currentModalHierarchy, false);
	
}

function markViewsInViewExcept(view, except, ignore) 
{
	var elem = view.firstChild;
	do {
		if (elem != except) {
			if (ignore) {
				elem.className += " ignored";
			} else {
				elem.className = elem.className.replace(" ignored", "");
			}
		
			if (elem.hasChildNodes()) {
				markViewsInViewExcept(elem, except, ignore);
			}
		}
	} while (elem = elem.nextSibling);
}

var views = document.getElementsByClassName("view");
for (var i=0; i<views.length; i++) {
	var v = views[i];
	v.addEventListener("mouseover", function() {
		markAsModal(this);
	}, true); 
	v.addEventListener("mouseout", function() {
		removeModalMark(this);
	}, true); 
	v.addEventListener("touchend", function() {
		markAsModal(this);
	}, true);
}

var viewsH = document.getElementsByClassName("viewHeirarchy");
for (var iH=0; iH<viewsH.length; iH++) {
	var vH = viewsH[iH];
	vH.addEventListener("mouseover", function() {
		markAsModal(this);
	}, true); 
	vH.addEventListener("mouseout", function() {
		removeModalMark(this);
	}, true); 
	vH.addEventListener("touchend", function() {
		markAsModal(this);
	}, true);
}

document.getElementsByTagName("figure")[0].addEventListener("touchend", function() {
	removeModalMark(this);
}, true);

