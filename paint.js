var pi = Math.PI;
var Pi = pi;
var PI = pi;
var ic = {};
var sin = Math.sin;
var cos = Math.cos;
var tg = Math.tan;
ic.AlfaObject = function(a){
	if (a === undefined) return this;
	if (typeof a === 'function'){
		for (var i in ic.AlfaObject.prototype)
			a.prototype[i] = ic.AlfaObject.prototype[i];
		return a;
	}
	else{
		return this.addHard(a);
	}
}
ic.AlfaObject.prototype = {
	_counter: 0,
	initialize: function(){},
	addHard: function(obj){
		for (var i in obj){
			this[i] = obj[i];
		}
		return this;
	},
	addSoft: function(obj){
		for (var i in obj){
			if (this[i] === undefined) this[i] = obj[i];
		}
		return this;
	},	
	_ic_kill: function(){
		this.stopListening();
		this._ic_unbindListeners();
	},
	kill: function(){
		console.error('method kill is undefined for this class', this);
	},
	show: function(){
		$(this.node).show();
	},
	hide: function(){
		$(this.node).hide();
	},
	remove: function(){
		$(this.node).remove();
	},
	_checkAlfaEvents: function(){
		if (this.hasOwnProperty('_id')) return;
		this._ic_events = [];
		this._ic_listeners = {};			//objects who listens to events stored by events
		this._ic_onceEvents = [];
		this._ic_onceListeners = {};
		this._id = 'ic' + ic.AlfaObject.prototype._counter++;
	},
	trigger: function(event){
		if (! this.hasOwnProperty('_id')) return;
		//вызывается как object.trigger(event, arg1, arg2...). 
		//слушатели вешаются listener.listenTo(object, event, callback);
		//при сробатывании события вызывается callback в контексте слушателя с аргументами arg1, arg2...
		if ((typeof event !== 'string') || (event === '')) {
			console.error('illegel event. Must be not empty string', event, this);
		}

		this._checkAlfaEvents();
		var args = [];
		for (var i=1; i<arguments.length; i++){
			args.push(arguments[i]);
		}
		if (this._ic_listeners[event] !== undefined){
			for (var i in this._ic_listeners[event]){
				this._ic_listeners[event][i].callback.apply(this._ic_listeners[event][i].obj, args);
			}
		}
		if (this._ic_onceListeners[event] !== undefined){
			for (var i in this._ic_onceListeners[event]){
				this._ic_onceListeners[event][i].callback.apply(this._ic_onceListeners[event][i].obj, args);
				if (this._ic_onceListeners[event] === undefined){
					console.log(event, this);
				}
				delete this._ic_onceListeners[event][i].obj._ic_onceEvents[this._ic_onceListeners[event][i].num];
			}
			delete this._ic_onceListeners[event];
		}
	},
	listenTo: function(obj, event, callback){
		this._checkAlfaEvents();
		if (obj === undefined || typeof obj._checkAlfaEvents !== 'function') console.error('kkk');
		obj._checkAlfaEvents();
		if (callback === undefined) return;
		if (obj._ic_listeners[event] === undefined) obj._ic_listeners[event] = [];
		var num = obj._ic_listeners[event].length;
		obj._ic_listeners[event][num] = {
			callback: callback,
			obj: this
		};

		var eventObj = {
			event: event,
			obj: obj,
			num: num
		}
		this._ic_events.push(eventObj);
	},
	listenToOnce: function(obj, event, callback){
		this._checkAlfaEvents();
		obj._checkAlfaEvents();
		if (callback === undefined) return;
		if (obj._ic_onceListeners[event] === undefined) obj._ic_onceListeners[event] = [];
		var numE = this._ic_onceEvents.length;
		var numL = obj._ic_onceListeners[event].length;
		obj._ic_onceListeners[event][numL] = {
			callback: callback,
			obj: this,
			num: numE
		};

		var eventObj = {
			event: event,
			obj: obj,
			num: numL
		}
		this._ic_onceEvents[numE] = eventObj;
	},
	stopListening: function(arg1, arg2){
		this._checkAlfaEvents();
		if (typeof arg1 === 'object') arg1._checkAlfaEvents();
		if (arg1 === undefined){
			//перестать слушать все события
			for (var ev in this._ic_events){
				var eventObj = this._ic_events[ev];
				delete eventObj.obj._ic_listeners[eventObj.event][eventObj.num];
			}
			this._ic_events = [];
			for (var ev in this._ic_onceEvents){
				var eventObj = this._ic_onceEvents[ev];
				delete eventObj.obj._ic_onceListeners[eventObj.event][eventObj.num];
			}
			this._ic_onceEvents = [];
			return;
		}
		
		if (typeof arg1 === 'string'){
			//перестать слушать все события event
			for (var i in this._ic_events){
				var eventObj = this._ic_events[i];
				if (eventObj.event !== arg1) continue;
				delete eventObj.obj._ic_listeners[eventObj.event][eventObj.num];
				delete this._ic_events[i];
			}
			for (var i in this._ic_onceEvents){
				var eventObj = this._ic_onceEvents[i];
				if (eventObj.event === arg1) continue;
				delete eventObj.obj._ic_onceListeners[eventObj.event][eventObj.num];
				delete this._ic_onceEvents[i];
			}
			return;
		}
		
		if ((typeof arg1 === 'object') && (arg2 === undefined)){
			//перестать слушать все события от объекта
			for (var i in this._ic_events){
				var eventObj = this._ic_events[i];
				if (eventObj.obj._id !== arg1._id) continue;
				delete eventObj.obj._ic_listeners[eventObj.event][eventObj.num];
				delete this._ic_events[i];
			}
			for (var i in this._ic_onceEvents){
				var eventObj = this._ic_onceEvents[i];
				if (eventObj.obj._id !== arg1._id) continue;
				delete eventObj.obj._ic_onceListeners[eventObj.event][eventObj.num];
				delete this._ic_onceEvents[i];
			}
			return;
		}

		if ((typeof arg1 === 'object') && (typeof arg2 === 'string')){
			//перестать слушать все события от объекта
			for (var i in this._ic_events){
				var eventObj = this._ic_events[i];
				if ((eventObj.event !== arg1)||(eventObj.obj._id !== arg1._id)) continue;
				delete eventObj.obj._ic_listeners[eventObj.event][eventObj.num];
				delete this._ic_events[i];
			}
			for (var i in this._ic_onceEvents){
				var eventObj = this._ic_onceEvents[i];
				if ((eventObj.event !== arg1)||(eventObj.obj._id !== arg1._id)) continue;
				delete eventObj.obj._ic_onceListeners[eventObj.event][eventObj.num];
				delete this._ic_onceEvents[i];
			}
			return;
		}
		
		console.error('wrong params', arg1, arg2);
	},
	_ic_unbindListeners: function(){
		var listeners = {};
		for (var ev in this._ic_listeners){
			for (var i in this._ic_listeners[ev]){
				listeners[this._ic_listeners[ev][i].obj._id] = this._ic_listeners[ev][i].obj;
			}
		}
		for (var ev in this._ic_onceListeners){
			for (var i in this._ic_onceListeners[ev]){
				listeners[this._ic_onceListeners[ev][i].obj._id] = this._ic_onceListeners[ev][i].obj;
			}
		}
		for (var i in listeners){
			listeners[i].stopListening(this);
		}
	}
};
function AddObjectHard(a, b){
	for (var i in b){
		a[i] = b[i];
	}
}

