const LiteralType = require("../LiteralType");
const Utils = require("../Utils");
const Expression = require("./Expression");
class TypeObjectExpression extends Expression{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isTypeObjectExpression= true;
        this.properties = node.properties.map( item=>{
            return Utils.createStack(compilation, item, scope, node,this );
        });
    }
    attribute(name){
        return this.properties.find( item=>item.key.value() == name );
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
        if( !this._type ){
            const inherit = this.compilation.getType("Object");
            const properties = {};
            this.properties.forEach(item=>properties[item.value()]=item);
            this._type = new LiteralType(inherit,properties);
        }
        return this._type;
    }
    value(){
        return super.raw();
    }
}

module.exports = TypeObjectExpression;