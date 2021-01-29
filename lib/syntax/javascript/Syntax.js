const Grammar = require("../../Grammar");
class Syntax extends Grammar {

    getIndent(num=null){
        let level = num === null ? this.scope.level-1 : num;
        if( num === null ){

            if( (this.stack.isFunctionExpression||this.stack.isSwitchStatement) && this.scope.parent ){
                level = this.scope.parent.level-1;
                if( this.scope.asyncParentScopeOf !== this.scope && this.scope.asyncParentScopeOf ){
                    level = this.scope.asyncParentScopeOf.level+2;
                }
            }
            
            if( this.scope.asyncParentScopeOf ){
                level = this.scope.asyncParentScopeOf.level+2;
                const stack = this.stack.getParentStackByName("BlockStatement").parentStack;
                if( !stack.isIfStatement || !stack.hasAwait){
                    level = this.scope.level+2;
                }
            }
        }
        return "\t".repeat( level );
    }
    
    isRuntime( name ){
        return name.toLowerCase() === "client";
    }

    isSyntax( name ){
        return name.toLowerCase() === "javascript";
    }
}

module.exports = Syntax;