const Type = require("./Type"); 
class UnionType extends Type{
    constructor( types )
    {
      super("Union");
      this.types = types;
    }
}
module.exports = UnionType;