# Tockler Backend Documentation

## Overview

Tockler's backend is built on Electron and provides core functionality for tracking computer usage, application activities, and system state changes. The backend handles data collection, storage, analysis, and maintains the application state.

## Architecture

Tockler's backend is structured into several key components:

### Core Components

1. **Main Process (`index.ts`)** - Entry point that initializes the application, sets up windows, and manages power monitor events.
2. **Window Manager (`window-manager.ts`)** - Handles the creation and management of application windows.
3. **State Manager (`state-manager.ts`)** - Maintains the current state of tracking items and system state.
4. **Background Service (`background-service.ts`)** - Core service for handling track item creation, updates, and system state transitions.
5. **App Manager (`app-manager.ts`)** - Manages application lifecycle and initialization.

### Data Models

1. **TrackItem** - The primary data model representing a tracked activity with the following properties:
    - `id`: Unique identifier
    - `app`: Application name
    - `taskName`: Type of track item (LogTrackItem, AppTrackItem, StatusTrackItem)
    - `title`: Window title or description
    - `url`: URL (if applicable)
    - `color`: Color for visualization
    - `beginDate`: Start time of the tracked item
    - `endDate`: End time of the tracked item

### Tracking Jobs

Tockler has three main tracking jobs that run at regular intervals:

1. **AppTrackItemJob** - Tracks active applications and window titles

    - Captures the current active window
    - Creates or updates AppTrackItem records
    - Analyzes window titles for task identification

2. **StatusTrackItemJob** - Monitors system status

    - Tracks whether the system is Online, Offline, or Idle
    - Manages transitions between different states
    - Creates StatusTrackItem records

3. **LogTrackItemJob** - Handles manual time logging
    - Manages user-defined tracking items
    - Records intentional activities logged by the user

### Services

1. **TrackItemService** - Handles CRUD operations for track items

    - Creating new track items
    - Querying track items for various time ranges
    - Exporting track items
    - Updating and deleting track items

2. **AppSettingService** - Manages application settings

    - Storing and retrieving app colors
    - Managing app-specific settings

3. **SettingsService** - Handles global application settings
    - Timer settings
    - UI preferences
    - Background job intervals

### State Management

The application tracks three main states:

-   **ONLINE** - Computer is active and being used
-   **IDLE** - Computer is on but not being used (idle timeout)
-   **OFFLINE** - Computer is sleeping or powered off

### Tracking Types

Three primary tracking types are defined:

-   **AppTrackItem** - Records application usage (which apps were open and active)
-   **StatusTrackItem** - Records system status (online, idle, offline)
-   **LogTrackItem** - Records manual time entries created by the user

## Core Functionality

### Application Tracking

The AppTrackItemJob runs at regular intervals (default: every few seconds) and:

1. Queries the OS for the currently active window
2. Creates a new AppTrackItem or updates an existing one
3. Stores details like app name, window title, start time, and end time

### System State Tracking

The StatusTrackItemJob:

1. Monitors for system idle state
2. Creates StatusTrackItem records when state changes
3. Handles transitions between Online, Idle, and Offline states

### Sleep/Wake Handling

The backend responds to system sleep and wake events:

1. When the system sleeps, the current state is saved
2. When the system wakes, an Offline period is recorded for the sleep duration
3. Tracking resumes with the current state

### Task Analysis

The TaskAnalyzer:

1. Examines window titles and application names
2. Identifies potential tasks based on patterns
3. Can notify users about recognized tasks

## Database

Tockler uses an Objection.js ORM with SQL database to store:

1. Track items (application usage, system state, manual logs)
2. Application settings (colors, preferences)
3. Global settings

## Implementation Details

### Handling Day Boundaries

The backend has special handling for activities that span midnight:

1. TrackItems that cross midnight are split into separate day chunks
2. This ensures accurate daily reporting

### Error Handling

The backend implements robust error handling:

1. Logging errors with detailed context
2. Graceful degradation when tracking encounters issues
3. Recovery mechanisms after system sleep or crashes

### Background Job Management

Background jobs are managed with:

1. Configurable intervals
2. Automatic retries
3. Error logging and recovery

## Integration Points

The backend exposes functionality to the frontend through:

1. IPC (Inter-Process Communication) channels
2. Shared data models
3. Event emitters for real-time updates

## Configuration

The backend can be configured through:

1. Environment variables
2. User settings (stored in the database)
3. Default configurations in code

This document provides an overview of Tockler's backend architecture and main components. For specific implementation details, refer to the corresponding source files.

# New backend

There should be system state events. Online, Offline, Idle. There is a thread that checks for Idle state. If state changes event is fired.

Other parts are listening to those events.

In active application tracking, there is a thread that in every 3 seconds checks the active window. If system is Idle or Offline, the thread is ended. It will start if it gets event Online. It keeps current state in memory, and changes endDate if needed or saves state to sqllite db
