const Utils = require("../Utils");
const Declarator = require("./Declarator");
const TupleType = require("../TupleType");
class VariableDeclarator extends Declarator {
    constructor(compilation,node,scope,parentNode,parentStack){ 
        super(compilation,node,scope,parentNode,parentStack);
        this.isVariableDeclarator= true;
        this.id = Utils.createStack( compilation,node.id, scope, node, this);
        this.acceptType = this.id.acceptType;
        this.init = Utils.createStack( compilation, node.init, scope, node, this);
        this.kind = parentNode.kind;
        this.isPattern = false;
        if( this.id.isIdentifier ){
            this.assignItems.add( this.init );
            this.assignValue = this.init;
            scope.define( this.id.value(), this );
        }else if(this.id.isObjectPattern || this.id.isArrayPattern){
            this.isPattern = true;
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
        if( this.acceptType ){
            this.acceptType.check();
        }
        if( this.init ){
            this.init.check();
            const acceptType = this.acceptType ? this.acceptType.type() : null;
            if( acceptType ){
                if( Utils.isFunction(this.init) ){
                    if( !acceptType.is( this.compilation.getType("Function") ) ){
                        this.id.throwError(`"${this.raw()}" of type "${acceptType.toString()}" is not assignable to assignment of type "Function"`);
                    }
                }else if( !acceptType.check( this.init ) ){
                    const initValue = this.init.reference()
                    if( acceptType instanceof TupleType && initValue.isArrayExpression ){
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
    throwError(message){
        this.id.throwError(message)
    }
    throwWarn(message){
        this.id.throwWarn(message)
    }
}

module.exports = VariableDeclarator;