function sendToLight() {
  var LightRepository = require('./LightRepository');
  var ConnectionManager = require('./ConnectionManager');
  var lightRepo = new LightRepository();

  var bluetoothConnection = new ConnectionManager(lightRepo);
  bluetoothConnection.start();


  function exitHandler(options, err) {
    console.log('exiting');
    lightRepo.toAll(function(){
      this.disconnect();
    });
    process.exit();
  }

  process.on('exit', exitHandler.bind(null,{cleanup:true}));
  process.on('SIGINT', exitHandler.bind(null, {exit:true}));
  //process.on('uncaughtException', exitHandler.bind(null, {exit:true}));

}

sendToLight();
