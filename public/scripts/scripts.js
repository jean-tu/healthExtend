
// Jean added
function saveOptions() {
	var data = {};
  data['vegetables']= document.getElementById("sodavVege").checked;
  data['drinks'] = !document.getElementById("sodavVege").checked;
  data['nuts']= document.getElementById("chipvNuts").checked;
  data['snacks'] = !document.getElementById("chipvNuts").checked;
  data['fruit']= document.getElementById("ffvFruit").checked;
  data['fastfood'] = !document.getElementById("ffvFruit").checked;

	jsonStr = JSON.stringify(data);
	chrome.storage.sync.set({healthEOpts : {}}, function () {
		chrome.storage.sync.set({healthEOpts : data});
	});
	console.log(data);
	console.log("click");
	window.close();
	chrome.tabs.query({active: true, currentWindow: true}, function (arrayOfTabs) {
	    chrome.tabs.reload(arrayOfTabs[0].id);
	});
}
let btn = document.getElementById('saveBtn');
btn.addEventListener("click", saveOptions, false);
