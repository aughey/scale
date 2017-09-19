$(function() {
  var synth = new Tone.Synth({
    envelope: {
      attack : 0.01,
      decay : 100,
      sustain: 1
    }
  }).toMaster()

  var sharp_to_flat = {
    'C#' : 'Db',
    'D#' : 'Eb',
    'E#' : 'F',
    'F#' : 'Gb',
    'G#' : 'Ab',
    'A#' : 'Bb',
    'B#' : 'C'
  }

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

  function interval_pattern(note, count) {
    var s = scale(note,count);
    var repeat = s[parseInt($('#repeatednote').val())-1];
    var out = [];
    s.forEach(function(n) {
      out.push(n);
      if(n !== repeat) {
        out.push(repeat);
      }
    });
    return out;


    if (!count) {
      count = 1;
    }
    var pattern = [2, 2, 1, 2, 2, 2, 1];
    var note = new Tone.Frequency(note);
    var res = [note.toNote()];
    for (var i = 0; i < count; ++i) {
      pattern.forEach(function(t,index) {
        note = note.transpose(t);
        res.push(note.toNote());
	if(i == count-1 && index === pattern.length-1) {
	} else {
          res.push(res[0]);
	}
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
  var scale_interval = 1;
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

    var notes;
    if($('#pattern').val() == 'Scale') {
      notes = scale(first_note,scalecount);
    } else {
      notes = interval_pattern(first_note,scalecount);
    }

    notes = notes.slice().concat(notes.slice().reverse());

    pattern = new Tone.Pattern(function(time, note) {
      //the order of the notes passed in depends on the pattern
      synth.triggerAttackRelease(note, "" + scale_interval + "n", time);
    }, notes, "up").start(0);
    pattern.interval = "" + scale_interval + 'n'

    var key = drawScale(notes,scale_interval)

    $('#key').html(key);
    $('#count').html(scalecount)
    var intervalmap = {
      16 : "Sixteenth Note",
      8 : "Eighth Note",
      4 : "Quarter Note",
      2 : "Half Note",
      1 : "Whole Note",
    }
    $('#interval').html(intervalmap[scale_interval])
  }

  $('#pattern').click(function() {
    if($('#pattern').val() == "Scale") {
      $('#repeatednote').prop('disabled',true);
    } else {
      $('#repeatednote').prop('disabled',false);
    }
    incr(0,0);
  });
  $('#repeatednote').click(function() {
    incr(0,0);
  });
  $('#keyup').click(function() {
    incr(1,0);
  })
  $('#keydown').click(function() {
    incr(-1,0);
  })
  $('#countup').click(function() {
    incr(0,1);
  })
  $('#countdown').click(function() {
    incr(0,-1);
  })
  function down_interval() {
    if(scale_interval == 16) {
      scale_interval = 8;
      incr(0,0);
    } else if(scale_interval == 8) {
      scale_interval = 4;
      incr(0,0);
    } else if(scale_interval == 4) {
      scale_interval = 2;
      incr(0,0);
    } else if(scale_interval == 2) {
      scale_interval = 1;
      incr(0,0);
    }
  }
  $('#intervaldown').click(down_interval);
  function up_interval() {
    if(scale_interval == 1) {
      scale_interval = 2;
      incr(0,0);
    } else if(scale_interval == 2) {
      scale_interval = 4;
      incr(0,0);
    } else if(scale_interval == 4) {
      scale_interval = 8;
      incr(0,0);
    } else if(scale_interval == 8) {
      scale_interval = 16;
      incr(0,0);
    }
  }
  $('#intervalup').click(up_interval);

  function drawScale(notes,interval) {
    var out = []

    var key = first_note.replace(/[0-9]+/,'')

    var flat_key = false;
    if(sharp_to_flat[key]) {
      key = sharp_to_flat[key]
      flat_key = true;
    }
    var retkey = key;
    key = key.replace('#','is');
    key = key.replace('b','es');

    notes.forEach(function(n) {
      if(flat_key) {
        var check = n.replace(/[0-9]+/,'');
        if(sharp_to_flat[check]) {
	  n = sharp_to_flat[check] + n.substr(2);
	}
	if(key == 'Ges' && check == 'B') {
	  // One exception for a key that we never use
	  n = 'Cb' + "'" + n.substr(1)
	}
      }
      if(key == 'F' && n.substr(0,2) == 'A#') {
        n = 'Bb' + n.substr(2);
      }
      n = n.replace('#','is');
      n = n.replace('b','es');
      n = n.toLowerCase();
      n = n.replace('3',"");
      n = n.replace('4',"'");
      n = n.replace('5',"''");
      n = n.replace('6',"'''");
      n = n.replace('7',"''''");
      n = n + interval;
      out.push(n)
    });
    //var notes =  "d'1 e' fis' g' a' b' cis'' d''"
    var notes =  out.join(' ')
    var host = "http://washucsc.org:3001";
    //var host = "";
    $('#scale').attr('src',host + '/song.png?key=' + key.toLowerCase() + '&notes=' + encodeURIComponent(notes));
    return retkey;
  }


  $('#stop').click(stop)
  $('.metronome').click(stop)
  $('body').keydown(function(e) {
    if (e.keyCode == 32) { // space
      stop();
    } else if (e.keyCode == 37) {
      incr(-1,0);
    } else if (e.keyCode == 39) {
      incr(1,0);
    } else if(e.keyCode == 38) {
      up_interval();
    } else if(e.keyCode == 40) {
      down_interval();
    }
  });
})
