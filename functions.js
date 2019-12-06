//run js after html content loaded
document.addEventListener("DOMContentLoaded", function(e) 
{
  var myList=document.getElementsByTagName("li");
  /**
   * Add a span element at the end of li
   */
  for(var i=0;i<myList.length;i++)
  {
    var span=document.createElement("SPAN");
    var txt=document.createTextNode("\u00D7");
    
    span.className="close";
    span.appendChild(txt);
    myList[i].appendChild(span);
  }

  /**
   * Add onclick at every span close
   */
  var close = document.getElementsByClassName("close");
  for(var x=0;x<close.length;x++){
    close[x].onclick = function() {
      var div = this.parentElement;
      div.style.display = "none";
    }
  }

  /**
   * Add a cheched class when click on a list of item
   * With EventListener
   */
  var list = document.getElementById("myList");
  if(list!=null){
    list.addEventListener('click',function(ev){
      if(ev.target.localName=="li"){
        ev.target.classList.toggle("checked");
      }
    }, false);
  }
});

/**
 * Add New Element in the list (li)
 *  this function is out of DocumentLoaded because will be ever accessible 
 */
function addNewElement() 
{
  var li = document.createElement("li");
  var inputValue = document.getElementById("inputElement").value;

  var t = document.createTextNode(inputValue);
  li.appendChild(t);

  if(inputValue==='') alert("You must write something!");
  else document.getElementById("myList").appendChild(li);

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

function doAuth(form)
{
  console.log("auth");
  console.log(form);
  email= document.getElementById('email');
  pswd= document.getElementById('password');
  
  console.log(email);
  console.log(pswd);

  //mongodb = require('mongodb'); 


}






