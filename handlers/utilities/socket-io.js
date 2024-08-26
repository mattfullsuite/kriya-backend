let connection = null;

class Socket {
  constructor() {
    this.socket = null;
  }

  connect(server) {
    const io = require("socket.io")(server);
    io.on("connection", (socket) => {
      this.socket = socket;
    });
  }

  emit(event, data) {
    this.socket.emit(event, data);
  }

  static init(server) {
    if (!connection) {
      connection = new Socket();
      connection.connect(server);
    }
  }

  static getConnection() {
    return connection;
  }
}

module.exports = {
  connect: Socket.init,
  connection: Socket.getConnection
};