const minImageSz = 10;
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
				    return im.value >= 0.6;
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
				if (key == 0 && opts.healthEOpts.vegetables) {
					maxItem = "soda"
		  			replaceImage(images_arr[ind], maxItem)
				}
				if (key == 1 && opts.healthEOpts.nuts) {
					maxItem = "snacks"
		  			replaceImage(images_arr[ind], maxItem)
				}
				if (key == 2 && opts.healthEOpts.fruits) {
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


let DB = {
    "soda": [
        "http://everydayroots.com/wp-content/uploads/2014/04/detoxwaters.jpg",
        "http://wellneess.com/wp-content/uploads/2017/03/Get-Your-5-Serves-of-Vegies-a-Day-Get-Juicing.jpg",
        "https://healthyfoodwhisperer.com/wp-content/uploads/2017/12/Apple_cider_vinegar-768x570.jpg",
        "http://newyorkbabyshow.com/wp-content/uploads/2016/03/Wubba-Transparent.png",
        "https://images.meredith.com/content/dam/bhg/Images/recipecq/2012/09/RU191825.jpg.rendition.largest.jpg",
        "https://www.fitmittenkitchen.com/wp-content/uploads/2018/01/Purple-Potato-Smoothie-6-400x400.jpg",
        "http://blogs.rdxsports.com/wp-content/uploads/2017/08/feature2.jpg",
        "http://anneshk.wpengine.netdna-cdn.com/wp-content/uploads/2013/06/summer-drinks.jpg",
        "https://cimg0.ibsrv.net/cimg/www.fitday.com/693x350_85-1/132/healthy-20green-20drink_000034881644_Small-107132.jpg",
        "http://www.besthealthydrinks.com/wp-content/uploads/2014/05/watermelon-health-drink.jpg",
        "http://drinkhealthydrinks.com/images/healthy-drinks-2015.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw_NwslNtnwpg6rI1BUf3mDeFMo0oFCLtQhp99NfFT3_LUUS9S",
        "http://www.gdnonline.com/Details/222954/Ditch-that-can-of-soda-and-try-these-healthy-drinks-to-beat-the-heat-this-summer",
        "http://www.healthylivingteam.net/wp-content/uploads/2016/11/THIS-IS-WHAT-HAPPENS-TO-YOUR-BODY-WHEN-YOU-ADD-TURMERIC-TO-YOUR-LEMON-WATER-IN-THE-MORNING-1.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7lB4Q0PBs5ciVzmutfc7Ag48hgJnnRha9zgXbiOzQ2VbjSERFig",
        "https://img.etimg.com/thumb/msid-62564999,width-643,imgsize-275146,resizemode-4/yes-it-is-healthy-drinking-100-per-cent-fruit-juice-does-not-raise-blood-sugar-levels.jpg",
        "https://showmetheyummy.com/wp-content/uploads/2016/03/Green-Juice-Show-Me-the-Yummy-4.jpg",
        "https://www.healthline.com/hlcmsresource/images/topic_centers/Food-Nutrition/1296x728_BODY_13_Health_Benefits_of_Beetroot_Juice-cancerprevention.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZ1sE3uW4qTsMxOG8iAmZ7OzWksun6KEFNh4RHHynlsKqbkuNV",
        "https://www.wellandgood.com/wp-content/uploads/2016/08/Drinking-Vinegars-1.jpg",
        "http://www.seriouseats.com/images/2014/08/20140805-vietnam-drinks-sugar-cane-juice-barbara-adam.jpg",
        "https://www.shape.com/sites/shape.com/files/styles/slide/public/sweettooth_0.jpg"
    ],
    "fastFood": [
        "https://www.healthydietadvisor.com/wp-content/uploads/2015/07/healthy-organic-food.jpg",
        "https://gardenvarietynews.files.wordpress.com/2013/12/food.jpg",
        "https://www.thebeijinger.com/sites/default/files/thebeijinger/blog-images/462/tribe-programoverview2.jpg",
        "https://abasto.com/wp-content/uploads/2017/11/Photo-for-Healthy-Foods-Article-660x330.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSExH38Anw-fPSB1v2OZ4EGn-O26Fd8hxSP41aay8MypOSuUs1W",
        "http://img1.cookinglight.timeinc.net/sites/default/files/styles/4_3_horizontal_-_900x675/public/image/Oxmoor/oh3321p15-organic-produce-m.jpg?itok=8uWhMjjc",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhKe4RCdNVgusvS-o2m299DhxXAsoSkyskTih6x5cRZaVaHIP1yg",
        "https://nofanj.org/wp-content/uploads/2017/06/slide1-1024x576.jpg",
        "http://lovechildorganics.com/wp-content/themes/lovechildorganics/dist/images/apples-sweet-potatoes-beet-cinnamon.png",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQVjVjpKLtlsbQP5pFwhDr35q9FYy1fUzxZuN9uY3FlH0pSiJpp",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSmPS9gMRseF9OLzfepxG2MWm_3-fkKgdezvfrYviQVMFvJh1mCdA",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdZQbcLBrRtp2tfvQzxr6ojD2xoOjZU3YvuRKg_1Icd2vMM2wR",
        "https://timedotcom.files.wordpress.com/2015/11/50-healthiest-foods-apple.jpg?quality=85",
        "https://t3.ftcdn.net/jpg/01/75/84/50/240_F_175845030_WvNJV5QDh9AVVD9JCQGsnAvo7vVeEgIa.jpg",
        "http://www.goodwinsorganics.com/wordpress/wp-content/uploads/2014/07/Lemons-dreamstime_xl_27608913-1024x558.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_6dgmnWPhqL6bjUwGeVBa8gtX7sb3a1G2os-xmXTkca4DyB_F",
        "http://ecoki.com/wp-content/uploads/whole-foods.jpg",
        "https://ww2.kqed.org/education/wp-content/uploads/sites/38/2016/03/Garden-Harvest-Basket-1440x960.jpg",
        "http://www.obpeoplesfood.coop/uploads/5/6/0/3/56035807/heart-healthy-foods_orig.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0AM-qdBwTmk2ioioIzwKg9hfMFOiTooRdyPtkL5Jp7T_Z4F-9",
        "https://ak5.picdn.net/shutterstock/videos/31469695/thumb/1.jpg",
        "https://www.drweil.com/wp-content/uploads/2013/04/15_tomato_cherry.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRwVDIIwM5QYBrX4J9fguCkXeGivF0BPu6YfxC4Jr9efW1aBKfd",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP6-aG5safsEEflLXh1nK19c9ODK2EExSY6ETcoE8sFtYoVL5s",
        "http://www.ecohomeideas.com/wp-content/uploads/2015/10/produce-vegetables-food-organic-healthy-600x300.jpg",
        "https://www.naturalnews.com/gallery/640/Food/Fresh-Honey.jpg",
        "https://assets.bwbx.io/images/users/iqjWHBFdfxIU/i2bzS9JiItu8/v0/400x-1.jpg"
    ],
    "snacks": [
        "https://profruit.com/wp-content/uploads/2017/09/service-fruits.png",
        "https://cdn3.volusion.com/jpwbx.wqxbt/v/vspfiles/photos/425-2.jpg?1398347184",
        "https://img.aws.livestrongcdn.com/ls-article-image-673/ds-photo/getty/article/106/107/475058135.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCNyTk9Kwu80FAL8v6-Fhg-I33tdtSuooqD6fx0cYI8cuSyr-H",
        "https://img.webmd.com/dtmcms/live/webmd/consumer_assets/site_images/articles/health_tools/diet_fruit_sugar_slideshow/493ss_thinkstock_rf_figs_on_wooden_table.jpg",
        "https://wonderopolis.org/_img?img=/wp-content/uploads/2014/12/1372_f.jpg&transform=resizeCrop,720,450",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSTBJ8XqzzapSdH4ZoLlfsNuoAzHO3zaolKK4U2bJM-7P5kdmKIFg",
        "https://www.hindimeaning.com/pictures/fruits/apple.jpg",
        "http://cdn-img.health.com/sites/default/files/styles/medium_16_9/public/styles/main/public/strawberry-pesticide-400x400.jpg?itok=ijckUkC3",
        "https://fthmb.tqn.com/55w_U-um-sGrc_ZRUI_SXLlDzP4=/960x0/filters:no_upscale()/full-frame-shot-of-yellow-bananas-527593699-59499c263df78c537b6e3f0f.jpg",
        "https://cdn3.themysteriousworld.com/wp-content/uploads/2014/03/durian-fruit.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHPWgvY5OnJsEBZCqEG_-N_DV5IyTLoZAtRJmaicvjA26lJ1wK",
        "https://nicolelana.com/wp-content/uploads/2014/05/Green-Papaya-Fruit-image-3.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-gAx8GpRYX0M5O3UZCyRxFOJO_o8b638mH8kMrmRjP4vxx135-w",
        "https://media.npr.org/assets/img/2017/05/19/apple_custom-51a74cee5ce6bfa624f0936b2c86ef2529267a41-s900-c85.jpg",
        "https://steptohealth.com/wp-content/uploads/2015/05/Strawberries.jpg",
        "https://www.menshealth.com/sites/menshealth.com/files/styles/listicle_slide_custom_user_phone_1x/public/images/slideshow2/green-apples.jpg?itok=ZjWM7B65",
        "https://www.puraforceremedies.com/wp-content/uploads/2016/04/fruits_grapes-05.jpg",
        "https://sc01.alicdn.com/kf/UT8rtfxXGXaXXagOFbX6/Pomegranate-and-Pomegranate-Fruits.jpg",
        "https://www.healthaim.com/wp-content/uploads/2016/02/types-of-fresh-fruits.jpg",
        "http://www.huahintoday.com/wp-content/uploads/2013/05/mango02.jpg",
        "https://www.friedas.com/wp-content/uploads/2014/07/DragonFruit_RedFlesh_sm.jpg",
        "https://cdn-mf0.heartyhosting.com/sites/mensfitness.com/files/styles/gallery_slideshow_image/public/5-healthiest-winter-fruits-kiwi.jpg?itok=x-thdaCG",
        "http://im.rediff.com/getahead/2012/sep/20fruit1.jpg",
        "https://livelovefruit.com/wp-content/uploads/2013/06/Pineapple-Fruit-image.jpg",
        "https://fthmb.tqn.com/TzCgl6KWZFj6IdEAPfnLvyEfnGk=/960x0/filters:no_upscale()/fresh-fruits-565798285-58864b5c5f9b58bdb3900dd8.jpg"
    ]
}

// Chose from a library of images
// Replaces
