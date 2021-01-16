function dodaj_pytanie()	{
var a=document.getElementById("question").value;
//sprawdzenie czy użytkownik wprowadził wartość,
//ponieważ mógł od razu wcisnąć przycisk Dalej
if (a=='') document.getElementById("wynik").innerHTML='Nie wprowadzono pytania'; 
	else {
		//wyświetlenie pobranej wartości
		document.getElementById("wynik").innerHTML=a;
	}
}

function createNewElement() {
    // First create a DIV element.
	var txtNewInputBox = document.createElement('div');
	
	
	var myQuestion;
  var question = document.getElementById("type").value;
  switch(question) {
    case "5ffae2a70225760e3ed0da84":
      txtNewInputBox.innerHTML = "<input type='radio' name='newInputRadio[]'> <input type='text' name='questionContent[]' >";
      break;
    case "5ffae2c30225760e3ed0da85":
      txtNewInputBox.innerHTML = "<input type='text' name='questionContent[]'>";
      break;
    case "5ffae2cc0225760e3ed0da86":
      txtNewInputBox.innerHTML = "<input type='checkbox' name='newCheckbox[]'><input type='text' name='questionContent[]' >";
      break;
    default:
      txtNewInputBox.innerHTML = "I have never heard of that fruit...";
  }

	
	
	
	
    // Then add the content (a new input box) of the element.
	//txtNewInputBox.innerHTML = "<input type='text' name='newInputBox[]'>";

    // Finally put it where it is supposed to appear.
	document.getElementById("newElementId").appendChild(txtNewInputBox);
}

function deleteAnswer() {
	var myobj = document.getElementById('newElementId');
	myobj.removeChild(myobj.lastChild);
}