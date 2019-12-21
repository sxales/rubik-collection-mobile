var Button = function Button() {
	var x,y;
	var w,h;
	var txt;

	this.init = function(t, tx, ty, tw, th) {
		txt = t;
		x = tx;
		y = ty;
		w = tw;
		h = th;
	};

	this.draw = function(ctx) {
		var bb = h / 24;
		ctx.strokeStyle="black";
		ctx.strokeRect(x, y, w, h);
		ctx.fillStyle="white";
		ctx.fillRect(x, y, w-bb, h-bb); //light box
		ctx.fillStyle="#3e701e"; //dark green
		ctx.fillRect(x+bb, y+bb, w-bb, h-bb); //shadow box
		ctx.fillStyle="#6cc236"; //green
		ctx.fillRect(x+bb, y+bb, w-(bb*2), h-(2*bb)); //inner box

		var fs = h/2;
		writeMessage(ctx, txt, 6, x + (w-fs*txt.length)/2, y + fs/2, fs);
	};

	this.check = function(tx, ty) {
		if (tx > x && tx < x+w && ty > y && ty < y+h) return true;
		return false;
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
}