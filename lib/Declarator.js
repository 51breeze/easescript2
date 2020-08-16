class Declarator {

    constructor( name, initValue, acceptType, kind, defaultValue=undefined )
    {
       this.kind = kind;
       this.name = name;
       this.initValue= initValue;
       this.acceptType = acceptType;
       this.defaultValue = defaultValue;
       this.assignment = null;
    }

}

module.exports = Declarator;