# Valve Master Node.js
OUTDATED, DOES NO LONGER WORK!

Node.js Valve Master Server Query Protocol implementation (client to master only)

The protocol specification can be found here: https://developer.valvesoftware.com/wiki/Master_Server_Query_Protocol

Usage
-----
Install with npm:

    npm install valve-master

Example

```js
var ValveMaster = require('valve-master');

var vm = new ValveMaster(3000);

vm.query('\\appid\\221100',vm.WORLD,'hl2master.steampowered.com',27011,function(err,ips){
	if(!err){
		console.log(ips);
	}
	vm.close();
});
```
