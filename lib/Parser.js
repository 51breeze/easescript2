const acorn = require("acorn");
const
    SCOPE_TOP = 1,
    SCOPE_FUNCTION = 2,
    SCOPE_VAR = SCOPE_TOP | SCOPE_FUNCTION,
    SCOPE_ASYNC = 4,
    SCOPE_GENERATOR = 8,
    SCOPE_ARROW = 16,
    SCOPE_SIMPLE_CATCH = 32,
    SCOPE_SUPER = 64,
    SCOPE_DIRECT_SUPER = 128;

 const
    BIND_NONE = 0, 
    BIND_VAR = 1, 
    BIND_LEXICAL = 2,
    BIND_FUNCTION = 3, 
    BIND_SIMPLE_CATCH = 4,
    BIND_OUTSIDE = 5;

const Parser = acorn.Parser
const TokenType = Parser.acorn.TokenType;
const tokTypes = Parser.acorn.tokTypes;
const keywordTypes = Parser.acorn.keywordTypes;

const lineBreak = /\r\n?|\n|\u2028|\u2029/;

keywordTypes["is"] = new TokenType("is", {beforeExpr: true, binop: 7,keyword:"is"});
tokTypes._is = keywordTypes["is"];

keywordTypes["as"] = new TokenType("as", {beforeExpr: true, binop: 7,keyword:"as"});
tokTypes._as = keywordTypes["as"];

keywordTypes["package"] = new TokenType("package",{startsExpr: true,keyword:"package"});
tokTypes._package = keywordTypes["package"];

keywordTypes["implements"] = new TokenType("implements",{startsExpr: true,keyword:"implements"});
tokTypes._implements = keywordTypes["implements"];

keywordTypes["private"] = new TokenType("private",{startsExpr: true,keyword:"private"});
tokTypes._private = keywordTypes["private"];

keywordTypes["protected"] = new TokenType("protected",{startsExpr: true,keyword:"protected"});
tokTypes._protected = keywordTypes["protected"];

keywordTypes["public"] = new TokenType("public",{startsExpr: true,keyword:"public"});
tokTypes._public = keywordTypes["public"];

keywordTypes["override"] = new TokenType("override",{startsExpr: true,keyword:"override"});
tokTypes._override = keywordTypes["override"];

keywordTypes["static"] = new TokenType("static",{startsExpr: true,keyword:"static"});
tokTypes._static = keywordTypes["static"];

keywordTypes["when"] = new TokenType("when",{startsExpr: true,keyword:"when"});
tokTypes._when = keywordTypes["when"];

keywordTypes["then"] = new TokenType("then",{startsExpr: true,keyword:"then"});
tokTypes._then = keywordTypes["then"];

keywordTypes["enum"] = new TokenType("enum",{startsExpr: true,keyword:"enum"});
tokTypes._enum = keywordTypes["enum"];

keywordTypes["interface"] = new TokenType("interface",{startsExpr: true,keyword:"interface"});
tokTypes._interface = keywordTypes["interface"];

keywordTypes["abstract"] = new TokenType("abstract",{startsExpr: true,keyword:"abstract"});
tokTypes._abstract = keywordTypes["abstract"];

tokTypes._declarator = new TokenType("declarator",{startsExpr: true,keyword:"declarator"});

tokTypes._annotation = new TokenType("@",{startsExpr: true});

class SyntaxParser extends Parser {

    constructor(options, input, startPos){
        super(options, input, startPos);
        this.keywords =  new RegExp( this.keywords.source.replace(")$","|is|package|implements|static|public|protected|private|override|when|then|enum|interface|abstract)$") );
        if( Array.isArray(options.reserved) && options.reserved.length > 0 ){
            this.reservedWords = new RegExp( this.reservedWords.source.replace(")$", "|"+options.reserved.join("|")+")$") );
        }
    }

    declareName(name, bindingType, pos) {
        if( bindingType === BIND_VAR || bindingType == BIND_LEXICAL ){
            const scope = this.currentVarScope();
            if( (bindingType === BIND_VAR && scope.var.indexOf(name) >= 0) || (bindingType == BIND_LEXICAL && scope.lexical.indexOf(name) >= 0) ) {
                this.raiseRecoverable(pos, ("Identifier '" + name + "' has already been declared"));
            }
            if (this.reservedWords.test(name)) {
                this.raiseRecoverable(pos, `Identifier '${name}' is reserved do not declared.`);
            }
        }
        super.declareName( name, bindingType, pos);
    }

