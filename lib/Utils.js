
const stackKey = Symbol("stackKey")
module.exports={

    getStacks(){
        return this[ stackKey ] || (this[stackKey] = require('./stacks'));
    },
    
    createStack(module,node,scope,parent)
    {
        if( !node )
        {
            return null;
        }
        const stacks = this.getStacks();
        switch( node.type ){
            case "Program":
                return new stacks.Program(module,node,scope,parent);
            case "Literal" :
                return new stacks.Literal(module,node,scope,parent);
            case "Identifier":
                return new stacks.Identifier(module,node,scope,parent);
            case "MethodDefinition":
                return new stacks.MethodDefinition(module,node,scope,parent);
            case "PropertyDefinition":
                return new stacks.PropertyDefinition(module,node,scope,parent);
            case "TypeDefinition":
                return new stacks.TypeDefinition(module,node,scope,parent);
            case "PackageDeclaration":
                return new stacks.PackageDeclaration(module,node,scope,parent);
            case "DeclaratorDeclaration":
                return new stacks.DeclaratorDeclaration(module,node,scope,parent);
            case "ClassDeclaration":
                return new stacks.ClassDeclaration(module,node,scope,parent);
            case "InterfaceDeclaration":
                return new stacks.InterfaceDeclaration(module,node,scope,parent);
            case "EnumDeclaration":
                return new stacks.EnumDeclaration(module,node,scope,parent);
            case "FunctionDeclaration":
                return new stacks.FunctionDeclaration(module,node,scope,parent);
            case "VariableDeclaration":
                return new stacks.VariableDeclaration(module,node,scope,parent);
            case "VariableDeclarator":
                return new stacks.VariableDeclarator(module,node,scope,parent);
            case "ModifierDeclaration":
                return new stacks.ModifierDeclaration(module,node,scope,parent);
            case "AnnotationDeclaration":
                return new stacks.AnnotationDeclaration(module,node,scope,parent);
            case "MetatypeDeclaration":
                return new stacks.MetatypeDeclaration(module,node,scope,parent);
            case "RestElement":
                return new stacks.RestElement(module,node,scope,parent);
            case "SpreadElement":
                return new stacks.SpreadElement(module,node,scope,parent);
            case "ReturnStatement":
                return new stacks.ReturnStatement(module,node,scope,parent);
            case "ExpressionStatement":
                return new stacks.ExpressionStatement(module,node,scope,parent);
            case "BlockStatement":
                return new stacks.BlockStatement(module,node,scope,parent);
            case "IfStatement":
                return new stacks.IfStatement(module,node,scope,parent);
            case "WhileStatement":
                return new stacks.WhileStatement(module,node,scope,parent);
            case "DoWhileStatement":
                return new stacks.DoWhileStatement(module,node,scope,parent);
            case "SwitchStatement":
                return new stacks.SwitchStatement(module,node,scope,parent);
            case "SwitchCase":
                return new stacks.SwitchCase(module,node,scope,parent);
            case "BreakStatement":
                return new stacks.BreakStatement(module,node,scope,parent);
            case "ForStatement":
                return new stacks.ForStatement(module,node,scope,parent);
            case "ForInStatement":
                return new stacks.ForInStatement(module,node,scope,parent);
            case "ForOfStatement":
                return new stacks.ForOfStatement(module,node,scope,parent);
            case "TryStatement":
                return new stacks.TryStatement(module,node,scope,parent);
            case "WhenStatement":
                return new stacks.WhenStatement(module,node,scope,parent);
            case "MemberExpression":
                return new stacks.MemberExpression(module,node,scope,parent);
            case "ObjectExpression":
                return new stacks.ObjectExpression(module,node,scope,parent);
            case "ArrowFunctionExpression":
                return new stacks.ArrowFunctionExpression(module,node,scope,parent);
            case "FunctionExpression":
                return new stacks.FunctionExpression(module,node,scope,parent);
            case "ArrayExpression":
                return new stacks.ArrayExpression(module,node,scope,parent);
            case "LogicalExpression":
                return new stacks.LogicalExpression(module,node,scope,parent);
            case "AssignmentExpression":
                return new stacks.AssignmentExpression(module,node,scope,parent);
            case "ThisExpression":
                return new stacks.ThisExpression(module,node,scope,parent);
            case "BinaryExpression":
                return new stacks.BinaryExpression(module,node,scope,parent);
            case "CallExpression":
                return new stacks.CallExpression(module,node,scope,parent);
            case "NewExpression":
                return new stacks.NewExpression(module,node,scope,parent);
            case "UpdateExpression":
                return new stacks.UpdateExpression(module,node,scope,parent);
            case "UnaryExpression":
                return new stacks.UnaryExpression(module,node,scope,parent);
            case "ObjectPattern":
                return new stacks.ObjectPattern(module,node,scope,parent);
            case "ArrayPattern":
                return new stacks.ArrayPattern(module,node,scope,parent);
        }
        return null;
    }



}