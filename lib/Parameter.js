const Declarator = require("./Declarator"); 
class Parameter extends Declarator{
    constructor(key,initValue,acceptType,require=true)
    {
       super(key,"var",initValue,acceptType);
       this.require = require;
    }
}

module.exports = Parameter;