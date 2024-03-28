# Online Coding App 🖥🖱
structure my project and separating the frontend and backend code into separate foldersto help organize the project
more effectively, making it easier to maintain and understand your project.


```plaintext
online-coding-app/
│
├── backend/
│   ├── server.js        // Backend server code
│   └── package.json     // Backend dependencies 
│
└── frontend/
    ├── public/
    │   └── index.html   // HTML template for React app
    ├── src/
    │   ├── components/  // React components
    │   │   ├── Lobby.js
    │   │   └── CodeBlock.js
    │   ├── App.js       // Main React component with routing
    │   └── index.js     // Entry point for React app
    ├── package.json     // Frontend dependencies 
    └── README.md       
```

### Backend Folder Structure:
- [x] **backend/**: Root folder for backend code.
  - [ ] **server.js**: Backend server code.
  - [ ] **package.json**: Backend dependencies.

### Frontend Folder Structure:

- [x] **frontend/**: Root folder for frontend code.
  - [x] **public/**: Contains the HTML template for the React app.
    - [ ] **index.html**: HTML template file.
  - [x] **src/**: Contains the source code for the React app.
    - [x] **components/**: React components.
      - [ ] **Lobby.js**: Component for the Lobby page.
      - [ ] **CodeBlock.js**: Component for the Code Block page.
    - [ ] **App.js**: Main React component with routing.
    - [ ] **index.js**: Entry point for the React app.
  - [ ] **package.json**: Frontend dependencies.



## Work Flow -
### 1. Set Up the Project Structure:

Create a new directory for the project and initialize a new Node.js project.
Install necessary dependencies such as `Express` for the backend and `create-react-app` for the frontend.

```bash
mkdir online-coding-app
cd online-coding-app

# Backend
npm init -y
npm install express socket.io

# Frontend
npx create-react-app client
cd client
npm install socket.io-client highlight.js
```


### 2. Implement the Home Page:

In the client/src directory, create a new component called Lobby.js.

```jsx
// client/src/Lobby.js
import React from 'react';

const Lobby = () => {
  const codeBlocks = [
    { id: 1, name: 'Async case' },
    { id: 2, name: 'Promise example' },
    { id: 3, name: 'Event handling' },
    { id: 4, name: 'State management' },
  ];

  return (
    <div>
      <h2>Choose code block</h2>
      <ul>
        {codeBlocks.map((block) => (
          <li key={block.id}>
            <a href={`/code/${block.id}`}>{block.name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Lobby;
```



### 3. Implement the `Code Block` Page:

- In the client/src directory, create a new component called CodeBlock.js.
- The frontend client is implemented with React and uses Socket.IO-client to establish a WebSocket connection to the server.
- It displays a textarea for the student to edit the code and shows a smiley face if the code matches the solution.
- use useParams from React Router to get the id parameter from the URL.
- find the corresponding code block object from the JSON data based on the id parameter.
- If a code block with the specified id is found, we set the codeBlock state and initialize the code state with the code block's code.


```jsx
// CodeBlock.js (frontend)
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Highlight from 'react-highlight.js';
import data from './data.json'; // Import the JSON data

const CodeBlock = () => {
  const [codeBlock, setCodeBlock] = useState(null);
  const [code, setCode] = useState('');
  const [isMatch, setIsMatch] = useState(false);

  // Get the code block id from the URL params
  const { id } = useParams();

  useEffect(() => {
    // Find the code block by id from the JSON data
    const selectedCodeBlock = data.find((block) => block.id === parseInt(id));
    if (selectedCodeBlock) {
      setCodeBlock(selectedCodeBlock);
      setCode(selectedCodeBlock.code); // Set initial code value
    }

    // Establish Socket.IO connection
    const socket = io('http://localhost:5000');

    socket.on('solution match', () => {
      setIsMatch(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    const socket = io('http://localhost:5000');
    socket.emit('code change', newCode);
  };

  return (
    <div>
      {codeBlock ? (
        <div>
          <h2>{codeBlock.title}</h2>
          <Highlight language="javascript">
            <textarea
              value={code}
              onChange={handleCodeChange}
              style={{ width: '100%', height: '300px' }}
            />
          </Highlight>
          {isMatch && <div>😊 Smiley face</div>}
        </div>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
};

export default CodeBlock;
```



### 4. Set Up the Express Server:

In the project root directory, create a new file called server.js.
The backend server is implemented with Express.js and connects to a MongoDB database using Mongoose for storing code blocks and solutions.
Socket.IO is used to handle real-time communication between the client and server for checking if the student's code matches the solution.

```javascript
// server.js + mongoDB
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

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

// Define schema for code blocks
const codeBlockSchema = new mongoose.Schema({
  title: String,
  code: String,
  solution: String,
});
const CodeBlock = mongoose.model('CodeBlock', codeBlockSchema);

app.use(cors());

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

  socket.on('code change', async (newCode) => {
    const solution = await CodeBlock.findOne({ solution: newCode });
    if (solution) {
      socket.emit('solution match');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```


### 5. Update App.js to Set Up Routes:

In the client/src directory, update App.js to set up routes using React Router.

```jsx
// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import Lobby from './Lobby';
import CodeBlock from './CodeBlock';

const App = () => {
  return (
    <Router>
      <div>
        <Route path="/" exact component={Lobby} />
        <Route path="/code/:id" component={CodeBlock} />
      </div>
    </Router>
  );
};

export default App;
```



### 6. Add styling using React Bootstrap and custom CSS to enhance the appearance of the entire app
Integrate React Bootstrap and add some basic styling to `Lobby` page and the `CodeBlock page`.
- import components from React Bootstrap (`Container`, `Row`, `Col`, `Form`) to structure the layout and style the textarea.
- use Bootstrap classes like `mt-4` for margin-top, `h2` for heading size, `Form.Control` for styling the textarea, and `mt-2` for margin-top on the smiley face element.
- wrap the content in a `Container`, `Row`, and `Col` to create a responsive layout.

The improve code:

```jsx
// CodeBlock.js (frontend)

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Highlight from 'react-highlight.js';
import { Container, Row, Col, Form } from 'react-bootstrap'; // Import React Bootstrap components
import data from './data.json'; // Import the JSON data

const CodeBlock = () => {
  const [codeBlock, setCodeBlock] = useState(null);
  const [code, setCode] = useState('');
  const [isMatch, setIsMatch] = useState(false);

  // Get the code block id from the URL params
  const { id } = useParams();

  useEffect(() => {
    // Find the code block by id from the JSON data
    const selectedCodeBlock = data.find((block) => block.id === parseInt(id));
    if (selectedCodeBlock) {
      setCodeBlock(selectedCodeBlock);
      setCode(selectedCodeBlock.code); // Set initial code value
    }

    // Establish Socket.IO connection
    const socket = io('http://localhost:5000');

    socket.on('solution match', () => {
      setIsMatch(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    const socket = io('http://localhost:5000');
    socket.emit('code change', newCode);
  };

  return (
    <Container>
      <Row className="mt-4">
        <Col>
          {codeBlock ? (
            <div>
              <h2>{codeBlock.title}</h2>
              <Highlight language="javascript">
                <Form.Control
                  as="textarea"
                  value={code}
                  onChange={handleCodeChange}
                  style={{ height: '300px' }}
                />
              </Highlight>
              {isMatch && <div className="mt-2">😊 Smiley face</div>}
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CodeBlock;
```




```jsx
// Lobby.js (frontend)
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import data from './data.json';

const Lobby = () => {
  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h1 className="text-center mb-4">Choose a Code Block</h1>
        </Col>
      </Row>
      <Row>
        {data.map((codeBlock) => (
          <Col key={codeBlock.id} md={6} lg={4} className="mb-4">
            <Card className="h-100">
              <Card.Body>
                <Card.Title>{codeBlock.title}</Card.Title>
                <Link to={`/code/${codeBlock.id}`} className="btn btn-primary">
                  View Details
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Lobby;
```

```jsx
// CodeBlock.js (frontend)

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Highlight from 'react-highlight.js';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import data from './data.json';

const CodeBlock = () => {
  const [codeBlock, setCodeBlock] = useState(null);
  const [code, setCode] = useState('');
  const [isMatch, setIsMatch] = useState(false);

  // Get the code block id from the URL params
  const { id } = useParams();

  useEffect(() => {
    // Find the code block by id from the JSON data
    const selectedCodeBlock = data.find((block) => block.id === parseInt(id));
    if (selectedCodeBlock) {
      setCodeBlock(selectedCodeBlock);
      setCode(selectedCodeBlock.code); // Set initial code value
    }

    // Establish Socket.IO connection
    const socket = io('http://localhost:5000');

    socket.on('solution match', () => {
      setIsMatch(true);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

    const socket = io('http://localhost:5000');
    socket.emit('code change', newCode);
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          {codeBlock ? (
            <div>
              <h2 className="mb-4">{codeBlock.title}</h2>
              <Highlight language="javascript">
                <Form.Control
                  as="textarea"
                  value={code}
                  onChange={handleCodeChange}
                  style={{ height: '300px' }}
                />
              </Highlight>
              {isMatch && <div className="mt-2">😊 Smiley face</div>}
            </div>
          ) : (
            <div>Loading...</div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CodeBlock;
```

And here is the corresponding CSS file `styles.css`:

```css
/* styles.css (frontend) */

