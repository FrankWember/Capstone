import React from "react";
import { Card, Col, Row } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const MovieCards = ({ movies }) => {
  return (
    <Row className="d-flex flex-wrap">
      {movies.map((movie, index) => (
        <Col key={index} md={4} lg={3} className="mb-4">
          <Card className="h-100">
            <Card.Body>
              <Card.Title>{movie.title}</Card.Title>
              <Card.Text>Year: {movie.year}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default MovieCards;
