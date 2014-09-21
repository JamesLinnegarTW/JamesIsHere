function sendToLight() {
  var LightRepository = require('./LightRepository');
  var ConnectionManager = require('./ConnectionManager');
  var lightRepo = new LightRepository();

  var led = 0;

  var bluetoothConnection = new ConnectionManager(lightRepo);
  bluetoothConnection.start();


  function exitHandler(options, err) {
    console.log('exiting');
    lightRepo.toAll(function(){
      this.disconnect();
    });
    process.exit();
  }


  function sendBuffer(){

    var b = new Buffer(3);
    var red = 0,
        yellow = 0,
        green = 0;


    if(led == 0){
      red = 200
    } else if(led == 1){
      red = 200
      yellow = 255;
    } else if(led == 2){
      green = 255;
    } else if(led == 3){
      yellow = 255;
    } else if(led == 4){
      red = 200;
    }

    led++;

    if(led > 4) led = 0;

    b.writeUInt8(red, 0);
    b.writeUInt8(yellow, 1);
    b.writeUInt8(green, 2);
    console.log(b);



    function callback(buffer){
      return function sendToLight(){
        this.writeBuffer(buffer, true);
      }
    }

    var cb = callback(b);
    lightRepo.toAll(cb);

  }

  setInterval(sendBuffer, 1000);

  process.on('exit', exitHandler.bind(null,{cleanup:true}));
  process.on('SIGINT', exitHandler.bind(null, {exit:true}));
  process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

}

sendToLight();
