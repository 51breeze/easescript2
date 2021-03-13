const Utils = require("../Utils");
const Expression = require("./Expression");
class ObjectExpression extends Expression{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isObjectExpression= true;
        this.properties = node.properties.map( item=>{
            return Utils.createStack( compilation, item, scope, node,this );
        });
    }
    definition(){
        return null;
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
        return this.compilation.getType("Object");
    }
    parser(grammar){
        this.properties.forEach( item=>{
            item.parser(grammar);
        });
    }
    value(){
        return super.raw();
    }
}

module.exports = ObjectExpression;