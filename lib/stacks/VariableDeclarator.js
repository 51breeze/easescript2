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

    parser(syntax){ 
        this.id.parser(syntax);
        this.acceptType && this.acceptType.parser(syntax);
        if( this.init ){
            this.init.parser(syntax);
        }
        this.check();
    }

    check(){
        if( this.init ){
            const acceptType = this.acceptType ? this.acceptType.type() : null;
            if( acceptType ){
                if( Utils.isFunction(this.init) ){
                    if( !acceptType.is( this.compilation.getType("Function") ) ){
                        this.id.throwError(`"${this.raw()}" of type "${acceptType.toString()}" is not assignable to assignment of type "Function"`);
                    }
                }else if( !acceptType.check( this.init ) ){
                    const initValue = this.init.reference()
                    if( acceptType instanceof TupleType && Utils.isStackByName(initValue,"ArrayExpression") ){
                        const elements = initValue.elements.map( item=>item.type().toString() );
                        this.id.throwError(`"${this.id.value()}" statement of type "${acceptType.toString()}" is not assignable to assignment of type "${elements.join(',')}" `);
                    }else{
                        this.id.throwError(`"${this.id.value()}" statement of type "${acceptType.toString()}" is not assignable to assignment of type "${this.init.type().toString()}" `);
                    }
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
        this.check();
        if( this.id instanceof ObjectPattern || this.id instanceof ArrayPattern ){
            return this.id.emit( syntax );
        }else{
            const init = this.init && this.init.emit(syntax);
            return syntax.makeVariableDeclarator(this.scope, this.id.emit(syntax), init);
        }
    }
}

module.exports = VariableDeclarator;