# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a React implementation of the E-Card game from the anime Kaiji. It's a multiplayer card game where players take turns as Emperor and Slave, with Firebase Firestore providing real-time multiplayer functionality. The application runs in Docker containers for consistent development and deployment.

## Development Commands

### Local Development (Docker)
```bash
# Build and run the application with hot reloading
docker-compose up --build

# Run in detached mode
docker-compose up -d --build

# Stop the application
docker-compose down

# View logs
docker-compose logs -f
```

The application will be available at `http://localhost:3000`.

### Local Development (Node.js)
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests (though no tests currently exist)
npm test
```

### Testing
Currently, no tests are implemented. To add testing:
```bash
# Run existing test setup (React Testing Library is included)
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

## Architecture Overview

### Core Architecture
- **Single-Page Application**: All game logic contained in `src/App.jsx`
- **Real-time Multiplayer**: Firebase Firestore with real-time listeners for game state synchronization
- **Component Structure**: Monolithic component with embedded child components (Card, GameLobby)
- **State Management**: React hooks (useState, useEffect) with Firebase as the source of truth

### Key Components

#### Main App Component (`src/App.jsx`)
- **Game State Management**: Handles player creation, game creation/joining, and game flow
- **Firebase Integration**: Real-time listeners for game updates, Firestore operations
- **Game Logic**: Card game rules, round progression, role swapping, scoring
- **UI Rendering**: All game screens (lobby, waiting, playing, finished)

#### Child Components
- **Card**: Renders individual game cards with role-based styling
- **GameLobby**: Initial screen for creating/joining games

#### Firebase Configuration (`src/firebase.js`)
- **Note**: Contains actual API keys and should be secured in production
- **Database**: Uses Firestore collections: `games` with player data, scores, hands, and choices

### Game Logic
- **Roles**: Emperor (E) and Slave (S), with Citizen (C) cards
- **Rule System**: Emperor beats Citizen, Citizen beats Slave, Slave beats Emperor (when Emperor plays Emperor card)
- **Scoring**: 1 point per round win, 5 points when Slave beats Emperor's Emperor card
- **Role Swapping**: Players swap roles after round 4
- **Game Length**: 12 rounds maximum

### Data Flow
1. **Player Creation**: Auto-generated unique IDs stored in localStorage
2. **Game Creation**: Creates Firestore document with initial game state
3. **Real-time Updates**: onSnapshot listeners update local state when Firestore changes
4. **Turn Resolution**: Both players choose cards → automatic resolution → next round

## Firebase Security Considerations

The Firebase configuration contains actual API keys. For production:
- Move sensitive keys to environment variables
- Implement Firestore security rules
- Consider authentication for player identity verification

## Deployment Notes

- **Docker**: Configured for containerized deployment with volume mapping for development
- **Build Process**: Standard Create React App build process
- **Environment**: Requires Node 18+ (specified in Dockerfile)

## Potential Improvements

- Extract components into separate files for better maintainability
- Add comprehensive test coverage
- Implement proper error boundaries
- Add TypeScript for better type safety
- Separate game logic into custom hooks or services
- Add environment-specific Firebase configurations