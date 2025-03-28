# Running the Project with Docker

This project is structured into three main components: `client`, `ml-service`, and `server`. The following instructions guide you through setting up and running the project using Docker.

## Prerequisites

- Ensure Docker and Docker Compose are installed on your system.
- Verify the required versions:
  - Python: 3.9 (used in `ml-service`)
  - Node.js: 22.13.1 (used in `server` and `client`)

## Environment Variables

- The `server` service may require environment variables defined in a `.env` file. Uncomment the `env_file` line in the `docker-compose.yml` file and provide the necessary variables.

## Build and Run Instructions

1. Navigate to the project's root directory.
2. Build and start the services using Docker Compose:

   ```bash
   docker-compose up --build
   ```

3. Access the services:
   - `ml-service`: [http://localhost:8000](http://localhost:8000)
   - `server`: [http://localhost:5000](http://localhost:5000)
   - `client`: [http://localhost:3000](http://localhost:3000)

## Exposed Ports

- `ml-service`: 8000
- `server`: 5000
- `client`: 3000

## Notes

- The `ml-service` uses a Python virtual environment for dependency management.
- The `server` and `client` services are configured for a production environment.

For further details, refer to the respective `Dockerfile` and `docker-compose.yml` files.