    initFunction(node) {
        if( this.type === tokTypes.star ){
            this.raise( this.lastTokStart, `Function generator unsupported`);
        }
        super.initFunction(node);
    }

    parseStatement(context, topLevel, exports, isStatic)
    {
        switch ( this.type )
        {
            case tokTypes._package : 
                if( !topLevel )
                {
                    this.unexpected();
                }
                return this.parsePackage( this.startNode(), true );
            case tokTypes._abstract : 
                if( !topLevel || isStatic )
                {
                    this.unexpected();
                }

                var abstract = this.startNode();
                abstract.name = "abstract";
                this.next();

                if( this.type !== tokTypes._class )
                {
                    this.unexpected();
                }

                this.finishNode(abstract,"ModifierDeclaration")
                var node = this.parseClass(this.startNode(), true, true );
                node.abstract = abstract;
                return node;
            case tokTypes._public : 
                if( !topLevel ){
                    this.unexpected();
                }
                this.next();
                var modifier = this.finishNode(this.startNode(),"ModifierDeclaration");
                modifier.name = "public";
                var node = this.parseStatement(null, topLevel, exports);
                node.modifier = modifier;
                return node;
            case tokTypes._protected : 
                if( !topLevel )
                {
                    this.unexpected();
                }
                this.next();
                var modifier = this.finishNode(this.startNode(),"ModifierDeclaration");
                modifier.name = "protected";
                var node = this.parseStatement(null, topLevel, exports);
                node.modifier = modifier;
                return node;
            case tokTypes._private : 
                this.raise( this.lastTokStart, `Private modifier can only be used in class member methods`);
            break;
            case tokTypes._override : 
                this.raise( this.lastTokStart, `Override modifier can only be used in class member methods`);
            break;
            case tokTypes._static:
                if( !topLevel ){
                    this.unexpected();
                }
                this.next();
                var modifier = this.finishNode(this.startNode(),"ModifierDeclaration");
                modifier.name = "static";
                var node = tokTypes._class === this.type ? this.parseClass(this.startNode(), true, false, true ) : this.parseStatement(null, topLevel, exports, true);
                node.static = modifier;
                return node;  
            case tokTypes._import:
                if( !topLevel ){
                    this.unexpected();
                }
                return this.parseImport( this.startNode() );
            case tokTypes._when:
                return this.parseWhenStatement( this.startNode() );
            case tokTypes._enum:
                return this.parseEnumStatement( this.startNode(), topLevel );
            case tokTypes._interface:
                if( !topLevel ) { this.unexpected(); }
                return this.parseInterface( this.startNode(), topLevel );
            default:
        }
        if( topLevel && this.value ==="declarator" ){
            return this.parseDeclarator( this.startNode(), topLevel );
        }
        if( this.type === tokTypes.name && this.value ==="await" && !this.inAsync){
            return this.parseAwait();
        }
        return super.parseStatement(context, topLevel, exports);
    }

    parseMaybeConditional(noIn, refDestructuringErrors)
    {
        if( this.type === tokTypes._enum )
        {
            this.raise(this.lastTokEnd, "Enum expression is not assignable");
        }
        return super.parseMaybeConditional(noIn, refDestructuringErrors);
    }

    parseWhenStatement(node) 
    {
        const currentScope = this.currentScope();
        const inherit = (scope, inherit)=>{
            scope.var = scope.var.concat( inherit.var );
            scope.lexical = scope.lexical.concat( inherit.lexical );
            scope.functions = scope.functions.concat( inherit.functions );
        };

        this.next();
        node.test = this.parseParenExpression();
        this.enterScope( SCOPE_FUNCTION );
        const whenScope = this.currentScope()
        inherit( whenScope, currentScope);
        node.consequent = super.parseStatement("when");
        this.exitScope();

        this.enterScope( SCOPE_FUNCTION );
        const thenScope = this.currentScope()
        inherit(thenScope, currentScope);
        node.alternate = this.eat(tokTypes._then) ? super.parseStatement("then") : null;
        this.exitScope();

        inherit(currentScope, whenScope);
        inherit(currentScope, thenScope);
        return this.finishNode(node, "WhenStatement");
    }

