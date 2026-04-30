const socketIO = require("socket.io");

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: [
        "https://pos-restaurant-system.netlify.app",
        "https://pos-restaurant-system.netlify.app",
      ],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-order-room", (orderId) => {
      socket.join(`order-${orderId}`);
    });

    socket.on("order-status-update", (data) => {
      io.to(`order-${data.orderId}`).emit("order-updated", data);
      io.emit("kitchen-update", data);
    });

    socket.on("disconnect", () => {});
  });
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = {
  initializeSocket,
  getIO,
};
