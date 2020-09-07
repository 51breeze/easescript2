class Declarator{

    constructor(key,kind,initValue=undefined,acceptType=null,defaultValue=undefined )
    {
       this.kind = kind;
       this.key  = key;
       this.initValue= initValue;
       this.acceptType = acceptType;
       this.defaultValue = defaultValue;
       this.assignment = null;
    }

}

module.exports = Declarator;