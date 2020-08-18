module.exports = {
    "length":{kind:"const",type:"uint",modifier:"public"},
    "substr":{kind:"method",type:"string",modifier:"public",params:[{type:"uint",require:true},{type:"uint",default:-1,require:false}]},
    "toLowerCase":{kind:"method",type:"string",modifier:"public"},
};
