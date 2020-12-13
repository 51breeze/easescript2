const Utils = require("../Utils");
const Declarator = require("./Declarator");
const ObjectPattern = require("./ObjectPattern");
const ArrayPattern = require("./ArrayPattern");
const Identifier = require("./Identifier");
const TupleType = require("../TupleType");
class VariableDeclarator extends Declarator {

    constructor(compilation,node,scope,parentNode,parentStack)
    { 
        super(compilation,node,scope,parentNode,parentStack);
        this.id = Utils.createStack( compilation,node.id, scope, node, this);
        this.acceptType = this.id.acceptType;
        this.init = Utils.createStack( compilation, node.init, scope, node, this);
        this.kind = parentNode.kind;
        if( this.id instanceof Identifier ){
            this.assignValue = this.init;
            scope.define( this.id.value(), this );
        }else if( this.id instanceof ObjectPattern || this.id instanceof ArrayPattern){
            this.id.setKind(this.kind);
        }
    }

    type(){
        const value = this.description();
        return value ? value.type() : this.compilation.getType("any");
    }

    parser(syntax){ 
        this.id.parser(syntax);
        this.acceptType && this.acceptType.parser(syntax);
        if( this.init ){
            const acceptType = this.acceptType ? this.acceptType.type() : null;
            this.init.parser(syntax);
            if( acceptType && !acceptType.check( this.init ) ){
                const initValue = this.init.reference()
                if( acceptType instanceof TupleType && Utils.isStackByName(initValue,"ArrayExpression") ){
                    const elements = initValue.elements.map( item=>item.type().toString() );
                    this.throwError(`"${this.id.value()}" statement of type "${acceptType.toString()}" is not assignable to assignment of type "${elements.join(',')}" `);
                }else{
                   this.throwError(`"${this.id.value()}" statement of type "" is not assignable to assignment of type "${this.init.type().toString()}" `);
                }
            }
        }
    }

    value(){
        return this.id.value();
    }

    raw(){
        return this.id.raw();
    }

    emit(syntax){
        if( this.id instanceof ObjectPattern || this.id instanceof ArrayPattern ){
            return this.id.emit( syntax );
        }else{
            const init = this.init && this.init.emit(syntax);
            return syntax.makeVariableDeclarator(this.scope, this.id.emit(syntax), init);
        }
    }
}

module.exports = VariableDeclarator;