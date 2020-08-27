const Module = require("../Module");
const m = new Module();
m.id = "String";
m.members.length={kind:"const",type:"uint",modifier:"public"};
m.members.substr={kind:"method",type:"string",modifier:"public",params:[{type:"uint",require:true},{type:"uint",default:-1,require:false}]};
m.members.toLowerCase={kind:"method",type:"string",modifier:"public"};
module.exports = m;
