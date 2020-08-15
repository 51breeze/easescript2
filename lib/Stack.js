class Stack {

    constructor( parent )
    {
       this.parent = parent;
       this.before = [];
       this.content = [];
       this.after=[];
       this.children=[];
       this.level = 0;
       if( parent instanceof Stack )
       {
           parent.children.push( this );
           this.level = parent.level+1;
       }
    }

    getChildByAt( index=-1 )
    {
        return this.children[ index<0 ? this.children.length+index : index ];
    }

    removeChild( stack )
    {
       const index = this.children.indexOf( stack );
       return this.children.splice(index,1);
    }

    push( value )
    {
        this.content.push( value );
    }

    pushBefore(value)
    {
        this.before.push( value );
    }

    pushAfter(value)
    {
        this.after.push( value );
    }

    toString()
    {
        const before = this.before.map( (val)=>val.toString() ).join("");
        const after = this.after.map( (val)=>val.toString() ).join("");
        let content = this.content.map( (val)=>val.toString() ).join("");
        this.children.forEach( (child)=>{
            content+=child.toString();
        })
        content = before + content + after;
        return content;
    }

}

module.exports = Stack;