const Type = require("./Type"); 
class UnionType extends Type{
  constructor( types ){
    super("Union");
    this.types = [].concat(types);
  }

  check( stacks ){
      if( stacks instanceof Array ){
          return stacks.every( item=>this.is( item.type() ) );
      }
      return this.is( stacks.type() );
  }

  is( type ){
    if( type instanceof UnionType ){
       return type.types.some( item=>this.is(item) );
    }
    return this.types.some( item=>item.is(type) );
  }
  toString( flag = false ){
     const str = this.types.map( item=>item.toString() ).join(" | ")
     if( flag ){
         return this.types.length > 1 ? `(${str})[]` : `${str}[]`;
     }
     return str;
  }
}
module.exports = UnionType;