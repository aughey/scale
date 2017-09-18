$(function() {
  var synth = new Tone.Synth().toMaster()

  var piano = new Tone.Synth({
    "oscillator": {
      "type": "fmsine4",
      "modulationType": "square"
    }
  }).toMaster();

  var kick = new Tone.MembraneSynth(
    /*{
			"envelope" : {
				"sustain" : 0,
				"attack" : 0.02,
				"decay" : 0.8
			},
			"octaves" : 10
		}*/
  ).toMaster();

  var snare = new Tone.NoiseSynth({
    "volume": -5,
    "envelope": {
      "attack": 0.001,
      "decay": 0.2,
      "sustain": 0
    },
    "filterEnvelope": {
      "attack": 0.001,
      "decay": 0.1,
      "sustain": 0
    }
  }).toMaster();

  function scale(note, count) {
    if (!count) {
      count = 1;
    }
    var pattern = [2, 2, 1, 2, 2, 2, 1];
    var note = new Tone.Frequency(note);
    var res = [note.toNote()];
    for (var i = 0; i < count; ++i) {
      pattern.forEach(function(t) {
        note = note.transpose(t);
        res.push(note.toNote());
      })
    }
    return res;
  }


  synth.volulme = -6;

  var pattern = null;

  var on = false;
  var count = 0;
  var loop = new Tone.Loop(function(time) {
    //kick.triggerAttackRelease( "4n", time);
    $('.metronome').html(count + 1);
    count = (count + 1) % 4;
    if (on) {
      on = false;
      $('.metronome').removeClass("metronomeon").addClass("metronomeoff");
    } else {
      on = true;
      $('.metronome').removeClass("metronomeoff").addClass("metronomeon");
    }
  }, "4n");
  loop.start();

  var first_note = "D4";
  var scalecount = 1;
  incr(0,0);

  Tone.Transport.start()
  Tone.Transport.bpm.value = 90;

  function stop() {
    var t = Tone.Transport;
    if (t.state == 'paused') {
      t.start();
    } else {
      t.pause();
    }
  }


  function incr(i,count) {
    scalecount += count;
    if(scalecount < 1) {
      scalecount = 1;
    }
    if(scalecount > 2) {
      scalecount = 2;
    }
    if (pattern) {
      pattern.stop();
    }

    var t = new Tone.Frequency(first_note);
    if (i != 0) {
      t = t.transpose(i);
    }
    first_note = t.toNote();
    console.log(first_note);

    pattern = new Tone.Pattern(function(time, note) {
      //the order of the notes passed in depends on the pattern
      synth.triggerAttackRelease(note, "1n", time);
    }, scale(first_note,scalecount), "upDown").start(0);
    pattern.interval = "2n";

    $('#key').html(first_note);
    $('#count').html(scalecount)
  }

  $('button').click(stop)
  $('.metronome').click(stop)
  $('body').keydown(function(e) {
    if (e.keyCode == 32) { // space
      stop();
    } else if (e.keyCode == 37) {
      incr(-1,0);
    } else if (e.keyCode == 39) {
      incr(1,0);
    } else if(e.keyCode == 38) {
      incr(0,1);
    } else if(e.keyCode == 40) {
      incr(0,-1);
    }
  });
})