    parseEnumStatement(node) 
    {
        this.next();
        if (this.type === tokTypes.name)
        {
            node.name = this.value;
        } else {
            this.unexpected();
        }

        this.next();
        if( this.type === tokTypes._extends  )
        {
            this.next();
            node.extends = this.parseChainIdentifier();
        }

        this.expect( tokTypes.braceL );
        node.value = this.parseExpression();
        this.expect( tokTypes.braceR );
        return this.finishNode(node, "EnumDeclaration")
    }

    parseInterfaceMethod(element) 
    {
        var node = this.startNode();
        this.expect(tokTypes.parenL);
        node.params = this.parseBindingList(tokTypes.parenR, false, true);
        this.finishNode(node, "FunctionExpression")
        this.finishNode(element, "MethodDefinition");
        return node;
    }

    parseInterfaceElement()
    {
        if( this.eat( tokTypes.bracketL ) )
        {
            return this.parseMetatype();
        }

        if( this.type === tokTypes._annotation )
        {
            return this.parseAnnotation();
        }

        if (this.eat(tokTypes.semi))
        {
             return null
        }

        const parserProperty = (kind)=>{
            this.next();
            const node = this.startNode();
            node.declarations = [];
            node.kind = kind;
            const decl = this.startNode();
            decl.id = this.parseIdent();
            if (this.eat(tokTypes.eq)) {
               this.raise(this.lastTokEnd, "Interface property cannot have initialization value"); 
            }
            node.declarations.push(this.finishNode(decl, "VariableDeclarator"));
            this.semicolon();
            return this.finishNode(node, "VariableDeclaration");
        };

        const modifier = this.parseModifier();
        const isProperty = this.type === tokTypes._const || this.type === tokTypes._var;
        const element = isProperty ? parserProperty(this.value) : this.startNode();
        if( !isProperty )
        {
            var tryContextual = (k, noLineBreak)=>{
                if ( noLineBreak === void 0 ) noLineBreak = false;
                var start = this.start, startLoc = this.startLoc;
                if (!this.eatContextual(k)) { return false }
                if (this.type !== tokTypes.parenL && (!noLineBreak || !this.canInsertSemicolon())) { return true }
                if (element.key) { this.unexpected(); }
                element.computed = false;
                element.key = this.startNodeAt(start, startLoc);
                element.key.name = k;
                this.finishNode(element.key, "Identifier");
                return false
            };
        
            const isGenerator = this.eat(tokTypes.star);
            element.kind    = "method";
            element.isAsync = tryContextual("async", true);
            element.isGenerator = isGenerator;

            if (tryContextual("get")) {
                element.kind = "get";
            } else if (tryContextual("set")) {
                element.kind = "set";
            }

            if (!element.key)
            { 
                this.parsePropertyName(element);
            }
        
            var key = element.key;
            if ( key.name === "constructor" )
            {
                this.raise(key.start, "Interface can't have Constructor");

            } else if( key.name === "prototype" ) 
            {
                this.raise(key.start, "Interface may not have a property named prototype");
            }
            element.value = this.parseInterfaceMethod(element);
            if (element.kind === "get" && element.value.params.length !== 0)
                { this.raiseRecoverable(element.value.start, "getter should have no params"); }
            if (element.kind === "set" && element.value.params.length !== 1)
                { this.raiseRecoverable(element.value.start, "setter should have exactly one param"); }
            if (element.kind === "set" && element.value.params[0].type === "RestElement")
                { this.raiseRecoverable(element.value.params[0].start, "Setter cannot use rest params"); }

            if( this.eat( tokTypes.colon ) )
            {
                element.value.returnType = this.parseTypeStatement();
            }

        }else{

            if( element.declarations.length > 1 )
            {
                this.raise( element.start , `Interface member properties can only be declared one at a time.`)
            }
            if(  element.declarations[0].init )
            {
                this.raise( element.start , `Interface member properties cannot be have initial value.`)
            }
            this.finishNode(element, "PropertyDefinition");
        }

        if ( modifier[0] )
        {
            element.modifier =  modifier[0];
            if( element.modifier.name !=="public" )
            {
                this.raise( modifier[0].start , `Interface member can only be "public" modifier.`)
            }
        }

        if( modifier[1] )
        {
            this.raise( modifier[1].start, `Interface member cannot use "static" modifier `)
        }
        return element;
    }

