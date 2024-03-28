// simplified Socket.IO connection handling.
// Now, when a new user connects, the server checks if it's the first user to connect. If it is, it assumes the user is the mentor;
// otherwise, it assumes the user is a student.
// emit the mentor status to the client, indicating whether the user is the mentor or a student.

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const connectDB = require('./db'); // Import the connectDB function


const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/coding_app', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;


// Connect to MongoDB
connectDB();

// Define schema for code blocks
const codeBlockSchema = new mongoose.Schema({
  title: String,
  code: String,
  solution: String,
});
const CodeBlock = mongoose.model('CodeBlock', codeBlockSchema);

app.use(cors());
app.use(express.json());

// Get code blocks from the database
app.get('/api/codeblocks', async (req, res) => {
  try {
    const codeBlocks = await CodeBlock.find();
    res.json(codeBlocks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  let isMentor = false;

  // Check if the user is the first to connect (mentor)
  if (io.engine.clientsCount === 1) {
    isMentor = true;
  }

  // Emit mentor status to the client
  socket.emit('mentor status', isMentor);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
