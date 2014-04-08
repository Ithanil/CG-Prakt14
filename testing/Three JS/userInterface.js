var throwProperties = function() {
  this.speed = 5;

};

createUi = function() {
  var text = new throwProperties();
  var gui = new dat.GUI();
  var controller2 = gui.add(text, 'speed', 0, 10);
	controller2.onFinishChange(function(value){
	V0=value;
	});
};