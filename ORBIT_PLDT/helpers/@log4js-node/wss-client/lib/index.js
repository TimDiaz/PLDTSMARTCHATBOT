var wss = require("nodejs-websocket")

function wssclientAppender(layout, config) {
    let canWrite = false;
    const buffer = [];
    let shutdownAttempts = 3;
    let endMsg = '__LOG4JS__';
    let socket;

    function write(loggingEvent) {
        canWrite = socket.sendText(`${layout(loggingEvent)}${endMsg}`);
    }

    function emptyBuffer() {
        let evt;
        while ((evt = buffer.shift())) {
            write(evt);
        }
    }

    function createWebSocket() {
        const protocol = config.protocol || 'ws';
        const host = config.host || 'localhost';
        const port = config.port || 5000;

        socket = wss.connect(`${protocol}://${host}:${port}`)
        socket.on('connect', () => {
            emptyBuffer();
            canWrite = true;
        });
        socket.on('error', (e) => {
            canWrite = false;
            emptyBuffer();
        });
        socket.on('close', createWebSocket);
    }

    createWebSocket();

    function log(loggingEvent) {
        if (canWrite) {
            write(loggingEvent);
        } else {
            buffer.push(loggingEvent);
        }
    }

    log.shutdown = function (cb) {
        if (buffer.length && shutdownAttempts) {
            shutdownAttempts -= 1;
            setTimeout(() => {
                log.shutdown(cb);
            }, 100);
        } else {
            socket.close();
            socket.removeAllListeners('close');            
        }
    };
    return log;
}

function configure(config, layouts) {
    let layout = function (loggingEvent) {
        return loggingEvent.serialise();
    };
    if (config.layout) {
        layout = layouts.layout(config.layout.type, config.layout);
    }
    return wssclientAppender(layout, config);
}

module.exports.configure = configure;