const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
// app.use('/api/auth', require('./src/routes/auth'));
// app.use('/api/mesh', require('./src/routes/mesh'));
// app.use('/api/admin', require('./src/routes/admin'));

// Static folder for uploaded meshes
app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'MeshChecker API is running' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