    parseInterface(node) {

        this.next();
        var oldStrict = this.strict;
        this.strict = true;
        this.parseClassId(node, true);

        if( this.type === tokTypes._extends  )
        {
            this.next();
            node.extends = this.parseChainIdentifier();
        }

        var classBody = this.startNode();
        classBody.body = [];
        this.expect(tokTypes.braceL);

        while (this.type !== tokTypes.braceR) 
        {
          var element = this.parseInterfaceElement();
          if (element) {
            classBody.body.push(element);
          }
        }
        this.strict = oldStrict;
        this.next();
        node.body = this.finishNode(classBody, "InterfaceBody");
        return this.finishNode(node,  "InterfaceDeclaration")
    }


    parseDeclarator(node)
    {
        this.next();
        var oldStrict = this.strict;
        this.strict = true;
        this.parseClassId(node, true);

        if( this.type === tokTypes._extends  )
        {
            this.next();
            node.extends = this.parseChainIdentifier();
        }

        var classBody = this.startNode();
        classBody.body = [];
        this.expect( tokTypes.braceL );

        while (this.type !== tokTypes.braceR) 
        {
          var element = this.parseDeclaratorElement();
          if (element) 
          {
              classBody.body.push(element);
          }
        }
        this.strict = oldStrict;
        this.next();
        node.body = this.finishNode(classBody, "DeclaratorBody");
        return this.finishNode(node,  "DeclaratorDeclaration")
    }

    parseDeclaratorElement()
    {
        if( this.eat( tokTypes.bracketL ) )
        {
            return this.parseMetatype();
        }

        if( this.type === tokTypes._annotation )
        {
            return this.parseAnnotation();
        }

        if (this.eat(tokTypes.semi))
        {
             return null
        }

        const modifier = this.parseModifier();
        const isProperty = this.type === tokTypes._const || this.type === tokTypes._var;
        const element = isProperty ? this.parseVarStatement( this.startNode(), this.value ) : this.startNode();
        if( !isProperty )
        {
            var tryContextual = (k, noLineBreak)=>{

                if ( noLineBreak === void 0 ) noLineBreak = false;
                var start = this.start, startLoc = this.startLoc;
                if (!this.eatContextual(k)) { return false }
                if (this.type !== tokTypes.parenL && (!noLineBreak || !this.canInsertSemicolon())) { return true }
                if (element.key) { this.unexpected(); }
                element.computed = false;
                element.key = this.startNodeAt(start, startLoc);
                element.key.name = k;
                this.finishNode(element.key, "Identifier");
                return false
            };
        
            const isGenerator = this.eat(tokTypes.star);
            element.kind    = "method";
            element.isAsync = tryContextual("async", true);
            element.isGenerator = isGenerator;

            if (tryContextual("get")) {
                element.kind = "get";
            } else if (tryContextual("set")) {
                element.kind = "set";
            }

            if (!element.key)
            { 
                this.parsePropertyName(element);
            }

            var key = element.key;
            if( key.name === "prototype" )
            {
                this.raise(key.start, "Declarator may not have a property named prototype");
            }
            
            element.value = this.parseInterfaceMethod(element);
            if (element.kind === "get" && element.value.params.length !== 0)
                { this.raiseRecoverable(element.value.start, "getter should have no params"); }
            if (element.kind === "set" && element.value.params.length !== 1)
                { this.raiseRecoverable(element.value.start, "setter should have exactly one param"); }
            if (element.kind === "set" && element.value.params[0].type === "RestElement")
                { this.raiseRecoverable(element.value.params[0].start, "Setter cannot use rest params"); }

            if( this.eat( tokTypes.colon ) )
            {
                element.value.returnType = this.parseTypeStatement();  
            }

        }else{

            if( element.declarations.length > 1 )
            {
                this.raise( element.start , `Declarator member properties can only be declared one at a time.`)
            }
            this.finishNode(element, "PropertyDefinition");
        }

        if ( modifier[0] )
        {
            element.modifier =  modifier[0];
        }

        if ( modifier[1] )
        {
            element.static =  modifier[1];
        }

        return element;
    }

