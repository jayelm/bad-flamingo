
import KerasJS from 'keras-js';

const labels = ["alarm clock", "ant", "anvil", "arm", "basketball", "belt", "bird", "birthday cake", "blackberry", "bottlecap", "brain", "bread", "broom", "butterfly", "calendar", "campfire", "canoe", "car", "ceiling fan", "chair", "chandelier", "circle", "cooler", "crocodile", "crown", "cruise ship", "diamond", "dog", "donut", "dresser", "dumbbell", "face", "fence", "finger", "firetruck", "flashlight", "fork", "garden", "giraffe", "goatee", "golf club", "harp", "hockey stick", "hot air balloon", "keyboard", "leg", "lollipop", "map", "marker", "mermaid", "microwave", "motorbike", "mouse", "mouth", "mug", "octopus", "owl", "paint can", "peanut", "piano", "pig", "pond", "pool", "popsicle", "postcard", "power outlet", "rabbit", "rain", "rake", "rhinoceros", "rifle", "river", "scorpion", "sink", "skyscraper", "smiley face", "snail", "snake", "snorkel", "snowflake", "sock", "stairs", "stitches", "submarine", "suitcase", "swan", "swing set", "sword", "toe", "tooth", "train", "trombone", "trumpet", "umbrella", "van", "watermelon", "windmill", "wine glass", "yoga", "zigzag"]

function argmax(xs) {
  let max = -Infinity
  let max_n = -1
  for (let i=0; i<xs.length; i++) {
    if (xs[i] > max) {
      max = xs[i]
      max_n = i
    }
  }
  return max_n
}

const kerasModel = new KerasJS.Model({
  filepath: 'https://raw.githubusercontent.com/jayelm/bad-flamingo-2/master/models/73_pc_weights.bin',
  gpu: true
})

function predict(img) {
  kerasModel
    .ready()
    .then(() => {
      let data = []
      for (let i=0; i<28; i++) {
        for (let j=0; j<28; j++) data.push(0);
      }
      const inputData = {
        input_1: new Float32Array(data)
      }
      // make predictions
      return kerasModel.predict(inputData)
    })
    .then(outputData => {
      console.log(outputData)
      return labels[argmax(outputData.dense_1)]
    })
}

