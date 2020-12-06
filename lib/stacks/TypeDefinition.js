const Stack = require("../Stack");
const Utils = require("../Utils");
const TupleType = require("../TupleType");
class TypeDefinition extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.valueType = Utils.createStack(compilation,node.value, scope, node, this);
        this.tupleType = null;
        this.typeElements = null;
        if( node.isArrayElement )
        {
            if( node.value.typeElements ){
                this.typeElements = node.value.typeElements.map( item=>{
                    return Utils.createStack(compilation,item,scope,node,this);
                });
            }else{
                this.typeElements  = [ this.valueType ];
            }
        }
    }

    description(){
        return this;
    }

    type(){
        if( this.typeElements ){
           return this.tupleType || (this.tupleType = new TupleType( this.typeElements.map( item=>item.type() ) ));
        } 
        return this.compilation.getType( this.valueType.value() );
    }

    parser(syntax){
        this.valueType.parser(syntax);
        if( this.typeElements ){
            this.typeElements.forEach( item=>item.parser(syntax) );
        }
    }

    value(){
        return this.valueType.value(syntax);
    }

    raw(){
        return this.valueType.raw(syntax);
    }

    emit(syntax){
        return this.valueType.value();
    }
}

module.exports = TypeDefinition;