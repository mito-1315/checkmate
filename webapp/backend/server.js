import express from 'express';
import routes from './setup/routes/routes.js';
const app = express();

app.use(express.json());
app.use('/api', routes);
// Basic route
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`REST API server running on port ${PORT}`);
});
