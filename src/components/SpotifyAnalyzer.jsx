import React, { useState, useMemo } from 'react';
import { Upload, Music, Clock, Calendar, TrendingUp, BarChart3, Menu, X } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SpotifyAnalyzer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedYear, setSelectedYear] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

    const years = [...new Set(data.map(stream => {
      if (!stream.ts) return null;
      return new Date(stream.ts).getFullYear();
    }).filter(Boolean))].sort((a, b) => b - a);

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
      .slice(0, 20)
      .map(([name, count]) => ({
        name,
        plays: count,
        hours: Math.round(albumTime[name] / 3600000 * 10) / 10
      }));

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

  const COLORS = [
    '#1db954', '#1ed760', '#169c46', '#117a37', '#0d5b29', '#1aa34a', '#22c55e', '#16a34a', '#15803d', '#166534',
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#ffd93d', '#6bcf7f', '#ff9999', '#99ccff', '#ffcc99', '#cc99ff', '#99ffcc',
    '#ff6b9d', '#c44569', '#f8a100', '#2ecc71', '#3498db', '#9b59b6', '#1abc9c', '#e74c3c', '#34495e', '#f39c12'
  ];

  const tabs = ['overview', 'artists', 'albums', 'tracks', 'time'];

  if (data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md w-full border border-gray-700">
          <div className="text-center mb-6">
            <Music className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Spotify History Analyzer</h1>
            <p className="text-gray-400 text-sm sm:text-base">Upload your Spotify streaming history to discover your listening patterns</p>
          </div>
          
          <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer hover:border-green-500 transition-colors bg-gray-900">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mb-3" />
              <p className="mb-2 text-xs sm:text-sm text-gray-300">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-400">JSON files from Spotify data export</p>
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
              <li>Wait for the email (up to 30 days)</li>
              <li>Extract ZIP and upload JSON files</li>
            </ol>
          </div>

          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              <p className="text-gray-400 mt-2 text-sm">Processing your data...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-gray-900 p-3 sm:p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Music className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
              <h1 className="text-xl sm:text-3xl font-bold text-white truncate">Spotify Stats</h1>
            </div>
            <button
              onClick={() => setData([])}
              className="px-3 sm:px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors text-xs sm:text-sm flex-shrink-0"
            >
              New
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 text-xs sm:text-sm"
            >
              <option value="all">All Time</option>
              {stats?.availableYears.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <StatCard icon={TrendingUp} label="Streams" value={stats.totalStreams.toLocaleString()} />
            <StatCard icon={Clock} label="Hours" value={stats.totalHours.toLocaleString()} />
            <StatCard icon={Music} label="Artists" value={stats.uniqueArtists.toLocaleString()} />
            <StatCard icon={BarChart3} label="Skip %" value={stats.skipRate + '%'} />
            <StatCard icon={Music} label="Tracks" value={stats.uniqueTracks.toLocaleString()} />
            <StatCard icon={Calendar} label="Albums" value={stats.uniqueAlbums.toLocaleString()} />
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl sm:rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          {/* Mobile Menu Button */}
          <div className="sm:hidden flex items-center justify-between bg-gray-900 px-4 py-3 border-b border-gray-700">
            <span className="text-white font-semibold text-sm capitalize">{activeTab}</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-green-500"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Tab Navigation */}
          <div className={`border-b border-gray-700 overflow-x-auto ${mobileMenuOpen ? 'block' : 'hidden'} sm:block`}>
            <div className="flex flex-col sm:flex-row">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => {
                    setActiveTab(tab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex-1 px-4 py-3 sm:px-6 sm:py-4 font-semibold capitalize transition-colors whitespace-nowrap text-sm sm:text-base border-b-2 ${
                    activeTab === tab
                      ? 'text-green-500 border-green-500 bg-gray-900'
                      : 'text-gray-400 hover:text-gray-300 border-transparent'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-3 sm:p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Listening Over Time</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={stats.monthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Line type="monotone" dataKey="plays" stroke="#1db954" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">By Day</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.dayData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="plays" fill="#1db954" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">By Hour</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={stats.hourData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={70} />
                        <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
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

            {activeTab === 'artists' && stats && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Top 20 Artists</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    {stats.topArtists && stats.topArtists.map((artist, idx) => (
                      <div key={idx} className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-700">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-white font-semibold text-sm sm:text-base line-clamp-2">#{idx + 1} {artist.name}</span>
                          <span className="text-green-500 font-bold text-xs sm:text-sm flex-shrink-0">{artist.plays}</span>
                        </div>
                        <div className="text-gray-400 text-xs">{artist.hours} hrs</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="hidden lg:flex justify-center">
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={stats.topArtists}
                          dataKey="plays"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          label={({ name, plays }) => {
                            const total = stats.topArtists.reduce((sum, a) => sum + a.plays, 0);
                            const percent = ((plays / total) * 100).toFixed(0);
                            return `${percent}%`;
                          }}
                        >
                          {stats.topArtists.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                          formatter={(value, name, props) => {
                            const total = stats.topArtists.reduce((sum, a) => sum + a.plays, 0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${value} plays (${percent}%)`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="lg:hidden">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.topArtists}
                          dataKey="plays"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={80}
                          label={({ plays }) => {
                            const total = stats.topArtists.reduce((sum, a) => sum + a.plays, 0);
                            const percent = ((plays / total) * 100).toFixed(0);
                            return `${percent}%`;
                          }}
                        >
                          {stats.topArtists.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                          formatter={(value, name, props) => {
                            const total = stats.topArtists.reduce((sum, a) => sum + a.plays, 0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${value} plays (${percent}%)`;
                          }}
                        />
                        <Legend 
                          layout="horizontal"
                          align="center"
                          verticalAlign="bottom"
                          wrapperStyle={{ paddingTop: '10px' }}
                          formatter={(value, entry) => {
                            const dataPoint = entry.payload;
                            return `${dataPoint.name.length > 12 ? dataPoint.name.substring(0, 12) + '...' : dataPoint.name}`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'albums' && stats && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Top 20 Albums</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
                  <div className="space-y-2 sm:space-y-3">
                    {stats.topAlbums && stats.topAlbums.map((album, idx) => (
                      <div key={idx} className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-700">
                        <div className="flex justify-between items-start gap-2 mb-1">
                          <span className="text-white font-semibold text-sm sm:text-base line-clamp-2">#{idx + 1} {album.name}</span>
                          <span className="text-green-500 font-bold text-xs sm:text-sm flex-shrink-0">{album.plays}</span>
                        </div>
                        <div className="text-gray-400 text-xs">{album.hours} hrs</div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="hidden lg:flex gap-6">
                    <div className="flex-1">
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={stats.topAlbums}
                            dataKey="plays"
                            nameKey="name"
                            cx="60%"
                            cy="50%"
                            outerRadius={90}
                            label={({ plays }) => {
                              const total = stats.topAlbums.reduce((sum, a) => sum + a.plays, 0);
                              const percent = ((plays / total) * 100).toFixed(0);
                              return `${percent}%`;
                            }}
                          >
                            {stats.topAlbums.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            labelStyle={{ color: '#fff' }}
                            formatter={(value) => {
                              const total = stats.topAlbums.reduce((sum, a) => sum + a.plays, 0);
                              const percent = ((value / total) * 100).toFixed(1);
                              return `${value} plays (${percent}%)`;
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="w-48 overflow-y-auto max-h-80">
                      {stats.topAlbums.map((album, idx) => (
                        <div key={idx} className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                          ></div>
                          <span className="text-gray-300 text-xs truncate">{album.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:hidden">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.topAlbums}
                          dataKey="plays"
                          nameKey="name"
                          cx="50%"
                          cy="45%"
                          outerRadius={80}
                          label={({ plays }) => {
                            const total = stats.topAlbums.reduce((sum, a) => sum + a.plays, 0);
                            const percent = ((plays / total) * 100).toFixed(0);
                            return `${percent}%`;
                          }}
                        >
                          {stats.topAlbums.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                          formatter={(value, name, props) => {
                            const total = stats.topAlbums.reduce((sum, a) => sum + a.plays, 0);
                            const percent = ((value / total) * 100).toFixed(1);
                            return `${value} plays (${percent}%)`;
                          }}
                        />
                        <Legend 
                          layout="horizontal"
                          align="center"
                          verticalAlign="bottom"
                          wrapperStyle={{ paddingTop: '10px' }}
                          formatter={(value, entry) => {
                            const dataPoint = entry.payload;
                            return `${dataPoint.name.length > 12 ? dataPoint.name.substring(0, 12) + '...' : dataPoint.name}`;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'tracks' && stats && (
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Top 20 Tracks</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-2 sm:space-y-3">
                    {stats.topTracks && stats.topTracks.map((track, idx) => (
                      <div key={idx} className="bg-gray-900 rounded-lg p-3 sm:p-4 border border-gray-700">
                        <div className="flex justify-between items-start gap-2">
                          <div className="flex-1 min-w-0">
                            <span className="text-green-500 font-bold text-xs sm:text-sm mr-2">#{idx + 1}</span>
                            <span className="text-white font-semibold text-xs sm:text-sm line-clamp-2">{track.name}</span>
                          </div>
                          <span className="text-green-500 font-bold text-xs sm:text-sm flex-shrink-0">{track.plays}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="hidden lg:block">
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={stats.topTracks} layout="vertical" margin={{ top: 0, right: 30, left: 100, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" width={100} stroke="#9ca3af" tick={{ fontSize: 10 }} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                          labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="plays" fill="#1db954" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="lg:hidden">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.topTracks} layout="vertical" margin={{ top: 0, right: 30, left: 80, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="name" type="category" width={80} stroke="#9ca3af" tick={{ fontSize: 9 }} />
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

            {activeTab === 'time' && (
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Hourly Patterns</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.hourData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="hour" stroke="#9ca3af" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={70} />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Bar dataKey="plays" fill="#1db954" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Weekly Pattern</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={stats.dayData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9ca3af" tick={{ fontSize: 12 }} />
                      <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} />
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

const StatCard = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-900 rounded-lg p-2.5 sm:p-4 border border-gray-700">
    <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
      <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 flex-shrink-0" />
      <span className="text-gray-400 text-xs sm:text-sm truncate">{label}</span>
    </div>
    <p className="text-xl sm:text-2xl font-bold text-white truncate">{value}</p>
  </div>
);

export default SpotifyAnalyzer;