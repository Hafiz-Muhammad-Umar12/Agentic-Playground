import React from 'react';

const statusColors = {
  online:        '#00ff88',
  offline:       '#ff4466',
  fake_shutdown: '#ffaa00',
};

const statusLabels = {
  online:        '● ONLINE',
  offline:       '○ OFFLINE',
  fake_shutdown: '⚡ FAKE SHUTDOWN',
};

export default function DeviceCard({ device, selected, onClick, lastLoc }) {
  const color = statusColors[device.status] || '#888';
  const label = statusLabels[device.status] || device.status;

  return (
    <div onClick={onClick} style={{
      ...styles.card,
      borderColor: selected ? '#00ff88' : 'rgba(0,255,136,0.1)',
      background: selected ? 'rgba(0,255,136,0.06)' : 'rgba(0,20,15,0.6)',
      cursor: 'pointer',
    }}>
      <div style={styles.row}>
        <div style={styles.name}>{device.device_name || device.device_id.slice(0,12)}</div>
        <div style={{ ...styles.badge, color, borderColor: `${color}44` }}>{label}</div>
      </div>
      <div style={styles.meta}>
        <span>📱 {device.model || 'Unknown model'}</span>
        <span>🤖 {device.os_version || '—'}</span>
      </div>
      {lastLoc && (
        <div style={styles.coords}>
          📍 {lastLoc.latitude?.toFixed(4)}, {lastLoc.longitude?.toFixed(4)}
          &nbsp;&nbsp;🔋 {lastLoc.battery_level ?? '—'}%
        </div>
      )}
      <div style={styles.time}>
        Last seen: {device.last_seen_at
          ? new Date(device.last_seen_at).toLocaleString()
          : 'Never'}
      </div>
    </div>
  );
}

const styles = {
  card: {
    border: '1px solid',
    borderRadius: 4,
    padding: '14px 16px',
    marginBottom: 10,
    transition: 'all 0.2s',
    fontFamily: "'Courier New', monospace",
  },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  name: { color: '#e0ffe0', fontSize: 13, fontWeight: 700, letterSpacing: 1 },
  badge: {
    fontSize: 10, letterSpacing: 1, border: '1px solid',
    padding: '2px 8px', borderRadius: 2,
  },
  meta: { color: 'rgba(0,255,136,0.4)', fontSize: 11, display: 'flex', gap: 12, marginBottom: 4 },
  coords: { color: 'rgba(0,255,136,0.6)', fontSize: 11, marginBottom: 2 },
  time: { color: 'rgba(0,255,136,0.25)', fontSize: 10 },
};
