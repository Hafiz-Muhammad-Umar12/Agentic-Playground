import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyDevices, getLastLocation, getLocationHistory, deleteDevice } from '../services/api';
import { LocationSocket } from '../socket/socket';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView';
import DeviceCard from '../components/DeviceCard';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [devices,      setDevices]      = useState([]);
  const [selected,     setSelected]     = useState(null); // device_id
  const [lastLocs,     setLastLocs]     = useState({});   // {device_id: loc}
  const [history,      setHistory]      = useState([]);
  const [liveLocation, setLiveLocation] = useState(null);
  const [wsStatus,     setWsStatus]     = useState('disconnected');
  const [events,       setEvents]       = useState([]);   // live event log
  const [loading,      setLoading]      = useState(true);
  const [sidePanel,    setSidePanel]    = useState('devices'); // 'devices' | 'history'

  const socketRef = useRef(null);

  // Load devices on mount
  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const res = await getMyDevices();
      setDevices(res.data);

      // Load last location for each device
      const locs = {};
      await Promise.allSettled(
        res.data.map(async (d) => {
          try {
            const r = await getLastLocation(d.device_id);
            locs[d.device_id] = r.data;
          } catch {}
        })
      );
      setLastLocs(locs);

      // Auto-select first device
      if (res.data.length > 0 && !selected) {
        selectDevice(res.data[0].device_id, locs);
      }
    } catch (err) {
      console.error('Failed to load devices', err);
    } finally {
      setLoading(false);
    }
  };

  const selectDevice = useCallback(async (deviceId, locsOverride) => {
    setSelected(deviceId);
    const loc = (locsOverride || lastLocs)[deviceId];
    if (loc) setLiveLocation(loc);

    // Load history
    try {
      const res = await getLocationHistory(deviceId, 200);
      setHistory(res.data.locations || []);
    } catch {}

    // Reconnect WebSocket
    socketRef.current?.disconnect();
    const ws = new LocationSocket(
      deviceId,
      (data) => {
        if (data.type === 'location_update') {
          setLiveLocation(data);
          setLastLocs(prev => ({ ...prev, [deviceId]: data }));
          setHistory(prev => [data, ...prev].slice(0, 500));
          // Add to event log
          setEvents(prev => [{
            time: new Date().toLocaleTimeString(),
            lat: data.latitude?.toFixed(5),
            lng: data.longitude?.toFixed(5),
            type: data.event_type,
            battery: data.battery_level,
            aggressive: data.is_aggressive,
          }, ...prev].slice(0, 50));
        }
      },
      () => setWsStatus('connected'),
      () => setWsStatus('disconnected')
    );
    ws.connect();
    socketRef.current = ws;
  }, [lastLocs]);

  useEffect(() => () => socketRef.current?.disconnect(), []);

  const handleDelete = async (deviceId) => {
    if (!window.confirm('Remove this device from tracking?')) return;
    await deleteDevice(deviceId);
    await loadDevices();
    if (selected === deviceId) { setSelected(null); setHistory([]); setLiveLocation(null); }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const eventTypeColor = (t) =>
    t === 'fake_shutdown' ? '#ffaa00'
    : t === 'shutdown'    ? '#ff4466'
    : t === 'boot'        ? '#00aaff'
    : '#00ff88';

  return (
    <div style={styles.page}>
      {/* ── Top Bar ── */}
      <div style={styles.topbar}>
        <div style={styles.topLogo}>
          <span style={styles.ghost}>👻</span>
          <span style={styles.topLogoText}>GHOSTTRACK</span>
          <span style={styles.topLogoBeta}>v1.0</span>
        </div>
        <div style={styles.topCenter}>
          <div style={{
            ...styles.wsBadge,
            background: wsStatus === 'connected' ? 'rgba(0,255,136,0.1)' : 'rgba(255,68,102,0.1)',
            borderColor: wsStatus === 'connected' ? 'rgba(0,255,136,0.3)' : 'rgba(255,68,102,0.3)',
            color:       wsStatus === 'connected' ? '#00ff88' : '#ff4466',
          }}>
            {wsStatus === 'connected' ? '● LIVE' : '○ OFFLINE'}
          </div>
          {selected && (
            <div style={styles.selectedLabel}>
              TRACKING: {selected.slice(0, 14).toUpperCase()}
            </div>
          )}
        </div>
        <div style={styles.topRight}>
          <span style={styles.userLabel}>{user?.name}</span>
          <button style={styles.logoutBtn} onClick={handleLogout}>LOGOUT</button>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div style={styles.body}>

        {/* ── LEFT PANEL ── */}
        <div style={styles.left}>
          {/* Panel tabs */}
          <div style={styles.panelTabs}>
            {['devices','history'].map(t => (
              <button key={t}
                style={{...styles.panelTab, ...(sidePanel===t ? styles.panelTabActive : {})}}
                onClick={() => setSidePanel(t)}>
                {t === 'devices' ? '📱 DEVICES' : '📜 EVENTS'}
              </button>
            ))}
            <button style={styles.refreshBtn} onClick={loadDevices}>↻</button>
          </div>

          <div style={styles.panelBody}>
            {sidePanel === 'devices' && (
              <>
                {loading && <div style={styles.loading}>Loading devices...</div>}
                {!loading && devices.length === 0 && (
                  <div style={styles.empty}>
                    No devices registered yet.<br/>
                    Install the mobile app to get started.
                  </div>
                )}
                {devices.map(d => (
                  <div key={d.device_id} style={{ position: 'relative' }}>
                    <DeviceCard
                      device={d}
                      selected={selected === d.device_id}
                      lastLoc={lastLocs[d.device_id]}
                      onClick={() => selectDevice(d.device_id)}
                    />
                    <button
                      onClick={() => handleDelete(d.device_id)}
                      style={styles.deleteBtn} title="Remove device">✕</button>
                  </div>
                ))}
              </>
            )}

            {sidePanel === 'history' && (
              <>
                <div style={styles.eventHeader}>
                  LIVE EVENT FEED — {events.length} events
                </div>
                {events.length === 0 && (
                  <div style={styles.empty}>Waiting for location events...</div>
                )}
                {events.map((ev, i) => (
                  <div key={i} style={styles.eventRow}>
                    <span style={{ color: 'rgba(0,255,136,0.35)', minWidth: 70, fontSize: 10 }}>{ev.time}</span>
                    <span style={{ color: eventTypeColor(ev.type), fontSize: 10, minWidth: 80 }}>
                      {ev.type?.toUpperCase()}
                    </span>
                    <span style={{ color: 'rgba(0,255,136,0.6)', fontSize: 10 }}>
                      {ev.lat}, {ev.lng}
                    </span>
                    {ev.aggressive && <span style={{ color: '#ffaa00', fontSize: 9 }}>⚡ AGG</span>}
                    {ev.battery !== null && <span style={{ color: 'rgba(0,255,136,0.4)', fontSize: 10 }}>🔋{ev.battery}%</span>}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* ── MAP ── */}
        <div style={styles.mapContainer}>
          {!selected ? (
            <div style={styles.noDevice}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🛰️</div>
              <div style={{ color: '#00ff88', fontSize: 14, letterSpacing: 3 }}>SELECT A DEVICE TO TRACK</div>
            </div>
          ) : (
            <MapView locations={history} liveLocation={liveLocation} />
          )}

          {/* ── LIVE STATS OVERLAY ── */}
          {liveLocation && (
            <div style={styles.statsOverlay}>
              <StatBox label="LATITUDE"  value={liveLocation.latitude?.toFixed(6)}  />
              <StatBox label="LONGITUDE" value={liveLocation.longitude?.toFixed(6)} />
              <StatBox label="ACCURACY"  value={liveLocation.accuracy ? `${liveLocation.accuracy}m` : '—'} />
              <StatBox label="SPEED"     value={liveLocation.speed    ? `${(liveLocation.speed * 3.6).toFixed(1)} km/h` : '—'} />
              <StatBox label="BATTERY"   value={`${liveLocation.battery_level ?? '—'}%`}
                valueColor={
                  liveLocation.battery_level > 50 ? '#00ff88'
                  : liveLocation.battery_level > 20 ? '#ffaa00'
                  : '#ff4466'} />
              <StatBox label="MODE"
                value={liveLocation.is_aggressive ? 'AGGRESSIVE' : 'NORMAL'}
                valueColor={liveLocation.is_aggressive ? '#ffaa00' : '#00ff88'} />
            </div>
          )}

          {/* History count badge */}
          {history.length > 0 && (
            <div style={styles.historyBadge}>{history.length} POINTS</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, valueColor = '#00ff88' }) {
  return (
    <div style={statStyles.box}>
      <div style={statStyles.label}>{label}</div>
      <div style={{ ...statStyles.value, color: valueColor }}>{value}</div>
    </div>
  );
}

const C = { bg: '#030b12', green: '#00ff88', dim: 'rgba(0,255,136,0.15)', panel: 'rgba(5,18,28,0.97)' };

const styles = {
  page: {
    minHeight: '100vh', background: C.bg, display: 'flex',
    flexDirection: 'column', fontFamily: "'Courier New', monospace", overflow: 'hidden',
  },
  topbar: {
    height: 54, background: C.panel, borderBottom: `1px solid ${C.dim}`,
    display: 'flex', alignItems: 'center', padding: '0 20px', gap: 20,
    flexShrink: 0,
  },
  topLogo: { display: 'flex', alignItems: 'center', gap: 8 },
  ghost: { fontSize: 22 },
  topLogoText: { color: C.green, fontSize: 16, fontWeight: 700, letterSpacing: 4 },
  topLogoBeta: { color: 'rgba(0,255,136,0.3)', fontSize: 9, letterSpacing: 1 },
  topCenter: { flex: 1, display: 'flex', alignItems: 'center', gap: 16 },
  wsBadge: {
    fontSize: 10, letterSpacing: 2, border: '1px solid',
    padding: '3px 10px', borderRadius: 2,
  },
  selectedLabel: { color: 'rgba(0,255,136,0.4)', fontSize: 10, letterSpacing: 2 },
  topRight: { display: 'flex', alignItems: 'center', gap: 14 },
  userLabel: { color: 'rgba(0,255,136,0.5)', fontSize: 11 },
  logoutBtn: {
    background: 'none', border: '1px solid rgba(255,68,102,0.3)',
    color: '#ff4466', fontSize: 10, letterSpacing: 2, padding: '4px 12px',
    borderRadius: 2, cursor: 'pointer', fontFamily: 'inherit',
  },
  body: {
    flex: 1, display: 'flex', overflow: 'hidden',
    height: 'calc(100vh - 54px)',
  },
  left: {
    width: 300, flexShrink: 0, borderRight: `1px solid ${C.dim}`,
    display: 'flex', flexDirection: 'column', background: C.panel,
  },
  panelTabs: {
    display: 'flex', borderBottom: `1px solid ${C.dim}`, flexShrink: 0,
  },
  panelTab: {
    flex: 1, background: 'none', border: 'none', borderBottom: '2px solid transparent',
    color: 'rgba(0,255,136,0.35)', fontSize: 10, letterSpacing: 1, padding: '12px 0',
    cursor: 'pointer', fontFamily: 'inherit', marginBottom: -1,
  },
  panelTabActive: { color: C.green, borderBottomColor: C.green },
  refreshBtn: {
    background: 'none', border: 'none', color: 'rgba(0,255,136,0.4)',
    fontSize: 18, padding: '0 14px', cursor: 'pointer',
  },
  panelBody: { flex: 1, overflowY: 'auto', padding: '12px 10px' },
  loading: { color: 'rgba(0,255,136,0.4)', fontSize: 12, padding: 12, textAlign: 'center' },
  empty: {
    color: 'rgba(0,255,136,0.25)', fontSize: 11, textAlign: 'center',
    padding: '40px 20px', lineHeight: 1.8,
  },
  deleteBtn: {
    position: 'absolute', top: 8, right: 8, background: 'none',
    border: 'none', color: 'rgba(255,68,102,0.4)', fontSize: 12,
    cursor: 'pointer', padding: '2px 6px',
  },
  eventHeader: {
    color: 'rgba(0,255,136,0.35)', fontSize: 10, letterSpacing: 1,
    paddingBottom: 8, borderBottom: `1px solid ${C.dim}`, marginBottom: 8,
  },
  eventRow: {
    display: 'flex', flexWrap: 'wrap', gap: '4px 8px',
    padding: '5px 0', borderBottom: '1px solid rgba(0,255,136,0.04)',
  },
  mapContainer: {
    flex: 1, position: 'relative', overflow: 'hidden',
  },
  noDevice: {
    width: '100%', height: '100%', display: 'flex',
    flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    background: '#030b12',
  },
  statsOverlay: {
    position: 'absolute', bottom: 20, left: 16,
    display: 'flex', gap: 8, flexWrap: 'wrap', maxWidth: 480,
    zIndex: 1000,
  },
  historyBadge: {
    position: 'absolute', top: 12, right: 12,
    background: 'rgba(0,20,15,0.85)', border: '1px solid rgba(0,255,136,0.2)',
    color: 'rgba(0,255,136,0.5)', fontSize: 10, letterSpacing: 1,
    padding: '4px 10px', borderRadius: 2, zIndex: 1000,
  },
};

const statStyles = {
  box: {
    background: 'rgba(3,11,18,0.88)', border: '1px solid rgba(0,255,136,0.15)',
    borderRadius: 2, padding: '6px 12px', minWidth: 90,
    backdropFilter: 'blur(4px)',
  },
  label: { color: 'rgba(0,255,136,0.35)', fontSize: 9, letterSpacing: 1, marginBottom: 2 },
  value: { fontSize: 12, fontWeight: 700, letterSpacing: 1 },
};
