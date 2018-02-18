class Predictor {

  constructor() {
    this.classifier = new Classifier();

  }


  train () {
    for (var i = 0; i < dataset["snacks"].length; i++) {
      let item = dataset["snacks"][i];
      this.classifier.train(item, "snacks");
    }
    for (var i = 0; i < dataset["fastFood"].length; i++) {
      let item = dataset["fastFood"][i];
      this.classifier.train(item, "fastFood");
    }
    for (var i = 0; i < dataset["soda"].length; i++) {
      let item = dataset["soda"][i];
      this.classifier.train(item, "soda");
    }
    this.classifier.probabilities();
  }
  // train();

  // classifier.probabilities();

  determineType (item) {
    console.log(dataset)
    var obj = this.classifier.guess(item)
    console.log(obj)
    var res = Object.keys(obj).reduce(function(a, b){ return obj[a]['probability'] > obj[b]['probability']? a : b });

    console.log("HERE")
    console.log(res)
    console.log("\n\n\n")
  }


  clean(text) {
    text = text.toLowerCase()
    text = text.split('[0-9]+').join('');
    text = text.split("#").join("")
    text = text.split("\n").join("")
    text = text.replace('$', '@')
    text = text.split("@[^\s]+").join("")
    text = text.replace("(http|https)://[^\s]*", "")
    text = text.replace("[^\s]+@[^\s]+","")
    text = text.split("[^a-z A-Z]+").join('')
    return text
  }


}

