const Stack = require("./Stack");
module.exports = class Scope extends Stack{
   
    constructor( parent )
    {
        super( parent );
        this.declarations=new Map();
    }

    type( name )
    {
        return name==="top";
    }

    define(name, type)
    {
        this.declarations.set(name,type);
    }

    isDefine( name )
    {
        let has = this.declarations.has( name );
        if( !has )
        {
            let parentScope = this.parent;
            while( parentScope && !(parentScope instanceof Scope) )
            {
                parentScope = parentScope.parent;
            }
            if( parentScope )
            {
                return parentScope.isDefine( name );
            }
        }
        return has;
    }
};