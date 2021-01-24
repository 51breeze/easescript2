const Stack = require("../Stack");
const Utils = require("../Utils");
class WhenStatement extends Stack{

    constructor(compilation,node,scope,parentNode,parentStack){
        super(compilation,node,scope,parentNode,parentStack);
        this.isWhenStatement= true;
        this.condition = Utils.createStack(compilation,node.test,scope,node,this);
        this.consequent = Utils.createStack(compilation,node.consequent,scope,node,this);
        this.alternate = Utils.createStack(compilation,node.alternate,scope,node,this);
    }

    parser(syntax){
        this.consequent.parser(syntax);
        this.alternate.parser(syntax);
    }

    emit(syntax){
        const name = this.condition.value();
        if( !Utils.isStackByName(this.condition,"CallExpression") ){
            this.condition.throwError( `'when' compiler directive condition statement must is callable expression` )
        }
        const args = this.condition.arguments.map( item=>item.value() );
        if( args.length < 1  ){
            this.condition.throwError( `'${name}' compiler directive params missing.` );
        }
        let result = false;
        switch( name ){
            case 'Runtime' :
                result = syntax.isRuntime(args[0]) 
            break;
            case 'Syntax' :
                result = syntax.isSyntax(args[0]) 
            break;
            default:
                this.condition.throwError( `'${name}' compiler directive is not supported.` )
        }
        if( result ){
            return this.consequent.emit(syntax);
        }
        return this.alternate.emit(syntax);
    }
}

module.exports = WhenStatement;