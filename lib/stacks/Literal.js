const Stack = require("../Stack");
class Literal extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isLiteral = true;
        let type = "String";
        if( node.regex ){
            type= "RegExp";
        }else if(node.value == node.raw){
            type= "Number";
        }else if( node.raw === "false" || node.raw === "true"){
            type = "Boolean";
        }else if( node.raw === "null"){
            type = "Nullable";
        }
        this._type = compilation.getType( type );
    }
    definition(){
        return null;
    }
    referenceItems(){
        return [this];
    }
    type(){
        return this._type;
    }
    value(){
        return this.node.value;
    }
    raw(){
        return this.node.raw;
    }
}

module.exports = Literal;