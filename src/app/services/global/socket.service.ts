declare let io: any;

export class SocketService {
    socket: any;

    Initialize() {
        this.socket = io();
    }

    IsSocketExists() {
        return !!this.socket;
    }

    private ConvertArrayToString(params: any[]): string {
        let paramsString = '';

        if (!params || params.length == 0) {
            return null;
        }
        else {
            params.forEach((param: any) => {
                if (typeof (param) == "object") {
                    paramsString += JSON.stringify(param);
                }
                else if (typeof (param) == "string") {
                    paramsString += "'" + param + "'";
                }
                else {
                    paramsString += param.toString();
                }

                paramsString += ",";
            });

            return paramsString.substring(0, paramsString.length - 1);
        }
    }

    SocketEmit(funcName: string, ...params: any[]) {
        let socketObjStr = this.socket ? "this.socket" : "io()";
        eval(socketObjStr + ".emit('" + funcName + "'," + this.ConvertArrayToString(params) + ");");
    }

    SocketOn(name: string, func: Function) {
        this.socket.on(name, func);
    }

    // This function should be called in order to refresh
    // the client cookies (token) that the socket object contains.
    RefreshSocket() {
        if (this.IsSocketExists()) {
            this.socket.disconnect();
            this.socket.connect();
            this.socket.emit('login');
        }
    }

    DeleteSocket() {
        if (this.IsSocketExists()) {
            this.socket.destroy();
            this.socket = null;
        }
    }
}