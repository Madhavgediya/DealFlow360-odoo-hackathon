require('dotenv').config();
const express = require('express');
const os = require('os');

const app = express();
const PORT = process.env.PORT || 5050;
const HOST = '0.0.0.0';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Helper function to get local IP
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
};

// Routes
app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running'
  });
});

// Start Server
const server = app.listen(PORT, HOST, () => {
  const localIP = getLocalIP();
  console.log('Server started successfully');
  console.log(`Local URL: http://localhost:${PORT}`);
  console.log(`Network URL: http://${localIP}:${PORT}`);
  console.log(`Health URL: http://${localIP}:${PORT}/health`);
}).on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Error: Port ${PORT} is already in use.`);
  } else {
    console.error('Server failed to start:', err.message);
  }
  process.exit(1);
});

// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('Closed out remaining connections.');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
