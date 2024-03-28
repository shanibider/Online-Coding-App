// Lobby.js (frontend)

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import data from '../data.json';

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
