function Light(peripheral){
  this._peripheral = peripheral;
}

Light.prototype.writeBuffer = function(data){
  console.log('default buffer');
}

Light.prototype.readBuffer = function(data){

}

Light.prototype.registerDisconnectHandler = function(handler){
  this.disconnect = handler;
}

Light.prototype.sendReset = function(){
  var b = new Buffer(3);

  b.writeUInt8(0, 0);
  b.writeUInt8(0, 1);
  b.writeUInt8(0, 2);

  this.writeBuffer(b);

  return this;
}

Light.prototype.registerReadHandler = function(characteristic){
  var light = this;
  characteristic.notify(true);
  characteristic.on('read', function(data, isNotification) {
    if(data){
        light.signalStrength = data.readInt8(0);
     // console.log(light.signalStrength);
    }
  });

  return this;
}

Light.prototype.registerWriteHandler = function(characteristic){
  this.writeService = characteristic;

  this.writeBuffer = function(data){
    this.writeService.write(data, true);
    return this;
  }
  return this;
}


module.exports = Light;