# My Travel Pal

A web application to help plan travels, track experiences, and create summaries using AI.

## Features

- ✅ Create and manage travel plans
- ✅ Add activities, hotels, restaurants, attractions, and transportation
- ✅ Edit and update all items in your itinerary
- ✅ Timeline view of your travel itinerary
- ✅ List view for organized browsing
- ✅ Interactive map with location markers and custom icons
- ✅ Google Places autocomplete for accurate locations
- ✅ Date validation and business logic
- 🚧 AI-powered suggestions and itinerary optimization (coming soon)

## Tech Stack

- **Frontend**: React with Vite
- **UI**: CSS Modules
- **Routing**: React Router
- **Backend**: Node.js (coming soon)
- **Database**: PostgreSQL (coming soon)
- **Deployment**: Vercel

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up Google Maps API (for location autocomplete):
   - Get a Google Maps API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Enable the "Places API" for your project
   - Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   - Add your API key to `.env`:
   ```
   VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```
   - Note: The app will work without the API key, but location autocomplete won't be available

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
