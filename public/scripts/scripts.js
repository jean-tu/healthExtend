
// Jean added
function saveOptions() {
	var data = {};
	if(document.getElementById("drinks-sodas").checked){
		data['drinks']= true;
		console.log(true);
	} else {
		data['drinks'] = false;
	}
	if (document.getElementById("snacks").checked){
		data['snacks']= true;
	} else{
		data['snacks']= false;
	}
	if (document.getElementById("fastfood").checked){
		data['fastfood']= true;
	} else{
		data['fastfood']= false;
	}
	if (document.getElementById("vegetables").checked){
		data['vegetables']= true;
	} else{
		data['vegetables']= false;
	}
	if (document.getElementById("fruit").checked){
		data['fruit']= true;
	} else{
		data['fruit']= false;
	}
	if (document.getElementById("nuts").checked){
		data['nuts']= true;
	} else{
		data['nuts']= false;
	}

	jsonStr = JSON.stringify(data);

	var storage = chrome.storage.local;
	alert(data)
	storage.set({'healthEOpts' : jsonStr});
	console.log(jsonStr);
	console.log("click");
}
let btn = document.getElementById('saveBtn');
btn.addEventListener("click", saveOptions, false);
