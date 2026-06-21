# Varta (वार्ता)

A modern, lightweight HTTP client for testing and debugging APIs. Built with [Tauri](https://tauri.app/) and [React](https://react.dev/), Varta provides a native desktop experience for making HTTP requests with a clean, intuitive interface.

## Features

- **HTTP Methods**: Full support for GET, POST, PUT, PATCH, and DELETE requests
- **Request Builder**: 
  - URL with query parameters
  - Headers and cookies management
  - Multiple authentication types (None, Basic, Bearer, API Key)
  - Multiple body modes (JSON, Raw, Form Data, URL Encoded, Multipart)
- **Response Viewer**: View status, headers, body, and performance metrics
- **Tab Management**: Work with multiple requests simultaneously
- **History**: Track request history with timestamps and response codes
- **Keyboard Shortcuts**: Command palette for fast navigation (Cmd/Ctrl + K)
- **Environment Support**: Manage different environments (staging, production, etc.)
- **File Upload**: Support for multipart file uploads
- **Resizable Panels**: Adjust the request/response panel sizes to your preference

## Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **Zustand** - State management
- **Monaco Editor** - Code editor for request/response bodies
- **Lucide React** - Icons
- **Vite** - Build tool

### Backend
- **Tauri 2** - Desktop framework
- **Rust** - Backend runtime
- **Reqwest** - HTTP client (with JSON, multipart, and query support)
- **Tokio** - Async runtime
- **Serde** - Serialization/deserialization

### Package Manager
- **Bun** - Fast package manager and runtime

## Getting Started

### Prerequisites
- **Node.js** 18+ or **Bun**
- **Rust** 1.70+ (for building Tauri)
- **Xcode Command Line Tools** (macOS) or equivalent build tools

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iamdhakrey/varta.git
   cd varta
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Start development server**
   ```bash
   bun run tauri dev
   ```
   This will start the Vite dev server and open the Tauri window.

### Building for Production

```bash
bun run tauri build
```

The built application will be available in `src-tauri/target/release/bundle/`.

## Contributing

Contributions are welcome! Please follow these guidelines:
1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request


## Author

**iamdhakrey**

---

**Varta** (वार्ता) means "conversation" in Hindi/Sanskrit, reflecting the ongoing dialogue between client and server.
