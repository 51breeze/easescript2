
const Type = require("./Type"); 
class Intersection extends Type{
    constructor( ...types )
    {
      super("Intersection");
      this.types = types;
    }
}
module.exports = Intersection;