const Stack = require("../Stack");
const Utils = require("../Utils");
const Declarator = require("./Declarator");
class ReturnStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack)
    {
        super(compilation,node,scope,parentNode,parentStack);
        this.isReturnStatement= true;
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
        const fnScope = scope.getScopeByType("function");
        const has = fnScope.returnItems.some( item=>{
            return item.scope === scope;
        });
        if( !has ){
            fnScope.returnItems.push( this );
        }
        this.fnScope = fnScope;
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

    check(){
        let parent = this.parentStack;
        while( parent && !Utils.isStackByName(parent,"FunctionExpression") ){
            parent = parent.parentStack;
        }
        if( parent && parent.returnType ){
            if( !this.argument ){
                this.throwError("Need to specify an expression to return");
            }
            if( !parent.returnType.type().check( this.argument ) ){
                this.argument.throwError(`the "${this.argument.value()}" expression type does not match of returned. the must be "${parent.returnType.type().toString()}"`);
            }
        }
    }

    parser(syntax){
        this.argument && this.argument.parser(syntax);
        this.check();
    }
}

module.exports = ReturnStatement;