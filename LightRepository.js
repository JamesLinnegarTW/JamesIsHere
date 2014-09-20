function LightRespository(){
  var lights = [];
  return {
    add: function(l){
      lights.push(l);
    },
    toAll: function(callback){
      lights.forEach(function(light){
        callback.call(light);
      });
    },
    removeLight: function(peripheral){
      lights.forEach(function(light, index, array){
        if(light._peripheral.uuid === peripheral.uuid){
          console.log('yo remove me');
          array.splice(index, 1);
        } else {
          console.log('nope');
        }
      });

    },
    clearAll: function(){
      lights = [];
    }
  };
}

module.exports = LightRespository;