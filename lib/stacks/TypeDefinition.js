const Stack = require("../Stack");
const Utils = require("../Utils");
const TupleType = require("../TupleType");
const UnionType = require("../UnionType");
const GenericType = require("../GenericType");
class TypeDefinition extends Stack {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        this.isTypeDefinition= true;
        this.valueType = Utils.createStack(compilation,node.value, scope, node, this);
        if(parentStack && parentStack.isGenericType ){
           this.extends = Utils.createStack(compilation,node.extends, scope, node, this);
        }
        this.tupleType = null;
        this.typeElements = null;
        this.restElement  = !!node.restElement;
        this.unions = [];
        let union=node;
        while( union=union.union ){
            this.unions.push( Utils.createStack(compilation,union,scope,node,this) );
        }
        if( node.isArrayElement ){
            if( node.typeElements ){
                this.typeElements = node.typeElements.map( item=>{
                    return Utils.createStack(compilation,item,scope,node,this);
                });
            }else{
                this.typeElements = [ this.valueType ];
            }
        }
        if( this.parentStack && this.parentStack.isGenericType ){
            if( node.value && node.value.type !=="Identifier" ){
                this.throwError(`"${this.value()}" generic type can only be an identifier.`);
            }
        }else if( this.extends ){
            this.throwError(`"${this.value()}" extends keyword can only be used for generics`);
        }
    }
    definition(){
        const type = this.type().toString();
        const identifier = this.raw();
        const context = this;
        return {
            kind:"Type",
            identifier:identifier,
            expre:`Type ${identifier}`,
            type:type,
            start:this.node.start,
            end:this.node.end,
            file:this.compilation.module.file,
            context
        };
    }
    throwError(message){
        this.valueType.throwError(message);
    }
    throwWarn(message){
        this.valueType.throwWarn(message);
    }
    description(){
        return this;
    }
    referenceItems(){
        return [this];
    }
    type(){
        if( this.parentStack && this.parentStack.isGenericType ){
             return this.genericType || ( this.genericType = new GenericType( this.value(), this.scope,  this.extends ? this.extends.type() : null ) );
        }
        if( this.typeElements ){
            return this.tupleType || (this.tupleType = new TupleType( this.typeElements.map( item=>item.type() ) , this.restElement ));
        }
        const type =  this.valueType.type();
        if( this.unions.length > 0 ){
            const unions = this.unions.map( item=>item.type() );
            return this.unionType || (this.unionType = new UnionType( [type].concat( unions ) , this.restElement ));
        }
        return type;
    }

    check(){
        this.unions.forEach( item=>item.check() );
        if( this.typeElements ){
            const restElement = this.typeElements.find( item=>item.restElement);
            if( restElement && restElement !== this.typeElements[ this.typeElements.length-1 ] ){
                this.throwError(`rest parameter must be last of tuple type`)
            }
            this.typeElements.forEach( item=>item.check() );
        }else{
            if( !this.valueType.type() ){
                this.valueType.throwError(`the '${this.valueType.value()}' reference type is not exists.`)
            }
        }
    }

    parser(grammar){
        this.check();
        this.valueType && this.valueType.parser(grammar);
        if( this.typeElements ){
            this.typeElements.forEach( item=>item.parser(grammar) );
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
        return this.value();
    }
}

module.exports = TypeDefinition;