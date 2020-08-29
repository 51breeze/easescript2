const Parameter = require("../Parameter");
const Module = require("../Module");
const MethodDescription = require("../MethodDescription");
const m = new Module();
m.id = "String";
m.methods.length=new MethodDescription("length","const","uint","public");
m.methods.toString=new MethodDescription("toString","method","String","public");
m.methods.substr=new MethodDescription("substr","method","String","public",[
    new Parameter("start",null,"uint"),
    new Parameter("end",-1,"uint",false),
]);
module.exports = m;