    readToken( code ){
        //@
        if( code === 64 ){
            ++this.pos; 
            return this.finishToken(tokTypes._annotation);
        } 
        return super.readToken(code);
    }

    finishToken(type, word){
        if( word === "as" ){
            type = tokTypes._as;
        }
        return super.finishToken(type, word);
    }

    parseClassSuper(node)
    {
        node.superClass = null;
        if(  this.eat(tokTypes._extends) )
        {
            if( this.isStaticClass )
            {
                this.raise(this.lastTokStart,"Static class cannot extends super class.");
            }
            node.superClass = this.parseChainIdentifier();
        }
        
        node.implements = null;
        if( this.eat(tokTypes._implements) )
        {
            if( this.isStaticClass )
            {
                this.raise(this.lastTokStart,"Static class cannot implements interfaces.");
            }

            node.implements = [];
            do{ 
                node.implements.push( this.parseChainIdentifier() );
            }while( this.eat(tokTypes.comma) );
        }
    }

    parseClassId(node, isStatement)
    {
        super.parseClassId(node, isStatement);
        node.id.genericity = this.parseGenericType();
        this.currentClassId = node.id;
    }

    parsePropertyName(prop){
        const node = super.parsePropertyName(prop);
        node.genericity = this.parseGenericType();
        return node;
    }

    parseFunctionParams(node){
        node.genericity = this.parseGenericType();
        super.parseFunctionParams(node);
    }

    parseGenericType(){
        if( this.type === tokTypes.relational && this.value && this.value.charCodeAt(0) === 60 ) 
        {
            const genericNode = this.startNode(); 
            const elements = [];
            this.next();
            do{
                const type = this.parseTypeStatement();
                elements.push( type );
                if( this.eat(tokTypes._extends) ){
                    // if( tokTypes.name === this.type && this.value ==="keyof"){
                    //     const node = this.finishNode(this.startNode(), "KeyofDefinition"); 
                    //     node.value = this.parseTypeStatement();
                    //     type.extends = node;
                    //     this.next();
                    // }else{
                        type.extends = this.parseTypeStatement();
                    //}
                }
            }while( this.eat(tokTypes.comma) );
            if( !(this.type===tokTypes.relational && this.value.charCodeAt(0) === 62) ){
                this.unexpected();
            }else{
                this.next();
            }
            genericNode.elements = elements;
            return this.finishNode(genericNode, "GenericTypeDefinition");
        }
        return null;
    }

    parseChainIdentifier()
    {
        const startPos = this.start, startLoc = this.startLoc;
        const type = this.type;
        var base = super.parseIdent( type === tokTypes._void );
        this.checkLVal(base, BIND_NONE);
        while ( this.eat( tokTypes.dot ) ) 
        {
            const node = this.startNodeAt(startPos, startLoc);
            node.object = base;
            node.property = this.parseIdent( this.options.allowReserved !== "never" );
            base = this.finishNode(node, "MemberExpression");
        }
        return base;
    }

    parseTypeStatement()
    {
        const node = this.startNode();
        let typeName = "TypeDefinition";
        if( this.eat(tokTypes.ellipsis) ){
            node.restElement = true;
            node.isArrayElement = true;
        }
       
        if( (this.type === tokTypes.name || this.type  === tokTypes._void) && this.type !== tokTypes.eof )
        {
            node.value = this.parseChainIdentifier();
            /*if( this.type === tokTypes.relational && this.value.charCodeAt(0) === 60 && this.value.length===1 )
            {
                this.next();
                const elements = [];
                while( !( this.type === tokTypes.relational && this.value.charCodeAt(0) === 62 && this.value.length===1 ) )
                {
                    elements.push( this.parseTypeStatement() );
                    if( !this.eat(tokTypes.comma) )
                    {
                        break;
                    }
                } 
                this.next();
                node.typeElements = elements;
                node.isArrayElement = true;

            }else*/ if(  this.eat(tokTypes.bracketL) ){

                if( this.type !== tokTypes.bracketR ){
                    this.unexpected(); 
                }
                this.next();
                node.isArrayElement = true;
            }

        }else if( this.eat(tokTypes.bracketL) ){
            const elements = [];
            while( !(this.type === tokTypes.bracketR) )
            {
                elements.push( this.parseTypeStatement() );
                if( !this.eat(tokTypes.comma) )
                {
                    break;
                }
            } 
            if( this.type !== tokTypes.bracketR ){
                this.unexpected(); 
            }
            this.next();
            node.typeElements = elements;
            node.isArrayElement = true;
        }else
        {
            this.unexpected();
        }

        this.finishNode(node, typeName );
        if( this.eat(tokTypes.bitwiseOR) ){
            node.union = this.parseTypeStatement();
        }
        return node;
    }

