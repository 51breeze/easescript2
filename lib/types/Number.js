const Module = require("../Module");
const MethodDescription = require("../MethodDescription");
const m = new Module();
m.id = "Number";
m.methods.toString=new MethodDescription("toString","method","String","public");
module.exports = m;
