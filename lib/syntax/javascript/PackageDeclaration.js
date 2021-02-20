const Utils = require("../../Utils");
const Syntax = require("./Syntax");
class PackageDeclaration extends Syntax{

    makeClass(syntax){
        const module = this.compilation.module;
        const methods = module.methods;
        const members = module.members;
        const properties = [];
        const content = [];
        const make=(item,name,modifier)=>{
            if( !item )return null;
            const metaTypes = item.metatypes;
            const annotations = item.annotations;
            if( !this.checkMetaTypeSyntax(metaTypes) ){
                return null;
            }
            const value = item.isPropertyDefinition && item.init ? item.init.emit(syntax) : item.emit(syntax);
            if( value ){
                if( item.isPropertyDefinition ){
                    if( !item.static ){
                        properties.push(`"${name}":${value||null}`);
                        return null;
                    }
                    return value;
                }else{
                    return value;
                }
            }
            return null;
        }
        const emiter=(target,proto)=>{
            for( var name in target ){
                const item = target[ name ];
                const modifier = item.modifier ? item.modifier.value() : 'public';
                if( item.isPropertyDefinition && !item.static ){
                    make(item,name,modifier);
                    if( modifier !=="private" ){
                        const getter = `function get${Utils.firstToUpper(name)}(){\r\n\t\treturn this[private].${name};\r\n\t}`;
                        const setter = `function set${Utils.firstToUpper(name)}(value){\r\n\t\tthis[private].${name}=value;\r\n\t}`;
                        content.push(this.defineProperty(proto,name,{
                            get:getter,
                            set:setter
                        },true));
                    }
                }else if( item.isAccessor ){
                    content.push(this.defineProperty(proto,name,{
                        get:make(item.get,name,modifier),
                        set:make(item.set,name,modifier)
                    },true));
                }else{
                    content.push(this.defineProperty(proto,name,make(item,name,modifier)));
                }
            }
        }
        emiter( methods , module.id);
        emiter( members , `${module.id}.prototype`);
        const parentClass =  module.extends.length > 0 ? module.extends[0].id : 'Object';
        const callSuper = module.extends.length > 0 ? `${module.extends[0].id}.call(this);` : '';
        if( properties.length > 0 ){
            module.methodConstructor.once("fetchClassProperty",(event)=>{
                event.properties = `{${properties.join(",")}}`;
            });
        }
        const construct = module.methodConstructor ? module.methodConstructor.emit( syntax ) : `function ${module.id}(){${callSuper}}`;
        const imps   = this.getImps(module);
        const inherit = this.getInherit(module);
        const refs = [`\tvar private=Symbol("private");`];
        const description = [`\t\t"private":private`];
        if( imps.length > 0 ){
            description.push(`\t\t"imps":[${imps.map(item=>item.id).join(",")}]`);
        }
        if( inherit ){
            description.push(`\t\t"inherit":${inherit.id}`);
        }
        module.imports.forEach(module=>{
            if( module.used ){
                refs.push(`\tconst ${module.id} = global.getClass(${this.getIdByModule(module)});`);
            }
        });
        const code = [
            `(function(global){`,
            refs.join("\r\n"),
            `\t${construct}`,
            this.defineProperty(module.id,'prototype',`Object.create(${parentClass}.prototype)`),
            this.defineProperty(`${module.id}.prototype`,'constructor',module.id),
            content.join("\r\n"),
            `\tglobal.setClass(${this.getIdByModule(module)},${module.id},${this.getDescription(description)});`,
            `})(global);`
        ];
        return code.filter( value=>!!value ).join("\r\n");
    }
    makeInterface(syntax){
        const module = this.compilation.module;
        const imps   = this.getImps(module);
        const inherit = this.getInherit(module);
        const refs = [];
        const description = [];
        if( imps.length > 0 ){
            description.push(`\t\t"imps":[${imps.map( item=>item.id ).join(",")}]`);
        }
        if( inherit ){
            description.push(`\t\t"inherit":${inherit.id}`);
        }
        module.imports.forEach(module=>{
            if( module.used ){
                refs.push(`\tconst ${module.id} = global.getClass(${this.getIdByModule(module)});`);
            }
        });
        const code = [
            `(function(global){`,
            refs.join("\r\n"),
            `\tfunction ${module.id}(){}`,
            this.defineProperty(`${module.id}.prototype`,'constructor',module.id),
            `\tglobal.setClass(${this.getIdByModule(module)},${module.id},${this.getDescription(description)});`,
            `})(global);`
        ];
        return code.filter( value=>!!value ).join("\r\n");
    }
    defineProperty(target,name,value,isAccessor){
        const option = this.getSyntaxOption();
        if( isAccessor ){
            const accessor = [];
            if( value.get ){
                if( option.target === "es5" ){
                    accessor.push( this.defineProperty(target, `get`+Utils.firstToUpper(name), value.get) );
                }else{
                    accessor.push(`\tget:`+value.get);
                }
            }
            if( value.set ){
                if( option.target === "es5" ){
                    accessor.push( this.defineProperty(target, `set`+Utils.firstToUpper(name), value.set) );
                }else{
                    accessor.push(`\tset:`+value.set);
                }
            }
            if( option.target === "es5" ){
                return accessor.join("\r\n");
            }
            return `\tObject.defineProperty(${target},"${name}",{\r\n${accessor.join(",\r\n")}});`;
        }
        if( option.useDefineProperty ){
            return `\tObject.defineProperty(${target},"${name}",{value:${value}});`;
        }
        return `\t${target}.${name}=${value};`
    }
    getDescription(description){
       if( description.length >0 ){
           return `{\r\n${description.join(",\r\n")}\r\n\t}`;
       }
       return `{}`;
    }
    getImps(module){
        return module.implements.filter( module=>module.used && module.isInterface );
    }
    getInherit(module){
        const inherit = module.extends.filter( module=>module.used && module.isClass );
        return inherit[0] || null;
    }
    emit(syntax){
        const module = this.compilation.module;
        if( module.isClass ){
            return this.makeClass(syntax);
        }else if( module.isInterface ){
            return this.makeInterface(syntax);
        }
        return '';
    }
}

module.exports = PackageDeclaration;