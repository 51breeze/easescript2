const Grammar = require("../../Grammar");
const classMap=new Map();
const namespaceMap=new Map();
class Syntax extends Grammar {
    constructor(stack){
        super( Syntax.target.name );
        this.stack = stack;
        this.scope = stack.scope;
        this.compilation = stack.compilation;
        this.parentStack = stack.parentStack;
        this.parentNode = stack.parentNode;
        this.module = this.compilation.module;
    }
    check(){
        this.stack.check(this);
    }
    getOptions(){
        return this.compilation.compiler.options;
    }
    getSyntaxOption(){
        return this.compilation.compiler.options.syntax[ this.syntaxName ] || {};
    }
    isBlockStatement(){
        const stack = this.stack;
        return stack.isFunctionExpression || 
                stack.isSwitchStatement   ||
                stack.isIfStatement         ||
                stack.isForInStatement      ||
                stack.isForStatement        ||
                stack.isForOfStatement      ||
                stack.isForOfStatement      ||
                stack.isDoWhileStatement    ||
                stack.isWhileStatement      ||
                stack.isTryStatement        ||
                stack.isPackageDeclaration  ||
                stack.isClassDeclaration    ||
                stack.isInterfaceDeclaration
                   
    }

    isExpression(){
        const stack = this.stack;
        return stack.isVariableDeclaration || 
               stack.parentStack.isVariableDeclarator || 
               stack.parentStack.isExpressionStatement || 
               stack.isSwitchCase || 
               stack.isBreakStatement || 
               stack.isReturnStatement || 
               stack.isExpressionStatement;
    }

    getBlockStatement( stack ){
       stack = stack || this.stack.parentStack;
       while( stack && !(stack.isBlockStatement || stack.isSwitchStatement) ){
           stack=stack.parentStack;
       }
       if(stack && stack.isBlockStatement ){
           return stack.parentStack;
       }
       return stack;
    }

    inCaseStatement(){
        let stack = this.stack.parentStack;
        while( stack && !stack.isSwitchCase ){
            stack=stack.parentStack;
        }
        return !!(stack && stack.isSwitchCase);
     }

    getIndent(num=null){
        let level = num === null ? this.scope.level : num;
        if( num === null ){
            if( this.scope.asyncParentScopeOf ){
                const asyncIndent = 4;
                const asc = this.scope.asyncParentScopeOf;
                const stack = this.getBlockStatement();
                level =  this.scope.parent && this.stack.isFunctionExpression ? this.scope.parent.level : asc.level+asyncIndent;
                if( stack ){
                    if( stack.hasAwait || this.hasAwait ){
                        level = asc.level+asyncIndent;
                    }else if(stack.isFunctionExpression && stack.scope !== asc ){
                        const diff = this.scope.level - stack.scope.parent.level;
                        level = asc.level+asyncIndent+diff;
                    }else{
                        let ps = this.scope;
                        while( ps && ps.parent && !(ps.parent === asc || ps === asc || ps.hasChildAwait) ){
                            ps = ps.parent;
                        }
                        let diff = this.scope.level - ps.level;
                        level = asc.level+asyncIndent+diff;
                    }
                }
                
            }else{
                if( this.scope.parent && this.stack.isFunctionExpression ) {
                    level = this.scope.parent.level;
                }else if( !this.stack.isBreakStatement && this.inCaseStatement() ){
                    level+=1;
                }
            }
        }
        return "\t".repeat( level );
    }
    
    semicolon(expression){
        if( !expression )return "";
        return `${this.getIndent()}${expression};`;
    }

    checkMetaTypeSyntax( metaTypes ){
        metaTypes = metaTypes.filter( item=>item.name ==="Runtime" || item.name ==="Syntax");
        return metaTypes.length > 0 ? metaTypes.every( item=>{
            const desc = item.description();
            const value = desc.params[0];
            const expect = desc.expect !== false;
            switch( item.name ){
                case "Runtime" :
                    return this.isRuntime(value) === expect;
                case "Syntax" :
                    return this.isSyntax(value) === expect;
            }
            return true;
        }) : true;
    }
    getIdByModule( module ){
        if( !classMap.has(module) ){
            classMap.set(module,classMap.size);
        }
        return classMap.get(module);
    }
    getIdByNamespace( namespace ){
        if( !namespaceMap.has(namespace) ){
            namespaceMap.set(namespace,namespaceMap.size);
        }
        return namespaceMap.get(namespace);
    }
    throwError(message){
        this.stack.throwError(message);
    }
    throwWarn(message){
        this.stack.throwWarn(message);
    }
}

module.exports = Syntax;