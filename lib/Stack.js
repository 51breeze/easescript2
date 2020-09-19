const stackMap={};
class Stack {

    constructor( parent )
    {
       this.parent = parent;
       this.before = [];
       this.after=[];
       this.children=[];
       this.level = 0;
       if( parent )
       {
           parent.children.push( this );
           this.level = parent.level+1;
       }
    }


    add(value, pos=0 )
    {
        if( pos===-1 ){
            this.before.push( value );
        }else if( pos===1 )
        {
            this.after.push( value );
        }else{
            this.children.push( value );
        }
    }
}

module.exports = Stack;