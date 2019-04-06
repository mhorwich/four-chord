//SERIAL PORT AT LINE 230

kickOn = false;
snareOn = false;
pianoOn = false;
bassOn = false;


cChordPlaying = false;
fChordPlaying = false;
gChordPlaying = false;
amChordPlaying = false;

cBassPlaying = false;
fBassPlaying = false;
gBassPlaying = false;
amBassPlaying = false;

var pianoAnimation = false;

var bgFill = 8;


//KICK SOUND DEFINED
var kick = new Tone.MembraneSynth({
  "envelope": {
    "sustain": 0,
    "attack": 0.02,
    "decay": 0.8
  },
  "octaves": 10
}).toMaster();

//KICK LOOP SET
var kickPart = new Tone.Loop(function(time) {
  kick.triggerAttack("C2");
}, "2n");

//SNARE FILTER

var spectrumT = new Tone.Waveform(32);

var snareFilter = new Tone.AutoFilter({
  frequency: 1,
  type: "sine",
  depth: 1,
  baseFrequency: 400,
  octaves: 2.6,
  filter: {
    type: "bandpass",
    rolloff: -12,
    Q: 1
  }
})
//.connect(spectrumT)
.toMaster();

//SNARE SOUND DEFINED
var snare = new Tone.MetalSynth({
  volume: -10,
  frequency: 60,
  envelope: {
    attack: 0.001,
    decay: 0.4,
    release: 0.2
  },
  harmonicity: 5.1,
  modulationIndex: 1,
  resonance: 800,
  octaves: 1.5
}).connect(snareFilter);

//SNARE LOOP SET
var snarePart = new Tone.Sequence(function(time, freq) {
  snare.frequency.setValueAtTime(freq, time, Math.random() * 0.5 + 0.5);
  snare.triggerAttack(time);
}, [[3500, 3500, 3500, 3500]], "2n");
//}, [null, 350, null, 350], "2n");



//PIANO DELAY
var pianoDelay = new Tone.PingPongDelay({
  "delayTime": "4t",
  "maxDelayTime": 2,
  "wet": 0.3,
  "feedback": 0.1
}).toMaster();

//PIANO TONE DEFINED
var piano = new Tone.MonoSynth(4, Tone.Synth, {
  "volume": -7,
  "oscillator": {
    "partials": [1, 2, 1],
  },
  "envelope": {
    "attack": 0.001,
    "decay": 0.1,
    "sustain": 0.3,
    "release": 1
  },
  "portamento": 0.001
}).connect(spectrumT).connect(pianoDelay);

//PIANO CHORDS DEFINED
/*
		var cChord = ["C4", "E4", "G4", "E4", "C4", "E4", "G4", "C5"];
		var gChord = ["B3", "D4", "G4", "D4", "B3", "D4", "G4", "B4"];
		var amChord = ["C4", "E4", "A4", "E4", "C4", "E4", "A4", "C5"];
		var fChord = ["C4", "F4", "A4", "F4", "C4", "F4", "A4", "C5"];
*/
var cChord = ["C4", "E4", "G4"];
var gChord = ["B3", "D4", "G4"];
var amChord = ["C4", "E4", "A4"];
var fChord = ["C4", "F4", "A4"];
var ellipseCoord = {};

//PIANO LOOP SET

var pianoPart = new Tone.Sequence(function(time, note) {
  piano.triggerAttackRelease(note, "16n", time);
  //SEQUENCE OF CHORDS
}, [cChord]);
//pianoPart.probability = 0.5;

//Bass FFT & waveform
var fft = new Tone.FFT(32);
var spectrum = new Tone.Waveform(1024);

var bassDist = new Tone.Distortion({
  "distortion": 0.4,
  "oversample": '2x'
}).connect(spectrum).toMaster();

//BASS TONE DEFINED
var bass = new Tone.MonoSynth({
  "volume": -10,
  "envelope": {
    "attack": 0.1,
    "decay": 0.3,
    "release": 2,
  },
  "filterEnvelope": {
    "attack": 0.001,
    "decay": 0.01,
    "sustain": 0.5,
    "baseFrequency": 200,
    "octaves": 2.6
  }
}).connect(bassDist);


//BASS LOOP SET
var bassPart = new Tone.Sequence(function(time, note) {
  bass.triggerAttackRelease(note, "16n", time);
  //SEQUENCE OF BASS NOTES
}, ["C2"]);
//bassPart.probability = 0.5;


//LEAD DELAY
var leadDelay = new Tone.PingPongDelay({
  "delayTime": "8n",
  "maxDelayTime": 1,
  "feedback": 0.82,
  "wet": 0.40

}).toMaster();

