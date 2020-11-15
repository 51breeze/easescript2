
const stackKey = Symbol("stackKey")
module.exports={

    getStacks(){
        return this[ stackKey ] || (this[stackKey] = require('./stacks'));
    },

    getStackByName( name ){
        const stacks = this.getStacks();
        return stacks[name] || null;
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
            case "ArrowFunctionExpression":
                return new stacks.ArrowFunctionExpression(compilation,node,scope,parentNode,parentStack);
            case "FunctionExpression":
                return new stacks.FunctionExpression(compilation,node,scope,parentNode,parentStack);
            case "ArrayExpression":
                return new stacks.ArrayExpression(compilation,node,scope,parentNode,parentStack);
            case "LogicalExpression":
                return new stacks.LogicalExpression(compilation,node,scope,parentNode,parentStack);
            case "AssignmentExpression":
                return new stacks.AssignmentExpression(compilation,node,scope,parentNode,parentStack);
            case "ThisExpression":
                return new stacks.ThisExpression(compilation,node,scope,parentNode,parentStack);
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
        }
        return null;
    }



}