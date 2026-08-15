import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import adminApi from '../services/adminApi'
import { Users, Activity, Video, Image as ImageIcon, Shield, BarChart3, Search, Trash2, Check, RefreshCw } from 'lucide-react'

function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function timeAgo(iso) {
  if (!iso) return '—'
  const diff = Date.now() - new Date(iso).getTime()
  const sec = Math.floor(diff / 1000)
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

function ConfirmModal({ title, message, onConfirm, onCancel, danger = true }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(8,9,13,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-panel" style={{ padding: '32px', maxWidth: '400px', width: '90%', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: danger ? 'var(--danger-dim)' : 'var(--success-dim)', color: danger ? 'var(--danger)' : 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          {danger ? <Trash2 size={24} /> : <Check size={24} />}
        </div>
        <h3 className="h3" style={{ marginBottom: '8px' }}>{title}</h3>
        <p className="body" style={{ marginBottom: '24px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onCancel} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface-elevated)', color: 'var(--text-primary)', fontWeight: 600 }}>Cancel</button>
          <button onClick={onConfirm} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', background: danger ? 'var(--danger)' : 'var(--success)', color: '#fff', fontWeight: 600 }}>Confirm</button>
        </div>
      </div>
    </div>
  )
}

function Overview({ stats, onRefresh, loading }) {
  if (!stats) return <div style={{ padding: '40px', textAlign: 'center' }}><RefreshCw className="animate-spin" /> Loading stats...</div>

  const ObjectCards = [
    { label: 'Total Users', value: stats.total_users, sub: `+${stats.new_today} today`, icon: Users, color: 'var(--accent-purple)' },
    { label: 'Active This Week', value: stats.active_this_week, sub: `${stats.active_users} total active`, icon: Activity, color: 'var(--accent-cyan)' },
    { label: 'Videos Uploaded', value: stats.total_videos, sub: `+${stats.videos_today} today`, icon: Video, color: 'var(--success)' },
    { label: 'Frames Extracted', value: stats.total_frames, sub: 'All time', icon: ImageIcon, color: 'var(--warning)' },
    { label: 'Staff Accounts', value: stats.staff_users, sub: 'Admins', icon: Shield, color: 'var(--accent-purple)' },
    { label: 'Storage Used', value: stats.storage_display, sub: 'Media files', icon: BarChart3, color: 'var(--danger)' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="h2" style={{ marginBottom: '4px' }}>Platform Overview</h2>
          <p className="body" style={{ margin: 0 }}>Real-time stats across all users and content</p>
        </div>
        <button onClick={onRefresh} disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem' }}>
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        {ObjectCards.map((c, i) => (
          <div key={i} className="glass-panel" style={{ padding: '24px', transition: 'transform var(--transition-normal)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `color-mix(in srgb, ${c.color} 15%, transparent)`, color: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <c.icon size={20} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', fontFamily: 'monospace' }}>
              {c.value.toLocaleString()}
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>{c.label}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsersTable({ onRefreshStats }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirm, setConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminApi.getUsers(search)
      setUsers(res.data.users || [])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleToggle = async (user) => {
    setActionLoading(user.id + '_toggle')
    try {
      const res = await adminApi.toggleUser(user.id)
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: res.data.is_active } : u))
      onRefreshStats()
    } catch (e) { console.error(e) }
    finally { setActionLoading(null); setConfirm(null) }
  }

  const handleDelete = async (user) => {
    setActionLoading(user.id + '_del')
    try {
      await adminApi.deleteUser(user.id)
      setUsers(prev => prev.filter(u => u.id !== user.id))
      onRefreshStats()
    } catch (e) { console.error(e) }
    finally { setActionLoading(null); setConfirm(null) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="h2" style={{ marginBottom: '4px' }}>Users ({users.length})</h2>
          <p className="body" style={{ margin: 0 }}>All registered accounts</p>
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} style={{ padding: '8px 16px 8px 36px', borderRadius: 'var(--radius-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', outline: 'none' }} />
        </div>
      </div>

      <div className="glass-panel" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-hover)', borderBottom: '1px solid var(--border-strong)' }}>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Username</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Status</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Stats</th>
                <th style={{ padding: '16px', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.85rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>Loading...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '40px', textAlign: 'center' }}>No users found.</td></tr>
              ) : users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '16px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.username}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 8px', borderRadius: '4px', background: u.is_active ? 'var(--success-dim)' : 'var(--danger-dim)', color: u.is_active ? 'var(--success)' : 'var(--danger)', fontSize: '0.75rem', fontWeight: 700 }}>
                      {u.is_active ? 'Active' : 'Banned'}
                    </span>
                  </td>
                  <td style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    <div>Videos: {u.video_count}</div>
                    <div>Frames: {u.frame_count}</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {!u.is_superuser && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => setConfirm({ type: 'toggle', user: u })} style={{ padding: '6px 12px', borderRadius: '4px', background: 'var(--warning-dim)', color: 'var(--warning)', border: '1px solid var(--warning)', fontSize: '0.75rem', fontWeight: 600 }}>
                          {u.is_active ? 'Ban' : 'Unban'}
                        </button>
                        <button onClick={() => setConfirm({ type: 'delete', user: u })} style={{ padding: '6px 12px', borderRadius: '4px', background: 'var(--danger-dim)', color: 'var(--danger)', border: '1px solid var(--danger)', fontSize: '0.75rem', fontWeight: 600 }}>
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {confirm && confirm.type === 'toggle' && (
        <ConfirmModal danger={confirm.user.is_active} title={confirm.user.is_active ? `Ban @${confirm.user.username}?` : `Unban @${confirm.user.username}?`} message={confirm.user.is_active ? `This will deactivate their account.` : `This will restore their account.`} onConfirm={() => handleToggle(confirm.user)} onCancel={() => setConfirm(null)} />
      )}
      {confirm && confirm.type === 'delete' && (
        <ConfirmModal danger title={`Delete @${confirm.user.username}?`} message="This will permanently delete the account." onConfirm={() => handleDelete(confirm.user)} onCancel={() => setConfirm(null)} />
      )}
    </div>
  )
}



