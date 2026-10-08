import express from 'express';
import priceRoutes from './router/priceRoutes.js'
import sessionRoutes from './router/sessionRoutes.js'

const app = express();
const PORT = 3028;

app.use(express.json());

app.use('/api/prices', priceRoutes);
app.use('/api/session', sessionRoutes);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

export default app;