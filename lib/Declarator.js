class Declarator {

    constructor( name, initValue, type, kind, defaultValue=undefined )
    {
       this.kind = kind;
       this.name = name;
       this.initValue= initValue;
       this.type = type;
       this.defaultValue = defaultValue;
       this.assign = null;
    }
}

module.exports = Declarator;