//LEAD TONE DEFINED
//var leadPaint = new Tone.MonoSynth({
//  "volume": -10,
//  "oscillator": {
//    "type": "sawtooth"
//  },
//  "envelope": {
//    "attack": 0.5
//  },
//  "portamento": 0.1
//}).connect(leadDelay);

		var leadPaint = new Tone.FMSynth({
		harmonicity  : 3 ,
		modulationIndex  : 10 ,
		detune  : 0 ,
		oscillator  : {
		type  : "sine"
		}  ,
		envelope  : {
		attack  : 0.01 ,
		decay  : 0.01 ,
		sustain  : 1 ,
		release  : 0.5
		}  ,
		modulation  : {
		type  : "square"
		}  ,
		modulationEnvelope  : {
		attack  : 0.5 ,
		decay  : 0 ,
		sustain  : 1 ,
		release  : 0.5
		},
//		"portamento": 0.2
		
		}).connect(leadDelay);



//FX SENDS
		var delayKickSend = kick.send("delayKick", -Infinity);
		var delaySnareSend = snare.send("delaySnare", -Infinity);
		var crushSend = piano.send("crush", -Infinity);
		var chebySend = bass.send("cheby", -Infinity);

		var delayKick = new Tone.FeedbackDelay("4t", 0.38)
			.receive("delayKick")
			.toMaster();
		var delaySnare = new Tone.FeedbackDelay("8t", 0.25)
			.receive("delaySnare")
			.toMaster();
		var crushPiano = new Tone.BitCrusher(4)
    	.receive("crush")
    	.toMaster();
		var chebyBass = new Tone.Chebyshev(10)
			.receive("cheby")
			.toMaster();


//SLOWEST POSSIBLE TEMPO 
//ALL OTHERS ARE SET AS MULTIPLE OF THIS
//
Tone.Transport.bpm.value = 60;

//HIT IT!!!
Tone.Transport.start();

//----------------------------------------------------------------
//BEGINNING OF SETUP


function setup() {
  createCanvas(windowWidth, windowHeight);
  background(bgFill);
  noCursor();  

}

