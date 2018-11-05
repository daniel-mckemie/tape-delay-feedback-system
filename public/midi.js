// MIDI setup

let midi;
let data;
// request MIDI access
if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess({
    sysex: false // this defaults to 'false'
  }).then(onMIDISuccess, onMIDIFailure);
} else {
  alert("No MIDI support in your browser.");
}

// MIDI functions
function onMIDISuccess(midiAccess) {
  midi = midiAccess; // this is our raw MIDI data, inputs, outputs, and sysex status 
  // when we get a succesful response, run this code
  const inputs = midi.inputs.values();
  // loop over all available inputs and listen for any MIDI input
  for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
    // each time there is a midi message call the onMIDIMessage function
    input.value.onmidimessage = onMIDIMessage;
  }
  // console.log('MIDI Access Object', midiAccess);
}

function onMIDIFailure(e) {
  // when we get a failed response, run this code
  console.log("No access to MIDI devices or your browser doesn't support WebMIDI API. Please use WebMIDIAPIShim " + e);
}

let velocity

const onMIDIMessage = message => {
  data = event.data,
    cmd = data[0] >> 4,
    channel = data[0] & 0xf,
    type = data[0] & 0xf0, // channel agnostic message type
    note = data[1],
    velocity = data[2];

  switch (note) {
    case 14: // korg knob 1
      amFreq(velocity)
      break;
    case 15: // korg knob 2
      amTune(velocity)
      break;
    case 16: // korg knob 3
      fmFreq(velocity)
      break;
    case 17:
      fmMod(velocity)
      break;
    case 2: // korg slider 1
      userIn(velocity)
      break;
    case 3: // korg slider 2
      amHarm(velocity)
      break;
    case 5: // korg slider 3
      fmHarm(velocity)
      break;
    case 9: // korg slider 7
      crossCouple(velocity)
      break;
    case 12: // korg slider 8
      rightToLeft(velocity)
      break;
    case 33: // korg button 1B
      inputOn(velocity)
      break;
    case 25: // korg button 3A
      amFmSwitch(velocity)
      break;

  }
  console.log('MIDI data', data) // Reads all MIDI data
}

const oldRange = 127 - 0 // MIDI range

function amFreq(x) {
  // logarathmic knob
  const min = 0
  const max = 127
  const logMin = Math.log(1)
  const logMax = Math.log(5000)
  const scale = (logMax - logMin) / (max - min)
  let newValue = Math.exp(logMin + scale * (x - min)).toFixed(8)
  amFreqDial.value = newValue
  osc1.frequency.value = newValue
  console.log(osc1.frequency.value)
}

function amTune(x) {
  const newValue = (x * 7.874).toFixed(8)
  amTuneDial.value = newValue
  osc1.detune.value = newValue
  console.log(osc1.detune.value)
}

function fmFreq(x) {
  // logarathmic knob
  const min = 0
  const max = 127
  const logMin = Math.log(1)
  const logMax = Math.log(5000)
  const scale = (logMax - logMin) / (max - min)
  let newValue = Math.exp(logMin + scale * (x - min)).toFixed(8)
  fmFreqDial.value = newValue
  osc2.frequency.value = newValue
  console.log(osc2.frequency.value)
}


function fmMod(x) {
  const newValue = (x * .7874).toFixed(8)
  fmModDial.value = newValue
  osc2.modulationIndex.value = newValue
  console.log(osc2.modulationIndex.value)
}



// Input Gain - Slider 1
function userIn(x) {
  const newRange = 12 - (-24)
  const newValue = ((x - 127) * newRange) / oldRange + 12
  userVol.value = newValue.toFixed(8)
  userAmp.volume.value = newValue.toFixed(8)
  console.log(userAmp.volume.value)
}

// AM Osc Harmonicity - Slider 2
function amHarm(x) {
  const newValue = (x * 0.023622).toFixed(8)
  amHarmSlider.value = newValue
  osc1.harmonicity.value = newValue
  console.log(osc1.harmonicity.value)
}

// FM Osc Harmonicity - Slider 4
function fmHarm(x) {
  const newValue = (x * 0.023622).toFixed(8)
  fmHarmSlider.value = newValue
  osc2.harmonicity.value = newValue
  console.log(osc2.harmonicity.value)
}

// // Oscillator amps
// function amp1(x) {
//   const newRange = 12 - (-12)
//   const newValue = ((x - 127) * newRange) / oldRange + 12
//   fader1.value = newValue.toFixed(8)
//   oscAmp1.volume.value = newValue.toFixed(8)
//   // console.log(oscAmp1.volume.value)
// }

// function amp2(x) {
//   const newRange = 12 - (-12)
//   const newValue = ((x - 127) * newRange) / oldRange + 12
//   fader2.value = newValue.toFixed(8)
//   oscAmp2.volume.value = newValue.toFixed(8)
//   // console.log(oscAmp2.volume.value)
// }


// Feedback Amps
function crossCouple(x) {
  const newRange = 12 - (-24)
  const newValue = ((x - 127) * newRange) / oldRange
  crossCoupleSlider.value = newValue.toFixed(8)
  tapeDelayL2Amp.volume.value = newValue.toFixed(8)
  // console.log(tapeDelayL2Amp.volume.value)
}

function rightToLeft(x) {
  const newRange = 12 - (-24)
  const newValue = ((x - 127) * newRange) / oldRange
  delayDepthSlider.value = newValue.toFixed(8)
  tapeDelayRAmp.volume.value = newValue.toFixed(8)
  // console.log(tapeDelayRAmp.volume.value)
}


function inputOn(x) {
  if (x === 127) {
    inputSwitch.state = true
  } else { inputSwitch.state = false }
}

function amFmSwitch(x) {
  if (x === 127) {
    modType.state = true
  } else { modType.state = false }
}