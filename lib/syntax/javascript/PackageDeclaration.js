const Syntax = require("./Syntax");
class PackageDeclaration extends Syntax{
   emit(syntax){

        const module = this.compilation.module;
        const methods = module.methods;
        const members = module.members;
        const properties = [];
        const content = [];
        const emiterItem=(item)=>{
            const metatypes = item.metatypes;
            const annotations = item.annotations;
            const modifier = item.modifier ? item.modifier.value() : 'public';
            const value = item.isPropertyDefinition && item.init ? item.init.emit(syntax) : item.emit(syntax);
            if( value ){
                if( item.isPropertyDefinition ){
                    properties.push( value );
                    if( modifier !=="private" && item.init ){
                        return value;
                    }
                }else{
                    return value;
                }
            }
            return null;
        }
        const emiter=(target,proto)=>{
            for( var name in target ){
                const item = target[ name ];
                if( item.isAccessor ){
                    const getter = item.get ? emiterItem(item.get) : null;
                    const setter = item.set ? emiterItem(item.set) : null;
                    content.push(`\tObject.definProperty(${proto}, "${name}",{get:${getter},\r\n\tset:${setter}});`);
                }else{
                    const value = emiterItem(item);
                    content.push(`\tObject.definProperty(${proto}, "${name}", {value:${value}});`);
                }
            }
        }
        emiter( methods , module.id);
        emiter( members , `${module.id}.prototype`);
        const parentClass =  module.extends.length > 0 ? module.extends[0].id : 'Object';
        const callSuper = module.extends.length > 0 ? `${module.extends[0].id}.call(this);` : '';
        const construct = module.methodConstructor ? module.methodConstructor.emit( syntax ) : `function constructor(){${callSuper}}`;
        const ns = module.namespace.getChain().join(".");
        const code = [
            `(function(ns){`,
            `\tvar ${module.id}=${construct}`,
            `\tObject.definProperty(${module.id},"prototype",{value:Object.create(${parentClass}.prototype});`,
            `\tObject.definProperty(${module.id}.prototype,"constructor",{value:${module.id}});`,
            content.join("\r\n"),
            `\tns.${module.id}=${module.id};`,
            `})(ns.${ns});`
        ];
        return code.join("\r\n");
   }
}

module.exports = PackageDeclaration;