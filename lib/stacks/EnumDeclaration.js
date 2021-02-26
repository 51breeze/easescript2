const Stack = require("../Stack");
const Utils = require("../Utils");
const EnumProperty = require("./EnumProperty");
class EnumDeclaration extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isEnumDeclaration= true;
        this.inherit = Utils.createStack(compilation,node.extends,scope,node,this);
        this.increment =0;
        this.properties = node.value.expressions.map( (item,index)=>{
            const stack = item.right ? Utils.createStack(compilation,item,scope,item,this) : new EnumProperty(compilation,item,scope,node,this);
            const lastValue = stack.right.value();
            if( typeof lastValue === "number" ){
                this.increment = lastValue + 1;
            }
            return stack;
        });
        scope.define(node.name, this);
    }

    attribute(name){
        return this.properties.find( item=>item.value() == name );
    }

    reference(){
        return this;
    }

    description(){
        return this;
    }

    type(){
        return this.compilation.getType("Object");
    }

    parser(syntax){
        this.inherit && this.inherit.parser(syntax);
        this.properties.forEach( item=>item.parser(syntax));
    }
}

module.exports = EnumDeclaration;