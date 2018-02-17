const minImageSz = 100;
const maxImageWidth = $(window).width(); // Do not replace background images

// Scan for images
window.onload = function() {
	var images = document.getElementsByTagName('img');

	chrome.storage.local.get(['healthEOpts'], function (opts) {
		console.log(opts)

		var images_arr = Array.prototype.slice.call(images).filter(function(image){
			return (image.clientWidth > minImageSz 
					&& image.clientHeight > minImageSz
					&& image.clientWidth < (maxImageWidth - 100)) 
					&& !image.src.endsWith(".gif")
		});

		// get first 10
		images_arr = images_arr.slice(0, 3)



		Healthy.process(images_arr)
		  .then(function (result) {
		  	console.log(result)
		  	result.forEach(function (img, ind) {
		  		console.log(images_arr[ind])
		  		replaceImage (images_arr[ind], "https://media.giphy.com/media/3ohzdL95gkIo73F3Vu/source.gif") 
		  	})
		    // do something with result
		  })
		  .catch(function (error) {
		    //  do something with error
		  })


	});
};


function replaceImage (original) {
	let item =  $('img[src="'+ original.src +'"]')[0];
	console.log(item); 
	return item && item.setAttribute("src", healthyImage(original));
}



function healthyImage (key) {
	key = "pop"
	let dbItem = DB[key];
	return dbItem[Math.floor(Math.random() * dbItem.length)];
}

// takes corpus of offensive words by category and concats them all to object of regex searches for offensive words

var triggers_regex = {};

function generateTriggerRegexes(cb) {
	triggers_regex = {};
	chrome.storage.local.get(['activeFilterTypes', 'TRIGGERS'], function (data) {
		(data.activeFilterTypes||[]).forEach(function (triggerType) {
			var regexStr = '(' + data.TRIGGERS[triggerType].join('|') + ')';
			triggers_regex[triggerType] = new RegExp(regexStr);
		});
		if (cb) {
			cb(triggers_regex);
		}
	});	

}

// {violence : _regex_, racist : _regex_}
generateTriggerRegexes();



function checkContainsHarasment (text, triggers_regex) {
	for(var i in triggers_regex) {
		if(text.match(triggers_regex[i])) {
			return true;
		}
	}
	return false;
}





/*
-----------------------------------------
FILTERING FUNCTIONS ARE BELOW...
-----------------------------------------
*/
function findOffensiveNodes(node, avoidRecurse) {

	// validate node
	if(!node || !node.parentElement){
		return NodeFilter.FILTER_REJECT;
	}

	// check if inside a script elements
	var ignoreElemTypes = ['SCRIPT', 'INPUT', 'TEXTAREA'];
	if(ignoreElemTypes.indexOf(node.parentElement.nodeName) !== -1) {
		return NodeFilter.FILTER_REJECT;
	}

	// validate that its not editableElems
	if(node.isContentEditable) {
		return NodeFilter.FILTER_REJECT;
	}

	// check that it's not hidden
	var hiddenDisp = ['hidden', 'none'];
	if(hiddenDisp.indexOf(window.getComputedStyle(node.parentElement).display) != -1) {
		return NodeFilter.FILTER_REJECT;
	}

	// filter out messages that don't contain harrasmenet
	if(!checkContainsHarasment(node.textContent||node.innerText, triggers_regex)) {
		return NodeFilter.FILTER_REJECT;
	}

	// filter for children that satis
	if(!avoidRecurse) {
		var hasEncChild = Array.prototype.reduce.call(node.childNodes, function (bool, childElem) {
			var filtVal = findOffensiveNodes(childElem, true);
			var validChild = (filtVal === NodeFilter.FILTER_ACCEPT && childElem.childElementCount);
			return bool || validChild;
		}, false);
		if(hasEncChild) {
			return NodeFilter.FILTER_SKIP;
		}
	}

	return NodeFilter.FILTER_ACCEPT;
}


function iterateOffensiveNodes(startElem, handler) {
	if(!(startElem instanceof Node)) return;
	var walker = document.createTreeWalker(startElem, NodeFilter.SHOW_ELEMENT, {
		acceptNode : findOffensiveNodes
	}, true);
	while(walker.nextNode()) {
		while(walker.firstChild()){}
		//debugger;
		handler(walker.currentNode);
	}
}


let DB = {
	"pop": [
		"http://everydayroots.com/wp-content/uploads/2014/04/detoxwaters.jpg",
		"http://wellneess.com/wp-content/uploads/2017/03/Get-Your-5-Serves-of-Vegies-a-Day-Get-Juicing.jpg",
		"https://healthyfoodwhisperer.com/wp-content/uploads/2017/12/Apple_cider_vinegar-768x570.jpg",
		"http://newyorkbabyshow.com/wp-content/uploads/2016/03/Wubba-Transparent.png",
		"https://images.meredith.com/content/dam/bhg/Images/recipecq/2012/09/RU191825.jpg.rendition.largest.jpg",
		"https://www.fitmittenkitchen.com/wp-content/uploads/2018/01/Purple-Potato-Smoothie-6-400x400.jpg",
		"http://blogs.rdxsports.com/wp-content/uploads/2017/08/feature2.jpg",
		"http://anneshk.wpengine.netdna-cdn.com/wp-content/uploads/2013/06/summer-drinks.jpg"
	], 
	"soda": [
	],
	"snacks": [
	]
}

// Chose from a library of images
// Replaces