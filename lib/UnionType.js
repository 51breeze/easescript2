const Type = require("./Type"); 
class UnionType extends Type{
  constructor( types ){
    super("Union");
    this.types = [].concat(types);
  }

  is( type ){
    if( type instanceof UnionType ){
       return type.types.some( item=>this.is(item) );
    }
    return this.types.some( item=>item.is(type) );
  }
}
module.exports = UnionType;