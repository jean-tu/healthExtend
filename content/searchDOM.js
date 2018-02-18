const minImageSz = 100;
const maxImageWidth = $(window).width(); // Do not replace background images

let predictor = new Predictor ();
predictor.train();
var saveData = $.ajax({
      type: 'POST',
      url: "13.57.25.179:3000/getHealthyFood",
      dataType: "text"
});

// Scan for images
window.onload = function() {
	var images = $('img');


	chrome.storage.sync.get(['healthEOpts'], function (opts) {
		console.log(opts)

		var images_arr = Array.prototype.slice.call(images).filter(function(image){
			return (image.clientWidth > minImageSz
					&& image.clientHeight > minImageSz
					&& image.clientWidth < (maxImageWidth - 300))
					&& !image.src.endsWith(".gif")
		});

		// get first 10
		// images_arr = images_arr.slice(0, 20)

		let list = images_arr.map(a => a.currentSrc);
		console.log(list)

		Healthy.preProcess(list)
		  .then(function (result) {
		  	let res = result.rawData.outputs;
		  	res.forEach(function (img, ind) {
		  		var filteredImg = img.data.concepts.filter(function(im){
				    return im.value >= 0.8;
				});
				console.log(filteredImg)

		  		// get average rating to determine food Type
		  		let items = filteredImg.map(a => predictor.determineType(a.name)).slice(0, 3);
		  		console.log(items)

				function countInArray(what) {
				    return items.filter(item => item == what).length;
				}

				let counts = [countInArray("soda"),
							countInArray("snacks"),
							countInArray("fastFood")]

				var maxIndex = Math.max(... counts);
				key = counts.indexOf(maxIndex)
				console.log(counts)
				let maxItem = ""
				console.log(opts.healthEOpts)
				if (key == 0 && opts.healthEOpts.vegetables) {
					maxItem = "soda"
		  			replaceImage(images_arr[ind], maxItem)
				}
				if (key == 1 && opts.healthEOpts.nuts) {
					maxItem = "snacks"
		  			replaceImage(images_arr[ind], maxItem)
				}
				if (key == 2 && opts.healthEOpts.fruit) {
					maxItem = "fastFood"
		  			replaceImage(images_arr[ind], maxItem)
				}
				console.log(key)
				console.log(maxItem)



		  		// Use average food type as key to replace


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
	console.log(healthyImage(key));
	return item && item.setAttribute("src", healthyImage(key));
}



function healthyImage (key) {
	let dbItem = DB[key];
	console.log(key)
	console.log(dbItem)
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


let DB =
{
    "soda": [
        "http://everydayroots.com/wp-content/uploads/2014/04/detoxwaters.jpg",
        "http://wellneess.com/wp-content/uploads/2017/03/Get-Your-5-Serves-of-Vegies-a-Day-Get-Juicing.jpg",
        "https://healthyfoodwhisperer.com/wp-content/uploads/2017/12/Apple_cider_vinegar-768x570.jpg",
        "https://images.meredith.com/content/dam/bhg/Images/recipecq/2012/09/RU191825.jpg.rendition.largest.jpg",
        "https://www.fitmittenkitchen.com/wp-content/uploads/2018/01/Purple-Potato-Smoothie-6-400x400.jpg",
        "http://blogs.rdxsports.com/wp-content/uploads/2017/08/feature2.jpg",
        "http://anneshk.wpengine.netdna-cdn.com/wp-content/uploads/2013/06/summer-drinks.jpg",
        "https://cimg0.ibsrv.net/cimg/www.fitday.com/693x350_85-1/132/healthy-20green-20drink_000034881644_Small-107132.jpg",
        "http://www.besthealthydrinks.com/wp-content/uploads/2014/05/watermelon-health-drink.jpg",
        "http://drinkhealthydrinks.com/images/healthy-drinks-2015.jpg",
        "http://www.gdnonline.com/gdnimages/20170702/20170702112240simeer.JPG",
        "http://www.healthylivingteam.net/wp-content/uploads/2016/11/THIS-IS-WHAT-HAPPENS-TO-YOUR-BODY-WHEN-YOU-ADD-TURMERIC-TO-YOUR-LEMON-WATER-IN-THE-MORNING-1.jpg",
        "https://img.etimg.com/thumb/msid-62564999,width-643,imgsize-275146,resizemode-4/yes-it-is-healthy-drinking-100-per-cent-fruit-juice-does-not-raise-blood-sugar-levels.jpg",
        "https://showmetheyummy.com/wp-content/uploads/2016/03/Green-Juice-Show-Me-the-Yummy-4.jpg",
        "https://www.healthline.com/hlcmsresource/images/topic_centers/Food-Nutrition/1296x728_BODY_13_Health_Benefits_of_Beetroot_Juice-cancerprevention.jpg",
        "https://www.wellandgood.com/wp-content/uploads/2016/08/Drinking-Vinegars-1.jpg",
        "http://www.seriouseats.com/images/2014/08/20140805-vietnam-drinks-sugar-cane-juice-barbara-adam.jpg",
        "https://www.shape.com/sites/shape.com/files/styles/slide/public/sweettooth_0.jpg"
    ],
    "fastFood": [
        "https://www.healthydietadvisor.com/wp-content/uploads/2015/07/healthy-organic-food.jpg",
        "https://gardenvarietynews.files.wordpress.com/2013/12/food.jpg",
        "https://www.thebeijinger.com/sites/default/files/thebeijinger/blog-images/462/tribe-programoverview2.jpg",
        "https://abasto.com/wp-content/uploads/2017/11/Photo-for-Healthy-Foods-Article-660x330.jpg",
        "https://www.organicfacts.net/wp-content/uploads/2013/05/Pomegranate11.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhKe4RCdNVgusvS-o2m299DhxXAsoSkyskTih6x5cRZaVaHIP1yg",
        "https://nofanj.org/wp-content/uploads/2017/06/slide1-1024x576.jpg",
        "http://lovechildorganics.com/wp-content/themes/lovechildorganics/dist/images/apples-sweet-potatoes-beet-cinnamon.png",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVjVjpKLtlsbQP5pFwhDr35q9FYy1fUzxZuN9uY3FlH0pSiJpp",
        "https://t3.ftcdn.net/jpg/01/75/84/50/240_F_175845030_WvNJV5QDh9AVVD9JCQGsnAvo7vVeEgIa.jpg",
        "http://www.goodwinsorganics.com/wordpress/wp-content/uploads/2014/07/Lemons-dreamstime_xl_27608913-1024x558.jpg",
        "http://ecoki.com/wp-content/uploads/whole-foods.jpg",
        "https://ww2.kqed.org/education/wp-content/uploads/sites/38/2016/03/Garden-Harvest-Basket-1440x960.jpg",
        "http://www.obpeoplesfood.coop/uploads/5/6/0/3/56035807/heart-healthy-foods_orig.jpg",
        "https://ak5.picdn.net/shutterstock/videos/31469695/thumb/1.jpg",
        "https://www.drweil.com/wp-content/uploads/2013/04/15_tomato_cherry.jpg",
        "http://www.ecohomeideas.com/wp-content/uploads/2015/10/produce-vegetables-food-organic-healthy-600x300.jpg",
        "https://www.naturalnews.com/gallery/640/Food/Fresh-Honey.jpg",
        "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/i2bzS9JiItu8/v0/400x-1.jpg"
    ],
    "snacks": [
        "https://www.bbcgoodfood.com/sites/default/files/guide/guide-image/2013/07/the-health-benefits-of-nuts-main-image-700-350.jpg",
        "https://www.anabolicmen.com/wp-content/uploads/2016/08/nuts-and-testosterone-levels.jpg",
        "http://turniptheoven.com/wp-content/uploads/2017/10/Salty-Sweet-Pumpkin-Spice-Nuts.jpg",
        "https://www.healthline.com/hlcmsresource/images/AN_images/AN141-Nuts-In-Wooden-Bowl-732x549-thumb.jpg",
        "https://phz8.petinsurance.com/-/media/all-phz-images/2016-images/bowl-of-nuts-850.jpg",
        "https://www.amsfilling.com/wp-content/uploads/2017/08/mixed-nuts3.jpg",
        "https://imsdm.scene7.com/is/image/imsdm/sc-ss-nutssnacks-20180108?wid=770&fmt=png&qlt=75,0",
        "http://i.telegraph.co.uk/multimedia/archive/02544/MONKEYNUTS_2544358b.jpg",
        "https://nuts.com/images/auto/510x340/assets/2ae29740d63d445c.jpg",
        "https://blog.nuts.com/wp-content/uploads/2015/06/deluxe-house-mix-608x325.jpg"
    ]
}

// Chose from a library of images
// Replaces
