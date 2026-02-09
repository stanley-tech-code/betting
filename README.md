# Betting - AI Ads Dashboard

A Next.js application for managing and monitoring betting advertising campaigns with AI-powered optimization.

## Features

- Real-time campaign monitoring
- AI-powered optimization
- Propeller Ads integration
- Supabase backend
- Analytics dashboard

## Tech Stack

- **Framework**: Next.js
- **Database**: Supabase
- **Deployment**: Vercel
- **Ad Network**: Propeller Ads

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase account
- Propeller Ads API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/stanley-tech-code/betting.git
cd betting
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your environment variables:
- `NEXT_PUBLIC_APP_URL`
- `PROPELLER_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Deployment

This project is configured for deployment on Vercel. Push to your main branch to trigger automatic deployments.

## Live Demo

[https://betting-peach-phi.vercel.app](https://betting-peach-phi.vercel.app)

## License

MIT
