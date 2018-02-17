function processMutation (mutRec) {
	var _elemContext = this;

	// call listeners for "insert" event
	if(mutRec.type === 'childList' && mutRec.addedNodes && mutRec.addedNodes.length){
		Array.prototype.forEach.call(mutRec.addedNodes, function (addedNode) {
			iterateOffensiveNodes(addedNode, function (elem) {
				// console.log('Offensive Node found : ', elem);
				addBlur(elem);
			});
		});
	}

	// search for characterData changes
	if(mutRec.type === 'characterData') {
		iterateOffensiveNodes(mutRec.targetDiv, function (elem) {
			// console.log('Offensive Node found : ', elem);
			addBlur(elem);
		});
	}
}

var globalObserver = new MutationObserver(function (muts) {
	muts.forEach(processMutation);
});

var globalObserverParams = {
	subtree : true,
	childList: true,
	characterData: true
};

window.addEventListener("load", onloadFunction,false);

function onloadFunction(event){
	window.removeEventListener("load", onloadFunction, false); //remove listener, no longer needed

	iterateOffensiveNodes(document.body, function (elem) {
		// console.log('Offensive Node found : ', elem);
		addBlur(elem);
	});

	globalObserver.observe(document, globalObserverParams);

}

chrome.storage.onChanged.addListener(function (changes, areaName) {
	if (areaName === 'local') {
		SOOTHE_ELEMS.forEach(function (elem) {
			elem.soothe.div.remove();
			elem.soothe = null;
		});
		SOOTHE_ELEMS = [];
		generateTriggerRegexes(function (triggers_regex) {
			iterateOffensiveNodes(document.body, function (elem) {
				// console.log('Offensive Node found : ', elem);
				addBlur(elem);
			});
		});
	}
});

/*Healthy.process(["https://www.sbs.com.au/yourlanguage/sites/sbs.com.au.yourlanguage/files/podcast_images/junk_food_-_getty_images.jpg",
    				"https://i.ndtvimg.com/i/2015-05/junk-food_625x350_81432196524.jpg"])
  .then(function (result) {
  	console.log(result)
    // do something with result
  })
  .catch(function (error) {
    //  do something with error
  })*/


