var throwProperties = function() {
  this.speed = 5;
  this.spin=0;
  this.offset=0
};

createUi = function() {
  var text = new throwProperties();
  var gui = new dat.GUI();
  var controller2 = gui.add(text, 'speed', 0, 10);
	controller2.onFinishChange(function(value2){
	V0=value2;
	});
	//gui.add(text, 'speed', 0, 10);
  gui.add(text, 'spin',-1,1);
  var controller = gui.add(text, 'offset',-5,5);
	controller.onChange(function(value) {
	ball.position.set(value/10.0,0.11,10);
	});
};