// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useAuth } from '../context/AuthContext';

// const AVATAR_COLORS = ['#22C55E', '#3B82F6', '#F97316', '#A855F7', '#EF4444', '#06B6D4', '#84CC16', '#F59E0B'];

// export default function LeaderboardScreen() {
//   const { user } = useAuth();
//   const [tab, setTab] = useState('week');
//   const [leaderboard, setLeaderboard] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showInvite, setShowInvite] = useState(false);
//   const [toast, setToast] = useState('');

//   useEffect(() => {
//     fetchLeaderboard();
//   }, [tab]);

//   const fetchLeaderboard = async () => {
//     setLoading(true);
//     try {
//       const endpoint = tab === 'week' ? '/api/leaderboard/weekly' : '/api/leaderboard/all-time';
//       const res = await axios.get(endpoint);
//       setLeaderboard(res.data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showToast = (msg) => {
//     setToast(msg);
//     setTimeout(() => setToast(''), 2000);
//   };

//   const copyInviteCode = () => {
//     navigator.clipboard?.writeText(user?.inviteCode || 'FIT-USER-2024');
//     showToast('📋 Invite code copied!');
//   };

//   const topThree = leaderboard.slice(0, 3);
//   const rest = leaderboard.slice(3);

//   const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

//   const getRankBadgeClass = (rank) => {
//     if (rank === 1) return 'rank-badge rank-1';
//     if (rank === 2) return 'rank-badge rank-2';
//     if (rank === 3) return 'rank-badge rank-3';
//     return 'rank-badge rank-other';
//   };

//   const podiumOrder = topThree.length >= 3
//     ? [topThree[1], topThree[0], topThree[2]]
//     : topThree;

//   return (
//     <div>
//       {toast && <div className="toast">{toast}</div>}

//       {/* Header */}
//       <div style={{ background: 'white', padding: '48px 24px 0', borderBottom: '1px solid #E5E7EB' }}>
//         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
//           <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
//             Leaderboard 🏆
//           </h1>
//           <button
//             style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
//             onClick={() => fetchLeaderboard()}
//           >
//             <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
//               <polyline points="1 4 1 10 7 10"/>
//               <path d="M3.51 15a9 9 0 1 0 .49-4.72"/>
//             </svg>
//           </button>
//         </div>
//         <div className="tabs">
//           {[['week', 'This Week'], ['month', 'This Month'], ['all', 'All Time']].map(([key, label]) => (
//             <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
//               {label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {loading ? (
//         <div className="loading-wrap"><div className="spinner" /></div>
//       ) : leaderboard.length === 0 ? (
//         <div className="empty-state" style={{ marginTop: 40 }}>
//           <div className="empty-icon"><span style={{ fontSize: 28 }}>🏆</span></div>
//           <p className="empty-title">No data yet</p>
//           <p className="empty-sub">Complete workouts to appear on the leaderboard!</p>
//         </div>
//       ) : (
//         <>
//           {/* Podium */}
//           {topThree.length >= 2 && (
//             <div className="podium">
//               {podiumOrder.map((entry, idx) => {
//                 if (!entry) return null;
//                 const isFirst = entry.rank === 1;
//                 const size = isFirst ? 68 : 52;
//                 const colorIdx = entry.rank - 1;
//                 return (
//                   <div key={entry.rank} className={`podium-item ${isFirst ? 'first' : ''}`}
//                     style={{ order: isFirst ? 1 : (idx === 0 ? 0 : 2) }}>
//                     <div style={{ position: 'relative' }}>
//                       {isFirst && <div className="podium-crown">👑</div>}
//                       <div style={{
//                         width: size, height: size,
//                         borderRadius: '50%',
//                         background: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length],
//                         display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         fontSize: isFirst ? 22 : 17, fontWeight: 800, color: 'white',
//                         boxShadow: isFirst ? '0 8px 24px rgba(34,197,94,0.4)' : 'none'
//                       }}>
//                         {getInitials(entry.user?.name)}
//                       </div>
//                       <div style={{
//                         position: 'absolute', bottom: -4, right: -4,
//                         background: isFirst ? '#22C55E' : (entry.rank === 2 ? '#94A3B8' : '#F97316'),
//                         color: 'white', borderRadius: '50%',
//                         width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
//                         fontSize: 10, fontWeight: 800, border: '2px solid white'
//                       }}>
//                         {entry.rank}
//                       </div>
//                     </div>
//                     <p className="podium-name" style={{ fontSize: isFirst ? 14 : 12 }}>
//                       {entry.user?.name?.split(' ')[0]}
//                     </p>
//                     <p className="podium-pts">{entry.points?.toLocaleString()} pts</p>
//                   </div>
//                 );
//               })}
//             </div>
//           )}

