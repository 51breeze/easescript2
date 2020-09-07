const Declarator = require("./Declarator"); 
class Parameter extends Declarator{
    constructor(key,initValue,acceptType,isRest=false)
    {
       super(key,"var",initValue,acceptType);
       this.isRest = isRest;
    }
}

module.exports = Parameter;