//END OF SETUP
//----------------------------------------------------------------
//BEGIN OF DRAW
function draw() {

  
  var kickPulse = kickPart.progress;
  var snarePulse = snarePart.progress;
  var pianoPulse = pianoPart.progress;
  var bassPulse = bassPart.progress;
  var loopstate = pianoPart.state;

//  var pp = map(pianoPulse, 0, 1, 0.5, 1.1);
  var pp = map(pianoPulse, 0, 1, 1, 0.8);
  var pt = map(snarePulse, 0, 1, 1, 1.2);
  var pg = map(snarePulse, 0, 1, 1, 0.5);
  var pf = map(snarePulse, 0, 1, 1, 0.2);


  kickSwellOuter = map(kickPulse, 0, 1, 0, (width / 4.57)/35);
  kickSwellMiddle = map(kickPulse, 0, 1, 0, (width / 5.33)/9);
  kickSwellInner = map(kickPulse, 0, 1, 0, (width / 6.66)/3);
  


  alphaOuter = map(kickSwellOuter, 0, 5, 50, 20);
  alphaMiddle = map(kickSwellMiddle, 0, 16.7, 90, 30);

  alphaOuter2 = map(pt, 0, 5, 50, 20);
  alphaMiddle2 = map(pg, 0, 16.7, 90, 30);


  var wave = spectrum.getValue();
  var waveT = spectrumT.getValue();
  
  var fftwave = fft.getValue();
  
//-----------------------------Animations---------------------------------

  	fill(255, 5, 106, 24);
    //fill(255, 100 + i * 3, 100 + i * 5, 255 / i);
    ellipse(mouseX, mouseY, 15, 15);

  
  //KICK CIRCLE
  noFill();
  ellipseMode(CENTER);
  stroke(135, 206, 250, alphaOuter);
  strokeWeight(2);
  ellipse(width/2, height/2, width / 4.57 + (kickSwellOuter * -1));
  stroke(135, 206, 250, alphaMiddle);
  strokeWeight(2);
  ellipse(width/2, height/2, width / 5.33 + (kickSwellMiddle * -1));
  stroke(5, 106, 255);
  strokeWeight(2);
  ellipse(width/2, height/2, width / 6.66 + (kickSwellInner * -1));

  //SNARE CIRCLE
  noFill();
  ellipseMode(CENTER);
  stroke(250, 206, 135, alphaOuter2);
  strokeWeight(2);
  ellipse(width/2, height/2, width * pt);
  stroke(250, 206, 135, alphaMiddle2);
  strokeWeight(2);
  ellipse(width/2, height/2, width * pg);
  stroke(255, 106, 5);
  strokeWeight(2);
  ellipse(width/2, height/2, width * pf);


  //BASS SQUARE
  beginShape();
  push();
  //translate(width * 3 / 8, height * 3 / 4);
  noStroke();
  //fill(225);
  //rect(0 - (width / 8), 0 - (height / 4), width / 4, height / 2)
  //rect(0, 0, width / 4, height / 2)
  beginShape();
  noFill();
  rectMode(CENTER)
  for (var i = 0; i < wave.length; i += 600) {
    //var a = map(i, 0, wave.length, -3, 3);
    var b = map(wave[i], -1, 1, -40, 40);
    var c = map(wave[i], -1, 1, 50, 100);
    stroke(255, c, b); // waveform is red
  	strokeWeight(2);
    rect(width/2, height/2, width/2 + b, height/2 + b);
  }
  pop();
  endShape();

  
  //PIANO TRIANGLE
  push();
  translate(width/2, height/2);
  noStroke();
  //fill(225);
  //rect(0 - (width / 8), 0 - (height*0.25+height*0.05), width / 4, height / 2)
  scale(pp);
  for (var j = 0; j < waveT.length; j+=20) {
    var d = map(waveT[j], -1, 1, -0.1, 0.1);	
  	stroke(0,210,0);
    rotate(d);
  	//point(0, 0)
  	noFill();
  	strokeWeight(2);
  	triangle(0, -height/4, -width/4, height/4, width/4, height/4);
  	//triangle(-70, 40.67, 0, -81.35, 70, 40.67); //for 800/400
  }
  pop();
  

  
  push();
  //translate(width*0.25,0);
  //fill(225);
  noStroke(0);
  //rect(0,0,width*0.25,height/2);
  pop();
  



  if (pianoAnimation == true) {
    animateEllipseC(pianoPulse);
  }
  if (pianoAnimation == true) {
    animateEllipseG(pianoPulse);
  }
  if (pianoAnimation == true) {
    animateEllipseAM(pianoPulse);
  }
  if (pianoAnimation == true) {
    animateEllipseF(pianoPulse);
  }



  
  //RIGHT SIDE DRAWING
//   if (mouseX > width / 2 && mouseX < width &&
//   mouseY > 0 && mouseY < width) {
    if (mouseIsPressed) {
      for (i = 0; i < 15; i++) {
        noStroke();
        fill(255, 5, 106);
        //fill(255, 100 + i * 3, 100 + i * 5, 255 / i);
        ellipse(mouseX, mouseY, i, i);
      }
    }

    //SLOW FADE
    fill(bgFill,15);
    noStroke();
    rect(0, 0, width, height);

    //ERASE DRAWING AND KILL LEAD
//    if (keyIsPressed) {
//      fill(bgFill);
//    	rect(0, 0, width, height);
//      leadPaint.triggerRelease();
//    }

    //EFX BUTTONS
  if (keyIsDown(53)) { //5
    delayKickSend.gain.value = 0;
  } else {
    delayKickSend.gain.value = -100;
  }
  if (keyIsDown(84)) { //T
    delaySnareSend.gain.value = 0;
  } else {
    delaySnareSend.gain.value = -100;
  }
  if (keyIsDown(71)) { //G
    crushSend.gain.value = 0;
  } else {
    crushSend.gain.value = -100;
  }
  if (keyIsDown(66)) { //B
    chebySend.gain.value = 0;
  } else {
    chebySend.gain.value = -100;
  }


  
  if (keyIsDown(SHIFT)) {
      
    cChord = ["C4", "E4", "G4", "E4", "C4", "E4"];
		gChord = ["B3", "D4", "G4", "D4", "B3", "D4"];
		amChord = ["C4", "E4", "A4", "E4", "C4", "E4"];
		fChord = ["C4", "F4", "A4", "F4", "C4", "F4"];

    } else {
   	cChord = ["C4", "E4", "G4"];
	 	gChord = ["B3", "D4", "G4"];
	 	amChord = ["C4", "E4", "A4"];
	 	fChord = ["C4", "F4", "A4"];
    }
    
  //delayKickSend.gain.value = sliderFX1.value();3
  //delaySnareSend.gain.value = sliderFX2.value();
  //crushSend.gain.value = sliderFX3.value();
  //chebySend.gain.value = sliderFX4.value();

    
}


  //END OF DRAW MODE
  //----------------------------------------
  //BEGINNING OF FUNCTIONS

  function animateEllipseC(pianoPulse) {
    if (cChordPlaying) {
      var coord = ellipseCoord.c;
      var index = 0;
      if (pianoPulse > 0 && pianoPulse < 0.3) {
        index = 0;
      } else if (pianoPulse > 0.3 && pianoPulse < 0.6) {
        index = 2;
      } else if (pianoPulse > 0.6) {
        index = 4;
      }
      push();
      //translate(width / 4, 0)
      point(0, 0)
      fill(200, 50)
      fill(124, 225, 0, 200);
      noStroke();
      var pp = map(pianoPulse, 0, 1, 0.5, 1.1);
      ellipse(coord[index], coord[index + 1], pp*60, pp*60);
      pop();
    }
  }

  function animateEllipseF(pianoPulse) {
    if (fChordPlaying) {
      var coord = ellipseCoord.f;
      var index = 0;
      if (pianoPulse > 0 && pianoPulse < 0.3) {
        index = 0;
      } else if (pianoPulse > 0.3 && pianoPulse < 0.6) {
        index = 2;
      } else if (pianoPulse > 0.6) {
        index = 4;
      }
      push();
      //translate(width / 4, 0)
      point(0, 0)
      fill(200, 50)
      fill(140, 180, 121, 200);
      noStroke();
      var pp = map(pianoPulse, 0, 1, 0.5, 1.1);
      ellipse(coord[index], coord[index + 1], pp*80, pp*80);
      pop();
    }
  }

  function animateEllipseG(pianoPulse) {
    if (gChordPlaying) {
      var coord = ellipseCoord.g;
      var index = 0;
      if (pianoPulse > 0 && pianoPulse < 0.3) {
        index = 0;
      } else if (pianoPulse > 0.3 && pianoPulse < 0.6) {
        index = 2;
      } else if (pianoPulse > 0.6) {
        index = 4;
      }
      push();
      //translate(width / 4, 0)
      point(0, 0)
      fill(200, 50)
      fill(100, 120, 190, 200);
      noStroke();
      var pp = map(pianoPulse, 0, 1, 0.5, 1.1);
      ellipse(coord[index], coord[index + 1], pp*40, pp*40);
      pop();
    }
  }

  function animateEllipseAM(pianoPulse) {
    if (amChordPlaying) {
      var coord = ellipseCoord.am;
      var index = 0;
      if (pianoPulse > 0 && pianoPulse < 0.3) {
        index = 0;
      } else if (pianoPulse > 0.3 && pianoPulse < 0.6) {
        index = 2;
      } else if (pianoPulse > 0.6) {
        index = 4;
      }
      push();
      //translate(width / 4, 0)
      point(0, 0)
      fill(200, 50)
      fill(90, 100, 60, 200);
      noStroke();
      var pp = map(pianoPulse, 0, 1, 0.5, 1.1);
      ellipse(coord[index], coord[index + 1], pp*50, pp*50);
      pop();
    }
  }

  //DRAG TO PLAY FUNCTION
  function touchMoved() {
    //var paintNote = ["C4", "E4", "G4", "A4", "C5", "E5", "G5", "A5", "C6"]

    var paintNote = ["C3", "D3", "E3", "F3", "G3", "A3", "B3", "C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6"]

    //right side of canvas
//    if (mouseX > width / 2 && mouseX < width &&
//      mouseY > 0 && mouseY < height) {

      //------------NOTE GRID!!!
      //column1
      if (mouseX > 0 && mouseX < width/8 &&
        mouseY < height && mouseY > height * 7/8) {
        leadPaint.triggerAttackRelease(paintNote[0], "8n");
      } else if (mouseX > 0 && mouseX < width/8 &&
        mouseY < height * 7/8 && mouseY > height * 3/4) {
        leadPaint.triggerAttackRelease(paintNote[1], "8n");
      } else if (mouseX > 0 && mouseX < width/8 &&
        mouseY < height * 3/4 && mouseY > height * 5/8) {
        leadPaint.triggerAttackRelease(paintNote[2], "8n");
      } else if (mouseX > 0 && mouseX < width/8 &&
        mouseY < height * 5/8 && mouseY > height/2) {
        leadPaint.triggerAttackRelease(paintNote[3], "8n");
      } else if (mouseX > 0 && mouseX < width/8 &&
        mouseY < height/2 && mouseY > height * 3/8) {
        leadPaint.triggerAttackRelease(paintNote[4], "8n");
      } else if (mouseX > 0 && mouseX < width/8 &&
        mouseY < height * 3/8 && mouseY > height/4) {
        leadPaint.triggerAttackRelease(paintNote[5], "8n");
      } else if (mouseX > 0 && mouseX < width/8 &&
        mouseY < height/4 && mouseY > height/8) {
        leadPaint.triggerAttackRelease(paintNote[6], "8n");
      } else if (mouseX > 0 && mouseX < width/8 &&
        mouseY < height/8 && mouseY > 0) {
        leadPaint.triggerAttackRelease(paintNote[7], "8n");
        //column2
      } else if (mouseX > width/8 && mouseX < width/4 &&
        mouseY < height && mouseY > height * 7/8) {
        leadPaint.triggerAttackRelease(paintNote[2], "8n");
      } else if (mouseX > width/8 && mouseX < width/4 &&
        mouseY < height * 7/8 && mouseY > height * 3/4) {
        leadPaint.triggerAttackRelease(paintNote[3], "8n");
      } else if (mouseX > width/8 && mouseX < width/4 &&
        mouseY < height * 3/4 && mouseY > height * 5/8) {
        leadPaint.triggerAttackRelease(paintNote[4], "8n");
      } else if (mouseX > width/8 && mouseX < width/4 &&
        mouseY < height * 5/8 && mouseY > height/2) {
        leadPaint.triggerAttackRelease(paintNote[5], "8n");
      } else if (mouseX > width/8 && mouseX < width/4 &&
        mouseY < height/2 && mouseY > height * 3/8) {
        leadPaint.triggerAttackRelease(paintNote[6], "8n");
      } else if (mouseX > width/8 && mouseX < width/4 &&
        mouseY < height * 3/8 && mouseY > height/4) {
        leadPaint.triggerAttackRelease(paintNote[7], "8n");
      } else if (mouseX > width/8 && mouseX < width/4 &&
        mouseY < height/4 && mouseY > height/8) {
        leadPaint.triggerAttackRelease(paintNote[8], "8n");
      } else if (mouseX > width/8 && mouseX < width/4 &&
        mouseY < height/8 && mouseY > 0) {
        leadPaint.triggerAttackRelease(paintNote[9], "8n");
        //column3
      } else if (mouseX > width/4 && mouseX < width * 3 / 8 &&
        mouseY < height && mouseY > height * 7/8) {
        leadPaint.triggerAttackRelease(paintNote[4], "8n");
      } else if (mouseX > width/4 && mouseX < width * 3 / 8 &&
        mouseY < height * 7/8 && mouseY > height * 3/4) {
        leadPaint.triggerAttackRelease(paintNote[5], "8n");
      } else if (mouseX > width/4 && mouseX < width * 3 / 8 &&
        mouseY < height * 3/4 && mouseY > height * 5/8) {
        leadPaint.triggerAttackRelease(paintNote[6], "8n");
      } else if (mouseX > width/4 && mouseX < width * 3 / 8 &&
        mouseY < height * 5/8 && mouseY > height/2) {
        leadPaint.triggerAttackRelease(paintNote[7], "8n");
      } else if (mouseX > width/4 && mouseX < width * 3 / 8 &&
        mouseY < height/2 && mouseY > height * 3/8) {
        leadPaint.triggerAttackRelease(paintNote[8], "8n");
      } else if (mouseX > width/4 && mouseX < width * 3 / 8 &&
        mouseY < height * 3/8 && mouseY > height/4) {
        leadPaint.triggerAttackRelease(paintNote[9], "8n");
      } else if (mouseX > width/4 && mouseX < width * 3 / 8 &&
        mouseY < height/4 && mouseY > height/8) {
        leadPaint.triggerAttackRelease(paintNote[10], "8n");
      } else if (mouseX > width/4 && mouseX < width * 3 / 8 &&
        mouseY < height/8 && mouseY > 0) {
        leadPaint.triggerAttackRelease(paintNote[11], "8n");
        //column4
      } else if (mouseX > width * 3 / 8 && mouseX < width/2 &&
        mouseY < height && mouseY > height * 7/8) {
        leadPaint.triggerAttackRelease(paintNote[7], "8n");
      } else if (mouseX > width * 3 / 8 && mouseX < width/2 &&
        mouseY < height * 7/8 && mouseY > height * 3/4) {
        leadPaint.triggerAttackRelease(paintNote[8], "8n");
      } else if (mouseX > width * 3 / 8 && mouseX < width/2 &&
        mouseY < height * 3/4 && mouseY > height * 5/8) {
        leadPaint.triggerAttackRelease(paintNote[9], "8n");
      } else if (mouseX > width * 3 / 8 && mouseX < width/2 &&
        mouseY < height * 5/8 && mouseY > height/2) {
        leadPaint.triggerAttackRelease(paintNote[10], "8n");
      } else if (mouseX > width * 3 / 8 && mouseX < width/2 &&
        mouseY < height/2 && mouseY > height * 3/8) {
        leadPaint.triggerAttackRelease(paintNote[11], "8n");
      } else if (mouseX > width * 3 / 8 && mouseX < width/2 &&
        mouseY < height * 3/8 && mouseY > height/4) {
        leadPaint.triggerAttackRelease(paintNote[12], "8n");
      } else if (mouseX > width * 3 / 8 && mouseX < width/2 &&
        mouseY < height/4 && mouseY > height/8) {
        leadPaint.triggerAttackRelease(paintNote[13], "8n");
      } else if (mouseX > width * 3 / 8 && mouseX < width/2 &&
        mouseY < height/8 && mouseY > 0) {
        leadPaint.triggerAttackRelease(paintNote[14], "8n");
        //column5
      } else if (mouseX > width/2 && mouseX < width * 5/8 &&
        mouseY < height && mouseY > height * 7/8) {
        leadPaint.triggerAttackRelease(paintNote[9], "8n");
      } else if (mouseX > width/2 && mouseX < width * 5/8 &&
        mouseY < height * 7/8 && mouseY > height * 3/4) {
        leadPaint.triggerAttackRelease(paintNote[10], "8n");
      } else if (mouseX > width/2 && mouseX < width * 5/8 &&
        mouseY < height * 3/4 && mouseY > height * 5/8) {
        leadPaint.triggerAttackRelease(paintNote[11], "8n");
      } else if (mouseX > width/2 && mouseX < width * 5/8 &&
        mouseY < height * 5/8 && mouseY > height/2) {
        leadPaint.triggerAttackRelease(paintNote[12], "8n");
      } else if (mouseX > width/2 && mouseX < width * 5/8 &&
        mouseY < height/2 && mouseY > height * 3/8) {
        leadPaint.triggerAttackRelease(paintNote[13], "8n");
      } else if (mouseX > width/2 && mouseX < width * 5/8 &&
        mouseY < height * 3/8 && mouseY > height/4) {
        leadPaint.triggerAttackRelease(paintNote[14], "8n");
      } else if (mouseX > width/2 && mouseX < width * 5/8 &&
        mouseY < height/4 && mouseY > height/8) {
        leadPaint.triggerAttackRelease(paintNote[15], "8n");
      } else if (mouseX > width/2 && mouseX < width * 5/8 &&
        mouseY < height/8 && mouseY > 0) {
        leadPaint.triggerAttackRelease(paintNote[16], "8n");
        //column6
      } else if (mouseX > width * 5/8 && mouseX < width * 3/4 &&
        mouseY < height && mouseY > height * 7/8) {
        leadPaint.triggerAttackRelease(paintNote[11], "8n");
      } else if (mouseX > width * 5/8 && mouseX < width * 3/4 &&
        mouseY < height * 7/8 && mouseY > height * 3/4) {
        leadPaint.triggerAttackRelease(paintNote[12], "8n");
      } else if (mouseX > width * 5/8 && mouseX < width * 3/4 &&
        mouseY < height * 3/4 && mouseY > height * 5/8) {
        leadPaint.triggerAttackRelease(paintNote[13], "8n");
      } else if (mouseX > width * 5/8 && mouseX < width * 3/4 &&
        mouseY < height * 5/8 && mouseY > height/2) {
        leadPaint.triggerAttackRelease(paintNote[14], "8n");
      } else if (mouseX > width * 5/8 && mouseX < width * 3/4 &&
        mouseY < height/2 && mouseY > height * 3/8) {
        leadPaint.triggerAttackRelease(paintNote[15], "8n");
      } else if (mouseX > width * 5/8 && mouseX < width * 3/4 &&
        mouseY < height * 3/8 && mouseY > height/4) {
        leadPaint.triggerAttackRelease(paintNote[16], "8n");
      } else if (mouseX > width * 5/8 && mouseX < width * 3/4 &&
        mouseY < height/4 && mouseY > height/8) {
        leadPaint.triggerAttackRelease(paintNote[17], "8n");
      } else if (mouseX > width * 5/8 && mouseX < width * 3/4 &&
        mouseY < height/8 && mouseY > 0) {
        leadPaint.triggerAttackRelease(paintNote[18], "8n");
        //column7
      } else if (mouseX > width * 3/4 && mouseX < width * 7/8 &&
        mouseY < height && mouseY > height * 7/8) {
        leadPaint.triggerAttackRelease(paintNote[12], "8n");
      } else if (mouseX > width * 3/4 && mouseX < width * 7/8 &&
        mouseY < height * 7/8 && mouseY > height * 3/4) {
        leadPaint.triggerAttackRelease(paintNote[13], "8n");
      } else if (mouseX > width * 3/4 && mouseX < width * 7/8 &&
        mouseY < height * 3/4 && mouseY > height * 5/8) {
        leadPaint.triggerAttackRelease(paintNote[14], "8n");
      } else if (mouseX > width * 3/4 && mouseX < width * 7/8 &&
        mouseY < height * 5/8 && mouseY > height/2) {
        leadPaint.triggerAttackRelease(paintNote[15], "8n");
      } else if (mouseX > width * 3/4 && mouseX < width * 7/8 &&
        mouseY < height/2 && mouseY > height * 3/8) {
        leadPaint.triggerAttackRelease(paintNote[16], "8n");
      } else if (mouseX > width * 3/4 && mouseX < width * 7/8 &&
        mouseY < height * 3/8 && mouseY > height/4) {
        leadPaint.triggerAttackRelease(paintNote[17], "8n");
      } else if (mouseX > width * 3/4 && mouseX < width * 7/8 &&
        mouseY < height/4 && mouseY > height/8) {
        leadPaint.triggerAttackRelease(paintNote[18], "8n");
      } else if (mouseX > width * 3/4 && mouseX < width * 7/8 &&
        mouseY < height/8 && mouseY > 0) {
        leadPaint.triggerAttackRelease(paintNote[19], "8n");
        //column8
      } else if (mouseX > width * 7/8 && mouseX < width &&
        mouseY < height && mouseY > height * 7/8) {
        leadPaint.triggerAttackRelease(paintNote[14], "8n");
      } else if (mouseX > width * 7/8 && mouseX < width &&
        mouseY < height * 7/8 && mouseY > height * 3/4) {
        leadPaint.triggerAttackRelease(paintNote[15], "8n");
      } else if (mouseX > width * 7/8 && mouseX < width &&
        mouseY < height * 3/4 && mouseY > height * 5/8) {
        leadPaint.triggerAttackRelease(paintNote[16], "8n");
      } else if (mouseX > width * 7/8 && mouseX < width &&
        mouseY < height * 5/8 && mouseY > height/2) {
        leadPaint.triggerAttackRelease(paintNote[17], "8n");
      } else if (mouseX > width * 7/8 && mouseX < width &&
        mouseY < height/2 && mouseY > height * 3/8) {
        leadPaint.triggerAttackRelease(paintNote[18], "8n");
      } else if (mouseX > width * 7/8 && mouseX < width &&
        mouseY < height * 3/8 && mouseY > height/4) {
        leadPaint.triggerAttackRelease(paintNote[19], "8n");
      } else if (mouseX > width * 7/8 && mouseX < width &&
        mouseY < height/4 && mouseY > height/8) {
        leadPaint.triggerAttackRelease(paintNote[20], "8n");
      } else if (mouseX > width * 7/8 && mouseX < width &&
        mouseY < height/8 && mouseY > 0) {
        leadPaint.triggerAttackRelease(paintNote[21], "8n");
      }
    }

  
  //LOOP FUNCTIONS
  function loopKick() {
    if (!kickOn) {
      kickPart.start(0);
      kickOn = !kickOn;
    } else {
      kickPart.stop();
      kickOn = !kickOn;
    }
  }

  function loopSnare() {
    if (!snareOn) {
      snarePart.start(0);
      snarePart.loop = true;
      snareOn = !snareOn;
    } else {
      snarePart.loop = false;
      snareOn = !snareOn;
    }
  }

  function loopPiano() {
    if (!pianoOn) {
      pianoPart.start(0);
      pianoPart.loop = true;
      pianoOn = !pianoOn;
    } else {
      pianoPart.loop = false;
      pianoOn = !pianoOn;
    }
  }

  function loopBass() {
    if (!bassOn) {
      bassPart.start(0);
      bassPart.loop = true;
      bassOn = !bassOn;
    } else {
      bassPart.loop = false;
      bassOn = !bassOn;
    }
  }


