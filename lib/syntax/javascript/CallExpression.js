const Syntax = require("./Syntax");
class CallExpression extends Syntax{
    emit( syntax ){
        const callee= this.stack.callee.emit(syntax);
        const args = this.stack.arguments.map( item=>item.emit(syntax) );
        const desc = this.stack.callee.description();
        if(this.stack.callee.isSuperExpression || (this.stack.callee.object && this.stack.callee.object.isSuperExpression) ){
            return `${callee}.call(${["this"].concat(args).join(",")})`;
        }
        if( this.stack.isSyntaxRemoved ){
            if(this.stack.parentStack.isExpressionStatement){
                this.stack.parentStack.isSyntaxRemoved = true;
            }else{
                this.stack.throwError("the expression is removed.");
            }
        }
        if(desc.isMethodDefinition){
            const modifier =desc.modifier.value();
            const refModule = desc.compilation.module;
            if( modifier==="private" && refModule.children.length > 0){
                return `${callee}.call(${["this"].concat(args).join(",")})`;
            }
        }
        return `${callee}(${args.join(",")})`;
    }
}
module.exports = CallExpression;