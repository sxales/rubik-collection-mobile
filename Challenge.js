var Challenge = function() {
	var _width, _height;//in pixels
	var _w, _h;//in tiles
	var _frame = 0;//counter 0-100
	var _state;
	var WAITING = -1, INPLAY = 0, PAUSED = 1, GAMEOVER = 2;//states
	var TOOMANYCLICKS = 25;
	var NUMBER_OF_COLORS = 5;
	var BLUE = 5, GRAY = 8, GREEN = 4, RED = 3, SUPER = 2, WHITE = 1, TEAL = 5, YELLOW = 6, PINK = 7, LOGO = 0; //font colors
	var FONTSIZE = 40;
	var messages = new Array();
	var mute = false;
	var volume = .2;
	var subscribers = new Array();
	var SCREENRATIO = .85;
	//var view = new Array();
	var model = new ArrayList2d();
	var cursor = new Cursor();
	var level = 0;
	var score = 0;
	var displayedscore = 0;
	var btndown;
	var checkgamestate;
	var SPEED = 0.1;
	var debug = false;
	var locked = false;
	var clicks = 0;
	var combo = 0;
	var levelscore = 0;
	var highscore = 0;
	var levelchanged = false;
	var lastcolor = -1;
	//var countByType = new Array(NUMBER_OF_COLORS+1);
	var clearable = new Array();
	var btnback = new Button();
	var CHALLENGESCORE = 250000;

	this.subscribe = function(s) {
		subscribers.push(s);
	};

	this.unsubscribe = function(s) {
		for (var i = 0; i<subscribers.length; i++) {
			if (subscribers[i] == s) {
				subscribers.splice(i);
				break;
			}
		}
	};

	notify = function(b) {
		for (var i = 0; i<subscribers.length; i++) {
			subscribers[i].call(this,b);
		}
	};

	this.init = function(w,h) {
		_height = h;
		_width = w;

		_frame = 0;
		_state = WAITING;

		_w = 13;
		_h = Math.floor((_height*SCREENRATIO) / (_width / _w));

		setVolume(volume);
		if (typeof(Storage) !== "undefined") load();
		reset();
	};

	reset = function() {
		_state = WAITING;
		level = 0;
		score = 0;
		displayedscore = 0;
		clicks = 0;
		combo = 0;
		levelscore = 0;
		levelchanged = false;
		lastcolor = -1;
		//for (var i=0; i<NUMBER_OF_COLORS+1; i++) countByType[i] = 0;

		var w = Math.floor(_width/_w);
		var h = Math.floor(_height*SCREENRATIO/_h);

		model.init(_w, _h);

		for (var i=0;i<model.getWidth(); i++) {
			for (var j=0; j<model.getHeight(); j++) {
				var t = Math.floor((Math.random()*NUMBER_OF_COLORS)+1);
				if (i > 0) {
					if (j > 0) {
						while (t == model.get(i-1,j).type || t ==  model.get(i,j-1).type) {
							t = Math.floor((Math.random()*NUMBER_OF_COLORS)+1);
						}
					}
					else {
						while (t == model.get(i-1,j).type) {
							t = Math.floor((Math.random()*NUMBER_OF_COLORS)+1);
						}
					}
				}
				else if (j > 0) {
					while (t == model.get(i,j-1).type) {
						t = Math.floor((Math.random()*NUMBER_OF_COLORS)+1);
					}
				}
				var tile = new Tile();
				tile = {type: t, x: i, y: j, isMoving: false, isAnimating: false };
				model.set(i,j, tile);
				//countByType[t]++;
			}
		}
		var fs = Math.floor(_width/28);

		var bh = fs*2;
		var bw = fs*6;

		btnback.init("<menu", _width - bw, _height - bh*(13/12), bw, bh);
	};

	this.keydown = function(evt) {
		if (evt.key == "m") {
			mute = !mute;
		}
		else if (evt.key == "d") {
			debug = !debug;
		}
	};

	this.mousedown = function(evt) {
		if (evt.clientY < _height*SCREENRATIO) {
			if (evt.button == 0) {
				btndown =  window.setTimeout(rightClick, 500, evt.clientX, evt.clientY);//long press
			}
		}
	};

	this.mouseup = function(evt) {
		if (btndown) window.clearTimeout(btndown);
		if (btnback.check(evt.clientX, evt.clientY)) notify(0);
		if (evt.clientY < _height*SCREENRATIO) {
			if (evt.button == 0) {
				click(evt.clientX, evt.clientY); //left click
			}
			else rightClick(evt.clientX, evt.clientY);
		}
	};

	this.mouseout = function(evt) {
		if (btndown) window.clearTimeout(btndown);
	};

	this.mousemove = function(evt) {
		if (evt.clientY < _height*SCREENRATIO) {
			cursor.update(evt);
		}
		btnback.check(evt.clientX, evt.clientY);
	};

	this.touchstart = function(evt) {
		if (evt.touches[0].pageY < _height*SCREENRATIO) {
			btndown =  window.setTimeout(rightClick, 500, evt.touches[0].pageX, evt.touches[0].pageY);//long press
		}
	};

	this.touchend = function(evt) {
		if (btndown) window.clearTimeout(btndown);
		if (btnback.check(evt.changedTouches[0].pageX, evt.changedTouches[0].pageY)) notify(0);
		if (evt.changedTouches[0].pageY < _height*SCREENRATIO) {
			click(evt.changedTouches[0].pageX, evt.changedTouches[0].pageY); //left click
		}
	};

	this.touchcancel = function(evt) {
		if (btndown) window.clearTimeout(btndown);
	};

	this.touchmove = function(evt) {
	};

	rightClick = function(inputX, inputY) {
	};

	click  = function(inputX, inputY) {
		if (_state == WAITING) {
			_state = INPLAY;
		}
		else if (_state == INPLAY) {
			var w = _width / model.getWidth();
			var h = (_height*SCREENRATIO) / model.getHeight();
			var transX = Math.round(inputX/w);
			var transY = Math.round(inputY/h);
			if (transX >= 0 && transX < _w && transY >= 0 && transY < _h) {
				if (clicks < TOOMANYCLICKS) rotate(transX, transY);
			}
		}
	};

	rotate = function(x,y) {
		var a = model.get(x, y);
		var b = model.get(x, y-1);
		var c = model.get(x-1, y-1);
		var d = model.get(x-1, y);
		if (!locked && a.isMoving == false && b.isMoving == false && c.isMoving == false && d.isMoving == false && a.type > 0 && b.type > 0 && c.type > 0 && d.type > 0 && a.type < NUMBER_OF_COLORS+1 && b.type < NUMBER_OF_COLORS+1 && c.type < NUMBER_OF_COLORS+1 && d.type < NUMBER_OF_COLORS+1) {
			a.isMoving = true;
			b.isMoving = true;
			c.isMoving = true;
			d.isMoving = true;

			model.set(x, y, b);
			model.set(x, y-1, c);
			model.set(x-1, y-1, d);
			model.set(x-1, y, a);

			combo = 0;
			if (clicks++ < TOOMANYCLICKS) {
				if (checkgamestate) window.clearTimeout(checkgamestate);
				checkgamestate = window.setTimeout(check, 500);//check gamestate
			}
		}
	};

	this.draw = function(ctx) {
		ctx.clearRect(0, 0, _width, _height);

		var w = _width / model.getWidth();
		var h = (_height*SCREENRATIO) / model.getHeight();

		//draw the model
		locked = false;
		for (var i=0;i<model.getWidth(); i++) {
			for (var j=0; j<model.getHeight(); j++) {
				if (_state == INPLAY) {
					switch (model.get(i,j).type) {
						case 1:
							index = 10; //blue
							break;
						case 2:
							index = 0; //red
							break;
						case 3:
							index = 2; //gold
							break;
						case 4:
							index = 5; //green
							break;
						case 5:
							index = 14; //purple
							break;
						default:
							index = 20; //white
							break;
					}

					if (model.get(i,j).isMoving) {
						if (i < model.get(i,j).x) {
							if (model.get(i,j).x - i <= SPEED) model.get(i,j).x = i;
							else model.get(i,j).x -= SPEED;
						}
						else {
							if (i-model.get(i,j).x <= SPEED) model.get(i,j).x = i;
							else model.get(i,j).x += SPEED;
						}

						if (j < model.get(i,j).y) {
							if (model.get(i,j).y - j <= SPEED) model.get(i,j).y = j;
							else model.get(i,j).y -= SPEED;
						}
						else {
							if (j-model.get(i,j).y <= SPEED) model.get(i,j).y = j;
							else model.get(i,j).y += SPEED;
						}

						if (i == model.get(i,j).x && j == model.get(i,j).y) {
							model.get(i,j).isMoving = false;
							//evaluate(i, j);
						}
					}
					else if (j+1 < model.getHeight() && model.get(i,j+1).type < 0) {
						//gravity
						model.get(i,j).isMoving = true;
						var y = j+1;
						while(y<model.getHeight() && model.get(i,y).type < 0) y++;
						if (y>=model.getHeight()) model.set(i, model.getHeight()-1, model.get(i,j));
						else if (y-1 != j) model.set(i, y-1, model.get(i,j));
						clear(i,j);
					}
					if (j == 0 && model.get(i,j).type < 0) {
						var t = lastcolor;
						while (t==lastcolor) t = Math.floor((Math.random()*NUMBER_OF_COLORS)+1);
						if (levelchanged) {
							//t = NUMBER_OF_COLORS+1;//dead pixel
							levelchanged = false;
							//if (!mute) resourceRepository.levelup.play();
						}
						var tile = new Tile();
						tile = {type: t, x: i, y: -1, isMoving: true, isAnimating: false };
						model.set(i,j, tile);
						lastcolor = t;
					}

					if (model.get(i,j).isMoving) locked = true;
				}
				else {
					index = ((i+j+_frame) << 1 )%16; //colorful waiting screen
				}
				if (debug)ctx.drawImage(resourceRepository.tileSheet, 64*(index%8), 64*Math.floor(index/8), 64, 64, i*w, j*h, w, h);
				else ctx.drawImage(resourceRepository.tileSheet, 64*(index%8), 64*Math.floor(index/8), 64, 64, model.get(i,j).x*w, model.get(i,j).y*h, w, h);
			}
		}

		//draw cursor
		ctx.beginPath();
		ctx.strokeStyle = "white";
		var transX = Math.round(cursor.x/w)*w;
		var transY = Math.round(cursor.y/h)*h;
		ctx.arc(transX,transY,(w+h)/4,0,2*Math.PI);
		ctx.stroke();
		ctx.arc(transX,transY,((w+h)/4)-4,0,2*Math.PI);
		ctx.stroke();

		//draw messages
		for(var i=0; i<messages.length; i++) {
			writeMessage(ctx, messages[i].message, messages[i].type, messages[i].x, messages[i].y, messages[i].s);
			if (messages[i].ticks++ >= messages[i].timeout) messages.splice(i--, 1); //remove
		}

		if (_state == WAITING) {
			var w = _width*.9;
			var h = w * .8
			var margin = _width*.05;
			drawBox(ctx, 20, margin, _height*.9/2 - h/2, w, h);
			drawBox(ctx, 20, margin, _height*.9/2 - h/2 - w*.29, w, w*.19);
			//ctx.drawImage(resourceRepository.box, margin, _height*.9/2 - h/2, w, h);
			//ctx.drawImage(resourceRepository.logo, margin, _height*.9/2 - h/2 - w*.29, w, w*.19);

			var txt = "challenge mode";
			var fs = Math.floor(w/(txt.length+2));
			writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, _height*.9/2 - h/2 - w*.29 + (w*.19 - fs)/2, fs);

			var txt = "tap to begin";
			var fs = _width / (txt.length+2);
			if (Math.round(_frame/5)% 2 == 1) writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, _height*.9/2 + h/2 + fs*2, fs);

			fs = Math.floor(w/20);
			var buffer = fs/2;
			var starth = _height*.9/2 - h/2;

			var txt = "how to play";
			writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(1)), fs);

			var txt = "tap to rotate";
			writeMessage(ctx, txt, PINK, (_width-fs*txt.length)/2, starth + (fs*(5/2)), fs);

			var txt = "line up 3 or more";
			writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(4)), fs);
			var txt = "tiles of the same";
			writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(5)), fs);
			var txt = "color to score.";
			writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(6)), fs);

			var txt = "In 25 or fewer";
			writeMessage(ctx, txt, PINK, (_width-fs*txt.length)/2, starth + (fs*(8)), fs);
			var txt = "moves, score";
			writeMessage(ctx, txt, PINK, (_width-fs*txt.length)/2, starth + (fs*(9)), fs);
			var txt = "250,000 points.";
			writeMessage(ctx, txt, PINK, (_width-fs*txt.length)/2, starth + (fs*(10)), fs);

			var txt = "chain together";
			writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(12)), fs);
			var txt = "combos to maximize";
			writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(13)), fs);
			var txt = "the points scored.";
			writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(14)), fs);
		}
		else if (_state == GAMEOVER) {
			var w = _width*.9;
			var h = w * .8
			var margin = _width*.05;
			drawBox(ctx, 20, margin, _height*.9/2 - h/2, w, h);
			drawBox(ctx, 20, margin, _height*.9/2 - h/2 - w*.29, w, w*.19);
			//ctx.drawImage(resourceRepository.box, margin, _height*.9/2 - h/2, w, h);
			//ctx.drawImage(resourceRepository.logo, margin, _height*.9/2 - h/2 - w*.29, w, w*.19);

			var txt = "challenge mode";
			var fs = Math.floor(w/(txt.length+2));
			writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, _height*.9/2 - h/2 - w*.29 + (w*.19 - fs)/2, fs);

			var fs = Math.floor((_width*.9)/16);
			if (typeof(Storage) !== "undefined") {
				txt = "saving...";
				if (Math.round(_frame/5)% 2 == 1) writeMessage(ctx, txt, WHITE, _width-(fs*(txt.length)), _height*SCREENRATIO-fs*(3/2), fs);
			}
			else {
				txt = "saving failed";
				writeMessage(ctx, txt, RED, _width-(fs*(txt.length)), _height*SCREENRATIO-fs*(3/2), fs);
			}
			var starth = _height*.9/2 - h/2;


			if (score > CHALLENGESCORE) {
				var txt = "Challenge passed";
				var fs = _width / (txt.length+4);
				writeMessage(ctx, txt, SUPER, (_width-fs*txt.length)/2, starth + (fs*(1/2)), fs);
				var fs = Math.floor(w/20);
				var txt = "congratulations!";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(13)), fs);
			}
			else {
				var txt = "Game over";
				var fs = _width / (txt.length+6);
				writeMessage(ctx, txt, RED, (_width-fs*txt.length)/2, starth + (fs*(1/2)), fs);
				var fs = Math.floor(w/20);
				var txt = "maybe next time,";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(13)), fs);
			}

			var fs = Math.floor(w/20);

			var txt = "highscore";
			writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(7)), fs);

			var txt = zeroFill(highscore, 5);
			writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(17/2)), fs);

			var txt = "try again?";
			writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(14)), fs);

			if (_frame > 30) {
				save();
				_state = WAITING;
				_frame = 0;
				reset();
			}
		}

		//draw scoreboard
		//ctx.drawImage(resourceRepository.background, 0, _height*SCREENRATIO, _width, _height*(1-SCREENRATIO));
		drawBox(ctx, 9, 0, _height*SCREENRATIO, _width, _height*(1-SCREENRATIO));

		var fs = _height*(1-SCREENRATIO)/5;
		var margin = (_width-(fs*13))/2;
		var position = _height*SCREENRATIO + fs*3/2;

		writeMessage(ctx, "score", RED, margin, position, fs);
		if (score > displayedscore) displayedscore += 50;
		var txt = zeroFill(displayedscore, 6);
		if (_state == GAMEOVER) txt = zeroFill(score, 6);
		writeMessage(ctx, txt, WHITE, margin-(fs/2), position+fs, fs);

		writeMessage(ctx, "moves", RED, margin+(fs*8), position, fs);
		var m = TOOMANYCLICKS-clicks;
		if (m < 0) m = 0;
		var txt = zeroFill(m,2);
		writeMessage(ctx, txt, WHITE, margin+(fs*8)+fs*(3/2), position+fs, fs);

		btnback.draw(ctx);
	};

	this.update = function() {
		if (++_frame > 100) _frame = 0;

		if (_state == INPLAY) {
			clearable.splice(0, clearable.length);
			for (var i=0;i<model.getWidth(); i++) {
				for (var j=0; j<model.getHeight(); j++) {
					if (_state == INPLAY && !locked) {
						evaluate(i,j);
					}
				}
			}

			if (clearable.length > 0) {
				if (checkgamestate) window.clearTimeout(checkgamestate);
				checkgamestate = window.setTimeout(check, 2000);//check gamestate
			}

			for (var i=0; i<clearable.length; i++) {
				clear(clearable[i].x, clearable[i].y);
			}
		}
	};

	check = function() {
		if (clicks >= TOOMANYCLICKS) {
			_state = GAMEOVER;
			_frame = 0;
			if (score >= CHALLENGESCORE && !mute) resourceRepository.cleared.play();
			else if (!mute) resourceRepository.gameover.play();
		}
	};

	save = function() {
		if (typeof(Storage) !== "undefined") {
			// Code for localStorage/sessionStorage.
			localStorage.setItem("challengehighscore", highscore);
		}
		else {
		  // Sorry! No Web Storage support..
		}
	};

	load = function() {
		highscore = Number(localStorage.getItem("challengehighscore"));
	};

	addCoordinates = function (x,y) {
		for (var i=0; i<clearable.length; i++) {
			if (x == clearable[i].x && y == clearable[i].y) return false;
		}
		var c = new Coordinates();
		c = { x: x,y: y };
		clearable.push(c);
		return true;
	};

	evaluate = function(x,y) {
		if (model.get(x,y).type > 0 && !model.get(x,y).isMoving && !model.get(x,y).isAnimating) {
			var horizontal = new Array();
			var vertical = new Array();
			var goNorth = true, goSouth = true, goEast = true, goWest = true;
			var distance = 1;

			while (goNorth || goSouth || goEast || goWest) {
				if (goNorth && y-distance >= 0 && model.get(x,y-distance).type == model.get(x,y).type) {
					if (!model.get(x,y-distance).isMoving) vertical.push(y-distance);
					else {
						goSouth = false;
						goNorth = false;
						vertical.slice(0, vertical.length-1);
					}
				}
				else goNorth = false;

				if (goSouth && y+distance < model.getHeight() && model.get(x,y+distance).type == model.get(x,y).type) {
					if (!model.get(x,y+distance).isMoving) vertical.push(y+distance);
					else {
						goSouth = false;
						goNorth = false;
						vertical.slice(0, vertical.length-1);
					}
				}
				else goSouth = false;

				if (goWest && x-distance >= 0 && model.get(x-distance,y).type == model.get(x,y).type) {
					if (!model.get(x-distance,y).isMoving) horizontal.push(x-distance);
					else {
						goEast = false;
						goWest = false;
						horizontal.slice(0, horizontal.length-1);
					}
				}
				else goWest = false;

				if (goEast && x+distance < model.getWidth() && model.get(x+distance,y).type == model.get(x,y).type) {
					if (!model.get(x+distance,y).isMoving) horizontal.push(x+distance);
					else {
						goEast = false;
						goWest = false;
						horizontal.slice(0, horizontal.length-1);
					}
				}
				else goEast = false;

				distance++;
			}

			if (vertical.length >= 2) {
				if (addCoordinates(x,y)) {
					combo++;
					calculatePoints(vertical.length+1);
					var msg = new Message();
					msg = {timeout: 60, ticks: 0, s: (_width/_w)/4, x: x*(_width/_w), y: y*(_height*SCREENRATIO/_h), type: SUPER, message: "x"+combo };
					messages.push(msg);
				}
				var lowest = y;
				while(vertical.length > 0) {
					var j = vertical.pop();
					if (addCoordinates(x,j)) {
						var msg = new Message();
						msg = {timeout: 60, ticks: 0, s: (_width/_w)/4, x: x*(_width/_w), y: j*(_height*SCREENRATIO/_h), type: SUPER, message: "x"+combo };
						messages.push(msg);
					}
				}
			}
			if (horizontal.length >= 2) {
				if (addCoordinates(x,y)) {
					combo++;
					calculatePoints(horizontal.length+1);
					var msg = new Message();
					msg = {timeout: 60, ticks: 0, s: (_width/_w)/4, x: x*(_width/_w), y: y*(_height*SCREENRATIO/_h), type: SUPER, message: "x"+combo };
					messages.push(msg);
				}
				while(horizontal.length > 0) {
					var i = horizontal.pop();
					if (addCoordinates(i,y)) {
						var msg = new Message();
						msg = {timeout: 60, ticks: 0, s: (_width/_w)/4, x: i*(_width/_w), y: y*(_height*SCREENRATIO/_h), type: SUPER, message: "x"+combo };
						messages.push(msg);
					}
				}
			}
		}
	};

	clear = function(x, y) {
		//if (model.get(x,y).type > 0) countByType[model.get(x,y).type]--;
		var tile = new Tile();
		tile = {type: -1, x: Math.floor(x), y: -1, isMoving: false, isAnimating: false };
		model.set(Math.floor(x), Math.floor(y), tile);
	};

	calculatePoints = function(count) {
		var s = 0;
		if (count < 4) s += count*50;
		else if (count < 6) s += count*75;
		else if (count < 10) s += count*100;
		else s += count*150;

		score += s*combo;

		if (score > highscore) {
			highscore = score;
		}
		//clicks = 0;
	};

	setVolume = function(v) {
		volume = v;

		resourceRepository.gameover.volume = volume;
	};

}