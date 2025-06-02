# Investment Portfolio Management System

A comprehensive investment portfolio management application that provides real-time market data, portfolio analysis, and investment recommendations.

## Features

- Real-time portfolio tracking and analysis
- Market data integration
- Risk analysis and diversification recommendations
- Dynamic data visualization
- User authentication and portfolio management

## Tech Stack

### Frontend
- Angular 16
- D3.js for data visualization
- Angular Material for UI components

### Backend
- Java 17
- Spring Boot 3.x
- MySQL 8.0
- Spring Security for authentication

### DevOps
- Docker
- Jenkins
- Azure Cloud Services

## Prerequisites

- Node.js (v18 or higher)
- Java JDK 17
- Maven
- MySQL 8.0
- Docker

## Project Structure

```
investment-portfolio/
├── frontend/           # Angular frontend application
├── backend/           # Spring Boot backend application
├── docker/            # Docker configuration files
└── docs/             # Project documentation
```

## Getting Started

1. Clone the repository
2. Set up the backend:
   ```bash
   cd backend
   mvn clean install
   ```
3. Set up the frontend:
   ```bash
   cd frontend
   npm install
   ```
4. Start the development servers:
   - Backend: `mvn spring-boot:run`
   - Frontend: `ng serve`

## API Documentation

The API documentation is available at `/swagger-ui.html` when running the backend server.

## Deployment

The application can be deployed using Docker containers and Azure Cloud Services. Detailed deployment instructions are available in the `docker/` directory.

## License

MIT License 