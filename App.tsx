import React, { useState, useEffect, useRef } from 'react';
import { UserRole, CameraNode, AccessRequest, RequestStatus, MOCK_CAMERAS, generateMockCameras, MOCK_INCIDENTS, Incident, CommunityAlert, MOCK_ALERTS } from './types';
import { VideoAnalyzer } from './components/VideoAnalyzer';

// Mapbox
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// TODO: Replace with your actual Mapbox Token
const MAPBOX_TOKEN = 'pk.eyJ1Ijoia2FyYW5zaW5naHJhdGhvcmU4MjAiLCJhIjoiY21meXgxOG9xMGgydDJqc2cwczUxbDJibiJ9.UVPMx667PJQ5adCpPe6LFA';
mapboxgl.accessToken = MAPBOX_TOKEN;


// -- Components --

// 1. Enhanced Login/Landing Page
const LandingPage: React.FC<{ onLogin: (role: UserRole) => void }> = ({ onLogin }) => {
  const [step, setStep] = useState<'role-select' | 'login-form'>('role-select');
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.NONE);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep('login-form');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(selectedRole);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden">

      <div className="z-10 w-full max-w-4xl px-4">
        <div className="text-center mb-16 animate-clip">
          <div className="w-fit mx-auto inline-flex items-center gap-3 bg-zinc-900/80 border border-orange-800/40 px-4 py-2 rounded-full mb-8 hover:border-red-500/50 transition-colors cursor-default">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-xs font-semibold tracking-wide text-zinc-400 uppercase">System Operational</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold text-zinc-100 mb-6 tracking-tight drop-shadow-md">
            CASC <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">CONNECT</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto font-light leading-relaxed">
            Advanced Community Surveillance & Rapid Response Network
          </p>
        </div>

        {step === 'role-select' ? (
          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-clip delay-100">
            {/* Police Card */}
            <button
              onClick={() => handleRoleSelect(UserRole.POLICE)}
              className="flex-1 max-w-sm group gradient-border-card p-10 rounded-3xl transition-transform hover:-translate-y-2 duration-500 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                <iconify-icon icon="solar:shield-user-bold" class="text-8xl text-red-500 transform translate-x-4 -translate-y-4"></iconify-icon>
              </div>
              <div className="w-14 h-14 bg-zinc-800 border border-orange-800/30 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-red-500 group-hover:text-white transition-colors duration-500">
                <iconify-icon icon="solar:user-id-bold" class="text-2xl text-red-500 group-hover:text-white"></iconify-icon>
              </div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">Law Enforcement</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">Secure portal for authorities to monitor incidents and request evidence.</p>
            </button>

            {/* Homeowner Card */}
            <button
              onClick={() => handleRoleSelect(UserRole.HOMEOWNER)}
              className="flex-1 max-w-sm group bg-zinc-900/50 border border-orange-800/30 hover:border-red-500/50 p-10 rounded-3xl transition-all duration-500 hover:bg-zinc-800 text-left relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-20 transition-opacity">
                <iconify-icon icon="solar:home-wifi-bold" class="text-8xl text-zinc-400 transform translate-x-4 -translate-y-4"></iconify-icon>
              </div>
              <div className="w-14 h-14 bg-zinc-800 border border-orange-800/30 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-zinc-700 group-hover:text-white transition-colors duration-500">
                <iconify-icon icon="solar:home-smile-bold" class="text-2xl text-zinc-400 group-hover:text-white"></iconify-icon>
              </div>
              <h2 className="text-2xl font-bold text-zinc-100 mb-2">Homeowner</h2>
              <p className="text-zinc-500 text-sm leading-relaxed">Manage your camera feed, privacy settings, and community alerts.</p>
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto glass-panel p-8 rounded-3xl shadow-2xl relative animate-clip delay-100">
            <button
              onClick={() => setStep('role-select')}
              className="absolute top-6 left-6 text-zinc-500 hover:text-red-500 text-sm flex items-center transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800/50 flex items-center justify-center mr-2 group-hover:bg-zinc-800 transition-colors">
                <iconify-icon icon="solar:arrow-left-linear"></iconify-icon>
              </div>
              <span className="font-medium">Back</span>
            </button>

            <div className="mt-8">
              <h2 className="text-2xl font-bold text-zinc-100 mb-6 flex items-center justify-center">
                {selectedRole === UserRole.POLICE ? (
                  <><iconify-icon icon="solar:shield-bold" class="text-red-500 mr-3"></iconify-icon> Authority Login</>
                ) : (
                  <><iconify-icon icon="solar:home-smile-bold" class="text-zinc-400 mr-3"></iconify-icon> Resident Login</>
                )}
              </h2>

              <form onSubmit={handleLoginSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    {selectedRole === UserRole.POLICE ? 'Badge ID' : 'Email Address'}
                  </label>
                  <input
                    type={selectedRole === UserRole.POLICE ? "text" : "email"}
                    className="w-full bg-zinc-950 border border-orange-800/20 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-zinc-700"
                    placeholder={selectedRole === UserRole.POLICE ? "e.g. BADGE-8842" : "you@example.com"}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    className="w-full bg-zinc-950 border border-orange-800/20 rounded-xl px-4 py-3 text-zinc-300 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-zinc-700"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-beam bg-zinc-100 text-zinc-900 py-3.5 rounded-xl font-bold shadow-lg hover:bg-white transition-all transform active:scale-95"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <iconify-icon icon="svg-spinners:ring-resize" class="text-red-500"></iconify-icon> Authenticating...
                    </span>
                  ) : 'Log In'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// -- Extracted Components --

interface DemoControlsProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
}

const DemoControls: React.FC<DemoControlsProps> = ({ currentRole, setCurrentRole }) => {
  if (currentRole === UserRole.NONE) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[9999] glass-panel border-orange-800/30 p-2 rounded-xl shadow-2xl flex flex-col gap-2">
      <div className="text-[10px] text-zinc-500 uppercase font-bold text-center mb-1">Demo Controls</div>
      <button
        onClick={() => setCurrentRole(UserRole.POLICE)}
        className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-2 ${currentRole === UserRole.POLICE ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
      >
        <iconify-icon icon="solar:shield-user-bold"></iconify-icon> Police View
      </button>
      <button
        onClick={() => setCurrentRole(UserRole.HOMEOWNER)}
        className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-2 ${currentRole === UserRole.HOMEOWNER ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
      >
        <iconify-icon icon="solar:home-smile-bold"></iconify-icon> Homeowner View
      </button>
    </div>
  );
};

interface PoliceDashboardProps {
  cameras: CameraNode[];
  setCameras: React.Dispatch<React.SetStateAction<CameraNode[]>>;
  requests: AccessRequest[];
  selectedCameraId: string | null;
  setSelectedCameraId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedIncidentId: string | null;
  setSelectedIncidentId: React.Dispatch<React.SetStateAction<string | null>>;
  isRequestModalOpen: boolean;
  setIsRequestModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  analyzingRequest: AccessRequest | null;
  setAnalyzingRequest: React.Dispatch<React.SetStateAction<AccessRequest | null>>;
  activeTab: 'cameras' | 'incidents';
  setActiveTab: React.Dispatch<React.SetStateAction<'cameras' | 'incidents'>>;
  setCurrentRole: (role: UserRole) => void;
  onRequestAccess: (reason: string, time: string) => void;
  showNotification: (msg: string) => void;
}

const PoliceDashboard: React.FC<PoliceDashboardProps> = ({
  cameras, setCameras, requests, selectedCameraId, setSelectedCameraId,
  selectedIncidentId, setSelectedIncidentId, isRequestModalOpen, setIsRequestModalOpen,
  analyzingRequest, setAnalyzingRequest, activeTab, setActiveTab, setCurrentRole,
  onRequestAccess, showNotification
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const incidentMarkersRef = useRef<mapboxgl.Marker[]>([]);

  const selectedCamera = cameras.find(c => c.id === selectedCameraId);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);

  // Initial Geolocation
  useEffect(() => {
    const fetchIpLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.latitude && data.longitude) {
          const lat = parseFloat(data.latitude);
          const lng = parseFloat(data.longitude);
          setMapCenter([lat, lng]);
          setCameras(generateMockCameras(lat, lng));
          showNotification(`Located via IP: ${data.city || 'Unknown'}`);
          return;
        }
      } catch (e) {
        console.warn("IP Geolocation failed:", e);
      }

      // Final fallback to San Francisco
      const sfCoords: [number, number] = [37.7749, -122.4194];
      setMapCenter(sfCoords);
      setCameras(generateMockCameras(sfCoords[0], sfCoords[1]));
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          // Update global cameras based on location
          setCameras(generateMockCameras(latitude, longitude));
        },
        (error) => {
          console.warn("Geolocation warning:", error.message);
          fetchIpLocation();
        }
      );
    } else {
      fetchIpLocation();
    }
  }, []); // Intentionally empty dependency array

  // Handle Search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newLat = parseFloat(lat);
        const newLng = parseFloat(lon);

        // Fly to new location
        mapInstance.current?.flyTo({
          center: [newLng, newLat],
          zoom: 14,
          essential: true
        });

        // Regenerate cameras around new location
        const newCameras = generateMockCameras(newLat, newLng);
        setCameras(newCameras);
        showNotification(`Moved to ${data[0].display_name.split(',')[0]} and found ${newCameras.length} active units.`);
      } else {
        showNotification("Location not found.");
      }
    } catch (error) {
      console.error("Search failed:", error);
      showNotification("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current || !mapCenter) return;

    mapInstance.current = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11', // Dark theme
      center: [mapCenter[1], mapCenter[0]], // Mapbox uses [lng, lat]
      zoom: 14,
      attributionControl: false
    });

    mapInstance.current.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-right');

    const resizeObserver = new ResizeObserver(() => {
      mapInstance.current?.resize();
    });
    resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [mapCenter]);

  // Update Markers (Cameras)
  useEffect(() => {
    if (!mapInstance.current) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    cameras.filter(c => !c.isPrivate).forEach(cam => {
      const isSelected = selectedCameraId === cam.id;

      // Create custom DOM element for marker
      const el = document.createElement('div');
      el.className = 'custom-marker';
      el.innerHTML = `
        <div class="w-8 h-8 rounded-full border-2 ${isSelected ? 'bg-red-600 border-white scale-125 z-50' : 'bg-zinc-800 border-zinc-600 hover:bg-red-500 hover:border-red-400'} flex items-center justify-center shadow-lg transition-all cursor-pointer">
          <iconify-icon icon="solar:videocamera-record-bold" class="text-white text-sm"></iconify-icon>
        </div>
      `;

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([cam.lng, cam.lat])
        .addTo(mapInstance.current!);

      el.addEventListener('click', () => {
        setSelectedCameraId(cam.id);
        setSelectedIncidentId(null);
      });

      markersRef.current.push(marker);
    });

  }, [cameras, selectedCameraId]);

  // Update Incident Layer
  useEffect(() => {
    if (!mapInstance.current) return;

    incidentMarkersRef.current.forEach(m => m.remove());
    incidentMarkersRef.current = [];

    if (selectedIncidentId) {
      const incident = MOCK_INCIDENTS.find(i => i.id === selectedIncidentId);
      if (incident) {
        mapInstance.current.flyTo({
          center: [incident.lng, incident.lat],
          zoom: 16,
          essential: true
        });

        const el = document.createElement('div');
        el.className = 'incident-marker';
        el.innerHTML = `
          <div class="relative flex items-center justify-center">
             <div class="absolute w-24 h-24 bg-red-500/20 rounded-full animate-ping"></div>
             <div class="relative w-8 h-8 rounded-full bg-red-600 border-2 border-white flex items-center justify-center shadow-xl animate-bounce">
                <iconify-icon icon="solar:danger-bold" class="text-white text-sm"></iconify-icon>
             </div>
          </div>
        `;

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([incident.lng, incident.lat])
          .addTo(mapInstance.current);

        incidentMarkersRef.current.push(marker);
      }
    }
  }, [selectedIncidentId]);

  const filteredCameras = selectedIncidentId
    ? cameras.filter(c => {
      const incident = MOCK_INCIDENTS.find(i => i.id === selectedIncidentId);
      if (!incident || c.isPrivate) return false;
      const dist = Math.sqrt(Math.pow(c.lat - incident.lat, 2) + Math.pow(c.lng - incident.lng, 2));
      return dist < 0.005;
    })
    : cameras.filter(c => !c.isPrivate);

  // Debug Police View
  console.log("🚔 POLICE VIEW DEBUG:", {
    totalRequests: requests.length,
    approvedRequests: requests.filter(r => r.status === RequestStatus.APPROVED).length,
    allRequests: requests.map(r => ({
      id: r.id,
      status: r.status,
      cameraId: r.cameraId,
      hasVideo: !!r.videoFile,
      hasUrl: !!r.videoUrl
    }))
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* POLICE HEADER */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex justify-between items-center z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-red-600 rounded-lg flex items-center justify-center shadow-lg shadow-red-600/20">
            <iconify-icon icon="solar:shield-bold" class="text-white text-xl"></iconify-icon>
          </div>
          <div>
            <h1 className="font-bold text-zinc-100 leading-tight text-lg">CASC Command</h1>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Jaipur Police Dept.</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-6 relative group">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-red-500 transition-colors">
            <iconify-icon icon="solar:magnifer-linear"></iconify-icon>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search area (e.g., 'Brooklyn', 'London')..."
            className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-10 pr-4 py-2 text-sm text-zinc-200 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-zinc-600"
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <iconify-icon icon="line-md:loading-loop" class="text-red-500"></iconify-icon>
            </div>
          )}
        </form>

        <button
          onClick={() => setCurrentRole(UserRole.NONE)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-xs hover:bg-zinc-800 hover:text-white transition-colors"
        >
          <iconify-icon icon="solar:logout-2-bold"></iconify-icon> Log Out
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar */}
        <div className="w-[400px] bg-zinc-900 border-r border-zinc-800 flex flex-col z-10 shadow-2xl">
          <div className="p-4">
            <div className="flex bg-zinc-950 p-1 rounded-md border border-zinc-800">
              <button
                onClick={() => { setActiveTab('incidents'); setSelectedCameraId(null); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded transition-all ${activeTab === 'incidents' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Active Incidents
              </button>
              <button
                onClick={() => { setActiveTab('cameras'); setSelectedIncidentId(null); }}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wide rounded transition-all ${activeTab === 'cameras' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Camera Network
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">


            {/* Pending Analysis Requests */}
            {requests.filter(r => r.status === RequestStatus.APPROVED).length > 0 && (
              <div className="mb-6 bg-red-950/30 border border-red-500/20 rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-red-500/20 flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center">
                    <iconify-icon icon="solar:check-read-linear" class="text-white text-[10px]"></iconify-icon>
                  </div>
                  <span className="text-xs font-bold text-red-200 uppercase tracking-wider">Evidence Received ({requests.filter(r => r.status === RequestStatus.APPROVED).length})</span>
                </div>

                {requests.filter(r => r.status === RequestStatus.APPROVED).map(req => (
                  <div key={req.id} className="p-4" onClick={() => setAnalyzingRequest(req)}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-white font-bold text-sm">Case #{req.id.slice(-4)}</span>
                      <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">Ready</span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-4 line-clamp-2">{req.reason}</p>
                    <button className="w-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 rounded shadow-lg transition-colors">
                      Launch Analysis Tool
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: INCIDENTS */}
            {activeTab === 'incidents' && (
              <div className="space-y-2">
                {MOCK_INCIDENTS.map(inc => (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    className={`p-4 cursor-pointer transition-all rounded-lg border ${selectedIncidentId === inc.id ? 'bg-zinc-800 border-red-500' : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="font-bold text-zinc-200 text-sm">{inc.type}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500">{inc.timestamp}</span>
                    </div>
                    <p className="text-xs text-zinc-500 mb-2">{inc.description}</p>
                  </div>
                ))}
              </div>
            )}

            {/* TAB: CAMERAS */}
            {activeTab === 'cameras' && (
              <div className="space-y-1">
                {selectedIncidentId && (
                  <div className="p-3 bg-red-900/10 text-red-300 text-xs text-center border border-red-900/20 rounded-lg mb-3 flex items-center justify-center gap-2">
                    <iconify-icon icon="solar:filter-bold"></iconify-icon> Filtering by proximity
                  </div>
                )}
                {filteredCameras.map(cam => (
                  <div
                    key={cam.id}
                    onClick={() => {
                      setSelectedCameraId(cam.id);
                      mapInstance.current?.flyTo({ center: [cam.lng, cam.lat], zoom: 16 });
                    }}
                    className={`p-4 cursor-pointer transition-all border-l-[3px] flex justify-between items-center ${selectedCameraId === cam.id
                      ? 'bg-zinc-800 border-l-red-500'
                      : 'bg-transparent border-l-transparent hover:bg-zinc-800/50'
                      }`}
                  >
                    <div>
                      <h3 className="font-bold text-zinc-200 text-sm mb-0.5">{cam.ownerName}</h3>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <iconify-icon icon="solar:map-point-bold" class="text-[10px]"></iconify-icon> {cam.address}
                      </p>
                    </div>
                    {cam.hasFootage && (
                      <iconify-icon icon="solar:videocamera-record-bold" class="text-green-500 text-sm" title="Online"></iconify-icon>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 relative bg-zinc-950 border-3 border-zinc-700">
          {/* Map Container */}
          <div id="map" ref={mapRef} className="w-full h-full z-0"></div>

          {/* Overlay: Selected Camera Card */}
          {selectedCamera && !analyzingRequest && (
            <div className="absolute top-12 left-12 w-80 bg-zinc-900/95 backdrop-blur border border-zinc-700 rounded-lg p-5 shadow-2xl z-[1000] animate-clip">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <iconify-icon icon="solar:videocamera-record-bold" class="text-red-500"></iconify-icon>
                    <h3 className="text-lg font-bold text-zinc-100">{selectedCamera.ownerName}</h3>
                  </div>
                  <p className="text-sm text-zinc-500">{selectedCamera.address}</p>
                </div>
                <button onClick={() => setSelectedCameraId(null)} className="text-zinc-600 hover:text-zinc-300">
                  <iconify-icon icon="solar:close-circle-bold"></iconify-icon>
                </button>
              </div>

              <div className="flex gap-4 mb-5">
                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-2">
                  <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Status</span>
                  <span className="text-green-500 text-sm font-bold">Online</span>
                </div>
                <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-2">
                  <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Registered</span>
                  <span className="text-zinc-300 text-sm">2023</span>
                </div>
              </div>

              <button
                onClick={() => setIsRequestModalOpen(true)}
                className="w-full bg-gradient-to-b from-zinc-100 to-zinc-200 text-zinc-900 hover:from-white hover:to-zinc-100 py-2.5 rounded font-bold text-sm shadow-lg transition-all"
              >
                Request Footage
              </button>
            </div>
          )}
        </div>

        {/* Request Modal */}
        {isRequestModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[2000] p-4">
            <div className="bg-zinc-900 p-6 rounded-2xl w-full max-w-md border border-zinc-700 shadow-2xl animate-clip">
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <h3 className="text-xl font-bold text-zinc-100">Official Request</h3>
                <button onClick={() => setIsRequestModalOpen(false)} className="text-zinc-500 hover:text-white"><iconify-icon icon="solar:close-circle-bold"></iconify-icon></button>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const reason = (form.elements.namedItem('reason') as HTMLInputElement).value;
                const time = (form.elements.namedItem('time') as HTMLInputElement).value;
                onRequestAccess(reason, time);
              }}>
                <div className="mb-4">
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Target Incident Timeframe</label>
                  <input name="time" type="text" placeholder="e.g., Today 14:00 - 15:00" className="w-full bg-zinc-950 border border-zinc-700 rounded px-4 py-3 text-zinc-200 text-sm focus:border-red-500 outline-none" required />
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Legal Justification / Reason</label>
                  <textarea name="reason" rows={3} placeholder="e.g., Identifying vehicle involved in case #2931..." className="w-full bg-zinc-950 border border-zinc-700 rounded px-4 py-3 text-zinc-200 text-sm focus:border-red-500 outline-none" required></textarea>
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setIsRequestModalOpen(false)} className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 py-2.5 rounded-lg text-sm font-semibold transition">Cancel</button>
                  <button type="submit" className="flex-1 btn-beam bg-zinc-100 text-zinc-900 py-2.5 rounded-lg text-sm font-bold shadow-lg transition">Send Request</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface HomeownerDashboardProps {
  requests: AccessRequest[];
  cameras: CameraNode[];
  currentUserId: string;
  togglePrivacy: () => void;
  handleUploadVideo: (requestId: string, file: File) => void;
  handleRejectRequest: (requestId: string) => void;
  setCurrentRole: (role: UserRole) => void;
  alerts: CommunityAlert[];
}

const HomeownerDashboard: React.FC<HomeownerDashboardProps> = ({
  requests, cameras, currentUserId, togglePrivacy, handleUploadVideo,
  handleRejectRequest, setCurrentRole, alerts
}) => {
  const myRequests = requests.filter(r => r.cameraId === currentUserId);
  const myProfile = cameras.find(c => c.id === currentUserId);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [expandedReqId, setExpandedReqId] = useState<string | null>(null);
  const pendingCount = myRequests.filter(r => r.status === RequestStatus.PENDING).length;

  // Debug logging
  console.log("🏠 HOMEOWNER VIEW DEBUG:", {
    currentUserId,
    totalRequests: requests.length,
    myRequests: myRequests.length,
    requestDetails: myRequests.map(r => ({
      id: r.id,
      status: r.status,
      hasVideo: !!r.videoFile,
      hasUrl: !!r.videoUrl
    }))
  });

  // Auto-open notifications when there are pending requests
  React.useEffect(() => {
    if (pendingCount > 0 && !isNotificationsOpen) {
      setIsNotificationsOpen(true);
      // Auto-expand first pending request
      const firstPending = myRequests.find(r => r.status === RequestStatus.PENDING);
      if (firstPending) {
        setExpandedReqId(firstPending.id);
      }
    }
  }, [pendingCount]);

  return (
    <div className="min-h-screen text-zinc-200">
      {/* Urgent Alert Banner for Pending Requests */}
      {pendingCount > 0 && (
        <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <iconify-icon icon="solar:danger-bold" class="text-2xl"></iconify-icon>
            <div>
              <p className="font-bold">⚠️ URGENT: {pendingCount} Footage Request{pendingCount > 1 ? 's' : ''} from Authorities</p>
              <p className="text-xs">Click the notification bell or below to respond</p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsNotificationsOpen(true);
              const firstPending = myRequests.find(r => r.status === RequestStatus.PENDING);
              if (firstPending) setExpandedReqId(firstPending.id);
            }}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition"
          >
            Respond Now
          </button>
        </div>
      )}
      <header className="glass-panel border-b border-orange-800/20 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center shadow-lg shadow-green-600/20 border border-green-500/30">
            <iconify-icon icon="solar:home-smile-bold" class="text-white text-lg"></iconify-icon>
          </div>
          <div>
            <h1 className="font-bold text-zinc-100 leading-tight">Sentinel Home</h1>
            <p className="text-xs text-zinc-500">Welcome back, {myProfile?.ownerName}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors relative"
            >
              <iconify-icon icon="solar:bell-bing-bold" class={`text-xl ${pendingCount > 0 ? 'text-zinc-100' : 'text-zinc-400'}`}></iconify-icon>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center shadow-lg border-2 border-zinc-900">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown - Force open when pending */}
            {(isNotificationsOpen || pendingCount > 0) && (
              <div className="absolute top-12 right-0 w-96 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden z-[100] animate-clip">
                <div className="px-4 py-3 border-b border-zinc-800 flex justify-between items-center bg-red-950">
                  <h3 className="font-bold text-sm text-zinc-100">Notifications {pendingCount > 0 && <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{pendingCount} URGENT</span>}</h3>
                  <button onClick={() => setIsNotificationsOpen(false)}><iconify-icon icon="solar:close-circle-bold" class="text-zinc-500 hover:text-white"></iconify-icon></button>
                </div>
                <div className="max-h-[400px] overflow-y-auto p-2 space-y-2">
                  {myRequests.length === 0 ? (
                    <div className="text-center py-8 text-zinc-500 text-xs">No notifications</div>
                  ) : (
                    myRequests.map(req => (
                      <div
                        key={req.id}
                        onClick={() => setExpandedReqId(expandedReqId === req.id ? null : req.id)}
                        className={`group bg-zinc-800/50 rounded-lg border transition-all cursor-pointer ${expandedReqId === req.id ? 'border-zinc-500 bg-zinc-800' : 'border-zinc-700/50 hover:border-zinc-600'
                          }`}
                      >
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-sm font-bold text-zinc-200">Request from Authorities</span>
                              <span className="text-[10px] text-zinc-500">Case #{req.id.slice(-4)}</span>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {req.status === RequestStatus.PENDING && (
                                <span className="text-[10px] font-bold bg-yellow-500/20 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/30">
                                  IMPORTANT
                                </span>
                              )}
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${req.status === RequestStatus.PENDING ? 'bg-zinc-700 text-zinc-400 border-zinc-600' :
                                req.status === RequestStatus.APPROVED ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                  'bg-red-500/10 text-red-500 border-red-500/20'
                                }`}>{req.status}</span>
                            </div>
                          </div>
                        </div>

                        {/* Expandable Details */}
                        {expandedReqId === req.id && (
                          <div className="px-3 pb-3 pt-0 animate-clip">
                            <div className="mt-2 bg-zinc-900/50 p-2 rounded border border-zinc-700/50 mb-3">
                              <p className="text-xs text-zinc-300 mb-1 font-semibold">Reason:</p>
                              <p className="text-xs text-zinc-400 italic">"{req.reason}"</p>
                            </div>

                            {req.status === RequestStatus.PENDING && (
                              <div className="flex flex-col gap-2">
                                <label
                                  className="flex-1 cursor-pointer bg-red-600 hover:bg-red-500 text-white text-sm font-bold py-3 px-4 rounded-lg text-center transition-colors shadow-lg animate-pulse border-2 border-white"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    console.log("🖱️ Upload button clicked!");
                                  }}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <iconify-icon icon="solar:upload-bold" class="text-lg"></iconify-icon>
                                    <span>📹 UPLOAD VIDEO FOOTAGE</span>
                                  </div>
                                  <input
                                    type="file"
                                    accept="video/*"
                                    className="hidden"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log("📂 File input clicked!");
                                    }}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      console.log("📁 File input changed", e.target.files);
                                      if (e.target.files && e.target.files[0]) {
                                        console.log("📤 Calling handleUploadVideo with:", { requestId: req.id, fileName: e.target.files[0].name });
                                        handleUploadVideo(req.id, e.target.files[0]);
                                        setIsNotificationsOpen(false);
                                        e.target.value = ''; // Reset input
                                      } else {
                                        console.warn("⚠️ No file selected");
                                      }
                                    }}
                                  />
                                </label>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRejectRequest(req.id);
                                  }}
                                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 text-xs font-bold rounded-lg transition-colors"
                                >
                                  Decline Request
                                </button>
                              </div>
                            )}

                            {req.status === RequestStatus.APPROVED && (
                              <div className="text-xs text-green-500 flex items-center gap-2 font-bold p-2 bg-green-500/10 rounded">
                                <iconify-icon icon="solar:check-circle-bold"></iconify-icon> Footage Sent
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCurrentRole(UserRole.NONE)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-700 text-zinc-400 text-sm hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <iconify-icon icon="solar:logout-2-bold"></iconify-icon> Log Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 flex flex-col md:flex-row gap-8">

        {/* Main Feed */}
        <div className="flex-1">
          {/* Status Card */}
          <div className={`gradient-border-card rounded-2xl p-6 mb-8 flex items-center justify-between transition-colors shadow-lg`}>
            <div>
              <h2 className="text-lg font-bold text-zinc-100 mb-1">System Status</h2>
              <p className="text-zinc-500 text-sm">
                {myProfile?.isPrivate ? 'Privacy Mode is active. Your camera is hidden.' : 'Monitoring active. Connected to Sentinel Network.'}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                onClick={togglePrivacy}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold transition shadow-lg ${myProfile?.isPrivate
                  ? 'bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-green-600/20 border-green-500/50 text-green-400 hover:bg-green-600/30'
                  }`}
              >
                {myProfile?.isPrivate ? (
                  <><iconify-icon icon="solar:eye-closed-bold"></iconify-icon> Privacy ON</>
                ) : (
                  <><span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-green-500"></span> Online</>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Live Camera Feed */}
            <div className="md:col-span-2">
              <h3 className="text-xl font-bold text-zinc-100 mb-5 flex items-center">
                <iconify-icon icon="solar:camera-bold" class="text-green-500 mr-3"></iconify-icon> Live Feed
                <span className="ml-auto text-xs font-mono text-zinc-500 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> REC
                </span>
              </h3>

              <div className="relative aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group">
                {/* Video Player */}
                <video
                  src="/cctv-loop.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                >
                </video>

                {/* Overlay UI */}
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-white border border-white/10">
                  CAM-01 • {new Date().toLocaleTimeString()}
                </div>

                <div className="absolute inset-0 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded bg-white/10 backdrop-blur flex items-center justify-center text-white"><iconify-icon icon="solar:rewind-bold"></iconify-icon></div>
                    <div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white"><iconify-icon icon="solar:pause-bold"></iconify-icon></div>
                    <div className="w-8 h-8 rounded bg-white/10 backdrop-blur flex items-center justify-center text-white"><iconify-icon icon="solar:fast-forward-bold"></iconify-icon></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Community Alerts */}
        <div className="w-full md:w-80">
          <div className="glass-panel rounded-2xl border border-orange-800/20 p-6 sticky top-24 shadow-xl">
            <h3 className="font-bold text-zinc-100 mb-6 flex items-center justify-between">
              <span className="flex items-center"><iconify-icon icon="solar:radio-minimalistic-bold" class="text-red-500 mr-2"></iconify-icon> Alerts</span>
              <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
            </h3>
            <div className="space-y-5">
              {alerts.map(alert => (
                <div key={alert.id} className="relative pl-4 border-l-2 border-zinc-700 hover:border-red-500 transition-colors">
                  <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-zinc-700 border border-zinc-500"></div>
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-sm ${alert.severity === 'high' ? 'bg-red-500 text-white shadow-red-500/20' :
                      alert.severity === 'medium' ? 'bg-orange-500 text-white shadow-orange-500/20' : 'bg-red-600 text-white'
                      }`}>
                      {alert.severity}
                    </span>
                    <span className="text-[10px] text-zinc-500 italic">{alert.date}</span>
                  </div>
                  <h4 className="font-bold text-zinc-200 text-sm mb-1 leading-snug">{alert.title}</h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">{alert.message}</p>
                </div>
              ))}
            </div>
            <button className="w-full mt-6 py-2 text-xs font-bold text-center text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              View Archive
            </button>
          </div>
        </div>

      </main>
    </div>
  );
};


// -- Main App --

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>(UserRole.NONE);
  const [cameras, setCameras] = useState<CameraNode[]>(MOCK_CAMERAS);
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // -- Police State --
  const [selectedCameraId, setSelectedCameraId] = useState<string | null>(null);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [analyzingRequest, setAnalyzingRequest] = useState<AccessRequest | null>(null);
  const [activeTab, setActiveTab] = useState<'cameras' | 'incidents'>('cameras');

  // -- Homeowner State --
  const [currentUserId, setCurrentUserId] = useState<string>('c1'); // Simulating dynamic user for demo
  const [alerts] = useState<CommunityAlert[]>(MOCK_ALERTS);

  // -- Helpers --
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  // -- Logic: Police --

  const handleRequestAccess = (reason: string, time: string) => {
    if (!selectedCameraId) return;

    // NOTE: In a real app this would go to the backend.
    // For this demo, we assume the system routes it to the correct user.
    // "only for john doe" implies we mainly demo this flow.
    const newRequest: AccessRequest = {
      id: `req-${Date.now()}`,
      cameraId: selectedCameraId,
      requestDate: new Date().toISOString(),
      incidentTime: time,
      reason: reason,
      status: RequestStatus.PENDING
    };

    setRequests(prev => [...prev, newRequest]);
    setCurrentUserId(selectedCameraId); // Auto-switch context to this user for demo
    setIsRequestModalOpen(false);
    showNotification(`Request sent. System simulating login for ${selectedCameraId}...`);
  };

  // -- Logic: Homeowner --

  const handleUploadVideo = (requestId: string, file: File) => {
    console.log("🎬 handleUploadVideo called:", { requestId, fileName: file?.name, fileSize: file?.size });

    // Basic validation
    if (!requestId || !file) {
      console.error("❌ Invalid upload parameters", { requestId, file });
      showNotification("❌ Upload failed: Invalid parameters");
      return;
    }

    const url = URL.createObjectURL(file);
    console.log("🔗 Created blob URL:", url);

    setRequests(prev => {
      console.log("📋 Current requests before update:", prev.map(r => ({ id: r.id, status: r.status, cameraId: r.cameraId })));

      // Find the request
      const foundRequest = prev.find(r => String(r.id).trim() === String(requestId).trim());
      console.log("🔍 Looking for request:", requestId, "Found:", foundRequest?.id);

      // Create a clean update
      const updated = prev.map(req => {
        if (String(req.id).trim() === String(requestId).trim()) {
          console.log("✅ UPDATING REQUEST:", {
            id: req.id,
            oldStatus: req.status,
            newStatus: RequestStatus.APPROVED,
            videoFile: file.name,
            videoUrl: url
          });
          return {
            ...req,
            status: RequestStatus.APPROVED,
            videoUrl: url,
            videoFile: file
          };
        }
        return req;
      });

      console.log("📊 Updated requests after map:", updated.map(r => ({
        id: r.id,
        status: r.status,
        hasVideo: !!r.videoFile,
        hasUrl: !!r.videoUrl
      })));

      return updated;
    });

    showNotification("✅ Video uploaded! Switch to Police View to analyze the footage.");
    console.log("✅ Upload complete, notification shown");
  };

  const handleRejectRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        return { ...req, status: RequestStatus.REJECTED };
      }
      return req;
    }));
    showNotification("Request has been declined.");
  };

  const togglePrivacy = () => {
    setCameras(prev => prev.map(c =>
      c.id === currentUserId ? { ...c, isPrivate: !c.isPrivate } : c
    ));
  };

  // -- Render Logic --

  return (
    <>
      <DemoControls currentRole={currentRole} setCurrentRole={setCurrentRole} />

      {/* Notifications */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[10000] bg-zinc-100 text-zinc-900 px-6 py-3 rounded-full shadow-2xl animate-clip flex items-center gap-3 border-l-4 border-red-500">
          <iconify-icon icon="solar:info-circle-bold" class="text-red-500"></iconify-icon>
          <span className="text-sm font-bold">{notification}</span>
        </div>
      )}

      {currentRole === UserRole.NONE && (
        <LandingPage onLogin={setCurrentRole} />
      )}

      {currentRole === UserRole.HOMEOWNER && (
        <HomeownerDashboard
          requests={requests}
          cameras={cameras}
          currentUserId={currentUserId}
          togglePrivacy={togglePrivacy}
          handleUploadVideo={handleUploadVideo}
          handleRejectRequest={handleRejectRequest}
          setCurrentRole={setCurrentRole}
          alerts={alerts}
        />
      )}

      {currentRole === UserRole.POLICE && (
        <>
          <PoliceDashboard
            cameras={cameras}
            setCameras={setCameras}
            requests={requests}
            selectedCameraId={selectedCameraId}
            setSelectedCameraId={setSelectedCameraId}
            selectedIncidentId={selectedIncidentId}
            setSelectedIncidentId={setSelectedIncidentId}
            isRequestModalOpen={isRequestModalOpen}
            setIsRequestModalOpen={setIsRequestModalOpen}
            analyzingRequest={analyzingRequest}
            setAnalyzingRequest={setAnalyzingRequest}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setCurrentRole={setCurrentRole}
            onRequestAccess={handleRequestAccess}
            showNotification={showNotification}
          />
          {analyzingRequest && analyzingRequest.videoUrl && analyzingRequest.videoFile && (
            <VideoAnalyzer
              videoUrl={analyzingRequest.videoUrl}
              videoFile={analyzingRequest.videoFile}
              onClose={() => setAnalyzingRequest(null)}
            />
          )}
        </>
      )}
    </>
  );
}