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
      healthy.init();
    return Promise.all(urls.map(function(url) {
      return $.ajax({
          beforeSend: function(xhrObj){
                  xhrObj.setRequestHeader("Content-Type","application/json");
                  xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", "c6496822a7d442c79ca8f7d30701ea1b");
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

}