//           {/* Rest */}
//           <div>
//             {rest.map(entry => (
//               <div key={entry.rank} className="lb-row">
//                 <div className={getRankBadgeClass(entry.rank)}>{entry.rank}</div>
//                 <div className="lb-avatar" style={{ background: AVATAR_COLORS[(entry.rank - 1) % AVATAR_COLORS.length] }}>
//                   {getInitials(entry.user?.name)}
//                 </div>
//                 <div className="lb-info">
//                   <div className="lb-name">{entry.user?.name || 'User'}</div>
//                   <div className="lb-steps">
//                     {entry.steps?.toLocaleString() || 0} steps · {entry.calories || 0} kcal
//                   </div>
//                 </div>
//                 <div className="lb-pts">{entry.points?.toLocaleString()} pts</div>
//               </div>
//             ))}
//           </div>

//           {/* Invite button */}
//           <button className="invite-btn-lb" onClick={() => setShowInvite(true)}>
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/>
//               <circle cx="9" cy="7" r="4"/>
//               <line x1="19" y1="8" x2="19" y2="14"/>
//               <line x1="22" y1="11" x2="16" y2="11"/>
//             </svg>
//             Invite Friends
//           </button>
//         </>
//       )}

//       {/* Invite Modal */}
//       {showInvite && (
//         <div className="modal-overlay" onClick={() => setShowInvite(false)}>
//           <div className="modal-sheet" onClick={e => e.stopPropagation()}>
//             <div className="modal-handle" />

//             <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
//               <button onClick={() => setShowInvite(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
//                   <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
//                 </svg>
//               </button>
//               <h2 className="modal-title" style={{ margin: 0 }}>Invite Friends</h2>
//             </div>

//             <div className="invite-card">
//               <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
//               <p className="invite-card-title">Challenge Your Friends!</p>
//               <p className="invite-card-sub">Invite friends to FitTrack and compete on the leaderboard together.</p>
//               <button className="share-btn" onClick={copyInviteCode}>
//                 <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
//                   <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
//                 </svg>
//                 Share Invite Link
//               </button>
//             </div>

//             <div className="share-via">
//               <p className="share-via-title">Share Via</p>
//               <div className="share-icons">
//                 {[
//                   { label: 'Messages', icon: '💬' },
//                   { label: 'WhatsApp', icon: '📱' },
//                   { label: 'Email', icon: '✉️' },
//                   { label: 'More', icon: '⋯' },
//                 ].map(s => (
//                   <div key={s.label} className="share-icon-btn" onClick={copyInviteCode}>
//                     <div className="share-icon-circle">
//                       <span style={{ fontSize: 20 }}>{s.icon}</span>
//                     </div>
//                     <span className="share-icon-label">{s.label}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             <div className="contacts-section">
//               <p className="contacts-title">From Your Contacts</p>
//               {[
//                 { initials: 'MG', name: 'Miteh Gangadhare.', color: '#3B82F6', added: false },
//                 { initials: 'AN', name: 'Aniket Naglekar.', color: '#F97316', added: true },
//                 { initials: 'Sk', name: 'Sandeep Kumar.', color: '#A855F7', added: false },
//               ].map(c => (
//                 <div key={c.name} className="contact-row">
//                   <div className="contact-avatar" style={{ background: c.color }}>{c.initials}</div>
//                   <div className="contact-info">
//                     <div className="contact-name">{c.name}</div>
//                     <div className="contact-phone">+1 (555) 000-0000</div>
//                   </div>
//                   {c.added ? (
//                     <span className="btn-added">✓ Added</span>
//                   ) : (
//                     <button className="btn-invite-sm" onClick={copyInviteCode}>Invite</button>
//                   )}
//                 </div>
//               ))}
//             </div>

