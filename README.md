﻿# Opal: Screen Recording and Collaboration Platform


Opal is a comprehensive application designed to streamline screen recording and video collaboration workflows. It consists of three integrated components: a Next.js web application, an Electron.js-based desktop application, and an Express.js server for video processing.

---

## Features

### Web Application (Next.js)
- **Workspace Management**:
  - Create and manage workspaces.
  - Invite collaborators to workspaces.
- **Folder Organization**:
  - Create and organize folders for video projects.
- **Video Management**:
  - Preview and share videos seamlessly.
- **Real-Time Updates**:
  - Videos recorded on the desktop app are uploaded and updated in real time.

### Desktop Application (Electron.js)
- **Screen Recording**:
  - Capture high-quality screen recordings.
  - Include audio and camera feeds during recording.
- **Real-Time Uploads**:
  - Videos are uploaded to the web app while recording.

### Video Processing Server (Express.js)
- **Video Handling**:
  - Processes and stores videos from the desktop app.
  - Updates video details on the Next.js web application.

---

## Project Repositories

### Web Application
[opal-webprodigies](https://github.com/faiz7077/Opal-web): Contains the Next.js application for video management and collaboration.

### Desktop Application
[opal-electron-desktop-app](https://github.com/faiz7077/Opal-Desktop): Contains the Electron.js desktop app for screen recording and real-time uploads.

### Video Processing Server
[opal-express](https://github.com/faiz7077/Opal-Express): Contains the Express.js server for processing and updating video data.

---

## Usage
1. **Record a Video**:
   - Launch the Electron desktop app to record your screen, audio, and camera feed.
2. **Upload in Real-Time**:
   - Videos are uploaded to the web app as you record.
3. **Manage and Collaborate**:
   - Use the web application to preview, share, and organize videos in workspaces and folders.

---


