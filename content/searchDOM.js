const minImageSz = 100;
const maxImageWidth = $(window).width(); // Do not replace background images

let predictor = new Predictor ();
predictor.train();
// var saveData = $.ajax({
//       type: 'POST',
//       url: "13.57.25.179:3000/getHealthyFood",
//       dataType: "text"
// });

// Scan for images
window.onload = function() {
	var images = document.getElementsByTagName('img');


	chrome.storage.sync.get(['healthEOpts'], function (opts) {
		console.log(opts)

		var images_arr = Array.prototype.slice.call(images).filter(function(image){
			return (image.clientWidth > minImageSz
					&& image.clientHeight > minImageSz
					&& image.clientWidth < (maxImageWidth - 100))
					&& !image.src.endsWith(".gif")
		});

		// get first 10
		images_arr = images_arr.slice(0, 3)

		let list = images_arr.map(a => a.currentSrc);
		console.log(list)

		Healthy.preProcess(list)
		  .then(function (result) {
		  	let res = result.rawData.outputs;
		  	res.forEach(function (img, ind) {
		  		var filteredImg = img.data.concepts.filter(function(im){
				    return im.value >= 0.8;
				});

		  		// get average rating to determine food Type
		  		let items = filteredImg.map(a => predictor.determineType(a.name));
		  		console.log(items)

				function countInArray(what) {
				    return items.filter(item => item == what).length;
				}

				let counts = [countInArray("soda"),
							countInArray("snacks"),
							countInArray("fastFood")]

				var maxIndex = Math.max(... counts);
				key = counts.indexOf(maxIndex)
				let maxItem = ""
				if (key == 0) {
					maxItem = "soda"
				}
				if (key == 1) {
					maxItem = "snacks"
				}
				if (key == 2) {
					maxItem = "fastFood"
				}
				console.log(key)
				console.log(maxItem)



		  		// Use average food type as key to replace


		  		replaceImage(images_arr[ind], key)
		  	})
		    // do something with result
		  })
		  .catch(function (error) {
		    //  do something with error
		  })


	});
};


function replaceImage (original, key) {
	let item =  $('img[src="'+ original.src +'"]')[0];
	console.log(item);
	return item && item.setAttribute("src", healthyImage(key));
}



function healthyImage (key) {
	key = "fastfood"
	let dbItem = DB[key];
	return dbItem[Math.floor(Math.random() * dbItem.length)];
}

function shouldReplace (response) {

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
	"soda": [
		"http://everydayroots.com/wp-content/uploads/2014/04/detoxwaters.jpg",
		"http://wellneess.com/wp-content/uploads/2017/03/Get-Your-5-Serves-of-Vegies-a-Day-Get-Juicing.jpg",
		"https://healthyfoodwhisperer.com/wp-content/uploads/2017/12/Apple_cider_vinegar-768x570.jpg",
		"http://newyorkbabyshow.com/wp-content/uploads/2016/03/Wubba-Transparent.png",
		"https://images.meredith.com/content/dam/bhg/Images/recipecq/2012/09/RU191825.jpg.rendition.largest.jpg",
		"https://www.fitmittenkitchen.com/wp-content/uploads/2018/01/Purple-Potato-Smoothie-6-400x400.jpg",
		"http://blogs.rdxsports.com/wp-content/uploads/2017/08/feature2.jpg",
		"http://anneshk.wpengine.netdna-cdn.com/wp-content/uploads/2013/06/summer-drinks.jpg"
	], 
	"fastFood": [
		"https://i.ndtvimg.com/i/2015-05/junk-food_625x350_81432196524.jpg",
		"https://cdn1.medicalnewstoday.com/content/images/articles/317/317122/junk-food.jpg",
		"http://del.h-cdn.co/assets/15/51/768x530/gallery-1450462207-gettyimages-126551697.jpg",
		"https://shk-images.s3.amazonaws.com/wp-content/uploads/2012/07/11111443/junk-food-1200facebook.jpg",
		"https://www.naturalnews.com/wp-content/uploads/sites/91/2017/11/Frosted-Doughnuts-Sweet-Junk-Food.jpg",
		"https://www.rmit.edu.au/content/dam/rmit/rmit-images/news/2016/may/Pizza_Eating_Istock_C_1440px_72dpi.jpg.transform/rendition-1220x731/image.jpg",
		"https://i0.wp.com/www.womensweb.in/wp-content/uploads/2013/11/what-junk-food-does-to-hormones.jpg",
		"https://3c1703fe8d.site.internapcdn.net/newman/csz/news/800/2015/fastfood.jpg",
		"https://pixel.nymag.com/imgs/daily/science/2016/08/23/23-junk-food.w710.h473.jpg"
	],
	"snacks": [
		"https://images.meredith.com/content/dam/bhg/Images/recipecq/2012/09/RU191825.jpg.rendition.largest.jpg",
		"https://www.fitmittenkitchen.com/wp-content/uploads/2018/01/Purple-Potato-Smoothie-6-400x400.jpg",
		"http://blogs.rdxsports.com/wp-content/uploads/2017/08/feature2.jpg",
		"http://anneshk.wpengine.netdna-cdn.com/wp-content/uploads/2013/06/summer-drinks.jpg"
	]
}

// Chose from a library of images
// Replaces
