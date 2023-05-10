/**
 * Simple 2D audio visual analyser to practice HTML audio manipulation and access prior to 3D
 */
import * as THREE from 'three';

let playButton, gainSlider; // Controls
let audioContext, audioElement, source, gainNode, analyserNode; // Audio graph objects
let bufferLength, dataArray; // Sound data storage
let canvas, canvasElement; // Rendering Elements


function main() {
  // Initialize audio graph
  initAudio();

  // Now that audio is connected we need to setup the controls
  initControls();

  // Now render
  canvasElement = document.querySelector("#visCanvas");
  canvas = canvasElement.getContext("2d");
  render();
}

/**
 * Initializes audio graph nodes
 */
function initAudio() {
  // First things first initialize an AudioContext
  audioContext = new AudioContext();

  // Give the audio context a sound source
  audioElement = document.querySelector("#audioFile");

  // Pass this audio source into the AudioContext
  source = audioContext.createMediaElementSource(audioElement);

  // Connect this audio to its destination (computer speakers in this case)
  source.connect(audioContext.destination); // Now audio graph looks like:   [Source] -> [Destination]

  // To modify the audio signal we need a node inbetween the source and destination
  gainNode = audioContext.createGain();
  source.connect(gainNode).connect(audioContext.destination); // [Source] -> [Gain Node] -> [Destination]

  // Now to analyze the audio signal we need another node
  analyserNode = audioContext.createAnalyser();
  source.connect(gainNode).connect(analyserNode).connect(audioContext.destination); // [Source] -> [Gain Node] -> [Analyser Node] -> [Destination]

  // Set up analyser
  analyserNode.fftSize = 2048; // Default: 2048
  bufferLength = analyserNode.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

/**
 * Initializes audio controls
 */
function initControls() {
  // Play/Pause Button
  playButton = document.querySelector("#playButton");

  playButton.addEventListener(
    "click",
    () => {
      if (audioContext.state === "suspended") {
        audioContext.resume();
      }

      if (playButton.dataset.playing === "false") {
        audioElement.play();
        playButton.dataset.playing = "true";
      } else if (playButton.dataset.playing === "true") {
        audioElement.pause();
        playButton.dataset.playing = "false";
      }
    },
    false
  );

  // Add listener to audio element to update button on song end
  audioElement.addEventListener(
    "ended",
    () => {
      playButton.dataset.playing = "false";
    },
    false
  );

  // Gain control slider
  gainSlider = document.querySelector("#gainSlider");

  gainSlider.addEventListener(
    "input",
    () => {
      gainNode.gain.value = gainSlider.value;
    },
    false
  )
}

/**
 * Analyzes the audio at the current segment
 */
function analyze() {

}

/**
 * Analyzes the audio segment currently playing and adjusts the canvas
 */
function render() {

  // Clear prev frame
  canvas.clearRect(0, 0, canvasElement.width, canvasElement.height);

  // Get time domain data
  analyserNode.getByteTimeDomainData(dataArray);

  // Set waveform parameters and calculate slice width
  canvas.lineWidth = 1;
  canvas.strokeStyle = "rgb(0, 0, 0)";
  canvas.lineJoin = "round";
  const sliceWidth = canvasElement.width / bufferLength;
  let x = 0;

  // Draw waveform
  canvas.beginPath();
  for (let i = 0; i < bufferLength; i++) {
    const v = dataArray[i] / 128.0;
    const y = v * (canvasElement.height / 2);

    if (i === 0) {
      canvas.moveTo(x, y);
    } else {
      canvas.lineTo(x, y);
    }

    x += sliceWidth;
  }

  canvas.lineTo(canvasElement.width, canvasElement.height / 2);
  canvas.stroke();
  
  requestAnimationFrame(render);
}

main();