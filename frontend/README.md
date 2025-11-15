# YouTube AI Analyst - React Frontend

Modern React frontend for the YouTube AI Analyst application, providing a comprehensive channel analysis interface.

## Features

- **Channel Analysis**: Analyze YouTube channels with detailed SEO insights
- **Interactive Tabs**: Overview, Keywords & Tags, Performance, and All Videos views
- **Data Visualization**: Engagement metrics, tag frequency, and performance tables
- **Search & Filter**: Search videos, filter tags by frequency
- **Export Functionality**: Export video data to CSV
- **Responsive Design**: Mobile-friendly interface with gradient backgrounds

## Tech Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the application
npm run build
```

The build output will be in the `dist` folder.

### Preview Production Build

```bash
# Preview the production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── common/          # Reusable UI components
│   │   ├── layout/          # Layout components
│   │   ├── channel/         # Channel-specific components
│   │   └── video/           # Video-specific components
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── utils/               # Utility functions
│   ├── types/               # TypeScript type definitions
│   ├── config/              # Configuration files
│   ├── hooks/               # Custom React hooks
│   ├── contexts/            # React contexts
│   ├── routes.tsx           # Route definitions
│   ├── App.tsx              # Main App component
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── index.html               # HTML template
└── package.json             # Dependencies and scripts
```

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=YouTube AI Analyst
VITE_APP_VERSION=1.0.0
```

## Available Routes

- `/` - Home page with channel/video selector
- `/channel-analysis` - Channel analysis page with full UI
- `/dashboard` - Analytics dashboard (coming soon)
- `/video/:id` - Video analysis page (coming soon)
- `/recommendations` - AI recommendations (coming soon)
- `/settings` - Application settings (coming soon)

## Components

### Channel Analysis Components

- **ChannelOverview**: Displays channel metadata and statistics
- **OverviewTab**: Top videos, engagement metrics, tags, publishing stats
- **KeywordsTab**: Tag analysis with filtering and keyword extraction
- **PerformanceTab**: Sortable performance metrics table
- **AllVideosTab**: Searchable video table with CSV export

### Common Components

- **Button**: Styled button with variants and loading states
- **Card**: Container component with optional header and footer
- **Input**: Text input with label and error states
- **Loading**: Loading spinner component
- **ErrorMessage**: Error display with retry option

## API Integration

The frontend communicates with the backend API at the configured `VITE_API_BASE_URL`:

- `GET /api/channel/videos?url={channelUrl}&maxResults={number}` - Fetch channel data

See `src/services/` for API service implementations.

## Docker Integration

The frontend is built as part of the Docker build process. The Dockerfile includes a multi-stage build that:

1. Builds the React frontend
2. Builds the backend TypeScript
3. Copies the frontend build to the `public` folder
4. Serves both through the Express backend

## Development Tips

- Use TypeScript for type safety
- Follow the existing component structure
- Use Tailwind utility classes for styling
- Create reusable components in `components/common/`
- Keep API calls in `services/`
- Use custom hooks for shared logic

## Contributing

When adding new features:

1. Create components in appropriate directories
2. Add types to `src/types/`
3. Update routes in `src/routes.tsx`
4. Add utility functions to `src/utils/`
5. Keep components small and focused
6. Use TypeScript for all new code

## License

Part of the YouTube AI Analyst project.