//             <div className="invite-code-bar" onClick={copyInviteCode}>
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
//                 <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
//                 <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
//               </svg>
//               <span className="invite-code-text">Copy Invite Code: <span className="invite-code-val">{user?.inviteCode || 'FIT-USER-2024'}</span></span>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




























import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const AVATAR_COLORS = ['#22C55E', '#3B82F6', '#F97316', '#A855F7', '#EF4444', '#06B6D4', '#84CC16', '#F59E0B'];

export default function LeaderboardScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState('week');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, [tab]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const endpoint = tab === 'week' ? '/api/leaderboard/weekly' : '/api/leaderboard/all-time';
      const res = await axios.get(endpoint);
      setLeaderboard(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2000);
  };

  // Helper to build share text/link
  const getInviteText = () => {
    const inviteCode = user?.inviteCode || 'FIT-USER-2024';
    const inviteLink = `https://fittrack.app/invite/${inviteCode}`; // Replace with your actual invite URL
    return `Join me on FitTrack to compete on the leaderboard! Use my invite code: ${inviteCode} or click: ${inviteLink}`;
  };

  // Universal share function
  const shareVia = (platform) => {
    const text = getInviteText();
    const encodedText = encodeURIComponent(text);

    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodedText}`, '_blank');
        break;
      case 'messages':
        window.location.href = `sms:?body=${encodedText}`;
        break;
      case 'email':
        window.location.href = `mailto:?subject=Join me on FitTrack&body=${encodedText}`;
        break;
      case 'more':
        if (navigator.share) {
          navigator.share({
            title: 'FitTrack Invite',
            text: text,
            url: `https://fittrack.app/invite/${user?.inviteCode || 'FIT-USER-2024'}`
          }).catch(() => copyInviteCode());
        } else {
          copyInviteCode();
        }
        break;
      default:
        copyInviteCode();
    }
  };

  const copyInviteCode = () => {
    const code = user?.inviteCode || 'FIT-USER-2024';
    navigator.clipboard?.writeText(code);
    showToast('📋 Invite code copied!');
  };

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  const getInitials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  const getRankBadgeClass = (rank) => {
    if (rank === 1) return 'rank-badge rank-1';
    if (rank === 2) return 'rank-badge rank-2';
    if (rank === 3) return 'rank-badge rank-3';
    return 'rank-badge rank-other';
  };

  const podiumOrder = topThree.length >= 3
    ? [topThree[1], topThree[0], topThree[2]]
    : topThree;

  return (
    <div>
      {toast && <div className="toast">{toast}</div>}

      {/* Header */}
      <div style={{ background: 'white', padding: '48px 24px 0', borderBottom: '1px solid #E5E7EB' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h1 style={{ fontFamily: 'Poppins, sans-serif', fontSize: 22, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>
            Leaderboard 🏆
          </h1>
          <button
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            onClick={() => fetchLeaderboard()}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
              <polyline points="1 4 1 10 7 10" />
              <path d="M3.51 15a9 9 0 1 0 .49-4.72" />
            </svg>
          </button>
        </div>
        <div className="tabs">
          {[['week', 'This Week'], ['month', 'This Month'], ['all', 'All Time']].map(([key, label]) => (
            <button key={key} className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-wrap"><div className="spinner" /></div>
      ) : leaderboard.length === 0 ? (
        <div className="empty-state" style={{ marginTop: 40 }}>
          <div className="empty-icon"><span style={{ fontSize: 28 }}>🏆</span></div>
          <p className="empty-title">No data yet</p>
          <p className="empty-sub">Complete workouts to appear on the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Podium */}
          {topThree.length >= 2 && (
            <div className="podium">
              {podiumOrder.map((entry, idx) => {
                if (!entry) return null;
                const isFirst = entry.rank === 1;
                const size = isFirst ? 68 : 52;
                const colorIdx = entry.rank - 1;
                return (
                  <div key={entry.rank} className={`podium-item ${isFirst ? 'first' : ''}`}
                    style={{ order: isFirst ? 1 : (idx === 0 ? 0 : 2) }}>
                    <div style={{ position: 'relative' }}>
                      {isFirst && <div className="podium-crown">👑</div>}
                      <div style={{
                        width: size, height: size,
                        borderRadius: '50%',
                        background: AVATAR_COLORS[colorIdx % AVATAR_COLORS.length],
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isFirst ? 22 : 17, fontWeight: 800, color: 'white',
                        boxShadow: isFirst ? '0 8px 24px rgba(34,197,94,0.4)' : 'none'
                      }}>
                        {getInitials(entry.user?.name)}
                      </div>
                      <div style={{
                        position: 'absolute', bottom: -4, right: -4,
                        background: isFirst ? '#22C55E' : (entry.rank === 2 ? '#94A3B8' : '#F97316'),
                        color: 'white', borderRadius: '50%',
                        width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 800, border: '2px solid white'
                      }}>
                        {entry.rank}
                      </div>
                    </div>
                    <p className="podium-name" style={{ fontSize: isFirst ? 14 : 12 }}>
                      {entry.user?.name?.split(' ')[0]}
                    </p>
                    <p className="podium-pts">{entry.points?.toLocaleString()} pts</p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Rest */}
          <div>
            {rest.map(entry => (
              <div key={entry.rank} className="lb-row">
                <div className={getRankBadgeClass(entry.rank)}>{entry.rank}</div>
                <div className="lb-avatar" style={{ background: AVATAR_COLORS[(entry.rank - 1) % AVATAR_COLORS.length] }}>
                  {getInitials(entry.user?.name)}
                </div>
                <div className="lb-info">
                  <div className="lb-name">{entry.user?.name || 'User'}</div>
                  <div className="lb-steps">
                    {entry.steps?.toLocaleString() || 0} steps · {entry.calories || 0} kcal
                  </div>
                </div>
                <div className="lb-pts">{entry.points?.toLocaleString()} pts</div>
              </div>
            ))}
          </div>

          {/* Invite button */}
          <button className="invite-btn-lb" onClick={() => setShowInvite(true)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
            Invite Friends
          </button>
        </>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <div className="modal-overlay" onClick={() => setShowInvite(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <button onClick={() => setShowInvite(false)} style={{ background: '#F3F4F6', border: 'none', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
                </svg>
              </button>
              <h2 className="modal-title" style={{ margin: 0 }}>Invite Friends</h2>
            </div>

            <div className="invite-card">
              <div style={{ fontSize: 36, marginBottom: 8 }}>🏆</div>
              <p className="invite-card-title">Challenge Your Friends!</p>
              <p className="invite-card-sub">Invite friends to FitTrack and compete on the leaderboard together.</p>
              <button className="share-btn" onClick={() => shareVia('more')}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
                Share Invite Link
              </button>
            </div>

            <div className="share-via">
              <p className="share-via-title">Share Via</p>
              <div className="share-icons">
                {[
                  { label: 'Messages', icon: '💬', platform: 'messages' },
                  { label: 'WhatsApp', icon: '📱', platform: 'whatsapp' },
                  { label: 'Email', icon: '✉️', platform: 'email' },
                  { label: 'More', icon: '⋯', platform: 'more' },
                ].map(s => (
                  <div key={s.label} className="share-icon-btn" onClick={() => shareVia(s.platform)}>
                    <div className="share-icon-circle">
                      <span style={{ fontSize: 20 }}>{s.icon}</span>
                    </div>
                    <span className="share-icon-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="contacts-section">
              <p className="contacts-title">From Your Contacts</p>
              {[
                { initials: 'MG', name: 'Miteh Gangadhare.', color: '#3B82F6', added: false, phone: '+1 (555) 000-0000' },
                { initials: 'AN', name: 'Aniket Naglekar.', color: '#F97316', added: true, phone: '+1 (555) 000-0001' },
                { initials: 'Sk', name: 'Sandeep Kumar.', color: '#A855F7', added: false, phone: '+1 (555) 000-0002' },
              ].map(c => (
                <div key={c.name} className="contact-row">
                  <div className="contact-avatar" style={{ background: c.color }}>{c.initials}</div>
                  <div className="contact-info">
                    <div className="contact-name">{c.name}</div>
                    <div className="contact-phone">{c.phone}</div>
                  </div>
                  {c.added ? (
                    <span className="btn-added">✓ Added</span>
                  ) : (
                    <button className="btn-invite-sm" onClick={() => shareVia('messages')}>
                      Invite
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="invite-code-bar" onClick={copyInviteCode}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              <span className="invite-code-text">Copy Invite Code: <span className="invite-code-val">{user?.inviteCode || 'FIT-USER-2024'}</span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}