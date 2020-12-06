const Scope = require("../Scope.js");
module.exports = class FunctionScope extends Scope {

    constructor( parentScope )
    {
        super(parentScope);
        this.arguments   = [];
        this.returnType  = null;
        this.returnItems = [];
        this.key         = null;
        this.isArrow     = false;
        this.isExpression = false;
        this.arrowThisName = null;
    }

    type( name )
    {
        return name === "function";
    }

    createThisName(){
        if( this.arrowThisName ){
            return this.arrowThisName;
        }else{
            return this.arrowThisName = this.generateVarName("$this");
        }
    }

    getArrowThisName(){
        if( this.isArrow ){
            if( this.arrowThisName ){
                return this.arrowThisName;
            }else{
                let parent = this.parent;
                while( (parent = parent.getScopeByType("function") ) && parent.isArrow );
                if( !parent ){
                    parent = this.getScopeByType("top");
                }
                this.arrowThisName = parent.createThisName();    
                return this.arrowThisName;
            }
        }
        return null;
    }
} 