ic.xLine = ic.AlfaObject(function(args){
	console.log('xLine', this);
	this.addHard(args);
	this.check();
	this.generate();
});
ic.xLine.prototype.addHard({
	check: function(){
		this.from = parseFloat(this.from);
		if (isNaN(this.from)){
			console.log('from is NaN', this, this.from);
			this.from = 0;
		}
		this.to = parseFloat(this.to);
		if (isNaN(this.to)){
			console.log('to is NaN', this, this.to);
			this.to = 1000;
		}
		this.step = parseFloat(this.step);
		if (isNaN(this.step)){
			console.log('step is NaN', this, this.step);
			this.step = 1;
		}
		if (this.step <= 0) this.step = 1;
		this.rot = parseFloat(this.rot);
		if (isNaN(this.rot)){
			console.log('rot is NaN', this);
			this.rot = 0;
		}
		eval('this.func = function (x){y=0;' + this.funcText + ';return y;}');
	},
	generate: function(){
		var echo = true;
		this.vals = [];
		for (var x=this.from; x<= this.to; x += this.step){
			var res = this.func(x);
			var y = parseFloat(res);
			if (isNaN(y)){
				if (echo) console.log('func returned incorrect result', x, res, this);
				echo = false;
			}
			else{
				var _x, _y;
				_x = x * cos(this.rot) - y * sin(this.rot);
				_y = x * sin(this.rot) + y * cos(this.rot);
				this.vals.push({x: _x, y: _y});
			}
		}
		console.log('generated', this.funcText, this);
		return this.vals;
	},
	toJson: function(){
		var ret = {
			color: this.color,
			from: this.from,
			step: this.step,
			to: this.to,
			rot: this.rot,
			funcText: this.funcText
		};
		return ret;
	},
	funcText: 'y=0;',
	from: 0,
	to: 1000,
	step: 1,
	color: 'rgba(0, 0, 0, 0)',
	rot: 0,
});
ic.Line = ic.xLine;

