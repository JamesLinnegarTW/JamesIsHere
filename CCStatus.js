var CCStatus = {

	getBuffer : function(lastBuildStatus, activity){
	  var b = new Buffer(3);
	  var red = 0,
	      yellow = 0,
	      green = 0;


	  if(activity === 'Sleeping'){
	    if(lastBuildStatus === "Failure"){
	      red = 200;
	      yellow = 0;
	      green = 0;
	    } else if(lastBuildStatus === "Success"){
	      red = 0;
	      yellow = 0;
	      green = 255;
	    } else {
	      console.log('unknown state', 'lbs sleeping', lastBuildStatus, activity);
	    }
	  } else if(activity === 'Building'){
	    if(lastBuildStatus === "Failure"){
	      red = 100;
	      yellow = 255;
	      green = 0;
	    } else if(lastBuildStatus === "Success"){
	      red = 0;
	      yellow = 255
	      green = 255;
	    } else {
	      console.log('unknown state', 'lbs', lastBuildStatus, activity);
	    }
	  } else {
	    console.log('unknown state', 'activity building', lastBuildStatus, activity);
	  }

	  b.writeUInt8(red, 0);
	  b.writeUInt8(yellow, 1);
	  b.writeUInt8(green, 2);

	  return b;
	}
}


module.exports = CCStatus;