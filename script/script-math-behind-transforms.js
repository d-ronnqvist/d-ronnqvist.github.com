function setUpTableHover() {
    var table = document.getElementById("matrixThree");

    for (var i = 0, row; row = table.rows[i]; i++) {
        //iterate through rows
        //rows would be accessed using the "row" variable assigned in the for loop
        for (var j = 0, col; col = row.cells[j]; j++) {
            //iterate through columns
            //columns would be accessed using the "col" variable assigned in the for loop
            col.onmouseover = function() {
                var one = document.getElementById("matrixOne");
            	var two = document.getElementById("matrixTwo");
            	var row = this.parentNode.rowIndex;
            	var col = this.cellIndex;
            	
            	var multi = this.innerHTML + " =";
            	for (var j = 0; j<one.rows[row].cells.length; j++) {
            	    if (j>0) {multi += "+";}
            		one.rows[row].cells[j].style.backgroundColor="hsl(38, 100%, "+(75-j*20)+"%)";
            		two.rows[j].cells[col].style.backgroundColor="hsl(38, 100%, "+(75-j*20)+"%)";
            		multi += "<span style='background:hsl(38, 100%, "+(75-j*20)+"%)'>";
            		multi += one.rows[row].cells[j].innerHTML + " ⋅ " + two.rows[j].cells[col].innerHTML;
            		multi += "</span>";
            	}
            	this.style.backgroundColor="#FFD17F";

            	document.getElementById("multiplicationText").innerHTML = multi;
            }
            col.onmouseout=function() {
            	var one = document.getElementById("matrixOne");
            	var two = document.getElementById("matrixTwo");
            	var row = this.parentNode.rowIndex;
            	var col = this.cellIndex;
            	for (var j = 0; j<one.rows[row].cells.length; j++) {
            		one.rows[row].cells[j].style.backgroundColor="transparent";
            		two.rows[j].cells[col].style.backgroundColor="transparent";
            	}
            	this.style.backgroundColor="transparent";
            	
            	document.getElementById("multiplicationText").innerHTML = "Hover the matrix C..."

            }
    	}  
    }
}