const events = require('events');
class Grammar extends events.EventEmitter {
    constructor(stack){ 
        super();
        this.stack = stack;
        this.scope = stack.scope;
        this.compilation = stack.compilation;
        this.parentStack = stack.parentStack;
        this.parentNode = stack.parentNode;
        this.module = this.compilation.module;
    }
    check(){
        this.stack.check(this);
    }
    getOption(){
        return this.compilation.compiler.options;
    }
    getSyntaxOptions(){
        return this.compilation.compiler.options.syntax;
    }
    getIndent(num=null){

        let level = num === null ? this.scope.level-1 : num;
        return "\t".repeat( level );
    }
    indentBlock( expression ){
        if( !expression )return "";
        return `${this.getIndent()}${expression};`;
    }
    semicolon(expression){
        if( !expression )return "";
        return `${this.getIndent()}${expression};`;
    }
    isRuntime( name ){
        return name.toLowerCase() === "client";
    }
    isSyntax( name ){
        return name.toLowerCase() === "javascript";
    }
    throwError(message){
        this.stack.throwError(message);
    }
    throwWarn(message){
        this.stack.throwWarn(message);
    }
    dispatcher(event, ...args){
        return super.emit(event, ...args);
    }
}


module.exports = Grammar;
