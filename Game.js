var Game = function Game() {
	var spriteCanvas, spriteContext;
	var currentScene;
	var SCREENRATIO = .85;
	var _state = -1;
	var MENU = -1, ARCADE = 0, ENDLESS = 1, CHALLENGE = 2;//states


	this.init = function() {
		//this.bgCanvas = document.getElementById('background');
		this.spriteCanvas = document.getElementById('sprite');

		width = this.spriteCanvas.width;
		height = this.spriteCanvas.height;

		window.addEventListener("keydown", function(evt) { currentScene.keydown(evt); }, false);
		this.spriteCanvas.addEventListener("mousedown", function(evt) {
			evt.preventDefault();
			currentScene.mousedown(evt);
		}, false);
		this.spriteCanvas.addEventListener("mouseup", function(evt) {
			evt.preventDefault();
			currentScene.mouseup(evt);
		}, false);
		this.spriteCanvas.addEventListener("moustout", function(evt) {
			evt.preventDefault();
			currentScene.mouseout(evt);
		}, false);
		this.spriteCanvas.addEventListener("mousemove", function(evt) {
			evt.preventDefault();
			currentScene.mousemove(evt);
		}, false);
		this.spriteCanvas.addEventListener("touchstart", function(evt) {
			evt.preventDefault();
			currentScene.touchstart(evt);
		}, false);
		this.spriteCanvas.addEventListener("touchend", function(evt) {
			evt.preventDefault();
			currentScene.touchend(evt);
		}, false);
		this.spriteCanvas.addEventListener("touchcancel", function(evt) {
			evt.preventDefault();
			currentScene.touchcancel(evt);
		}, false);
		this.spriteCanvas.addEventListener("touchmove", function(evt) {
			evt.preventDefault();
			currentScene.touchmove(evt);
		}, false);
		this.spriteCanvas.addEventListener("contextmenu", function(evt) { evt.preventDefault(); }, false);

		if (this.spriteCanvas.getContext) {
			//this.bgContext = this.bgCanvas.getContext('2d');
			this.spriteContext = this.spriteCanvas.getContext('2d');

			_height = window.innerHeight;
			_width = window.innerWidth;
			//_width = _height*10/16;


			this.spriteCanvas.width = _width;
			this.spriteCanvas.height = _height;

			//this.spriteContext.drawImage(resourceRepository.background, 0, _height*SCREENRATIO, _width, _height*(1-SCREENRATIO));

			_state = MENU;
			var m = new Menu();
			m.init(_width, _height);
			m.subscribe(changeScene);
			currentScene = m;

			return true;
		}
		return false;
	};

	changeScene = function(s) {
		if (_state == MENU) {
			if (s == ARCADE) {
				var a = new Arcade();
				a.init(_width, _height);
				a.subscribe(changeScene);
				var oldScene = currentScene;
				currentScene = a;
				delete oldScene;
				_state = ARCADE;
			}
			else if (s == ENDLESS) {
				var e = new Endless();
				e.init(_width, _height);
				e.subscribe(changeScene);
				var oldScene = currentScene;
				currentScene = e;
				delete oldScene;
				_state = ENDLESS;
			}
			else if (s == CHALLENGE) {
				var c = new Challenge();
				c.init(_width, _height);
				c.subscribe(changeScene);
				var oldScene = currentScene;
				currentScene = c;
				delete oldScene;
				_state = CHALLENGE;
			}
		}
		else {
			var m = new Menu();
			m.init(_width, _height);
			m.subscribe(changeScene);
			var oldScene = currentScene;
			currentScene = m;
			delete oldScene;
			_state = MENU;
		}
	};

	this.draw = function() {
		var ctx = this.spriteContext;
		currentScene.draw(ctx);
	};

	this.update = function() {
		currentScene.update();
	};

	// Start the animation loop
	this.start = function() {
		animate();
	};
}