body {
  font-family: Arial, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  color: #333;
}

.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.card {
  border: 1px solid #ccc;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 1.2rem;
}

textarea.form-control {
  font-family: 'Courier New', Courier, monospace;
}

.highlight {
  background-color: #f8f9fa;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
}

```

> Make sure to import the `styles.css` file in your main component (`App.js` or `index.js`) to apply the styles to your entire application.













### 7. create a data file with some code blocks and solutions to use in the application
* In a real-world scenario, you would typically store this data in a database instead of a JSON file.
However, for the purpose of this example and for simplicity, a JSON file can be used to simulate data storage.


 
```json
[
  {
    "id": 1,
    "title": "Async case",
    "code": "const fetchData = async () => {\n  const response = await fetch('https://api.example.com/data');\n  const data = await response.json();\n  console.log(data);\n};\n\nfetchData();",
    "solution": "const fetchData = async () => {\n  const response = await fetch('https://api.example.com/data');\n  const data = await response.json();\n  console.log(data);\n};\n\nfetchData();"
  },
  {
    "id": 2,
    "title": "Promise example",
    "code": "const fetchData = () => {\n  return fetch('https://api.example.com/data')\n    .then(response => response.json())\n    .then(data => console.log(data))\n    .catch(error => console.error(error));\n};\n\nfetchData();",
    "solution": "const fetchData = () => {\n  return fetch('https://api.example.com/data')\n    .then(response => response.json())\n    .then(data => console.log(data))\n    .catch(error => console.error(error));\n};\n\nfetchData();"
  },
  {
    "id": 3,
    "title": "Event handling",
    "code": "document.getElementById('btn').addEventListener('click', () => {\n  console.log('Button clicked');\n});",
    "solution": "document.getElementById('btn').addEventListener('click', () => {\n  console.log('Button clicked');\n});"
  },
  {
    "id": 4,
    "title": "State management",
    "code": "class Counter {\n  constructor() {\n    this.count = 0;\n  }\n\n  increment() {\n    this.count++;\n    console.log('Count:', this.count);\n  }\n}\n\nconst counter = new Counter();\ncounter.increment();",
    "solution": "class Counter {\n  constructor() {\n    this.count = 0;\n  }\n\n  increment() {\n    this.count++;\n    console.log('Count:', this.count);\n  }\n}\n\nconst counter = new Counter();\ncounter.increment();"
  }
]
```

### 7. Start the Application:

Start both the backend server and the frontend development server.



