# Spotify History Analyzer

A beautiful React application to analyze your Spotify streaming history data. Upload your exported JSON files and discover your listening patterns, top artists, tracks, albums, and more!

## Features

- 📊 **Comprehensive Analytics**: View your total streams, hours listened, unique artists, tracks, and albums
- 📈 **Visual Charts**: Interactive charts showing listening patterns over time, by hour, and by day of week
- 🎵 **Top Lists**: Discover your top 10 artists, tracks, and albums
- 📅 **Year Filtering**: Filter your data by year to see how your taste evolved
- 🎨 **Beautiful UI**: Modern, dark-themed interface with Spotify-inspired green accents

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser and navigate to the URL shown in the terminal (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## How to Get Your Spotify Data

1. Go to [spotify.com/account/privacy](https://www.spotify.com/account/privacy)
2. Scroll down to "Download your data"
3. Request your "Extended streaming history"
4. Wait for the email (can take up to 30 days)
5. Download and extract the ZIP file
6. Upload all JSON files from the extracted folder to the app

## Usage

1. Click or drag and drop your Spotify JSON files onto the upload area
2. Wait for the data to process
3. Explore your listening statistics across different tabs:
   - **Overview**: General listening trends and patterns
   - **Artists**: Your top artists with play counts and hours listened
   - **Albums**: Your most played albums
   - **Tracks**: Your favorite songs
   - **Time**: Detailed time-based listening patterns

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Recharts
- Lucide React (icons)

## License

MIT

