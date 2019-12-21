var Menu = function() {
	var _width, _height;//in pixels
	var _w, _h;//in tiles
	var _frame = 0;//counter 0-100
	var _state;
	var WAITING = -1, INPLAY = 0, PAUSED = 1, GAMEOVER = 2, SUCCESS = 3;//states
	var TOOMANYCLICKS = 25;
	var NUMBER_OF_COLORS = 5;
	var BLUE = 5, GRAY = 8, GREEN = 4, RED = 3, SUPER = 2, WHITE = 1, TEAL = 5, YELLOW = 6, PINK = 7, LOGO = 0; //font colors
	var FONTSIZE = 40;
	var messages = new Array();
	var mute = false;
	var volume = .2;
	var subscribers = new Array();
	var SCREENRATIO = 1;
	//var view = new Array();
	var model = new ArrayList2d();
	var cursor = new Cursor();
	var debug = false;
	var btnarcade = new Button();
	var btnendless = new Button();
	var btnchallenge = new Button();

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

		_w = 10;
		_h = Math.floor((_height*SCREENRATIO) / (_width / _w));

		setVolume(volume);
		reset();
	};

	reset = function() {
		_state = WAITING;

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
			}
		}
		var fs = Math.floor(_width/22);

		var bh = fs*2;
		var bw = fs*16;

		btnarcade.init("arcade mode", (_width-bw)/2, _height - bh*(10/2), bw, bh);
		btnendless.init("endless mode", (_width-bw)/2, _height - bh*(7/2), bw, bh);
		btnchallenge.init("challenge mode", (_width-bw)/2, _height - bh*(4/2), bw, bh);
	};

	this.keydown = function(evt) {
		if (evt.key == "m") {
			mute = !mute;
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
	};

	this.touchstart = function(evt) {
		if (evt.touches[0].pageY < _height*SCREENRATIO) {
			btndown =  window.setTimeout(rightClick, 500, evt.touches[0].pageX, evt.touches[0].pageY);//long press
		}
	};

	this.touchend = function(evt) {
		if (btndown) window.clearTimeout(btndown);
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
			if (btnarcade.check(inputX, inputY)) notify(0);
			else if (btnendless.check(inputX, inputY)) notify(1);
			else if (btnchallenge.check(inputX, inputY)) notify(2);
		}
		else if (_state == INPLAY) {
		}
	};

	this.draw = function(ctx) {
		ctx.clearRect(0, 0, _width, _height);

		var w = _width / model.getWidth();
		var h = (_height*SCREENRATIO) / model.getHeight();

		//draw the model
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
			ctx.drawImage(resourceRepository.box, margin, _height*.9/2 - h/2, w, h);
			ctx.drawImage(resourceRepository.logo, margin, _height*.9/2 - h/2 - w*.29, w, w*.19);

			var txt = "rubik";
			var fs = Math.floor(w/(txt.length+6));
			writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, _height*.9/2 - h/2 - w*.29 + (w*.19 - fs)/2, fs);

			if (_frame < 33) {
				fs = Math.floor(w/20);
				var buffer = fs/2;
				var starth = _height*.9/2 - h/2;

				var txt = "arcade mode";
				writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(1)), fs);

				var txt = "time attack:";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(3)), fs);
				var txt = "each level adds";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(9/2)), fs);
				var txt = "30-seconds to the";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(11/2)), fs);
				var txt = "clock & more tiles.";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(13/2)), fs);

				var txt = "score as many";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(8)), fs);
				var txt = "points as possible";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(9)), fs);
				var txt = "before time runs";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(10)), fs);
				var txt = "out.";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(11)), fs);

				var txt = "(1 of 3)";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(14)), fs);
			}
			else if (_frame < 66) {
				fs = Math.floor(w/20);
				var buffer = fs/2;
				var starth = _height*.9/2 - h/2;

				var txt = "endless mode";
				writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(1)), fs);

				var txt = "no time limit:";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(3)), fs);

				var txt = "as you advance";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(9/2)), fs);
				var txt = "more dead pixels,";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(11/2)), fs);
				var txt = "which cannot be";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(13/2)), fs);
				var txt = "rotated, fill the";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(15/2)), fs);
				var txt = "screen.";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(17/2)), fs);
				var txt = "When you run out";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(10)), fs);
				var txt = "of moves it is";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(11)), fs);
				var txt = "game over.";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(12)), fs);

				var txt = "(2 of 3)";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(14)), fs);
			}
			else {
				fs = Math.floor(w/20);
				var buffer = fs/2;
				var starth = _height*.9/2 - h/2;

				var txt = "challenge mode";
				writeMessage(ctx, txt, LOGO, (_width-fs*txt.length)/2, starth + (fs*(1)), fs);

				var txt = "try to score";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(6)), fs);
				var txt = "250,000 points";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(7)), fs);
				var txt = "using 25 or fewer";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(8)), fs);
				var txt = "moves.";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(9)), fs);

				var txt = "(3 of 3)";
				writeMessage(ctx, txt, WHITE, (_width-fs*txt.length)/2, starth + (fs*(14)), fs);
			}
			btnarcade.draw(ctx);
			btnendless.draw(ctx);
			btnchallenge.draw(ctx);
		}
	};

	this.update = function() {
		if (++_frame > 100) _frame = 0;
	};

	writeMessage = function(ctx, m, t, x, y, s) {
		var _m = ""+m;
		var _m = _m.toLowerCase();
		if (x+ _m.length*s > _width) x = _width-_m.length*s;
		else if (x < 0) x=0;
		for(var i=0; i<_m.length; i++) {
			if (_m.charCodeAt(i) <= 126 && _m.charCodeAt(i) >= 32) ctx.drawImage(resourceRepository.font, FONTSIZE*(_m.charCodeAt(i)-32)+1, FONTSIZE*t+1, FONTSIZE-2, FONTSIZE-2, x+(i*s),y,s,s);
			else ctx.drawImage(resourceRepository.font, FONTSIZE*(41 /*question mark*/)+1, FONTSIZE*t+1, FONTSIZE, FONTSIZE, x+(i*s),y,s,s);
		}
	};

	zeroFill = function(n,p) {
		var s = ""+n;
		while (s.length<p) {
			s = "0"+s;
		}
		return s;
	};

	setVolume = function(v) {
		volume = v;
	};

}