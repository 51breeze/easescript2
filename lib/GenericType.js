const Type = require("./Type");
class GenericType extends Type{
    constructor( id ){
        super(id);
        this.isGenericType=true;
    }
    check( stack, flag=false){
       return true;
    }
}
module.exports = GenericType;