ic.rLine = ic.AlfaObject(function(args){
	this.addHard(args);
	this.check();
	this.generate();
});
ic.rLine.prototype.addHard({
	check: function(){
		this.from = parseFloat(this.from);
		if (isNaN(this.from)){
			console.log('from is NaN', this);
			this.from = 0;
		}
		this.to = parseFloat(this.to);
		if (isNaN(this.to)){
			console.log('to is NaN', this);
			this.to = 2*pi;
		}
		this.step = parseFloat(this.step);
		if (isNaN(this.step)){
			console.log('step is NaN', this);
			this.step = 0.01;
		}
		if (this.step <= 0) this.step = 0.01;
		this.rot = parseFloat(this.rot);
		if (isNaN(this.rot)){
			console.log('rot is NaN', this);
			this.rot = 0;
		}
		eval('this.func = function(phi){r=0;' + this.funcText + ';return r;}');
	},
	generate: function(){
		var echo = true;
		this.vals = [];
		for (var phi=this.from; phi<= this.to; phi += this.step){
			var res = this.func(phi);
			var r = parseFloat(res);
			if (isNaN(r)){
				if (echo) console.log('func returned incorrect result', phi, res, this);
				echo = false;
			}
			else{
				var x = r * cos(phi);
				var y = r * sin(phi);
				var _x, _y;
				_x = x * cos(this.rot) - y * sin(this.rot);
				_y = x * sin(this.rot) + y * cos(this.rot);
				this.vals.push({x: _x, y: _y});
			}
		}
		console.log('generated', this.funcText, this);
		return this.vals;
	},
	toJson: function(){
		var ret = {
			color: this.color,
			from: this.from,
			step: this.step,
			to: this.to,
			rot: this.rot,
			funcText: this.funcText
		};
		return ret;
	},
	funcText: 'r=0;',
	from: 0,
	to: 2*pi,
	step: 0.01,
	color: 'rgba(0, 0, 0, 0)',
	rot: 0,
});

