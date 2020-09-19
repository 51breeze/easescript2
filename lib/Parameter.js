const Declarator = require("./Declarator"); 
class Parameter extends Declarator{
    constructor(node,key,initValue,acceptType,isRest=false)
    {
       super(node,key,"var",initValue,acceptType);
       this.isRest = isRest;
    }
}

module.exports = Parameter;