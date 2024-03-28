import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import Highlight from 'react-highlight';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import data from '../data.json';

const CodeBlock = () => {
  const [codeBlock, setCodeBlock] = useState(null);
  const [code, setCode] = useState('');
  const [isMatch, setIsMatch] = useState(false);
  const [isMentor, setIsMentor] = useState(false); // Track if the user is the mentor
  const [socket, setSocket] = useState(null);

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
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Check if the user is the mentor
    newSocket.emit('check mentor');

    newSocket.on('mentor status', (isMentor) => {
      setIsMentor(isMentor);
    });

    newSocket.on('solution match', () => {
      setIsMatch(true);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [id]);

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);

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
                  readOnly={isMentor} // Make textarea readOnly for mentor
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