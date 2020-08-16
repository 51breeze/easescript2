const Declarator = require("./Declarator"); 
class Parameter extends Declarator{
    constructor( name, value, type, kind )
    {
       super(name,value,type,kind)
    }
}

module.exports = Parameter;