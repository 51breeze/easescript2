class Declarator{

    constructor(node,key,kind,initValue=null,acceptType=null,defaultValue=null )
    {
       this.node = node; 
       this.kind = kind;
       this.key  = key;
       this.initValue= initValue;
       this.acceptType = acceptType;
       this.defaultValue = defaultValue;
       this.assignment = null;
    }
}

module.exports = Declarator;