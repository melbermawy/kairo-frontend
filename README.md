# Kairo Frontend

AI-native content copilot for brands and content teams.

This repo contains the **frontend application** (Next.js 16 + React 19 + Tailwind CSS 4).

## Quick Start

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm or yarn
- Backend running at `http://localhost:8000` (see [kairo-backend](https://github.com/melbermawy/kairo-backend))

### Installation

```bash
# Clone the repo
git clone https://github.com/melbermawy/kairo-frontend.git
cd kairo-frontend/ui

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local
# Edit .env.local with your settings (see Environment Variables below)

# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Environment Variables

Create a `.env.local` file in the `ui/` directory:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Optional: Enable debug logging
NEXT_PUBLIC_DEBUG=false
```

## Project Structure

```
ui/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── brands/[brandId]/   # Brand-specific routes
│   │   │   ├── today/          # Today board (opportunities)
│   │   │   ├── packages/       # Content packages
│   │   │   └── brain/          # Brand brain settings
│   │   └── onboarding/         # Brand onboarding flow
│   ├── components/             # React components
│   │   ├── ui/                 # Design system primitives
│   │   └── opportunities/      # Opportunity cards/drawer
│   ├── hooks/                  # Custom React hooks
│   └── lib/                    # Utilities and API client
├── public/                     # Static assets
└── package.json
```

## Key Features

- **Onboarding Flow**: Create a brand with positioning, pillars, and voice
- **Today Board**: View AI-generated content opportunities
- **Opportunity Details**: See evidence, angle, and timing for each opportunity
- **Brand Brain**: Edit brand settings and regenerate opportunities

## Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
npm run test     # Run tests
```

## Connecting to Backend

The frontend expects the backend to be running at the URL specified in `NEXT_PUBLIC_API_URL`.

### Full Stack Development

1. Start the backend (see backend README):
   ```bash
   # In kairo-backend directory
   python manage.py runserver
   ```

2. Start Redis (required for job queue):
   ```bash
   redis-server
   ```

3. Start the opportunities worker:
   ```bash
   # In kairo-backend directory
   python -m kairo.hero.queues.opportunities_worker
   ```

4. Start the frontend:
   ```bash
   # In kairo-frontend/ui directory
   npm run dev
   ```

5. Open `http://localhost:3000` and create a brand through onboarding

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Validation**: Zod

## License

MIT
