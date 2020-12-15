const Stack = require("../Stack");
const Utils = require("../Utils");
const TupleType = require("../TupleType");
const UnionType = require("../UnionType");
class TypeDefinition extends Stack {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.valueType = Utils.createStack(compilation,node.value, scope, node, this);
        this.tupleType = null;
        this.typeElements = null;
        this.restElement  = !!node.restElement;
        this.unions = [];
        let union=node;
        while( union=union.union ){
            this.unions.push( Utils.createStack(compilation,union,scope,node,this) );
        }
        
        if( node.isArrayElement )
        {
            if( node.typeElements ){
                this.typeElements = node.typeElements.map( item=>{
                    return Utils.createStack(compilation,item,scope,node,this);
                });
            }else{
                this.typeElements = [ this.valueType ];
            }
        }
    }

    description(){
        return this;
    }

    type(){
        if( this.typeElements ){
           return this.tupleType || (this.tupleType = new TupleType( this.typeElements.map( item=>item.type() ) , this.restElement ));
        } 
        const type = this.compilation.getType( this.valueType.value() );
        if( this.unions.length > 0 ){
            const unions = this.unions.map( item=>item.type() );
            return this.unionType || (this.unionType = new UnionType( [type].concat( unions ) , this.restElement ));
        }
        return type;
    }

    parser(syntax){
        this.valueType && this.valueType.parser(syntax);
        if( this.typeElements ){
            const restElement = this.typeElements.find( item=>item.restElement);
            if( restElement && restElement !== this.typeElements[ this.typeElements.length-1 ] ){
                this.throwError(`rest parameter must be last of tuple type`)
            }
            this.typeElements.forEach( item=>item.parser(syntax) );
        }
    }

    value(){
        if( this.valueType ){
            if( this.restElement ){
                return `...${this.valueType.value()}[]`;
            }
            return this.valueType.value();
        }
        const elements = (this.typeElements || []).map( item=>{
            return item.value()
        });
        return `[${elements.join(",")}]`;
    }

    raw(){
        return this.raw(syntax);
    }

    emit(syntax){
        return this.value();
    }
}

module.exports = TypeDefinition;