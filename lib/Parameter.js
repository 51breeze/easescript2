const Declarator = require("./Declarator"); 
class Parameter extends Declarator{
    constructor(key,initValue,acceptType)
    {
       super(key,"var",initValue,acceptType)
    }
}

module.exports = Parameter;