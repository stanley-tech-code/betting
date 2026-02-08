# PropellerAds Dashboard

A Next.js dashboard for tracking PropellerAds campaign performance and landing page analytics.

## Features

- 📊 **PropellerAds Analytics**: View campaign stats, spend, revenue, impressions, and clicks
- 🎯 **Landing Page Tracking**: Monitor visits, clicks, and CTR from your Aviator landing page
- 📈 **Visual Charts**: 7-day trends and performance metrics
- 🔄 **Real-time Data**: Auto-refreshing statistics

## Tech Stack

- Next.js 15
- TypeScript
- TailwindCSS
- Recharts
- PropellerAds API
- Supabase (for landing page analytics)

## Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd propeller-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` file:
   ```env
   PROPELLER_API_KEY=your_propellerads_api_key
   NEXT_PUBLIC_LANDING_API_URL=https://your-landing-page.vercel.app
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   Navigate to `http://localhost:3000`

## Deployment to Vercel

### Prerequisites
- Vercel account
- GitHub repository
- PropellerAds API key
- Landing page deployed (betting repo)

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/stanley-tech-code/betting.git
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Configure environment variables:
     - `PROPELLER_API_KEY`: Your PropellerAds API key
     - `NEXT_PUBLIC_LANDING_API_URL`: Your deployed landing page URL
     - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL
   - Click "Deploy"

3. **Verify Deployment**
   - Visit your Vercel URL
   - Check both tabs (PropellerAds & Landing Page)
   - Verify data is loading correctly

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PROPELLER_API_KEY` | PropellerAds API key | `681766321ea5b02f...` |
| `NEXT_PUBLIC_LANDING_API_URL` | Landing page API URL | `https://betting.vercel.app` |
| `NEXT_PUBLIC_APP_URL` | Dashboard URL | `https://propeller-dashboard.vercel.app` |

## Project Structure

```
propeller-dashboard/
├── src/
│   ├── app/
│   │   ├── page.tsx              # PropellerAds dashboard
│   │   ├── landing/
│   │   │   └── page.tsx          # Landing page analytics
│   │   └── api/
│   │       └── stats/
│   │           └── route.ts      # PropellerAds API route
│   ├── components/
│   │   ├── DashboardNav.tsx      # Navigation tabs
│   │   └── dashboard/
│   │       ├── StatsCard.tsx
│   │       ├── CampaignChart.tsx
│   │       └── CampaignTable.tsx
│   └── lib/
│       ├── propeller.ts          # PropellerAds API client
│       └── landing-api.ts        # Landing page API client
├── .env.local                    # Environment variables
└── package.json
```

## Features by Tab

### PropellerAds Tab
- Total spend & revenue
- Impressions & clicks
- Campaign performance charts
- Detailed campaign table
- ROI calculations

### Landing Page Tab
- Today's visits & growth
- Today's clicks & growth
- Click-through rate (CTR)
- 7-day visit trend chart
- Real-time tracking status

## Troubleshooting

### PropellerAds shows zeros
- Check if API key is correct
- Wait 15-30 minutes if rate-limited
- Verify campaigns exist in PropellerAds account

### Landing Page shows zeros
- Verify landing page is deployed
- Check `NEXT_PUBLIC_LANDING_API_URL` is correct
- Ensure Supabase is configured on landing page
- Test landing page API: `https://your-landing.vercel.app/api/stats?action=dashboard-summary`

## Support

For issues or questions, check:
- PropellerAds API docs: https://docs.propellerads.com/
- Next.js docs: https://nextjs.org/docs
- Vercel docs: https://vercel.com/docs
