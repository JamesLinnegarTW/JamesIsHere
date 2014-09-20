var http = require('http');
var noble = require('noble');
var retryInterval;

var url = "http://beta.bingle.com.au/car-insurance";
url = "http://localhost/ferry/app/";
var rulesToIgnore = ['Bad value X-UA-Compatible for attribute http-equiv on element meta.'];

function Light(){}

Light.prototype.writeBuffer = function(data){
  console.log('No light registered');
}

Light.prototype.peripheral = null;

Light.prototype.sendReset = function(){
  var b = new Buffer(3);

  b.writeUInt8(0, 0);
  b.writeUInt8(0, 1);
  b.writeUInt8(0, 2);

  this.writeBuffer(b);

  return this;
}

Light.prototype.registerHandler = function(service){
  this.service = service;

  this.writeBuffer = function(data){
    this.service.write(data, true);
    return this;
  }
  return this;
}

var myLight = new Light();


noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning(['2220']);
    console.log("scanning");
  } else {
    noble.stopScanning();
    console.log("stop scanning");
  }
});


noble.on('discover', function(peripheral) {

  var l = new Light();

  function exitHandler(options, err) {
    peripheral.disconnect();
    process.exit();
  }

  process.on('exit', exitHandler.bind(null,{cleanup:true}));
  process.on('SIGINT', exitHandler.bind(null, {exit:true}));
 // process.on('uncaughtException', exitHandler.bind(null, {exit:true}));


  if (peripheral.advertisement.localName == 'RFduino') {
    var connect = function() {
      peripheral.connect(function(error) {
        console.log('connecting');
        if (error) {
          console.log('failed to connect to the RFduino, error is ', error);
        }
      });
    };

    peripheral.on('disconnect', function() {
      console.log('disconnected, retrying...');
      retryInterval = setInterval(connect, 15000);
    });

    peripheral.on('connect', function() {
      if(retryInterval) clearInterval(retryInterval);
      peripheral.discoverServices(['2220']);
    });

    peripheral.on('servicesDiscover', function(services) {
    services[0].on('characteristicsDiscover', function(characteristics) {
        myLight.registerHandler(characteristics[0])
               .sendReset();
      });
      services[0].discoverCharacteristics(['2222']);
    });

    connect();
  }
});


function getValidationStatus(){

  var options = {
    hostname: 'validator.local',
    port: 80,
    path: '/w3c-validator/check?uri=' + encodeURI(url) + '&charset=%28detect+automatically%29&doctype=Inline&group=0&output=json',
    method: 'GET'
  };

  var req = http.request(options, function(res) {

    res.on('data', function (chunk) {
      var buffer;

      try {
        var resultObj = JSON.parse(chunk);
        console.log(resultObj);
        buffer = parseValidation(resultObj);
        console.log(buffer);

      } catch(e){
        console.log(e);
        console.log('not valid json?');
        buffer = allOn();
      }

        myLight.writeBuffer(buffer, true);
    });

  });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });
  req.end();

}

function allOn(){
  var b = new Buffer(3);
  var red = 200, yellow = 255, green = 255;
  b.writeUInt8(red, 0);
  b.writeUInt8(yellow, 1);
  b.writeUInt8(green, 2);
  return b;
}

function parseValidation(validation){

  var b = new Buffer(3);
  var red = 0, yellow = 0, green = 0;


  if(validation.messages && filterMessages(validation.messages)){
    red = 200;
    yellow = 0;
    green = 0;
  } else {
    red = 0;
    yellow = 0;
    green = 255;
  }

  console.log(red, yellow, green);
  b.writeUInt8(red, 0);
  b.writeUInt8(yellow, 1);
  b.writeUInt8(green, 2);
  return b;
}

function startValidation(){
  setInterval(function(){
    getValidationStatus();
  }, 5000);
  getValidationStatus();
}


function filterMessages(messages){
  for(var i = messages.length -1; i >=0; i--){
    if(messages[i].message == "Bad value X-UA-Compatible for attribute http-equiv on element meta."){
      messages.splice(i,1);
    }
  }
  console.log(messages.length);
  return messages.length > 0;
}

startValidation();