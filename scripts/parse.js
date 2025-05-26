const abi = require('../abi/marketplace-abi.json')
const path = require('path');
const fs = require('fs');

let methods = abi.methods

async function main() {
  let methodsKeys = Object.keys(methods)

  methodsKeys.map(methodName => {
    let method = methods[methodName]
    if(method.hasOwnProperty("input")) {
      method.argument = method.input;
      delete method.input;
    }
    if(method.hasOwnProperty("output")) {
      method.return = method.output;
      delete method.output;
    }
    if(method.hasOwnProperty("entryPoint")) {
      method.entry_point = method.entryPoint;
      delete method.entryPoint;
    }
    if(method.hasOwnProperty("readOnly")) {
      method.read_only = method.readOnly;
      delete method.readOnly;
    }
    methods[methodName] = method;
  })
  abi.methods = methods;
  fs.writeFileSync(path.resolve(__dirname, '../abi/marketplace-abi.json'), JSON.stringify(abi, null, 2));
}

main()
  .catch(error => console.error(error));


