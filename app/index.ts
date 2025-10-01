import express, { NextFunction, Request, Response } from "express";
import type { Server } from "http";
import { DatabaseManager } from "./src/config/DatabaseManager";
import CustomerRouter from "./src/presentation/routes/CustomerRouter";
import OrderRouter from "./src/presentation/routes/OrderRouter";
import ProductRouter from "./src/presentation/routes/ProductRouter";

const app = express();
const port = Number(process.env.PORT ?? 3000);
const databaseManager = DatabaseManager.getInstance();
let server: Server | undefined;

app.disable("x-powered-by");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (_req, res) => {
  res.status(200).json({ message: "TFU3 ANDIS2 API" });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/customers", CustomerRouter);
app.use("/api/orders", OrderRouter);
app.use("/api/products", ProductRouter);

app.use((req, res) => {
  res.status(404).json({ message: `Endpoint ${req.method} ${req.originalUrl} not found` });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Unhandled error:", error);
  res.status(500).json({ message: "Internal server error" });
});

const startServer = async (): Promise<void> => {
  try {
    await databaseManager.initialize();

    server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  console.log(`Received ${signal}. Shutting down gracefully...`);

  try {
    if (server) {
      await new Promise<void>((resolve, reject) => {
        server?.close((err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    }

    await databaseManager.close();
    console.log("Shutdown completed. Goodbye!");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  void shutdown("SIGTERM");
});

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  void shutdown("SIGTERM");
});

void startServer();
