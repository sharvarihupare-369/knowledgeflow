import express, { type Request, type Response } from "express";
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from "./config/prisma.js";
import authRoutes from './modules/auth/auth.route.js';

dotenv.config()
const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes)

app.get("/", (req: Request, res: Response) => {
    res.send("Welcome to Base Route!")
})

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
