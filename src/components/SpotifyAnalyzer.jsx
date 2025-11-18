import React, { useState, useMemo } from 'react';

import { Upload, Music, Clock, Calendar, TrendingUp, BarChart3 } from 'lucide-react';

import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SpotifyAnalyzer = () => {

  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('overview');

  const [selectedYear, setSelectedYear] = useState('all');

  const handleFileUpload = async (event) => {

    const files = Array.from(event.target.files);

    setLoading(true);

    try {

      let allStreams = [];

      for (const file of files) {

        if (file.name.endsWith('.json')) {

          const text = await file.text();

          const json = JSON.parse(text);

          allStreams = allStreams.concat(json);

        } else if (file.name.endsWith('.zip')) {

          alert('ZIP file support requires extraction. Please extract the ZIP file manually and upload the JSON files inside.');

          setLoading(false);

          return;

        }

      }

      if (allStreams.length === 0) {

        alert('No valid streaming data found. Please make sure you uploaded JSON files.');

      } else {

        setData(allStreams);

      }

    } catch (error) {

      alert('Error processing files. Please make sure they are valid Spotify JSON files.');

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  const stats = useMemo(() => {

    if (data.length === 0) return null;

    // Filter data by selected year

    const filteredData = selectedYear === 'all' 

      ? data 

      : data.filter(stream => {

          if (!stream.ts) return false;

          const year = new Date(stream.ts).getFullYear();

          return year === parseInt(selectedYear);

        });

    if (filteredData.length === 0) return null;

    const totalMs = filteredData.reduce((sum, stream) => sum + (stream.ms_played || 0), 0);

    const totalMinutes = Math.floor(totalMs / 60000);

    const totalHours = Math.floor(totalMinutes / 60);

    // Get available years

    const years = [...new Set(data.map(stream => {

      if (!stream.ts) return null;

      return new Date(stream.ts).getFullYear();

    }).filter(Boolean))].sort((a, b) => b - a);

    // Top artists

    const artistCounts = {};

    const artistTime = {};

    filteredData.forEach(stream => {

      const artist = stream.master_metadata_album_artist_name || stream.artistName || 'Unknown';

      artistCounts[artist] = (artistCounts[artist] || 0) + 1;

      artistTime[artist] = (artistTime[artist] || 0) + (stream.ms_played || 0);

    });

    const topArtists = Object.entries(artistCounts)

      .sort((a, b) => b[1] - a[1])

      .slice(0, 20)

      .map(([name, count]) => ({

        name,

        plays: count,

        hours: Math.round(artistTime[name] / 3600000 * 10) / 10

      }));

    // Top tracks

    const trackCounts = {};

    filteredData.forEach(stream => {

      const track = stream.master_metadata_track_name || stream.trackName || 'Unknown';

      const artist = stream.master_metadata_album_artist_name || stream.artistName || 'Unknown';

      const key = `${track} - ${artist}`;

      trackCounts[key] = (trackCounts[key] || 0) + 1;

    });

    const topTracks = Object.entries(trackCounts)

      .sort((a, b) => b[1] - a[1])

      .slice(0, 20)

      .map(([name, count]) => ({ name, plays: count }));

    // Top albums

    const albumCounts = {};

    const albumTime = {};

    filteredData.forEach(stream => {

      const album = stream.master_metadata_album_album_name || stream.albumName || 'Unknown';

      const artist = stream.master_metadata_album_artist_name || stream.artistName || 'Unknown';

      const key = `${album} - ${artist}`;

      albumCounts[key] = (albumCounts[key] || 0) + 1;

      albumTime[key] = (albumTime[key] || 0) + (stream.ms_played || 0);

    });

    const topAlbums = Object.entries(albumCounts)

      .sort((a, b) => b[1] - a[1])

      .slice(0,20)

      .map(([name, count]) => ({

        name,

        plays: count,

        hours: Math.round(albumTime[name] / 3600000 * 10) / 10

      }));

    // Listening by hour

    const hourCounts = Array(24).fill(0);

    filteredData.forEach(stream => {

      if (stream.ts) {

        const hour = new Date(stream.ts).getHours();

        hourCounts[hour]++;

      }

    });

    const hourData = hourCounts.map((count, hour) => ({

      hour: `${hour}:00`,

      plays: count

    }));

    // Listening by day of week

    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dayCounts = Array(7).fill(0);

    filteredData.forEach(stream => {

      if (stream.ts) {

        const day = new Date(stream.ts).getDay();

        dayCounts[day]++;

      }

    });

    const dayData = dayCounts.map((count, idx) => ({

      day: dayNames[idx],

      plays: count

    }));

    // Monthly listening

    const monthCounts = {};

    filteredData.forEach(stream => {

      if (stream.ts) {

        const date = new Date(stream.ts);

        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

        monthCounts[key] = (monthCounts[key] || 0) + 1;

      }

    });

    const monthData = Object.entries(monthCounts)

      .sort((a, b) => a[0].localeCompare(b[0]))

      .map(([month, count]) => ({ month, plays: count }));

    // Skip rate

    const skipped = filteredData.filter(s => (s.ms_played || 0) < 30000).length;

    const skipRate = ((skipped / filteredData.length) * 100).toFixed(1);

    return {

      totalStreams: filteredData.length,

      totalHours,

      totalMinutes,

      topArtists,

      topTracks,

      topAlbums,

      hourData,

      dayData,

      monthData,

      skipRate,

      uniqueArtists: Object.keys(artistCounts).length,

      uniqueTracks: Object.keys(trackCounts).length,

      uniqueAlbums: Object.keys(albumCounts).length,

      availableYears: years

    };

  }, [data, selectedYear]);

  const COLORS = ['#1db954', '#1ed760', '#169c46', '#117a37', '#0d5b29', '#1aa34a', '#22c55e', '#16a34a', '#15803d', '#166534'];

  if (data.length === 0) {

    return (

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 flex items-center justify-center p-4">

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-700">

          <div className="text-center mb-6">

            <Music className="w-16 h-16 text-green-500 mx-auto mb-4" />

            <h1 className="text-3xl font-bold text-white mb-2">Spotify History Analyzer</h1>

            <p className="text-gray-400">Upload your Spotify streaming history to discover your listening patterns</p>

          </div>

          {loading && (

            <div className="mt-4 text-center">

              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>

              <p className="text-gray-400 mt-2">Processing your data...</p>

            </div>

          )}

          

          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-gray-900">

            <div className="flex flex-col items-center justify-center pt-5 pb-6">

              <Upload className="w-12 h-12 text-gray-400 mb-3" />

              <p className="mb-2 text-sm text-gray-300">

                <span className="font-semibold">Click to upload</span> or drag and drop

              </p>

              <p className="text-xs text-gray-400">JSON files from Spotify data export (multiple files accepted)</p>

            </div>

            <input

              type="file"

              className="hidden"

              accept=".json"

              multiple

              onChange={handleFileUpload}

              disabled={loading}

            />

          </label>

          <div className="mt-6 text-xs text-gray-400 space-y-2">

            <p>💡 To get your data:</p>

            <ol className="list-decimal list-inside space-y-1 ml-2">

              <li>Go to spotify.com/account/privacy</li>

              <li>Request your extended streaming history</li>

              <li>Wait for the email (can take up to 30 days)</li>

              <li>Extract the ZIP file and upload all JSON files here (you can select multiple files at once)</li>

            </ol>

          </div>

        </div>

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 p-4">

      <div className="max-w-7xl mx-auto">

        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 mb-6 border border-gray-700">

          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">

            <div className="flex items-center gap-3">

              <Music className="w-8 h-8 text-green-500" />

              <h1 className="text-3xl font-bold text-white">Your Spotify Stats</h1>

            </div>

            <div className="flex items-center gap-3">

              <select

                value={selectedYear}

                onChange={(e) => setSelectedYear(e.target.value)}

                className="px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500"

              >

                <option value="all">All Time</option>

                {stats?.availableYears.map(year => (

                  <option key={year} value={year}>{year}</option>

                ))}

              </select>

              <button

                onClick={() => setData([])}

                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"

              >

                Upload New Data

              </button>

            </div>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">

              <div className="flex items-center gap-2 mb-2">

                <TrendingUp className="w-5 h-5 text-green-500" />

                <span className="text-gray-400 text-sm">Total Streams</span>

              </div>

              <p className="text-3xl font-bold text-white">{stats.totalStreams.toLocaleString()}</p>

            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">

              <div className="flex items-center gap-2 mb-2">

                <Clock className="w-5 h-5 text-green-500" />

                <span className="text-gray-400 text-sm">Hours Listened</span>

              </div>

              <p className="text-3xl font-bold text-white">{stats.totalHours.toLocaleString()}</p>

            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">

              <div className="flex items-center gap-2 mb-2">

                <Music className="w-5 h-5 text-green-500" />

                <span className="text-gray-400 text-sm">Unique Artists</span>

              </div>

              <p className="text-3xl font-bold text-white">{stats.uniqueArtists.toLocaleString()}</p>

            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">

              <div className="flex items-center gap-2 mb-2">

                <BarChart3 className="w-5 h-5 text-green-500" />

                <span className="text-gray-400 text-sm">Skip Rate</span>

              </div>

              <p className="text-3xl font-bold text-white">{stats.skipRate}%</p>

            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">

              <div className="flex items-center gap-2 mb-2">

                <Music className="w-5 h-5 text-green-500" />

                <span className="text-gray-400 text-sm">Unique Tracks</span>

              </div>

              <p className="text-3xl font-bold text-white">{stats.uniqueTracks.toLocaleString()}</p>

            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">

              <div className="flex items-center gap-2 mb-2">

                <Calendar className="w-5 h-5 text-green-500" />

                <span className="text-gray-400 text-sm">Unique Albums</span>

              </div>

              <p className="text-3xl font-bold text-white">{stats.uniqueAlbums.toLocaleString()}</p>

            </div>

          </div>

        </div>

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 mb-6">

          <div className="flex border-b border-gray-700 overflow-x-auto">

            {['overview', 'artists', 'albums', 'tracks', 'time'].map((tab) => (

              <button

                key={tab}

                onClick={() => setActiveTab(tab)}

                className={`flex-1 px-6 py-4 font-semibold capitalize transition-colors whitespace-nowrap ${

                  activeTab === tab

                    ? 'text-green-500 border-b-2 border-green-500 bg-gray-900'

                    : 'text-gray-400 hover:text-gray-300'

                }`}

              >

                {tab}

              </button>

            ))}

          </div>

          <div className="p-6">

            {activeTab === 'overview' && (

              <div className="space-y-6">

                <div>

                  <h3 className="text-xl font-bold text-white mb-4">Listening Over Time</h3>

                  <ResponsiveContainer width="100%" height={300}>

                    <LineChart data={stats.monthData}>

                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                      <XAxis dataKey="month" stroke="#9ca3af" />

                      <YAxis stroke="#9ca3af" />

                      <Tooltip 

                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}

                        labelStyle={{ color: '#fff' }}

                      />

                      <Line type="monotone" dataKey="plays" stroke="#1db954" strokeWidth={2} />

                    </LineChart>

                  </ResponsiveContainer>

                </div>

                <div className="grid md:grid-cols-2 gap-6">

                  <div>

                    <h3 className="text-xl font-bold text-white mb-4">Listening by Day</h3>

                    <ResponsiveContainer width="100%" height={250}>

                      <BarChart data={stats.dayData}>

                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                        <XAxis dataKey="day" stroke="#9ca3af" />

                        <YAxis stroke="#9ca3af" />

                        <Tooltip 

                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}

                          labelStyle={{ color: '#fff' }}

                        />

                        <Bar dataKey="plays" fill="#1db954" />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                  <div>

                    <h3 className="text-xl font-bold text-white mb-4">Listening by Hour</h3>

                    <ResponsiveContainer width="100%" height={250}>

                      <BarChart data={stats.hourData}>

                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                        <XAxis dataKey="hour" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />

                        <YAxis stroke="#9ca3af" />

                        <Tooltip 

                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}

                          labelStyle={{ color: '#fff' }}

                        />

                        <Bar dataKey="plays" fill="#1db954" />

                      </BarChart>

                    </ResponsiveContainer>

                  </div>

                </div>

              </div>

            )}

            {activeTab === 'artists' && (

              <div>

                <h3 className="text-xl font-bold text-white mb-4">Top 20 Artists</h3>

                <div className="grid md:grid-cols-2 gap-6">

                  <div className="space-y-3">

                    {stats.topArtists.map((artist, idx) => (

                      <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700">

                        <div className="flex justify-between items-center mb-2">

                          <span className="text-white font-semibold">#{idx + 1} {artist.name}</span>

                          <span className="text-green-500 font-bold">{artist.plays} plays</span>

                        </div>

                        <div className="text-gray-400 text-sm">{artist.hours} hours</div>

                      </div>

                    ))}

                  </div>

                  

                  <ResponsiveContainer width="100%" height={400}>

                    <PieChart>

                      <Pie

                        data={stats.topArtists}

                        dataKey="plays"

                        nameKey="name"

                        cx="50%"

                        cy="50%"

                        outerRadius={120}

                        label={(entry) => entry.name.length > 15 ? entry.name.slice(0, 15) + '...' : entry.name}

                      >

                        {stats.topArtists.map((entry, index) => (

                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />

                        ))}

                      </Pie>

                      <Tooltip 

                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}

                        labelStyle={{ color: '#fff' }}

                      />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </div>

            )}

            {activeTab === 'albums' && (

              <div>

                <h3 className="text-xl font-bold text-white mb-4">Top 20 Albums</h3>

                <div className="grid md:grid-cols-2 gap-6">

                  <div className="space-y-3">

                    {stats.topAlbums.map((album, idx) => (

                      <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700">

                        <div className="flex justify-between items-center mb-2">

                          <span className="text-white font-semibold">#{idx + 1} {album.name}</span>

                          <span className="text-green-500 font-bold">{album.plays} plays</span>

                        </div>

                        <div className="text-gray-400 text-sm">{album.hours} hours</div>

                      </div>

                    ))}

                  </div>

                  

                  <ResponsiveContainer width="100%" height={400}>

                    <PieChart>

                      <Pie

                        data={stats.topAlbums}

                        dataKey="plays"

                        nameKey="name"

                        cx="50%"

                        cy="50%"

                        outerRadius={120}

                        label={(entry) => entry.name.length > 15 ? entry.name.slice(0, 15) + '...' : entry.name}

                      >

                        {stats.topAlbums.map((entry, index) => (

                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />

                        ))}

                      </Pie>

                      <Tooltip 

                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}

                        labelStyle={{ color: '#fff' }}

                      />

                    </PieChart>

                  </ResponsiveContainer>

                </div>

              </div>

            )}

            {activeTab === 'tracks' && (

              <div>

                <h3 className="text-xl font-bold text-white mb-4">Top 20 Tracks</h3>

                <div className="grid md:grid-cols-2 gap-4">

                  <div className="space-y-3">

                    {stats.topTracks.map((track, idx) => (

                      <div key={idx} className="bg-gray-900 rounded-lg p-4 border border-gray-700">

                        <div className="flex justify-between items-center">

                          <div className="flex-1 min-w-0">

                            <span className="text-green-500 font-bold mr-2">#{idx + 1}</span>

                            <span className="text-white font-semibold truncate block">{track.name}</span>

                          </div>

                          <span className="text-green-500 font-bold ml-4">{track.plays}</span>

                        </div>

                      </div>

                    ))}

                  </div>

                  <ResponsiveContainer width="100%" height={450}>

                    <BarChart data={stats.topTracks} layout="vertical">

                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                      <XAxis type="number" stroke="#9ca3af" />

                      <YAxis dataKey="name" type="category" width={150} stroke="#9ca3af" />

                      <Tooltip 

                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}

                        labelStyle={{ color: '#fff' }}

                      />

                      <Bar dataKey="plays" fill="#1db954" />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            )}

            {activeTab === 'time' && (

              <div className="space-y-6">

                <div>

                  <h3 className="text-xl font-bold text-white mb-4">Listening Patterns by Hour</h3>

                  <ResponsiveContainer width="100%" height={300}>

                    <BarChart data={stats.hourData}>

                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                      <XAxis dataKey="hour" stroke="#9ca3af" />

                      <YAxis stroke="#9ca3af" />

                      <Tooltip 

                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}

                        labelStyle={{ color: '#fff' }}

                      />

                      <Bar dataKey="plays" fill="#1db954" />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

                <div>

                  <h3 className="text-xl font-bold text-white mb-4">Weekly Listening Pattern</h3>

                  <ResponsiveContainer width="100%" height={300}>

                    <BarChart data={stats.dayData}>

                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />

                      <XAxis dataKey="day" stroke="#9ca3af" />

                      <YAxis stroke="#9ca3af" />

                      <Tooltip 

                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}

                        labelStyle={{ color: '#fff' }}

                      />

                      <Bar dataKey="plays" fill="#1db954" />

                    </BarChart>

                  </ResponsiveContainer>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </div>

  );

};

export default SpotifyAnalyzer;

