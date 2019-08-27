
var nodelist = document.getElementsByTagName("li");

for(var i=0; i<nodelist.length; i++)
{
	var span = document.createElement("span");
	console.log("span");
  console.log(span);
  var txt = document.createTextNode("\u00D7");
  console.log("txt");
  console.log(txt);
  span.className="close";
	span.appendChild(txt);
	nodelist[i].appendChild(span);
}

var close = document.getElementsByClassName("close");
console.log("close");
console.log(close);

for(var x=0;x<close.length;x++)
{
	close[x].onclick = function() {
		var div = this.parentElement;
		div.style.display = "none";
	}
}

// Add a "checked" symbol when clicking on a list item
var list = document.getElementById("myList");
console.log("list ul>li");
console.log(list);

if(list!=null){
  list.addEventListener('click',function(ev){
    if(ev.target.tagName === "li") { ev.target.classList.toggle("checked"); }
  }, false);
}
 
// Create a new list item when clicking on the "Add" button
function addNewElement() 
{
  console.log("AddNewValue");
  var li = document.createElement("li");
  var inputValue = document.getElementById("inputElement").value;
  console.log("inputValue");
  console.log(inputValue);

  var t = document.createTextNode(inputValue);
  li.appendChild(t);

  if(inputValue===''){ alert("You must write something!"); }
  else{ document.getElementById("myList").appendChild(li); }
  
  document.getElementById("inputElement").value = "";

  var span = document.createElement("span");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for(i=0; i<close.length; i++){
    close[i].onclick = function(){
      var div = this.parentElement;
      div.style.display = "none";
    }
  }

} 
