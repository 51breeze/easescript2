var global={modules:[]};
global.__KEY__=Symbol("__GLOBAL__");
global.getClass=function(id){
    return global.modules[id] || (global.modules[id]={});
}
global.setClass=function(id,classObject,description){
    Object.defineProperty(classObject,global.__KEY__,description);
    global.modules[id] = classObject;
}
var System = {};
System.toArray=function toArray(object){
    var arr = [];
    for(var key in object)arr.push(object[key]);
    return arr;
}
System.is=function is(){

}
global.__awaiter = function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
global.__generator = function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
(function(global){
	function TestInterface(){}
	Object.defineProperty(TestInterface.prototype,"constructor",{value:TestInterface});
	global.setClass(0,TestInterface,{

	});
})(global);
(function(global){
	const Test = global.getClass(1);
	var private=Symbol("private");
	function Person(){
		Object.prototype.constructor.call(this);
		Object.prototype.hasOwnProperty.call(this,"name");
		console.log(this instanceof Test);
	}
	Object.defineProperty(Person,"prototype",{value:Object.create(Object.prototype)});
	Object.defineProperty(Person.prototype,"constructor",{value:Person});
	Object.defineProperty(Person.prototype, "method", {value:function method(name,age){
		var str = ["a","1"];
		var b = ["",["1",1],"true"];
		var cc = [1];
		var x = [1,1,'2222',{}];
		b.push('1');
		return "sssss";
	}});
	Object.defineProperty(Person.prototype, "name",{
	get:function name(){
		return '';
	},
	set:function name(val){

	}});
	Object.defineProperty(Person.prototype, "avg", {value:function avg(){

	}});
	global.setClass(2,Person,{
		"private":private
	});
})(global);
(function(global){
	const TestInterface = global.getClass(0);
	const Person = global.getClass(2);
	var private=Symbol("private");
	function Test(name){
		name = name === void 0 ? "div" : name;
		var $this1 = this;
		let ir = 0,br = 9;
		if(ir=5,br=6){
			ir=6;
		}
		var uiii = 4 ^ 6,btts = 9 | 2;
		var hhhh = 9;
		this.method("",1).substr();
		Test.fc().uuName;
		Test.fc().uuName.substr(5);
		this.name="1";
		var ccc = [2,''];
		Test.iiu.uuName;
		this.name=Test.fc().uuName;
		this instanceof Test;
		System.is(this,TestInterface);
		var iiss = true;
		ccc.push(2);
		ccc.push('9999');
		ccc.push(1);
		var bbpp = ccc.pop();
		bbpp='llll';
		function NaTest(name){
			name = name === void 0 ? "5555" : name;
			var sss = Array.prototype.slice.call(arguments,1);
			return 666;
		}
		var nss = {"name":5666,"age":65};
		var dd="123",age=65;
		dd="sfdfsd";
		var i = 5;
		const ppi = 5;
		var whenss = "ok";
		i=2;
		var y000 = 999999;
		try{

		}catch(e){

		}
		i=6;
		if(1){
			i=5;
		}
		while(1);
		do{

		}while(1);
		switch(name){
			case "o" :
				console.log(99999999999);
			break;
			default:
		}
		for(var ii = 0;ii < 10;++ii){
			console.log(i);
		}
		for(var names in this){
		}
		for(var value of []){
		}
		var b = 1;
		this.method < b;
		var arr = [];
		var bb=1,cc=2;
		var dsss = [].concat(arr);
		var bbc = {"bb":"uuu","ii":666,"Red":1,"Green":4};
		var Red=bbc["Red"] || 1,Green=bbc["Green"] || 2,Blue=bbc["Blue"];
		var Color = {"Red":1,"Green":2,"Blue":3};
		var ddss=dd || "456";
		var ddss999=arr[0] || "456",ioo=arr[1];
		ddss999='ssss';
		var $data = this.data;
		var ttts=$data["ttts"];
		const ddc = function(i,b){
			b = b === void 0 ? "123" : b;
			return 5;
		};
		const ls = Test;
		const cs = function(){

		};
		var btt = 555;
		var dds = /\s+/i;
		var $this = 666;
		var db = new Date(4,function(item){
			$this1.method;
		});
		var ccv = bb && btt;
		var ttt = {"ss":666,"bb":{"qq":"ooo","db":db}};
		var ds = 2 || 3;
		Number.isNaN(1);
		Number(1).valueOf();
		console.log(this.data);
		this.ss(1,5,"6");
		this.data;
		this[private]={"name123":"dfdsfsd"};
	}
	Object.defineProperty(Test,"prototype",{value:Object.create(Person.prototype)});
	Object.defineProperty(Test.prototype,"constructor",{value:Test});
	Object.defineProperty(Test, "age", {value:50});
	Object.defineProperty(Test, "fc", {value:function fc(){
		var dd = Test;
		return dd;
	}});
	Object.defineProperty(Test, "uuName",{
	get:function uuName(){
		return '';
	}});
	Object.defineProperty(Test, "iiu", {value:Test});
	Object.defineProperty(Test.prototype, "name123",{
	get:function getName123(){
		return this[private].name123;
	},
	set:function setName123(value){
		this[private].name123=value;
	}});
	Object.defineProperty(Test.prototype, "data",{
	get:function data(){
		return {"ttts":'1'};
	}});
	Object.defineProperty(Test.prototype, "ss", {value:function ss(){
		var types = Array.prototype.slice.call(arguments,0);
		return global.__awaiter(this, void 0, void 0, function (){
			var dd;
			var data;
			return global.__generator(this, function ($a) {
				switch ($a.label){
					case 0 :
						dd = function(i,b){
							b = b === void 0 ? "123" : b;
							console.log(i,b);
							if(66){
							console.log(i,b);
							if(66){
								console.log(i,b);
								if(66){
									console.log(i,b);
								}
							}
							}
							return 5;
						};
						if(!1)return [3,12];
						console.log(111111111);
						console.log(111111);
						if(!2)return [3,4];
						return [4,dd(222222222)];
					case 1:
						$a.sent();
						console.log(2222222222);
						if(!88888)return [3,3];
						return [4,dd(222222222)];
					case 2:
						$a.sent();
						console.log(2222222222);
						$a.label=3;
					case 3:
						return [3,7];
					case 4:
						console.log("=====222222222222222222222========");
						if(!2222)return [3,6];
						return [4,dd(222222222333333333333333)];
					case 5:
						$a.sent();
						console.log(2222222222333333333333333);
						$a.label=6;
					case 6:
						console.log("=====222222222222222222222==99999======");
						$a.label=7;
					case 7:
						console.log("=====999999999999999====99999999999999999====");
						if(22){
							console.log("====++++++++++++++++++2222======");
						}
						switch(777){
							case 777 : return [3,8];
							case 88899 : return [3,10];
						}
						return [3,11];
					case 8:
						return [4,dd(77777777777777777777777777)];
					case 9:
						$a.sent();
						return [3, 11];

					case 10:
						if(8999){

						}else{
							console.log("====444= 5555===");
							if(566){
								console.log("====444= 5555===");
								if(566){
									console.log("====444= 5555===");
								}
							}
						}
						console.log("====444====");
						return [3, 11];

					case 11:
						console.log("=====777777777=============77777777777777====");
						return [3,15];
					case 12:
						console.log("==3333333333==");
						return [4,dd(3333333333)];
					case 13:
						$a.sent();
						return [4,dd(3333333333)];
					case 14:
						$a.sent();
						console.log(3333333333);
						$a.label=15;
					case 15:
						data = {"name":123,"ccc":666};
						return [2, data];

				}
			});
		});
	}});
	Object.defineProperty(Test.prototype, "method", {value:function method(name,age){
		var str = ["a","1"];
		var b = ["",["1",1],"true"];
		var cc = [1];
		var x = [1,1,'2222',{}];
		b.push('1');
		b.push(["===",666]);
		return "sssss";
	}});
	Object.defineProperty(Test.prototype, "name",{
	get:function name(){
		return "1";
	},
	set:function name(value){

	}});
	Object.defineProperty(Test.prototype, "avg", {value:function avg(yy){
		var ii = function(){
			return 1;
		};
		var bb = ['1'];
		function name(i){
			var b = i;
			i.avg();
			i.method('',1);
			return b;
		}
		const person = new Person();
		const bbb = name(person);
		const dd = this.map();
		var ccc = dd.name999('1',999);
	}});
	Object.defineProperty(Test.prototype, "map", {value:function map(){
		const dd = {"name999":function(b){
			return b;
		}};
		if(1){
			return {};
		}
		return dd;
	}});
	Object.defineProperty(Test.prototype, "address", {value:function address(){
		const dd = [];
		dd.push(1);
		return dd;
	}});
	global.setClass(1,Test,{
		"private":private,
		"inherit":Person
	});
})(global);