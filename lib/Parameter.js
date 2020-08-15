class Parameter {

    constructor( name, value, type, kind )
    {
       this.kind = kind;
       this.name = name;
       this.value= value;
       this.type = type;
       this.assign = null;
    }
}

module.exports = Parameter;