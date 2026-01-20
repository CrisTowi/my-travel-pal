# MyTravelPal Setup Guide

## Google Maps API Setup

To enable location autocomplete features, you need to set up Google Maps API:

### Step 1: Get API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Places API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Places API"
   - Click "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy your API key

### Step 2: Configure Environment

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Open `.env` and add your API key:
```
VITE_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### Step 3: Secure Your API Key (Recommended)

For production, restrict your API key:

1. In Google Cloud Console, go to your API key settings
2. Add application restrictions (HTTP referrers for web)
3. Add API restrictions (limit to Places API only)

### Features Enabled

With the Google Maps API configured, users get:

- **Location Autocomplete**: Smart location suggestions as you type
- **Accurate Coordinates**: Latitude/longitude for map integration
- **Place Details**: Full address and place information
- **Interactive Map View**: Visual representation of all locations with custom markers
- **Clickable Markers**: Click on map markers to see item details
- **Auto-fit Bounds**: Map automatically adjusts to show all locations
- **Sidebar Navigation**: Quick access to all items with location data

### Without API Key

The app will still work, but:
- Location fields will be plain text inputs
- No autocomplete suggestions
- Manual entry required
- Map view won't be available (will show setup instructions)

## Form Field Labels

### Required Fields (marked with red *)
- Travel Name
- Starting Location
- Ending Location
- Item Name (when adding activities, hotels, etc.)
- Check-In/Check-Out dates (for hotels)

### Optional Fields (marked with "(optional)")
- Description
- Start/End dates (for travel plan)
- Date & Time (for activities, restaurants, etc.)
- Location (for items)
- Price
- Additional Notes

## Date Validation Rules

1. **Travel Plan Dates**:
   - End date cannot be before start date
   - Automatically adjusts if invalid combination is entered

2. **Item Dates**:
   - All item dates must be within travel plan boundaries
   - Hotels: Check-out cannot be before check-in
   - Both enforced via UI constraints and JavaScript validation

## Location Data Structure

When a location is selected via autocomplete, the following data is stored:

```javascript
{
  name: "Paris",
  address: "Paris, France",
  placeId: "ChIJD7fiBh9u5kcRYJSMaMOCCwQ",
  lat: 48.856614,
  lng: 2.3522219
}
```

This data is used for the interactive map view and location-based features.

## Technical Notes

### Google Maps Script Loading

The application uses a centralized Google Maps API loader (`src/utils/googleMapsLoader.js`) to prevent duplicate script loading. This ensures:

- Script is loaded only once, even with multiple components using it
- Prevents "multiple includes" errors in production
- Handles concurrent loading requests via callback queue
- Checks for existing scripts before loading

Both `LocationInput` and `MapView` components use this centralized loader, ensuring no conflicts.

## Using the Map View

### Adding Items with Locations

1. When adding an item (hotel, restaurant, etc.), use the location field
2. Start typing and select from the autocomplete suggestions
3. This captures the full location data including coordinates
4. The item will automatically appear on the map

### Viewing the Map

1. Go to any travel plan detail page
2. Click the "🗺️ Map" tab
3. See all items with locations displayed on the map
4. Each marker uses the item's corresponding icon and color

### Interacting with the Map

- **Click markers** to see item details in an info window
- **Click "Edit Item"** in the info window to modify the item
- **Click items in the sidebar** to focus on their location
- Map automatically zooms and centers to show all locations

### Custom Markers

Each item type has its own icon and color:
- 🎯 Activities (Blue)
- 🏨 Hotels (Purple)
- 🍽️ Restaurants (Orange)
- 🎭 Attractions (Green)
- 🚗 Transportation (Red)

