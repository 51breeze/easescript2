const Syntax = require("./Syntax");
class WhenStatement extends Syntax{
    emit(syntax){
        const name = this.stack.condition.value();
        if( !this.stack.condition.isCallExpression ){
            this.condition.throwError( `'when' compiler directive condition statement must is callable expression` )
        }
        const args = this.stack.condition.arguments.map( item=>item.value() );
        if( args.length < 1  ){
            this.stack.condition.throwError( `'${name}' compiler directive params missing.` );
        }
        let result = false;
        switch( name ){
            case 'Runtime' :
                result = this.isRuntime(args[0]) 
            break;
            case 'Syntax' :
                result = this.isSyntax(args[0]) 
            break;
            default:
                this.stack.condition.throwError( `'${name}' compiler directive is not supported.` )
        }
        if( result ){
            return this.stack.consequent.emit(syntax);
        }
        return this.stack.alternate.emit(syntax);
    }
}

module.exports = WhenStatement;