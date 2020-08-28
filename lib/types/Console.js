const Module = require("../Module");
const MethodDescription = require("../MethodDescription");
const m = new Module();
m.id = "Console";
m.methods.log=new MethodDescription("log","method",null,true,"public");


module.exports = m;
