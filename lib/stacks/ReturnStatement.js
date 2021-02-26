const Stack = require("../Stack");
const Utils = require("../Utils");
class ReturnStatement extends Stack{
    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isReturnStatement= true;
        this.argument = Utils.createStack( compilation, node.argument, scope, node,this );
        const fnScope = scope.getScopeByType("function");
        fnScope.returnItems.push( this );
        this.fnScope = fnScope;
    }
    reference(){
        const description = this.description();
        if( description.isDeclarator ){
            return description.reference();
        }
        return description;
    }
    referenceItems(){
        return this.argument ? this.argument.referenceItems() : [];
    }
    description(){
        return this.argument ? this.argument.description() : this;
    }
    type(){
        return this.argument ? this.argument.type() : this.compilation.getType("void");
    }
    check(){
        if(this.checked)return;
        this.checked = true;
        let parent = this.parentStack;
        while( parent && !parent.isFunctionExpression ){
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