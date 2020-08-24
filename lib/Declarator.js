const Type = require("./Type"); 
class Declarator extends Type{

    constructor( name, initValue, acceptType, kind, defaultValue=undefined )
    {
       super(name); 
       this.kind = kind;
       this.initValue= initValue;
       this.acceptType = acceptType;
       this.defaultValue = defaultValue;
       this.assignment = null;
    }

}

module.exports = Declarator;