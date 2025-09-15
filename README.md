# E-Card Kaiji Game with Docker

This project is a React implementation of the E-Card game from the anime Kaiji, set up to run inside a Docker container.

## Getting Started

### Prerequisites

* [Docker](https://www.docker.com/get-started) installed on your machine.

### File Structure

Ensure your project has the following file structure. The `docker-compose up` command should be run from the root directory where `docker-compose.yml` is located.
/
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── package.json
├── public/
│   └── index.html
└── src/
├── App.jsx
└── index.js

### Installation & Running the App

1.  **Save all the project files** into their respective directories as shown in the file structure above.

2.  **Open a terminal** in the project's root directory.

3.  **Build and run the container** using Docker Compose:
    ```sh
    docker-compose up --build
    ```
    This command will build the Docker image and start the container. The `--build` flag ensures it rebuilds the image if any files have changed.

4.  **View the application:**
    Open your web browser and navigate to **http://localhost:3000**.

### Hot Reloading

The project is configured with a volume in `docker-compose.yml`. 
This means any changes you make to the files in the `src` or `public` directories on your local machine will be reflected in the container automatically, and the browser will update to show the changes instantly without needing to restart the container.
