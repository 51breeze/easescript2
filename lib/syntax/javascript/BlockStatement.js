const Syntax = require("./Syntax");
class BlockStatement extends Syntax{
    emit( syntax ){
        const body = [];
        this.stack.body.forEach( item=>{
            const value = item.emit(syntax);
            if( value ){
               body.push( value );
            }
        });
        return this.stack.insertBefore.concat( body ).join("\r\n");
    }
}

module.exports = BlockStatement;