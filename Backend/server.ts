import cors from "cors";
import express from "express";
import dotenv from "dotenv";
import { Request, Response } from "express";
import session from "express-session";
import passport from "passport";
import { MonogoDbConnection } from "./config/Dbconfig";
import { PassportConfguration } from './controller/Auth/ConfigAuthWithGooglePassport';
import router from "./routes/auth.routes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Apply middleware in the correct order
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply CORS middleware properly
app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

// Session middleware must come BEFORE passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || "123453121", // You should use an environment variable
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === "production"
    }
  })
);

// Initialize passport after session
app.use(passport.initialize());
app.use(passport.session());

// Configure passport
PassportConfguration();

// Debug middleware to log authentication status
app.use((req, res, next) => {
  console.log(`Request path: ${req.path}, isAuthenticated: ${req.isAuthenticated()}`);
  next();
});

// Home route
app.get("/", (req: Request, res: Response) => {
  res.send(`
    <h1>Authentication Test</h1>
    <p>Server is running successfully</p>
    <a href="/auths/auth/google">Login with Google</a>
  `);
});

// Apply routes - note the /auths prefix
app.use("/auths", router);

// Add a catch-all route for debugging
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method
  });
});

// Connect to MongoDB and start server
app.listen(port, async () => {
  try {
    console.log(`Server is listening on port ${port}`);
    await MonogoDbConnection(process.env.MONGO_DB_URI!);
    console.log("Connected to MongoDB");
  } catch (err) {
    console.log("Error in connecting to MongoDB", err);
  }  
});