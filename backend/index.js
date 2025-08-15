import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import  routeremp  from "./routes/emp.route.js";
import routerbur   from "./routes/bur.route.js";
import routeraff from "./routes/affect.route.js";
import router from "./routes/auth.route.js";

dotenv.config();

const app = express();

app.use(express.urlencoded({ extended: true })); 
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    exposedHeaders: ['set-cookie']
  })
);


app.use('/api/employees', routeremp);
app.use('/api/bureau', routerbur);
app.use('/api/affectations', routeraff);
app.use('/api/auth',router);


app.get('/', (req, res) => {
  res.send('API is running');}
)



app.listen(process.env.PORT, () => console.log('API running on port '+process.env.PORT));

