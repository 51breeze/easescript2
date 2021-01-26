const Utils = require("../Utils");
const Expression = require("./Expression");
class ArrayExpression extends Expression{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isArrayExpression=true;
        this.elements = node.elements.map( (item)=>{
            return Utils.createStack(compilation,item,scope,node,this);
        });
    }

    attribute(index){
        return this.elements[index] || null;
    }

    reference(){
        return this;
    }

    description(){
        return this;
    }

    type(){
        return this.compilation.getType("Array");
    }

    parser( syntax ){
        const objectType = this.compilation.getType("Object");
        this.elements.forEach( item=>{
            if( item.isSpreadElement ){
               const type= item.type();
               if( !type || !( type.is( this.type() ) || type.is( objectType ) ) ){
                   this.throwError("SpreadElement must is Array")
               }
            }
            item.parser(syntax);
        });
    }
}

module.exports = ArrayExpression;