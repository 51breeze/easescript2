const Stack = require("../Stack");
const Utils = require("../Utils");
const Declarator = require("./Declarator");
const ObjectPattern = require("./ObjectPattern");
const ArrayPattern = require("./ArrayPattern");
const Identifier = require("./Identifier");
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
        return value ? value.type() : null;
    }

    parser(syntax){ 
        this.id.parser(syntax);
        this.acceptType && this.acceptType.parser(syntax);
        if( this.init ){
            const acceptType = this.acceptType ? this.acceptType.type() : null;
            this.init.parser(syntax);
            if( acceptType && !acceptType.is( this.init.type() ) ){
                this.compilation.throwErrorLine(`"${this.id.raw()}" type not match of assign value`, this.node);
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

        const init = this.init && this.init.emit(syntax);
        if( this.id instanceof ObjectPattern ){

             //const properties = this.init.reference();
             return this.id.emit( syntax );
             
        }else if( this.id instanceof ArrayPattern){

        }else{
            return syntax.makeVariableDeclarator(this.scope, this.id.emit(syntax), init);
        }
    }
}

module.exports = VariableDeclarator;