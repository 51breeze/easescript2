const fs     = require("fs");
const events = require('events');
class Stack extends events.EventEmitter 
{
    constructor(module,node,scope,parent)
    {
       super(); 
       this.module  = module;
       this.node    = node;
       this.scope   = scope;
       this.parent  = parent;
    }

    parser()
    {
       return null;
    }
 
    raw()
    {
        return '';
    }
 
    emit()
    {
        return '';
    } 
}


module.exports = Stack;
