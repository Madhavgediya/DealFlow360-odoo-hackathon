require("dotenv").config();
const express = require("express");
const os = require("os");

const authRoutes = require('./src/modules/auth/auth.routes');
const companyRoutes = require('./src/modules/companies/company.routes');
const userRoutes = require('./src/modules/users/user.routes');
const roleRoutes = require('./src/modules/roles/role.routes');
const permissionRoutes = require('./src/modules/permissions/permission.routes');
const leadRoutes = require('./src/modules/leads/lead.routes');
const customerRoutes = require('./src/modules/customers/customer.routes');
const contactRoutes = require('./src/modules/contacts/contact.routes');
const opportunityRoutes = require('./src/modules/opportunities/opportunity.routes');
const activityRoutes = require('./src/modules/activities/activity.routes');
const productRoutes = require('./src/modules/products/product.routes');
const pricingRoutes = require('./src/modules/pricing/pricing.routes');
const quotationRoutes = require('./src/modules/quotations/quotation.routes');
const orderRoutes = require('./src/modules/orders/order.routes');
const inventoryRoutes = require('./src/modules/inventory/inventory.routes');
const invoiceRoutes = require('./src/modules/invoices/invoice.routes');
const paymentRoutes = require('./src/modules/payments/payment.routes');
const reportRoutes = require('./src/modules/reports/report.routes');
const aiRoutes = require('./src/modules/ai/ai.routes');
const errorHandler = require('./src/middleware/error.middleware');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5050;
const HOST = "0.0.0.0";

// Middleware
app.use(cors());
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://10.217.113.128:5173', 'http://127.0.0.1:5173'],
//   credentials: true
// }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logging Middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
    );
  });
  next();
});

// Helper function to get local IP
const getLocalIP = () => {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        return iface.address;
      }
    }
  }
  return "localhost";
};

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/users", userRoutes); // includes /users/:userId/roles/:roleId
app.use("/api/v1/roles", roleRoutes);
app.use("/api/v1/permissions", permissionRoutes);
app.use("/api/v1/leads", leadRoutes); // includes /leads/:leadId/interactions
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/contacts", contactRoutes);
app.use("/api/v1/opportunities", opportunityRoutes);
app.use("/api/v1/activities", activityRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/pricing", pricingRoutes);
app.use("/api/v1/quotations", quotationRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/invoices", invoiceRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/reports", reportRoutes);
app.use("/api/v1/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Backend server is running");
});

app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running",
  });
});

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Start Server
const server = app
  .listen(PORT, HOST, () => {
    const localIP = getLocalIP();
    console.log("Server started successfully");
    console.log(`Local URL: http://localhost:${PORT}`);
    console.log(`Network URL: http://${localIP}:${PORT}`);
    console.log(`Health URL: http://${localIP}:${PORT}/health`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Error: Port ${PORT} is already in use.`);
    } else {
      console.error("Server failed to start:", err.message);
    }
    process.exit(1);
  });

// Graceful Shutdown
const shutdown = (signal) => {
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log("Closed out remaining connections.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down",
    );
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