function ActivityFeed() {
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getActivity().then(res => setActivity(res.data.activity || [])).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h2 className="h2" style={{ marginBottom: '24px' }}>Activity Feed</h2>
      <div className="glass-panel" style={{ padding: '24px' }}>
        {loading ? <div>Loading...</div> : activity.map(act => (
          <div key={`${act.type}-${act.timestamp}`} style={{ display: 'flex', gap: '16px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={16} color="var(--accent-cyan)" />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{act.detail}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>{timeAgo(act.timestamp)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function AdminPanel() {
  const [tab, setTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const fetchStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await adminApi.getStats()
      setStats(res.data)
    } catch (err) { console.error(err) }
    finally { setStatsLoading(false) }
  }, [])

  useEffect(() => { fetchStats() }, [fetchStats])

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', background: 'var(--bg-surface)', padding: '6px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', overflowX: 'auto' }}>
        {['overview', 'users', 'activity'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            flex: 1, padding: '10px 16px', borderRadius: 'var(--radius-md)',
            fontWeight: 600, fontSize: '0.9rem', textTransform: 'capitalize',
            background: tab === t ? 'var(--text-primary)' : 'transparent',
            color: tab === t ? 'var(--bg-primary)' : 'var(--text-secondary)',
            transition: 'all var(--transition-fast)', whiteSpace: 'nowrap'
          }}>
            {t}
          </button>
        ))}
      </div>

      <div>
        {tab === 'overview' && <Overview stats={stats} loading={statsLoading} onRefresh={fetchStats} />}
        {tab === 'users' && <UsersTable onRefreshStats={fetchStats} />}
        {tab === 'activity' && <ActivityFeed />}
      </div>
    </div>
  )
}
