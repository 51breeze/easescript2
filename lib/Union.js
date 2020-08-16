const Type = require("./Type"); 
class Union extends Type{
    constructor( ...types )
    {
      super("Union");
      this.types = types;
    }
}
module.exports = Union;