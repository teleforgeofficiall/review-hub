import { useState } from 'react';

export default function AdminProfile() {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    appName: 'Review Hub',
    minWithdrawal: '50',
    autoApprove: false,
    botToken: '7891:BCdEfGhIjKlMnOpQrStUvWxYz',
    adminId: '7371674958',
    frontendUrl: 'https://frontend-kappa-sepia-39.vercel.app',
  });
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="pt-3 pb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-14 h-14 rounded-full bg-[#630ed4] text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
          A
        </div>
        <div>
          <h1 className="text-lg font-bold" style={{ color: '#191c1e' }}>Admin</h1>
          <p className="text-xs" style={{ color: '#4a4455' }}>admin@reviewhub.com</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Users', value: '1,247' },
          { label: 'Tasks', value: '12' },
          { label: 'Pending', value: '89' },
        ].map((item) => (
          <div key={item.label} className="glass-card rounded-xl p-2.5 text-center">
            <p className="text-base font-bold" style={{ color: '#4800a0' }}>{item.value}</p>
            <p className="text-[10px]" style={{ color: '#4a4455' }}>{item.label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <button
          onClick={() => setShowSettings(true)}
          className="glass-card w-full rounded-xl p-3 flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-base" style={{ color: '#4800a0' }}>settings</span>
          </div>
          <span className="text-xs font-medium" style={{ color: '#191c1e' }}>Manage Settings</span>
          <span className="material-symbols-outlined text-base ml-auto" style={{ color: '#4a4455' }}>chevron_right</span>
        </button>

        <a
          href="/"
          className="glass-card w-full rounded-xl p-3 flex items-center gap-2.5"
        >
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-base" style={{ color: '#2563eb' }}>swap_horiz</span>
          </div>
          <span className="text-xs font-medium" style={{ color: '#191c1e' }}>Switch to User</span>
          <span className="material-symbols-outlined text-base ml-auto" style={{ color: '#4a4455' }}>chevron_right</span>
        </a>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.5)' }}>
          <div className="w-[90%] max-w-sm bg-white rounded-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 pt-4 pb-3 sticky top-0 bg-white rounded-t-2xl border-b" style={{ borderColor: '#f0f0f0' }}>
              <h2 className="text-sm font-bold" style={{ color: '#191c1e' }}>Settings</h2>
              <button onClick={() => setShowSettings(false)} className="p-0.5">
                <span className="material-symbols-outlined text-lg" style={{ color: '#4a4455' }}>close</span>
              </button>
            </div>

            <div className="px-4 py-4 space-y-3">
              <div>
                <label className="text-[10px] font-medium block mb-1" style={{ color: '#4a4455' }}>App Name</label>
                <input
                  type="text"
                  value={settings.appName}
                  onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ border: '1px solid #e0e0e0', color: '#191c1e' }}
                />
              </div>

              <div>
                <label className="text-[10px] font-medium block mb-1" style={{ color: '#4a4455' }}>Min Withdrawal (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: '#4a4455' }}>₹</span>
                  <input
                    type="number"
                    value={settings.minWithdrawal}
                    onChange={(e) => setSettings({ ...settings, minWithdrawal: e.target.value })}
                    className="w-full pl-7 pr-3 py-2 rounded-lg text-xs outline-none"
                    style={{ border: '1px solid #e0e0e0', color: '#191c1e' }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium" style={{ color: '#191c1e' }}>Auto-Approve</p>
                  <p className="text-[10px]" style={{ color: '#4a4455' }}>Automatically approve submissions</p>
                </div>
                <button
                  onClick={() => setSettings({ ...settings, autoApprove: !settings.autoApprove })}
                  className="relative w-10 h-6 rounded-full transition-colors flex-shrink-0"
                  style={{ background: settings.autoApprove ? '#4800a0' : '#d1d5db' }}
                >
                  <div
                    className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                    style={{ left: settings.autoApprove ? '20px' : '2px' }}
                  />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-medium block mb-1" style={{ color: '#4a4455' }}>Bot Token</label>
                <input
                  type="password"
                  value={settings.botToken}
                  onChange={(e) => setSettings({ ...settings, botToken: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ border: '1px solid #e0e0e0', color: '#191c1e' }}
                />
              </div>

              <div>
                <label className="text-[10px] font-medium block mb-1" style={{ color: '#4a4455' }}>Admin ID</label>
                <input
                  type="text"
                  value={settings.adminId}
                  onChange={(e) => setSettings({ ...settings, adminId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ border: '1px solid #e0e0e0', color: '#191c1e' }}
                />
              </div>

              <div>
                <label className="text-[10px] font-medium block mb-1" style={{ color: '#4a4455' }}>Frontend URL</label>
                <input
                  type="url"
                  value={settings.frontendUrl}
                  onChange={(e) => setSettings({ ...settings, frontendUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg text-xs outline-none"
                  style={{ border: '1px solid #e0e0e0', color: '#191c1e' }}
                />
              </div>

              <button
                onClick={handleSave}
                className="btn-3d w-full py-2.5 rounded-lg text-xs font-semibold"
              >
                {saved ? 'Saved!' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