    parseBlock(createNewLexicalScope, node)
    {
        if ( createNewLexicalScope === void 0 )
        {
            createNewLexicalScope = true;
        } 

        if ( node === void 0 ) 
        {
            node = this.startNode();
        }

        const scope = this.currentScope();
        switch( scope.flags & SCOPE_FUNCTION )
        {
            case SCOPE_ARROW :
            case SCOPE_FUNCTION :
            case SCOPE_ASYNC :
            case SCOPE_GENERATOR :
                if( this.eat( tokTypes.colon ) )
                {
                   node.acceptType = this.parseTypeStatement();
                }
                break;
        }
        return super.parseBlock(createNewLexicalScope, node);
    }

    parseIdent(liberal, isBinding){
        const node = super.parseIdent(liberal, isBinding);
        if( !liberal && this.eat( tokTypes.colon ) ){
            node.acceptType =  this.parseTypeStatement();
        }
        return node;
    }

    parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc){
       if( isPattern && this.eat( tokTypes.colon )  ){
           prop.acceptType = this.parseTypeStatement();
       }
       super.parsePropertyValue(prop, isPattern, isGenerator, isAsync, startPos, startLoc, refDestructuringErrors, containsEsc);
    }

    parseRestBinding(){
        const node = super.parseRestBinding();
        if( node.argument && node.argument.acceptType ){
           const acceptType = node.argument.acceptType 
           if( !acceptType.isArrayElement )
           {
              this.raise(acceptType.value.start,"A rest parameter must be of an array type.");
           }
        }
        return node;
    }

    parseAnnotation(){
        this.next();
        const node = this.startNode();
        node.name = this.value;
        this.next();
        if( this.eat( tokTypes.parenL ) ){
            node.body = [];
            while( this.type !== tokTypes.parenR ){
                const elem = this.startNode();
                const left = this.startNode();
                elem.name = this.value;
                left.name = this.value;
                this.next();
                if( this.eat(tokTypes.eq) )
                {
                    elem.left =  this.finishNode(left,"Identifier")
                    elem.right = this.parseMaybeAssign();
                }
                node.body.push( elem )
                if( elem.right ){
                    this.finishNode(elem, "AssignmentExpression");
                }else{
                    this.finishNode(elem, "Identifier");
                }
                if( !this.eat(tokTypes.comma) )
                {
                    break;
                }
            }
            this.expect( tokTypes.parenR );
        }
        return this.finishNode(node, "AnnotationDeclaration");
    }

    parseMetatype(){
        const node = this.startNode();
        node.name = this.value;
        this.next();
        if( this.eat( tokTypes.parenL )  ){
            node.body = [];
            while( this.type !== tokTypes.parenR ){
                const elem = this.startNode();
                const left = this.startNode();
                elem.name = this.value;
                left.name = this.value;
                this.next();
                if( this.eat(tokTypes.eq) ){
                    elem.left =  this.finishNode(left,"Identifier")
                    elem.right = this.parseMaybeAssign();
                }
                node.body.push( elem )
                if( elem.right ){
                    this.finishNode(elem, "AssignmentExpression");
                }else{
                    this.finishNode(elem, "Identifier");
                }
                if( !this.eat(tokTypes.comma) )
                {
                    break;
                }
            }
            this.expect( tokTypes.parenR );
        }
        this.expect( tokTypes.bracketR );
        return this.finishNode(node, "MetatypeDeclaration");
    }

    parseMaybeAssign(noIn, refDestructuringErrors, afterLeftParse){
        let genericity = null;
        let start = this.start;
        if (this.type === tokTypes.relational) {
            genericity = this.parseGenericType();
        }
        const node = super.parseMaybeAssign(noIn, refDestructuringErrors, afterLeftParse);
        if( genericity ){
            if( node.type !=="ArrowFunctionExpression" ) {
                this.unexpected( start );
            }
            node.genericity = genericity;
        }
        return node;
    }



    parseOverride(){
        if( this.type === tokTypes._override ){
            const override = this.startNode();
            override.name = "override";
            this.next();
            this.finishNode(override, "ModifierDeclaration");
            return override;
        }
        return null;
    }

    parseModifier()
    {
        let staticNode = this.parseMethodStatic();
        let overrideNode = this.parseOverride();
        let modifier = this.startNode();
        modifier.name = "public";
        for(let name of ["public","protected","private"] )
        {
            if( this.eat( tokTypes[ "_"+name ] ) )
            {
                modifier.name = name;
                break;
            }
        }
        this.finishNode(modifier, "ModifierDeclaration");
        if( !staticNode )
        {
            staticNode = this.parseMethodStatic();
        }
        if( !overrideNode )
        {
            overrideNode = this.parseOverride();
        }
        return [modifier,staticNode,overrideNode];
    }

    parseMethodStatic()
    {
        let staticNode = null;
        if( tokTypes._static === this.type )
        {
            staticNode = this.startNode();
            staticNode.name = "static";
            this.next();
            this.finishNode(staticNode, "ModifierDeclaration");
        }
        return staticNode;
    }

    parseClassProperty(node,kind)
    {
        node = this.parseVarStatement( node, this.value );
        if( node.declarations.length > 1)
        {
            this.raise( node.start, `Only one class property member can be defined in a declaration`);
        } 
        return this.finishNode(node, "PropertyDefinition");        
    }

    parseClass(node, isStatement, isAbstract,isStatic )
    {
        this.isAbstractClass = isAbstract;
        this.isStaticClass   = isStatic;
        node = super.parseClass(node, isStatement);
        this.isAbstractClass = false;
        this.isStaticClass   = false;
        this.currentClassId = null;
        this.hasConstructor = false;
        return node;
    }

    parseClassElement( constructorAllowsSuper )
    {
        if( this.eat( tokTypes.bracketL ) )
        {
            return this.parseMetatype();
        }

        if( this.type === tokTypes._annotation )
        {
            return this.parseAnnotation();
        }

        const modifier = this.parseModifier();
        const isProperty = this.type === tokTypes._const || this.type === tokTypes._var;
        const element = isProperty ? this.parseClassProperty( this.startNode(), this.value ) : super.parseClassElement( constructorAllowsSuper );
        const isConstruct = !isProperty && element && ( (element.key && element.key.name.toLowerCase()==="constructor") || 
                                        (this.currentClassId && this.currentClassId.name === element.key.name)
                                    );                  

        if( this.isAbstractClass && isConstruct )
        {
            this.raise( element.start, `Abstract class cannot defined constructor.`);
        }   
        
        if( this.isStaticClass && isConstruct )
        {
            this.raise( element.start, `Static class cannot defined constructor.`);
        }

        if( isConstruct )
        {
            if( this.hasConstructor )
            {
                this.raise( this.lastTokStart, `Constructor has already been defined.`);
            }

            this.hasConstructor = true;
        }
        
        if ( modifier[0] )
        {
            element.modifier =  modifier[0];
            if( element.modifier.name !=="public" && isConstruct )
            {
                this.raise( element.key.start, `Constructor modifier can only be "public".`)
            }
        }

        if( modifier[1] )
        {
            element.static =  modifier[1];
            if( isConstruct )
            {
                this.raise( element.key.start, `Constructor cannot is static method.`)
            }
        }

        if( modifier[2] ){
            element.override = modifier[2];
            if(isProperty){
                this.raise( element.override.start, `property is not used override modifier`);
            }   
        }   

        return element;
    }

    parseImport(node)
    {
        this.next();
        if( this.type !== tokTypes.name )
        {
            this.unexpected();
        }
        node.specifiers= this.parseStatement("import");
        this.finishNode(node.specifiers, "ImportSpecifier");
        return this.finishNode(node, "ImportDeclaration");
    }

    parseExport()
    {
        this.raise( this.lastTokStart, `Class do not need to use an export.`);
    }

    parsePackage(node, isStatement)
    {
        this.next();

        if( this.hasPackage )
        {
            this.raise( this.lastTokStart, `Package has already been defined.`);
        }

        var oldStrict = this.strict;
        this.strict = true;
        this.hasPackage = true;
        this.declarator = false;
        node.body = [];
        node.id = null;

        if( this.type === tokTypes.semi )
        {
            this.next();

        }else if(  tokTypes.braceL !== this.type )
        {
            node.id = this.parseChainIdentifier();
        }

        const metatype = ()=>{

            if( this.eat( tokTypes.bracketL ) )
            {
                return this.parseMetatype();
            }
    
            if( this.type === tokTypes._annotation )
            {
                return this.parseAnnotation();
            }
            return null;
        }

        if( this.eat(tokTypes.braceL) )
        {
            while( !this.eat(tokTypes.braceR) )
            {
                const item = metatype();
                if( item )
                {
                   node.body.push(item);
                }
                var element = this.parseStatement(null,true);
                node.body.push(element);
            }

        }else
        {
            while( tokTypes.eof !== this.type )
            {
                const item = metatype();
                if( item ){
                    node.body.push(item);
                }
                var element = this.parseStatement(null,true);
                node.body.push(element);
            }
        }

        this.strict = oldStrict;
        return this.finishNode(node,  "PackageDeclaration")
    }

    eat( type ){
       if( tokTypes.arrow === type){
           if( super.eat( tokTypes.colon ) ){
                this.arrowReturnType = this.arrowReturnType || {};
                const type = this.parseTypeStatement();
                this.arrowReturnType[ this.lastTokEnd ] = type;
           }
       }
       return super.eat( type );
    }

    parseArrowExpression(node, params, isAsync){
        let type = null;
        if( this.arrowReturnType && this.arrowReturnType[ this.lastTokStart ] ){
            type = this.arrowReturnType[  this.lastTokStart ];
            delete this.arrowReturnType[ this.lastTokStart ];
        }
        const fn = super.parseArrowExpression( node, params, isAsync );
        fn.returnType = type;
        return fn;
    }

    parseParenAndDistinguishExpression(canBeArrow){
       const node = super.parseParenAndDistinguishExpression(canBeArrow);
       if(node.type ==="ParenthesizedExpression" && !this.canInsertSemicolon() && this.value ){
          node.value= this.parseExprAtom();
       }
       return node;
    }

    parseExprOp(left, leftStartPos, leftStartLoc, minPrec, noIn){
        if( this.type === tokTypes._as ){
           this.next();
           var prec = this.type.binop;
           var startPos = this.start, startLoc = this.startLoc;
           var right = this.parseExprOp(this.parseMaybeUnary(null, false), startPos, startLoc, prec, noIn);
           var node = this.startNodeAt(startPos, startLoc);
           node.left = left;
           node.right = right;
           return this.finishNode(node,  "TypeAssertExpression");
        }
        if( this.type === tokTypes.relational && this.value && this.value.charCodeAt(0) === 60 ){
            const [content] = this.input.slice(this.start).split(lineBreak,1);
            const str = content.replace(/\s+/g,'');
            if( /\>\(/.test(str) && /\)\;?$/.test(str) ){
                this.next();
                const genericity = [];
                while( this.type !== tokTypes.relational ){
                    genericity.push( this.parseExprSubscripts(null,false) );
                    this.eat( tokTypes.comma );
                }
                this.expect( tokTypes.relational );
                if( tokTypes.parenL !== this.type ){
                    this.unexpected();
                }
                const node = this.parseSubscripts(left, this.start, this.startLoc);
                node.genericity = genericity;
                return node;
            }
        }
        return super.parseExprOp(left, leftStartPos, leftStartLoc, minPrec, noIn);
    }

    parseFunctionBody(node, isArrowFunction, isMethod)
    {
        if( !isArrowFunction && this.type === tokTypes.colon )
        {
            this.next();
            node.returnType = this.parseTypeStatement();
        }
        super.parseFunctionBody(node, isArrowFunction, isMethod);
    }

}

Parser.extend(function(){
    return SyntaxParser;
});

SyntaxParser.parse = function parse (input, options) {
    options = Object.assign( {preserveParens:true}, options||{} )
    return new SyntaxParser(options, input).parse()
};

SyntaxParser.parseExpressionAt = function parseExpressionAt (input, pos, options) {
    var parser = new SyntaxParser(options, input, pos);
    parser.nextToken();
    return parser.parseExpression()
};

module.exports= {
    acorn,
    Parser:SyntaxParser
}