var throwProperties = function() {
  this.speed = 5;
  this.angle =0;
  this.spin=0;
  this.offset=0
};

createUi = function() {
  var text = new throwProperties();
  var gui = new dat.GUI();
  var controller2 = gui.add(text, 'speed', 0, 10);
	controller2.onFinishChange(function(value){
	V0=value;
	});
	
  var controller3=gui.add(text,'angle',-10,10);
	controller3.onFinishChange(function(value){
	angle=value;
	});
  gui.add(text, 'spin',-1,1);
  var controller = gui.add(text, 'offset',-5,5);
	controller.onChange(function(value) {
	ballOffset=value/10.0;
	ball.position.set(value/10.0,0.11,10);
	});
};