ic.CanvasKeeper = ic.AlfaObject(function(args){
	this.addHard(args);
	this.init();
});
ic.CanvasKeeper.prototype.addHard({
	init: function(){
		this.$node = $('#paint');
		this.node = this.$node[0];
		this.context = this.node.getContext('2d');
		this.resize();
	},
	render: function(){
		this.resize();
		this.trigger('render');
	},
	drawLine: function(vals, color){
		console.log('drawLine', color);
		if (vals.length === 0) return;
		this.context.beginPath();
		this.context.strokeStyle = color;
		var dot = this.transform(vals[0]);
		this.context.moveTo(dot.x, dot.y);
		for (var i=1; i<vals.length; i++){
		var dot = this.transform(vals[i]);
			this.context.lineTo(dot.x, dot.y);
		}
		this.context.stroke();
		this.context.closePath();
	},
	transform: function(dot){
		var x, y;
		x = (dot.x - this.xFrom) * this.width / (this.xTo - this.xFrom);
		y = this.height - (dot.y - this.yFrom) * this.height / (this.yTo - this.yFrom);
		return {x: x, y: y};
	},
	resize: function(){
		var resizes = $('input.resize[field]');
		console.log(resizes);
		for (var i=0; i<resizes.length; i++){
			var field = $(resizes[i]).attr('field');
			var val = $(resizes[i]).val();
			this[field] = val;
		}
		this.$node.attr({
			width: ''+this.width+'px',
			height: ''+this.height+'px',
		});
		this.$node.css({
			width: ''+this.width+'px',
			height: ''+this.height+'px',
		});
		this.context.clearRect(0, 0, this.width, this.height);
		if ($('#axle')[0].checked){
			this.drawLine([{x: this.xFrom, y:0}, {x: this.xTo, y:0}], '#FF0000');
			this.drawLine([{x: 0, y:this.yFrom}, {x: 0, y:this.yTo}], '#FF0000');
		}
		console.log(this);
	},
	width: 640,
	height: 480,
	xFrom: -10,
	xTo: 10,
	yFrom: -10, 
	yTo: 10,
});

ic.FuncKeeper = ic.AlfaObject(function(args){
	this.addHard(args);
	this.init();
});
ic.FuncKeeper.prototype.addHard({
	init: function(){
		var xyDiv = $('.xy-div');
		var rphiDiv = $('.rphi-div');
		this.xProto = $('.proto', xyDiv).hide();
		this.rProto = $('.proto', rphiDiv).hide();
		this.listenTo(ic.canvas, 'render', this.render);
	},
	xAdd: function(){
		var clone = this.xProto.clone().show().insertBefore(this.xProto).removeClass('proto');
		var delButton = $('.del', clone);
		delButton[0].onclick = function(){ this.icObj.remove()};
		delButton[0].icObj = clone;
		return clone;
	},
	rAdd: function(){
		var clone = this.rProto.clone().show().insertBefore(this.rProto).removeClass('proto');
		var delButton = $('.del', clone);
		delButton[0].onclick = function(){ this.icObj.remove()};
		delButton[0].icObj = clone;
		return clone;
	},
	render: function(){
		var xs = $('.funcElem.x:not(.proto)');
		this.json = {x:[], r:[]};
		for (var i=0; i<xs.length; i++){
			this.json.x.push(this.xCreateLine(xs[i]).toJson());
		}
		var rs = $('.funcElem.r:not(.proto)');
		for (var i=0; i<rs.length; i++){
			this.json.r.push(this.rCreateLine(rs[i]).toJson());
		}
		var text = JSON.stringify(this.json);
		console.info('text', text);
		$('#jsonInput').val(text);
		document.location.hash = text;
	},
	xCreateLine: function(el){
		var fText = $('.funcInput>input', el).val();
		var fromInput = $('.fromInput>input', el).val();
		var toInput = $('.toInput>input', el).val();
		var stepInput = $('.stepInput>input', el).val();
		var colorInput = $('.colorInput>input', el).val();
		var rotInput = $('.rotInput>input', el).val();
		var ret = new ic.xLine({
			funcText: fText,
			from: parseFloat(fromInput),
			to: parseFloat(toInput),
			step: parseFloat(stepInput),
			color: colorInput,
			rot: rotInput,
		});
		ic.canvas.drawLine(ret.vals, ret.color);
		return ret;
	},
	rCreateLine: function(el){
		var fText = $('.funcInput>input', el).val();
		var fromInput = $('.fromInput>input', el).val();
		var toInput = $('.toInput>input', el).val();
		var stepInput = $('.stepInput>input', el).val();
		var colorInput = $('.colorInput>input', el).val();
		var rotInput = $('.rotInput>input', el).val();
		var ret = new ic.rLine({
			funcText: fText,
			from: parseFloat(fromInput),
			to: parseFloat(toInput),
			step: parseFloat(stepInput),
			color: colorInput,
			rot: rotInput,
		});
		ic.canvas.drawLine(ret.vals, ret.color);
		return ret;
	},
	parseJson: function(str){
		$('.funcElem:not(.proto)').remove();
		var json = JSON.parse(str);
		console.info(json);
		for (var i=0; i<json.x.length; i++){
			var el = this.xAdd();
			this.createEl(json.x[i], el);
		}
		for (var i=0; i<json.r.length; i++){
			var el = this.rAdd();
			this.createEl(json.r[i], el);
		}
		this.render();
	},
	createEl: function(obj, el){
		console.log('createEl', obj, el);
		$('.funcInput>input', el).val(obj.funcText);
		$('.fromInput>input', el).val(obj.from);
		$('.toInput>input', el).val(obj.to);
		$('.stepInput>input', el).val(obj.step);
		$('.colorInput>input', el).val(obj.color);
		$('.rotInput>input', el).val(obj.rot);
	}
});


