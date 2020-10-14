class Declarator{

    constructor(node,key,kind,initValue=null,acceptType=null,defaultValue=null )
    {
       this.node = node; 
       this.kind = kind;
       this.key  = key;
       this.initValue= initValue;
       this.acceptType = acceptType;
       this.defaultValue = defaultValue;
       this.lastAssignment = null;
       this.assignments = [];
    }

    set assignment( value )
    {
        this.lastAssignment = value;
        this.assignments.push( value );
        
    }

    get assignment()
    {
        return this.lastAssignment;
    }
}

module.exports = Declarator;