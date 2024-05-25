import express from 'express';
import dotenv from 'dotenv';
// Configuration to read our enviroment variables
dotenv.config();
import grades from './routes/grades.mjs';

const PORT = process.env.PORT || 5050;
const app = express();

//Connect to DB
// import './db/conn.mjs';

// JSON middleware
app.use(express.json());

// Grades Routes
app.use('/api/grades', grades);

app.get('/', (req, res) => {
  res.send('Welcome to the Grades API.');
});

//Global Error Handling Middlware
app.use((err, req, res, next) => {
  res.status(500).send('Seems like we messed up somewhere...');
});

// Start the Express Server
app.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});

//test