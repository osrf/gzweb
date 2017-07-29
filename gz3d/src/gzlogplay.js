 var nsInSec = 1000000000;

var correctTime = function(time)
{
  var n = 0;
  // In the case sec and nsec have different signs, normalize
  if (time.sec > 0 && time.nsec < 0)
  {
    n = Math.floor(Math.abs(time.nsec / nsInSec) + 1);
    time.sec -= n;
    time.nsec += n * nsInSec;
  }
  if (time.sec < 0 && time.nsec > 0)
  {
    n = Math.floor(Math.abs(time.nsec / nsInSec) + 1);
    time.sec += n;
    time.nsec -= n * nsInSec;
  }

  // Make any corrections
  time.sec += Math.floor(time.nsec / nsInSec);
  time.nsec = Math.floor(time.nsec % nsInSec);
};

var subtractTime = function(timeA, timeB)
{
  var result = {};
  result.sec = timeA.sec - timeB.sec;
  result.nsec = timeA.nsec - timeB.nsec;
  correctTime(result);
  return result;
};

/**
 * log playback
 * @constructor
 */
GZ3D.LogPlay = function(gui, guiEvents)
{
  this.gui = gui;
  this.visible = null;
  this.startTime = null;
  this.endTime = null;
  this.active = false;
  this.sliderRange = 100;

  var that = this;

  // when slide pos changes
  guiEvents.on('logPlaySlideStop', function (value)
    {
      if (!that.startTime || !that.endTime)
      {
        return;
      }

      var rel = value / that.sliderRange;
      var seek = (that.startTime.sec + that.startTime.nsec * 1e-9) +
        rel * (that.totalTime.sec + that.totalTime.nsec * 1e-9);

      var playback = {};
      playback.seek = {};
      playback.seek.sec = Math.floor(seek);
      playback.seek.nsec = Math.round((seek - playback.seek.sec) * nsInSec);

      // publich playback control command msg
      that.gui.emitter.emit('logPlayChanged', playback);
      that.active = false;
      console.log('no longer active !!!!!!!!!!!!!!!!!!!!!!!!');
    }
  );

  guiEvents.on('logPlaySlideStart', function ()
    {
      console.log('active !!!!!!!!!!!!!!!!!!!!!!!!');
      that.active = true;
    }
  );

  this.init();
};

/**
 * Initialize log playback
 */
GZ3D.LogPlay.prototype.init = function()
{
};

/**
 * Set log playback widget visibility
 */
GZ3D.LogPlay.prototype.setVisible = function(visible)
{
  console.log('set log play visible ' + visible);
  if (visible)
  {
    $('#logplay').show();
  }
  else
  {
    $('#logplay').hide();
  }
};

/**
 * Set log playback stats based on data received
 */
GZ3D.LogPlay.prototype.setStats = function(simTime, startTime, endTime)
{
  this.simTime = simTime;

  if (!this.startTime || !this.endTime || !this.totalTime ||
      this.startTime.sec !== startTime.sec ||
      this.startTime.nsec !== startTime.nsec ||
      this.endTime.sec !== endTime.sec ||
      this.endTime.nsec !== endTime.nsec)
  {
    this.startTime = startTime;
    this.endTime = endTime;
    this.totalTime = subtractTime(endTime, startTime);
  }

  if (!this.active)
  {
    // work out new slider value to set to
    var relTime = subtractTime(this.simTime, this.startTime);
    var newVal = (relTime.sec + relTime.nsec * 1e-9) /
        (this.totalTime.sec + this.totalTime.nsec * 1e-9);
    newVal = Math.max(newVal, 0);

    // slider range: 0 - 100
    $('#logplay-slider-input').val(newVal*this.sliderRange).slider('refresh');
    $('#logplay-slider-input').text(newVal*this.sliderRange).slider('refresh');
  }
};
