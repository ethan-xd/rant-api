import { execFile, ChildProcess } from "child_process"
import { Socket } from "net"

export default class Rant {
    private dotnet: string
    private rantTcp: string
    private port: number
    private started = false
    private server: ChildProcess
    private client: Socket

    constructor(dotnet: string, rantTcp: string, port: number) {
        this.dotnet = dotnet
        this.rantTcp = rantTcp
        this.port = port
    }

    async start(): Promise<void> {
        this.startServer()
        for (;;) {
            try {
                await this.startClient()
                break;
            } catch(e) {
                // LAWL
            }
        }
        this.started = true
    }

    stop() {
        if (!this.started) {
            throw new Error("Cannot stop a server that's not running")
        } else {
            this.server.kill()
            this.client.destroy()
            this.started = false
        }
    }

    startServer() {
        let args = [this.rantTcp, this.port.toString()]
        console.log([this.dotnet, ...args].join(' '))
        this.server = execFile(this.dotnet, args)
    }

    startClient() {
        return new Promise((resolve, reject) => {
            this.client = new Socket()
            this.client.on("error", reject);
            this.client.connect(this.port, "127.0.0.1", () => {
                resolve()
            })
        })
    }

    parse(request: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.started) {
                throw new Error("Not yet started, call the start function before parsing.")
            }
            request = request.replace(/(\r|\n|\r\n)/g, "\\n")
            this.client.write(request + "\n", "utf8")

            // once will only fire once, and then remove the handler
            this.client.once('data', (data) => {
                let response = data.toString()
                if (response.startsWith("0")) {
                    resolve(response.substr(1).trim()) // resolve with output data
                } else {
                    reject(response.substr(1).trim()) // reject with err msg
                }
            })
        })
    }
}