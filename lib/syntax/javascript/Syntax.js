const Grammar = require("../../Grammar");
class Syntax extends Grammar {

    getIndent(num=null){
        let level = num === null ? this.scope.level-1 : num;
        if( num === null ){
            if( this.stack.isFunctionExpression && this.scope.parent ){
                level = this.scope.parent.level-1;
                if( this.scope.asyncParentScopeOf !== this.scope && this.scope.asyncParentScopeOf ){
                    level = this.scope.asyncParentScopeOf.level+2;
                }
            }else{
                if( this.stack.isAwaitExpression ){
                    level = this.scope.asyncParentScopeOf.level+2;
                }else if( this.scope.asyncParentScopeOf ){
                    level = this.scope.asyncParentScopeOf.level+2;
                    const fnScope = this.scope.getScopeByType("function");
                    if( fnScope !== this.scope.asyncParentScopeOf ){
                        const diff = this.scope.level - this.scope.asyncParentScopeOf.level;
                        level = this.scope.asyncParentScopeOf.level+2+diff;
                    }
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