const Stack = require("../Stack");
const Utils = require("../Utils");
const Declarator = require("./Declarator");
class ReturnStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
        const fnScope = scope.getScopeByType("function");
        fnScope.returnItems.push( this );
    }

    reference(){
        const description = this.description();
        if( description instanceof Declarator ){
            return description.reference();
        }
        return description;
    }

    description(){
        return this.argument ? this.argument.description() : null;
    }

    type(){
        return this.argument ? this.argument.type() : this.compilation.getType("void");
    }

    parser(syntax){
        this.argument && this.argument.parser(syntax);
        let parent = this.parentStack;
        while( parent && !Utils.isStackByName(parent,"FunctionExpression") ){
            parent = parent.parentStack;
        }
        if( parent && parent.returnType ){
            if( !this.argument ){
                this.throwError("Need to specify an expression type to return");
            }
            if( !parent.returnType.type().is( this.argument.type() ) ){
                this.throwError("Return expression type does not match the type returned by the function");
            }
        }
    }

    emit(syntax){
        const argument = this.argument ? this.argument.emit(syntax) : null;
        return syntax.makeReturnStatement(this.scope, argument);
    }
}

module.exports = ReturnStatement;