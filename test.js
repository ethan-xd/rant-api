const Rant = require("./rant/lib/index.js").default;

let port = 25550;
let rant = new Rant("C:\\Program Files\\dotnet\\dotnet.exe", "./rant/assets/rant/rant-tcp.dll", port);

(async ()=>{
    const rantyWanty = await rant.start();

    const leText = await rant.parse(process.argv[2]);
    console.log(leText);
})();