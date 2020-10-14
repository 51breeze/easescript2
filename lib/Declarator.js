const TupleType = require("./TupleType.js");
class Declarator{

    constructor(node,key,kind,initValue=null,acceptType=null,defaultValue=null )
    {
       this.node = node; 
       this.kind = kind;
       this.key  = key;
       this.initValue= initValue;
       this.acceptType = acceptType;
       this.defaultValue = defaultValue;
       this.lastAssignment = initValue;
       this.assignments = [];
    }

    set assignment( value )
    {
        if( this.acceptType )
        {
            const check = this.acceptType.description instanceof TupleType ? this.acceptType.description.check( value ) : this.acceptType.description.is( value.description );
            if( !check )
            {
                throw new Error("type is not match.")
            }
        }
        this.lastAssignment = value;
        this.assignments.push( value );
    }

    get assignment()
    {
        return this.lastAssignment;
    }
}

module.exports = Declarator;