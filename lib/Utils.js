
const stackKey = Symbol("stackKey");
const Colors = require('colors');
Colors.setTheme({
    silly: 'rainbow',
    input: 'grey',
    verbose: 'cyan',
    info: 'green',
    data: 'blue',
    help: 'cyan',
    warn: 'yellow',
    debug: 'magenta',
    error: 'red'
});

const directiveMap={
    "Runtime":true,
    "Syntax":true,
}

module.exports={

    checkDirective( name ){
        return directiveMap[name]
    },
    getStacks(){
        return this[ stackKey ] || (this[stackKey] = require('./stacks'));
    },

    getStackByName( name ){
        const stacks = this.getStacks();
        return stacks[name] || null;
    },

    isStackByName(target, name, flag ){
        const fn = this.getStackByName( name );
        const result = fn && target instanceof fn;
        return result && flag ? target : result;
    },
    
    createStack(compilation,node,scope,parentNode,parentStack)
    {
        if( !node )
        {
            return null;
        }
        const stacks = this.getStacks();
        switch( node.type ){
            case "Program":
                return new stacks.Program(compilation,node,scope,parentNode,parentStack);
            case "Literal" :
                return new stacks.Literal(compilation,node,scope,parentNode,parentStack);
            case "Identifier":
                return new stacks.Identifier(compilation,node,scope,parentNode,parentStack);
            case "MethodDefinition":
                if( node.kind === "get"){
                    return new stacks.MethodGetterDefinition(compilation,node,scope,parentNode,parentStack);
                }else if( node.kind === "set"){
                    return new stacks.MethodSetterDefinition(compilation,node,scope,parentNode,parentStack);
                }
                return new stacks.MethodDefinition(compilation,node,scope,parentNode,parentStack);
            case "PropertyDefinition":
                return new stacks.PropertyDefinition(compilation,node,scope,parentNode,parentStack);
            case "TypeDefinition":
                return new stacks.TypeDefinition(compilation,node,scope,parentNode,parentStack);
            case "PackageDeclaration":
                return new stacks.PackageDeclaration(compilation,node,scope,parentNode,parentStack);
            case "DeclaratorDeclaration":
                return new stacks.DeclaratorDeclaration(compilation,node,scope,parentNode,parentStack);
            case "ClassDeclaration":
                return new stacks.ClassDeclaration(compilation,node,scope,parentNode,parentStack);
            case "InterfaceDeclaration":
                return new stacks.InterfaceDeclaration(compilation,node,scope,parentNode,parentStack);
            case "EnumDeclaration":
                return new stacks.EnumDeclaration(compilation,node,scope,parentNode,parentStack);
            case "FunctionDeclaration":
                return new stacks.FunctionDeclaration(compilation,node,scope,parentNode,parentStack);
            case "VariableDeclaration":
                return new stacks.VariableDeclaration(compilation,node,scope,parentNode,parentStack);
            case "VariableDeclarator":
                return new stacks.VariableDeclarator(compilation,node,scope,parentNode,parentStack);
            case "ModifierDeclaration":
                return new stacks.ModifierDeclaration(compilation,node,scope,parentNode,parentStack);
            case "AnnotationDeclaration":
                return new stacks.AnnotationDeclaration(compilation,node,scope,parentNode,parentStack);
            case "MetatypeDeclaration":
                return new stacks.MetatypeDeclaration(compilation,node,scope,parentNode,parentStack);
            case "RestElement":
                return new stacks.RestElement(compilation,node,scope,parentNode,parentStack);
            case "SpreadElement":
                return new stacks.SpreadElement(compilation,node,scope,parentNode,parentStack);
            case "ReturnStatement":
                return new stacks.ReturnStatement(compilation,node,scope,parentNode,parentStack);
            case "ExpressionStatement":
                return new stacks.ExpressionStatement(compilation,node,scope,parentNode,parentStack);
            case "ParenthesizedExpression":
                return new stacks.ParenthesizedExpression(compilation,node,scope,parentNode,parentStack);
            case "BlockStatement":
                return new stacks.BlockStatement(compilation,node,scope,parentNode,parentStack);
            case "IfStatement":
                return new stacks.IfStatement(compilation,node,scope,parentNode,parentStack);
            case "WhileStatement":
                return new stacks.WhileStatement(compilation,node,scope,parentNode,parentStack);
            case "DoWhileStatement":
                return new stacks.DoWhileStatement(compilation,node,scope,parentNode,parentStack);
            case "SwitchStatement":
                return new stacks.SwitchStatement(compilation,node,scope,parentNode,parentStack);
            case "SwitchCase":
                return new stacks.SwitchCase(compilation,node,scope,parentNode,parentStack);
            case "BreakStatement":
                return new stacks.BreakStatement(compilation,node,scope,parentNode,parentStack);
            case "ForStatement":
                return new stacks.ForStatement(compilation,node,scope,parentNode,parentStack);
            case "ForInStatement":
                return new stacks.ForInStatement(compilation,node,scope,parentNode,parentStack);
            case "ForOfStatement":
                return new stacks.ForOfStatement(compilation,node,scope,parentNode,parentStack);
            case "TryStatement":
                return new stacks.TryStatement(compilation,node,scope,parentNode,parentStack);
            case "WhenStatement":
                return new stacks.WhenStatement(compilation,node,scope,parentNode,parentStack);
            case "MemberExpression":
                return new stacks.MemberExpression(compilation,node,scope,parentNode,parentStack);
            case "ObjectExpression":
                return new stacks.ObjectExpression(compilation,node,scope,parentNode,parentStack);
            case "TypeObjectExpression":
                return new stacks.TypeObjectExpression(compilation,node,scope,parentNode,parentStack);
            case "TypeObjectProperty":
                return new stacks.TypeObjectProperty(compilation,node,scope,parentNode,parentStack);
            case "ArrowFunctionExpression":
                return new stacks.ArrowFunctionExpression(compilation,node,scope,parentNode,parentStack);
            case "FunctionExpression":
                return new stacks.FunctionExpression(compilation,node,scope,parentNode,parentStack);
            case "ArrayExpression":
                return new stacks.ArrayExpression(compilation,node,scope,parentNode,parentStack);
            case "LogicalExpression":
                return new stacks.LogicalExpression(compilation,node,scope,parentNode,parentStack);
            case "SequenceExpression":
                return new stacks.SequenceExpression(compilation,node,scope,parentNode,parentStack);
            case "AwaitExpression":
                return new stacks.AwaitExpression(compilation,node,scope,parentNode,parentStack);
            case "TypeAssertExpression":
                return new stacks.TypeAssertExpression(compilation,node,scope,parentNode,parentStack);
            case "AssignmentExpression":
                return new stacks.AssignmentExpression(compilation,node,scope,parentNode,parentStack);
            case "AssignmentPattern":
                return new stacks.AssignmentPattern(compilation,node,scope,parentNode,parentStack);
            case "ThisExpression":
                return new stacks.ThisExpression(compilation,node,scope,parentNode,parentStack);
            case "Super":
                return new stacks.SuperExpression(compilation,node,scope,parentNode,parentStack);
            case "BinaryExpression":
                return new stacks.BinaryExpression(compilation,node,scope,parentNode,parentStack);
            case "CallExpression":
                return new stacks.CallExpression(compilation,node,scope,parentNode,parentStack);
            case "NewExpression":
                return new stacks.NewExpression(compilation,node,scope,parentNode,parentStack);
            case "UpdateExpression":
                return new stacks.UpdateExpression(compilation,node,scope,parentNode,parentStack);
            case "UnaryExpression":
                return new stacks.UnaryExpression(compilation,node,scope,parentNode,parentStack);
            case "ObjectPattern":
                return new stacks.ObjectPattern(compilation,node,scope,parentNode,parentStack);
            case "ArrayPattern":
                return new stacks.ArrayPattern(compilation,node,scope,parentNode,parentStack);
            case "Property":
                return new stacks.Property(compilation,node,scope,parentNode,parentStack);
            case "ImportDeclaration":
                return new stacks.ImportDeclaration(compilation,node,scope,parentNode,parentStack);
            case "ImportSpecifier":
                return new stacks.ImportSpecifier(compilation,node,scope,parentNode,parentStack);
            case "GenericTypeDefinition":
                return new stacks.GenericTypeDefinition(compilation,node,scope,parentNode,parentStack);
        }
        return null;
    },
    info( msg ){
        console.info( msg.info );
    },
    silly( msg ){
        console.log( msg.silly );
    },
    input( msg ){
        console.log( msg.input );
    },
    verbose( msg ){
        console.log( msg.verbose );
    },
    prompt( msg ){
        console.log( msg.prompt );
    },
    data( msg ){
        console.log( msg.data );
    },
    help( msg ){
        console.log( msg.help );
    },
    warn( msg ){
        console.warn( msg.warn );
    },
    debug( msg ){
        console.debug( msg.debug );
    },
    error( msg ){
        console.trace( msg.error );
        process.exit(0);
    },
    scalarMap:["Number","Boolean","Float","Int","Uint","Float","Double","RegExp","String"],  
    isScalar(type){
        return type && type.isDeclarator && type.isModule && this.scalarMap.includes( type.id );
    },
    isInstanceObject(stack){
        return stack && stack.isStack && (stack.isThisExpression || stack.isArrayExpression || stack.isObjectExpression || stack.isNewExpression);
    },
    isTypeModule(stack){
        if( stack.isModule && (type.isDeclarator || type.isClass || type.isInterface) ){
            return true;
        }
        if( !(stack && stack.isStack) ) return false;
        const type = !stack.isLiteral && stack.compilation.getType( stack.value() );
        return type && type.isModule && (type.isDeclarator || type.isClass || type.isInterface);
    },
    checkGloableModule(object){
        return object.isDeclarator;
    },
    checkTypeForBoth(left,right){
        if( left === right ){
            return true;
        }
        if( !left || !right ){
            return false;
        }
        if( left.isLiteralType || right.isLiteralType ){
           return left.is( right );
        }
        if( !left.isModule && left.id === "Union" ){
            if( right.isModule || right.id !== "Union" || left.types.length !== right.types.length ){
                return false;
            }
            return left.types.every( item=>{
                return right.types.includes( item );
            });
        }
        if( !left.isModule && left.id === "Tuple" ){
            if( right.isModule || right.id !== "Tuple" || left.elements.length !== right.elements.length ){
                return false;
            }
            return left.elements.every( item=>{
                return right.elements.includes( item );
            });
        }
        return left.id === right.id && left.namesapce === right.namesapce;
    },

    isArray(type){
        return type && type.id ==="Array" && type.isDeclarator && type.isModule;
    },
    isObject(type){
        return type && type.id ==="Object" && type.isDeclarator && type.isModule;
    },
    isFunction( stack ){
        if(!stack || !stack.isStack )return false;
        if( stack.isCallExpression ){
            return false;
        }
        const desc = stack.description();
        if( desc.isAccessor ){
            return false;
        }
        if( desc.isFunctionExpression || desc.isMethodDefinition ){
            return true; 
        }
        return false;
    },
    firstToUpper(name){
        return name.substr(0,1).toUpperCase()+name.substr(1);
    }
}