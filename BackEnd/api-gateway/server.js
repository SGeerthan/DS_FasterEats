const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const cors = require("cors");

// Apply CORS globally to all routes
app.use(cors());

// Proxy setup with CORS for each individual proxy
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:5559",
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
      // Allow CORS headers from the proxied service
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE";
      proxyRes.headers["Access-Control-Allow-Headers"] = "Content-Type";
    },
  })
);

app.use(
  "/api/restaurant",
  createProxyMiddleware({
    target: "http://localhost:5560",
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE";
      proxyRes.headers["Access-Control-Allow-Headers"] = "Content-Type";
    },
  })
);

app.use(
  "/api/order",
  createProxyMiddleware({
    target: "http://localhost:5004",
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE";
      proxyRes.headers["Access-Control-Allow-Headers"] = "Content-Type";
    },
  })
);

app.use(
  "/api/payment",
  createProxyMiddleware({
    target: "http://localhost:5025",
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE";
      proxyRes.headers["Access-Control-Allow-Headers"] = "Content-Type";
    },
  })
);

app.use(
  "/api/delivery",
  createProxyMiddleware({
    target: "http://localhost:5003",
    changeOrigin: true,
    onProxyRes: (proxyRes) => {
      proxyRes.headers["Access-Control-Allow-Origin"] = "*";
      proxyRes.headers["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE";
      proxyRes.headers["Access-Control-Allow-Headers"] = "Content-Type";
    },
  })
);

app.get("/work", (req, res) => res.send("Working"));

app.listen(8080, () => {
  console.log("API Gateway running on port 8080");
});