$(function(){
	var resizes = $('input.resize[field]');
	for (var i=0; i<resizes.length; i++){
		resizes[i].onchange = function(){
			ic.canvas.render();
		}
	}
	$('button.render').click(function(){
		ic.canvas.render();
	});
	$('#axle').change(function(){
		ic.canvas.render();
	});
	ic.canvas = new ic.CanvasKeeper({});
});

$(function(){
	$('.x-add').click(function(){
		ic.funcs.xAdd();
	});
	$('.r-add').click(function(){
		ic.funcs.rAdd();
	});
	ic.funcs = new ic.FuncKeeper({});
	$('#import').click(function(){
		ic.funcs.parseJson($('#jsonInput').val());
	})
	
//	var hash = document.location.hash.substr(1);
	var hash = document.URL;
	var hashPlace = hash.indexOf('#');
	if (hashPlace >= 0) hash = hash.substr(hashPlace+1);
	else hash = '{"x":[{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":0,"funcText":"y=0.2*sin(x*4)"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":0.7854,"funcText":"y=0.2*sin(x*4)"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":1.5708,"funcText":"y=0.2*sin(x*4)"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":2.3562,"funcText":"y=0.2*sin(x*4)"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":3.1415,"funcText":"y=0.2*sin(x*4)"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":-0.7854,"funcText":"y=0.2*sin(x*4)"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":-1.5708,"funcText":"y=0.2*sin(x*4)"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":-2.3562,"funcText":"y=0.2*sin(x*4)"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":0.3927,"funcText":"y=0"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":1.1781,"funcText":"y=0"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":1.9635,"funcText":"y=0"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":2.7489,"funcText":"y=0"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":-2.7489,"funcText":"y=0"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":-1.9635,"funcText":"y=0"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":-1.1781,"funcText":"y=0"},{"color":"#FF0000","from":4.3,"step":0.1,"to":15,"rot":-0.3927,"funcText":"y=0"}],"r":[{"color":"#FF0000","from":0,"step":0.01,"to":7.85,"rot":0,"funcText":"r=phi/2"},{"color":"#FF0000","from":0,"step":0.01,"to":7.85,"rot":0,"funcText":"r=-phi/2"},{"color":"#FF0000","from":-1.5,"step":0.01,"to":6.28,"rot":0,"funcText":"r=(phi+PI/2)/2"},{"color":"#FF0000","from":-1.5,"step":0.01,"to":6.28,"rot":0,"funcText":"r=-(phi+PI/2)/2"},{"color":"#FF0000","from":0,"step":0.1,"to":6.3,"rot":0,"funcText":"r=7.85/2"}]}';
	console.info('hash', hash);
	ic.funcs.parseJson(hash);
});
