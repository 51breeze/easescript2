const Syntax = require("./Syntax");
class BlockStatement extends Syntax{
    emit( syntax ){
        const body = [];
        this.stack.body.forEach( item=>{
            const value = item.emit(syntax);
            if( value ){
                if( item.isExpression ){
                    body.push( this.semicolon(value) );
                }else{
                    body.push( value );
                }
            }
        });
        return this.stack.insertBefore.concat( body ).join("\r\n");
    }
}

module.exports = BlockStatement;