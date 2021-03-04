const Syntax = require("./Syntax");
class CallExpression extends Syntax{
    emit( syntax ){
        const callee= this.stack.callee.emit(syntax);
        const args = this.stack.arguments.map( item=>item.emit(syntax) );
        const desc = this.stack.callee.description(this);
        if(this.stack.callee.isSuperExpression){
            return `${callee}.call(${["this"].concat(args).join(",")})`;
        }else if(this.stack.callee.isMemberExpression && this.stack.callee.object.isSuperExpression){
            if( this.stack.callee.object.isMemberExpression ){
                return `${callee}.call(${[this.stack.callee.object.emit(syntax)].concat(args).join(",")})`;
            }
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
                if( this.stack.callee.isMemberExpression ){
                    return `${callee}.call(${[this.stack.callee.object.emit(syntax)].concat(args).join(",")})`;
                }
                return `${callee}.call(${["this"].concat(args).join(",")})`;
            }
        }
        return `${callee}(${args.join(",")})`;
    }
}
module.exports = CallExpression;