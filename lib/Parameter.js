const Declarator = require("./Declarator"); 
class Parameter extends Declarator{
    constructor(node,key,initValue,acceptType,isRest=false)
    {
       super(node,key,"var",initValue,acceptType);
       this.isRest = isRest;
    }

    set assignment( value )
    {
        if( this.acceptType && value.description.id !== "Nullable" && !this.acceptType.description.is( value.description ) )
        {
            throw new Error("type is not match.")
        }
        this.lastAssignment = value;
        this.assignments.push( value );
    }
}

module.exports = Parameter;