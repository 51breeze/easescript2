const events = require('events');
module.exports = class Scope extends events.EventEmitter{
   
    constructor( parent ){
        super();
        this.parent = parent;
        this.children=[];
        this.level = 0;
        if( parent ){
            parent.children.push( this );
            this.level = parent.level+1;
            this.asyncParentScopeOf = parent.async ? parent : parent.asyncParentScopeOf;
        }
        this.declarations=new Map();
    }

    removeChild( childScope ){
        const index = this.children.indexOf( childScope );
        if( index >= 0 ){
            return this.children.splice(index,1);
        }
        return null;
    }

    generateVarName( name ){
        let count = 0;
        let ref = name;
        const check = (item)=>{
            if( !item.type("function") ){
                if( item.isDefine( ref ) ){
                    return true;
                }else{
                    return item.children.some( check );
                }
            }
        };
        while( this.isDefine( ref ) || this.children.some( check ) ){
            count++;
            ref=name+count;
        }
        return ref;
    }

    type( name ){
        return false;
    }

    getScopeByType( name )
    {
        let obj = this;
        while( obj && obj instanceof Scope && !obj.type( name ) )
        {
            obj = obj.parent;
        }
        return obj;
    }

    define(name, type){
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

    isDefine( name ){
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

    dispatcher(event, ...args){
        return super.emit(event, ...args);
    }
};