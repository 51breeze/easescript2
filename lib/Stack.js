const fs     = require("fs");
const events = require('events');
const Utils = require("./Utils");
class Stack extends events.EventEmitter 
{
    constructor(compilation,node,scope,parentNode,parentStack)
    {
       super(); 
       this.compilation  = compilation;
       this.node    = node;
       this.scope   = scope;
       this.parentNode  = parentNode;
       this.parentStack  = parentStack;
       this.__parser=false;
    }

    getParentStackByName( name ){
        let parent = this.parentStack;
        while( parent && !Utils.isStackByName(parent,name) ){
            parent = parent.parentStack;
        }
        return parent;
    }

    reference(){
        return this;
    }

    description(){
        return this;
    }

    type(){
        return null;
    }

    check(){}
    parser(syntax){}

    value(){
        return this.node.name;
    }
 
    raw(){
        if( this.compilation.module )
        {
           return this.compilation.module.source.substr(this.node.start, this.node.end - this.node.start);
        }
        return this.node.raw || this.node.name;
    }

    dispatcher(event, ...args){
        return super.emit(event, ...args);
    }
 
    emit( syntax ){
        return this.raw();
    }

    throwError( message ){
        this.compilation.throwErrorLine(`At {code}\r\n ${message}`, this.node);
    }

    throwWarn( message ){
        this.compilation.throwWarnLine(`At {code}\r\n ${message}`, this.node);
    }

    toString(){
        return this.constructor.toString();
    }
}


module.exports = Stack;
