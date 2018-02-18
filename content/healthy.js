'use strict';

/** Class for the health food relacer*/
class Healthy {
  /**
   * Need to take a list of images to analyze
   *
   */
   constructor(images) {
    this.images = ["https://www.sbs.com.au/yourlanguage/sites/sbs.com.au.yourlanguage/files/podcast_images/junk_food_-_getty_images.jpg",
    				"https://i.ndtvimg.com/i/2015-05/junk-food_625x350_81432196524.jpg"] //images;
  }

  /** @description Initalizes the Healthy class by filtering non-food images
   */
  init() {
    if (this.images && this.images.length > 0) {
    	// Filter out non food images
    } 
    return this.images;
  }
  
  /** Request _view transaction to check if user can view stuff.
      @return {Promise} resolved when this update has completed
  */
	static process(urls) {
    try{
      let healthy = new Healthy(urls);
      let keys = ["ebf8b0e4230d445ba514d72b5fbc27de", 
                "c6496822a7d442c79ca8f7d30701ea1b",
                "3f0d506889b74ccd9b36e074ec97bf7f",
                "734d56ebf5a14c33bec9a00a75a6e5ec"]
      let key = keys[Math.floor(Math.random() * keys.length)];
      healthy.init();
    return Promise.all(urls.map(function(url) {
      return $.ajax({
          beforeSend: function(xhrObj){
                  xhrObj.setRequestHeader("Content-Type","application/json");
                  // xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "c6496822a7d442c79ca8f7d30701ea1b");
                  xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", key);
              },
          type: 'POST',
          url: 'https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze?visualFeatures=Categories,Description,Color&language=en',
          // data: {url: this.images[i]},
          data: '{"url": ' + '"' + url.src + '"}',
      })
    }))
    }
    catch(e){
      console.log(e);
    }

	}

  static preProcess (urls) {

    const clarifiaApp = new Clarifai.App({apiKey: 'd760d56dec2946258f38dae4b338bc6d'});
    try {
      return clarifiaApp.models.predict("bd367be194cf45149e75f01d59f77ba7", urls)
    }
    catch(e){
      console.log(e);
    }
  }

  // filterImages (images)

}

// [
//   "http://everydayroots.com/wp-content/uploads/2014/04/detoxwaters.jpg",
//   "http://wellneess.com/wp-content/uploads/2017/03/Get-Your-5-Serves-of-Vegies-a-Day-Get-Juicing.jpg",
//   "https://healthyfoodwhisperer.com/wp-content/uploads/2017/12/Apple_cider_vinegar-768x570.jpg",
//   "http://newyorkbabyshow.com/wp-content/uploads/2016/03/Wubba-Transparent.png",
//   "https://images.meredith.com/content/dam/bhg/Images/recipecq/2012/09/RU191825.jpg.rendition.largest.jpg",
//   "https://www.fitmittenkitchen.com/wp-content/uploads/2018/01/Purple-Potato-Smoothie-6-400x400.jpg",
//   "http://blogs.rdxsports.com/wp-content/uploads/2017/08/feature2.jpg",
//   "http://anneshk.wpengine.netdna-cdn.com/wp-content/uploads/2013/06/summer-drinks.jpg"
// ]