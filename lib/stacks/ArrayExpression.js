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
        if( this.elements.hasOwnProperty(index) ){
            return this.elements[index];
        }
        return null;
    }
    reference(){
        return this;
    }
    referenceItems(){
        return [this];
    }
    description(){
        return this;
    }
    type(){
        return this.compilation.getType("Array");
    }
    check(){
        const objectType = this.compilation.getType("Object");
        this.elements.forEach( item=>{
            if( item.isSpreadElement ){
               const type= item.type();
               if( !type || !( type.is( this.type() ) || type.is( objectType ) ) ){
                   this.throwError("SpreadElement must is Array")
               }
            }
        });
    }
}

module.exports = ArrayExpression;