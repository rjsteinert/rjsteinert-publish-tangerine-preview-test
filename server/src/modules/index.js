class TangyModules {

  constructor() {
    
    let enabledModules = process.env.T_MODULES
      ? JSON.parse(process.env.T_MODULES.replace(/\'/g,`"`))
      : []
    this.modules = enabledModules.map(moduleName => {
      let requiredModule
      try {
        requiredModule = require(`/tangerine/server/src/modules/${moduleName}/index.js`)
        return requiredModule
      } catch (e) {
        console.log(`Error loading module ${moduleName} Error: ${e} `)
      }
    })
    this.enabledModules = enabledModules
  }

  async hook(hookName, data) {
    for (let module of this.modules) {
      if (module) {
        if(module.hasOwnProperty('hooks') && module.hooks.hasOwnProperty(hookName)) {
          data = await module.hooks[hookName](data)
        }
      }
    }
    return data;
  }

}

module.exports = function() {
  return new TangyModules()
}