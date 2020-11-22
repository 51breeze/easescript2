module.exports = class Scope{
   
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
        this.declarations=new Map();
    }

    type( name )
    {
        return false;
    }

    getScopeByType( name )
    {
        let obj = this;
        while( obj instanceof Scope && !obj.type( name , true) && obj.parent )
        {
            obj = obj.parent;
        }
        return obj;
    }

    define(name, type)
    {
        if( type === void 0 )
        {
            let has = this.declarations.has( name );
            if( !has )
            {
                let parentScope = this.parent;
                while( parentScope )
                {
                    if( parentScope instanceof Scope && parentScope.declarations.has(name) )
                    {
                        return parentScope.declarations.get(name);
                    }else{
                        parentScope = parentScope.parent; 
                    }
                }
                return null;
            }
            return this.declarations.get(name);
        }
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