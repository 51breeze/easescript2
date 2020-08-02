class Stack {

    constructor( parent )
    {
       this.parent = parent;
       this.before = [];
       this.content = [];
       this.after=[];
       this.children=[];
       if( parent instanceof Stack )
       {
           parent.children.push( this );
       }
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