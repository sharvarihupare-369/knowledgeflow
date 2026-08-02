import express, { type Request, type Response } from "express";
import cors from 'cors';
import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import authRoutes from './modules/auth/auth.route.js';
import collectionRoutes from './modules/collections/collection.routes.js'
import documentRoutes from './modules/documents/document.routes.js'
import chatRoutes from './modules/chat/chat.routes.js'
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'
import { errorHandler } from "./middlewares/errorHandler.middleware.js";

const PORT = env.PORT;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes)
app.use("/api/collections", collectionRoutes)
app.use("/api/documents", documentRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/dashboard", dashboardRoutes)

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to Base Route!")
})

app.use(errorHandler);

async function startServer() {
    try {
        await prisma.$connect();
        console.log("Database connected successfully.");
        app.listen(PORT, () => {
            console.log(`Server is running on PORT ${PORT}`)
        })
    } catch (error) {
        console.error("Failed to connect database");
        console.error(error);
        process.exit(1);
    }
}

startServer();
