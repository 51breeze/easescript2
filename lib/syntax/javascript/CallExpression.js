const Syntax = require("./Syntax");
class CallExpression extends Syntax{
    emit( syntax ){
        const callee= this.stack.callee.emit(syntax);
        const args = this.stack.arguments.map( item=>item.emit(syntax) );
        if(this.stack.callee.isSuperExpression || this.stack.callee.object.isSuperExpression ){
            return `${callee}.call(${["this"].concat(args).join(",")})`;
        }
        return `${callee}(${args.join(",")})`;
    }
}
module.exports = CallExpression;