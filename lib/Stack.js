const stackMap={};
class Stack {

    constructor( parent )
    {
       this.parent = parent;
       this.children=[];
       this.level = 0;
       if( parent )
       {
           parent.children.push( this );
           this.level = parent.level+1;
       }
    }

    isScope()
    {
        return false;
    }

    add(value)
    {
        this.children.push( value );
    }
}

module.exports = Stack;