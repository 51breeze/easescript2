class Declarator {

    constructor( name, initValue, type, kind, defaultValue=undefined )
    {
       this.kind = kind;
       this.name = name;
       this.initValue= initValue;
       this.type = type;
       this.defaultValue = defaultValue;
    }
}

module.exports = Declarator;