//----------------KEY PRESSED SHIT----------------//

function keyPressed() {
  //KICK
  if (keyCode === 49) { //1
    if (kickPart.playbackRate == 1 || !kickOn) {
    loopKick();
    } else {
      kickPart.playbackRate = 1;
    }
  } else if (keyCode === 50) { //2
   if (kickPart.playbackRate == 2 || !kickOn) {
    loopKick();
    } else {
      kickPart.playbackRate = 2;
    }
  } else if (keyCode === 51) { //3
   if (kickPart.playbackRate == 3 || !kickOn) {
    loopKick();
    } else {
      kickPart.playbackRate = 3;
    }
  } else if (keyCode === 52) { //4
   if (kickPart.playbackRate == 4 || !kickOn) {
    loopKick();
    } else {
      kickPart.playbackRate = 4;
    }

  }

  //SNARE
  if (keyCode === 81) { //Q
    if (snarePart.playbackRate == 1 || !snareOn) {
      loopSnare();
    } else {
    snarePart.playbackRate = 1;
    }
  } else if (keyCode === 87) { //W
    if (snarePart.playbackRate == 2 || !snareOn) {
      loopSnare();
    } else {
    snarePart.playbackRate = 2;
    }
  } else if (keyCode === 69) { //E
    if (snarePart.playbackRate == 3 || !snareOn) {
      loopSnare();
    } else {
    snarePart.playbackRate = 3;
    }
  } else if (keyCode === 82) { //R
    if (snarePart.playbackRate == 4 || !snareOn) {
      loopSnare();
    } else {
    snarePart.playbackRate = 4;
    }
  }

  //PIANO
  if (keyCode == 65) { //A
    if (cChordPlaying == true || !pianoOn) {
          loopPiano();
    } else if (cChordPlaying == false) {
      pianoPart.removeAll();
      pianoPart.add(0, cChord);
      cChordPlaying = true;
      fChordPlaying = false;
      gChordPlaying = false;
      amChordPlaying = false;
    } 
  } else if (keyCode == 83) { //S
 		if (fChordPlaying == true || !pianoOn) {
         loopPiano(); 
    } else if (fChordPlaying == false) {
      pianoPart.removeAll();
      pianoPart.add(0, fChord);
      cChordPlaying = false;
      fChordPlaying = true;
      gChordPlaying = false;
      amChordPlaying = false;
    }
  } else if (keyCode == 68) { //D
		if (gChordPlaying == true || !pianoOn) {
     loopPiano(); 
    }
    else if (gChordPlaying == false) {
      pianoPart.removeAll();
      pianoPart.add(0, gChord);
      cChordPlaying = false;
      fChordPlaying = false;
      gChordPlaying = true;
      amChordPlaying = false;
    }
  } else if (keyCode == 70) { //F
    if (amChordPlaying == true || !pianoOn) {
        loopPiano();
    } else if (amChordPlaying == false) {
      pianoPart.removeAll();
      pianoPart.add(0, amChord);
      cChordPlaying = false;
      fChordPlaying = false;
      gChordPlaying = false;
      amChordPlaying = true;
  	}
  }
  
  	//BASS
    if (keyCode == 90) { //Z
      if (cBassPlaying == true || !bassOn) {
      loopBass();
      } else if (cBassPlaying == false) {
      bassPart.removeAll();
        bassPart.add(0, "C2");
      cBassPlaying = true;
      fBassPlaying = false;
      gBassPlaying = false;
      amBassPlaying = false;
    } 
  } else if (keyCode == 88) { //X
      if (fBassPlaying == true || !bassOn) {
      loopBass();
      } else if (fBassPlaying == false) {
      bassPart.remove(0);
      bassPart.add(0, "F1");
      cBassBassPlaying = false;
      fBassBassPlaying = true;
      gBassBassPlaying = false;
      amBassBassPlaying = false;
    } 
  } else if (keyCode == 67) { //C
      if (gBassPlaying == true || !bassOn) {
      loopBass();
      } else if (gBassPlaying == false) {
      bassPart.remove(0);
      bassPart.add(0, "G1");
      cBassPlaying = false;
      fBassPlaying = false;
      gBassPlaying = true;
      amBassPlaying = false;
    } 
  } else if (keyCode == 86) { //V
      if (amBassPlaying == true || !bassOn) {
      loopBass();
      } else if (amBassPlaying == false) {
      bassPart.remove(0);
      bassPart.add(0, "A1");
      cBassPlaying = false;
      fBassPlaying = false;
      gBassPlaying = false;
      amBassPlaying = true;
    } 
  }
  
  // switch (keyCode) {
  //   case 86:
  //     if (amBassPlaying == false) {
  //       bassPart.remove(0);
  //       bassPart.add(0, "A1");
  //       cBassPlaying = false;
  //       fBassPlaying = false;
  //       gBassPlaying = false;
  //       amBassPlaying = true;
  //   	}
  //     break;
  //   case 68:
  //     // do some other stuff
  //     break;
  //   default:
  //     break;
  // }
}




