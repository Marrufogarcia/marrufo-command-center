import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabase';
import { ALL_PACKAGES, PACKAGES, ALL_ADDONS, TEMPLATES, STATUS_COLORS, SUB_STATUS_COLORS } from '../lib/data';

export default function Home() {
  const [tab, setTab] = useState('dashboard');
  const [leads, setLeads] = useState([]);
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  const flash = (msg) => { setToast(msg); setTimeout(() => setToast(''), 1800); };

  const fetchLeads = useCallback(async () => {
    const { data } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (data) setLeads(data);
  }, []);

  const fetchSubs = useCallback(async () => {
    const { data } = await supabase.from('subs').select('*').eq('active', true).order('name');
    if (data) setSubs(data);
  }, []);

  const fetchStats = useCallback(async () => {
    const { data } = await supabase.from('daily_stats').select('*').single();
    if (data) setStats(data);
  }, []);

  useEffect(() => {
    Promise.all([fetchLeads(), fetchSubs(), fetchStats()]).then(() => setLoading(false));
    const ch = supabase.channel('realtime-leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => { fetchLeads(); fetchStats(); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [fetchLeads, fetchSubs, fetchStats]);

  const newCount = leads.filter(l => l.status === 'new').length;
  const dateStr = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <div style={S.loadWrap}>
        <Head><title>Marrufo HQ</title></Head>
        <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: '#E8952F', letterSpacing: 3 }}>MARRUFO</div>
        <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={S.shell}>
      <Head><title>Marrufo HQ</title><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" /></Head>

      {toast && <div style={S.toast}>{toast}</div>}

      <div style={S.header}>
        <div>
          <div style={S.logo}>MARRUFO</div>
          <div style={S.logoSub}>COMMAND CENTER</div>
        </div>
        <div style={S.dateBadge}>{dateStr}</div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {tab === 'dashboard' && <DashboardTab leads={leads} subs={subs} stats={stats} />}
        {tab === 'leads' && <LeadsTab leads={leads} fetchLeads={fetchLeads} fetchStats={fetchStats} flash={flash} />}
        {tab === 'quote' && <QuoteTab />}
        {tab === 'dispatch' && <DispatchTab subs={subs} fetchSubs={fetchSubs} leads={leads} fetchLeads={fetchLeads} flash={flash} />}
        {tab === 'templates' && <TemplatesTab />}
      </div>

      <div style={S.nav}>
        {[
          { id: 'dashboard', label: 'Home', path: 'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z' },
          { id: 'leads', label: 'Leads', path: 'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75' },
          { id: 'quote', label: 'Quote', path: 'M12 1v22 M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6' },
          { id: 'dispatch', label: 'Crew', path: 'M1 3h15v13H1z M16 8h4l3 3v5h-7V8z' },
          { id: 'templates', label: 'Texts', path: 'M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z' },
        ].map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ ...S.navBtn, color: tab === n.id ? '#E8952F' : '#666' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={n.path} /></svg>
            <span style={{ fontSize: 10, fontWeight: 600 }}>{n.label}</span>
            {n.id === 'leads' && newCount > 0 && <div style={S.badge}>{String(newCount)}</div>}
          </button>
        ))}
      </div>
    </div>
  );
}

// ═══ DASHBOARD ═══
function DashboardTab({ leads, subs, stats }) {
  const s = stats || {};
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          { l: 'New Leads', v: String(s.new_leads_today || 0), c: '#FFA726' },
          { l: "Active Jobs", v: String(s.active_jobs || 0), c: '#66BB6A' },
          { l: 'Completed', v: String(s.completed_today || 0), c: '#26A69A' },
          { l: 'Revenue', v: '$' + String(Math.round(s.revenue_this_week || 0)), c: '#E8952F' },
        ].map(x => (
          <div key={x.l} style={S.card}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 6, fontWeight: 500 }}>{x.l}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: x.c, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1 }}>{x.v}</div>
          </div>
        ))}
      </div>
      <Lbl>{'Subs (' + String(subs.length) + ')'}</Lbl>
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 20 }}>
        {subs.map(sub => (
          <div key={sub.id} style={{ ...S.card, minWidth: 120, flexShrink: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{sub.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: SUB_STATUS_COLORS[sub.status] || '#666' }} />
              <span style={{ fontSize: 11, color: '#999' }}>{sub.status === 'on-job' ? 'On Job' : sub.status === 'off-today' ? 'Off' : 'Available'}</span>
            </div>
            <div style={{ fontSize: 10, color: '#666', marginTop: 4 }}>{sub.split}</div>
          </div>
        ))}
        {subs.length === 0 && <div style={{ fontSize: 12, color: '#666' }}>Add subs in the Crew tab</div>}
      </div>
      <Lbl>Recent leads</Lbl>
      {leads.length === 0 && <Empty text="No leads yet - they'll auto-appear when forms come in!" />}
      {leads.slice(0, 6).map(ld => (
        <div key={ld.id} style={{ ...S.card, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{ld.name}</div>
            <div style={{ fontSize: 11, color: '#999', marginTop: 2 }}>{(ld.service || 'No service') + ' \u00B7 ' + new Date(ld.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</div>
          </div>
          <Badge st={ld.status} />
        </div>
      ))}
    </div>
  );
}

// ═══ LEADS ═══
function LeadsTab({ leads, fetchLeads, fetchStats, flash }) {
  const [filter, setFilter] = useState('all');
  const [adding, setAdding] = useState(false);
  const [nm, setNm] = useState(''); const [ph, setPh] = useState(''); const [veh, setVeh] = useState('');
  const [svc, setSvc] = useState(''); const [src, setSrc] = useState('Google Ads'); const [nts, setNts] = useState('');
  const [xl, setXl] = useState(false); const [saving, setSaving] = useState(false);

  const filtered = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  async function addLead() {
    if (!nm || !ph) return;
    setSaving(true);
    const { error } = await supabase.from('leads').insert({
      name: nm, phone: ph, vehicle: veh, service: svc, source: src, notes: nts, is_xl: xl, status: 'new',
    });
    if (!error) {
      await fetchLeads(); await fetchStats();
      setNm(''); setPh(''); setVeh(''); setSvc(''); setSrc('Google Ads'); setNts(''); setXl(false);
      setAdding(false); flash('Lead added!');
    }
    setSaving(false);
  }

  async function updateSt(id, st) {
    await supabase.from('leads').update({ status: st }).eq('id', id);
    await fetchLeads(); await fetchStats(); flash('Updated!');
  }

  async function removeLead(id) {
    await supabase.from('leads').delete().eq('id', id);
    await fetchLeads(); await fetchStats(); flash('Removed');
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>{'Leads (' + String(leads.length) + ')'}</div>
        <OBtn onClick={() => setAdding(!adding)}>+ New Lead</OBtn>
      </div>

      {adding && (
        <div style={{ ...S.card, marginBottom: 14, borderColor: '#E8952F33' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Add New Lead</div>
          <FInput v={nm} s={setNm} p="Customer Name" />
          <FInput v={ph} s={setPh} p="Phone Number" />
          <FInput v={veh} s={setVeh} p="Vehicle (Year Make Model)" />
          <FSelect v={svc} s={setSvc}>
            <option value="">Select Service</option>
            {ALL_PACKAGES.map(pk => <option key={pk.id} value={pk.name}>{pk.name + ' - $' + String(pk.price)}</option>)}
          </FSelect>
          <FSelect v={src} s={setSrc}>
            <option value="Google Ads">Google Ads</option>
            <option value="Google LSA">Google LSA</option>
            <option value="Website Form">Website Form</option>
            <option value="Phone Call">Phone Call</option>
            <option value="Fieldd Booking">Fieldd Booking</option>
            <option value="Referral">Referral</option>
          </FSelect>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, color: '#ccc', cursor: 'pointer' }}>
            <input type="checkbox" checked={xl} onChange={e => setXl(e.target.checked)} style={{ accentColor: '#E8952F' }} />
            XL Vehicle (SUV/Truck/3rd Row)
          </label>
          <textarea placeholder="Notes..." value={nts} onChange={e => setNts(e.target.value)} style={S.textarea} />
          <button onClick={addLead} disabled={saving} style={{ ...S.bigBtn, opacity: saving ? 0.6 : 1 }}>
            {saving ? 'Saving...' : 'Save Lead'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 4 }}>
        {['all', 'new', 'quoted', 'booked', 'in-progress', 'completed', 'paid'].map(s => (
          <button key={s} onClick={() => setFilter(s)} style={{
            background: filter === s ? '#E8952F' : '#1A1A1A', color: filter === s ? '#000' : '#999',
            border: '1px solid ' + (filter === s ? '#E8952F' : '#2A2A2A'),
            borderRadius: 20, padding: '6px 14px', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
          }}>{s === 'all' ? 'All' : s}</button>
        ))}
      </div>

      {filtered.length === 0 && <Empty text={filter === 'all' ? 'No leads yet!' : 'No ' + filter + ' leads.'} />}

      {filtered.map(ld => (
        <div key={ld.id} style={{ ...S.card, marginBottom: 10, borderColor: ld.status === 'new' ? '#E8952F44' : '#2A2A2A' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{ld.name}</div>
              <div style={{ fontSize: 12, color: '#E8952F', marginTop: 2 }}>{ld.phone}</div>
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <Badge st={ld.status} />
              <button onClick={() => removeLead(ld.id)} style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: 16, padding: '2px 6px' }}>{'\u00D7'}</button>
            </div>
          </div>
          {ld.vehicle ? <div style={{ fontSize: 12, color: '#ccc', marginTop: 8 }}>{'\uD83D\uDE97 ' + ld.vehicle + (ld.is_xl ? ' (XL)' : '')}</div> : null}
          {ld.service ? <div style={{ fontSize: 12, color: '#ccc', marginTop: 3 }}>{'\uD83D\uDCE6 ' + ld.service}</div> : null}
          <div style={{ fontSize: 11, color: '#666', marginTop: 3 }}>{(ld.source || '') + ' \u00B7 ' + new Date(ld.created_at).toLocaleString()}</div>
          {ld.notes ? <div style={{ fontSize: 11, color: '#999', marginTop: 6, fontStyle: 'italic' }}>{ld.notes}</div> : null}
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
            {ld.status === 'new' && <><SBtn l="Quoted" c="#42A5F5" fn={() => updateSt(ld.id, 'quoted')} /><SBtn l="Book" c="#66BB6A" fn={() => updateSt(ld.id, 'booked')} /></>}
            {ld.status === 'quoted' && <SBtn l="Book" c="#66BB6A" fn={() => updateSt(ld.id, 'booked')} />}
            {ld.status === 'booked' && <SBtn l="In Progress" c="#AB47BC" fn={() => updateSt(ld.id, 'in-progress')} />}
            {ld.status === 'in-progress' && <SBtn l="Complete" c="#26A69A" fn={() => updateSt(ld.id, 'completed')} />}
            {ld.status === 'completed' && <SBtn l="Paid" c="#78909C" fn={() => updateSt(ld.id, 'paid')} />}
          </div>
        </div>
      ))}
    </div>
  );
}

// ═══ QUOTE ═══
function QuoteTab() {
  const [pkgId, setPkgId] = useState('');
  const [isXL, setIsXL] = useState(false);
  const [addons, setAddons] = useState([]);
  const pkg = ALL_PACKAGES.find(p => p.id === pkgId);
  let total = 0;
  if (pkg) { total = pkg.price + (isXL ? pkg.xlAddon : 0); addons.forEach(aid => { const a = ALL_ADDONS.find(x => x.id === aid); if (a) total += a.price; }); }

  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 14 }}>Quote Calculator</div>
      {Object.entries(PACKAGES).map(([cat, pkgs]) => (
        <div key={cat} style={{ marginBottom: 14 }}>
          <Lbl c="#E8952F">{cat === 'interior' ? 'Interior Only' : cat === 'combo' ? 'Interior & Exterior' : 'Exterior Only'}</Lbl>
          {pkgs.map(p => (
            <button key={p.id} onClick={() => setPkgId(p.id)} style={{
              width: '100%', textAlign: 'left', background: pkgId === p.id ? '#E8952F15' : '#1A1A1A',
              border: '1px solid ' + (pkgId === p.id ? '#E8952F' : '#2A2A2A'),
              borderRadius: 10, padding: '12px 14px', marginBottom: 6, cursor: 'pointer',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#F5F5F0',
            }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>{p.name}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#E8952F' }}>{'$' + String(p.price)}</span>
            </button>
          ))}
        </div>
      ))}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#1A1A1A', borderRadius: 10, padding: '12px 14px', marginBottom: 14, border: '1px solid #2A2A2A', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#F5F5F0' }}>
        <input type="checkbox" checked={isXL} onChange={e => setIsXL(e.target.checked)} style={{ accentColor: '#E8952F', width: 18, height: 18 }} />
        {'XL Vehicle (+$' + String(pkg ? pkg.xlAddon : 50) + ')'}
      </label>
      <Lbl c="#E8952F">Add-ons</Lbl>
      {ALL_ADDONS.map(a => (
        <button key={a.id} onClick={() => setAddons(prev => prev.includes(a.id) ? prev.filter(x => x !== a.id) : [...prev, a.id])} style={{
          width: '100%', textAlign: 'left', background: addons.includes(a.id) ? '#E8952F15' : '#1A1A1A',
          border: '1px solid ' + (addons.includes(a.id) ? '#E8952F' : '#2A2A2A'),
          borderRadius: 10, padding: '10px 14px', marginBottom: 6, cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', color: '#F5F5F0',
        }}>
          <span style={{ fontSize: 12, fontWeight: 500 }}>{a.name}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#E8952F' }}>{'+$' + String(a.price)}</span>
        </button>
      ))}
      {pkg && (
        <div style={{ background: 'linear-gradient(135deg,#E8952F,#D4821F)', borderRadius: 14, padding: 18, marginTop: 16, color: '#000' }}>
          <div style={{ fontSize: 12, fontWeight: 600, opacity: 0.7, marginBottom: 4 }}>QUOTE TOTAL</div>
          <div style={{ fontSize: 36, fontWeight: 700, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 2 }}>{'$' + String(total)}</div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.6 }}>60/40 SPLIT</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{'You: $' + String(Math.round(total * 0.6)) + ' \u00B7 Sub: $' + String(Math.round(total * 0.4))}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, opacity: 0.6 }}>50/50 SPLIT</div>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{'You: $' + String(Math.round(total * 0.5)) + ' \u00B7 Sub: $' + String(Math.round(total * 0.5))}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ DISPATCH ═══
function DispatchTab({ subs, fetchSubs, leads, fetchLeads, flash }) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nm, setNm] = useState(''); const [ph, setPh] = useState(''); const [sp, setSp] = useState('60/40');

  const booked = leads.filter(l => l.status === 'booked');
  const avail = subs.filter(s => s.status === 'available');

  async function addSub() {
    if (!nm) return;
    await supabase.from('subs').insert({ name: nm, phone: ph, split: sp });
    await fetchSubs(); setNm(''); setPh(''); setSp('60/40'); setAdding(false); flash('Sub added!');
  }

  async function updateSubSt(id, st) {
    await supabase.from('subs').update({ status: st }).eq('id', id);
    await fetchSubs();
  }

  async function saveSub(id, updates) {
    await supabase.from('subs').update(updates).eq('id', id);
    await fetchSubs(); setEditId(null); flash('Saved!');
  }

  async function removeSub(id) {
    await supabase.from('subs').update({ active: false }).eq('id', id);
    await fetchSubs(); setEditId(null); flash('Removed');
  }

  async function dispatch(subId, leadId) {
    await supabase.from('leads').update({ assigned_sub: subId, status: 'in-progress' }).eq('id', leadId);
    await supabase.from('subs').update({ status: 'on-job' }).eq('id', subId);
    await fetchLeads(); await fetchSubs(); flash('Dispatched!');
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Dispatch</div>
        <OBtn onClick={() => setAdding(!adding)}>+ Add Sub</OBtn>
      </div>
      {adding && (
        <div style={{ ...S.card, marginBottom: 14, borderColor: '#E8952F33' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Add Subcontractor</div>
          <FInput v={nm} s={setNm} p="Name" />
          <FInput v={ph} s={setPh} p="Phone" />
          <FSelect v={sp} s={setSp}><option value="60/40">60/40 Split</option><option value="50/50">50/50 Split</option></FSelect>
          <button onClick={addSub} style={S.bigBtn}>Save Sub</button>
        </div>
      )}
      <Lbl>{'Jobs to dispatch (' + String(booked.length) + ')'}</Lbl>
      {booked.length === 0 && <Empty text="No booked jobs to dispatch" />}
      {booked.map(ld => {
        const aSub = ld.assigned_sub ? subs.find(s => s.id === ld.assigned_sub) : null;
        return (
          <div key={ld.id} style={{ ...S.card, marginBottom: 8, borderColor: aSub ? '#66BB6A44' : '#2A2A2A', background: aSub ? '#66BB6A10' : '#1A1A1A' }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{ld.name}</div>
            {ld.vehicle ? <div style={{ fontSize: 12, color: '#ccc', marginTop: 4 }}>{ld.vehicle}</div> : null}
            {ld.service ? <div style={{ fontSize: 12, color: '#ccc', marginTop: 2 }}>{ld.service}</div> : null}
            {aSub ? (
              <div style={{ marginTop: 10, color: '#66BB6A', fontSize: 12, fontWeight: 600 }}>{'\u2713 Dispatched to ' + aSub.name}</div>
            ) : (
              <div style={{ marginTop: 10 }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 6 }}>Assign to:</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {avail.length === 0 && <span style={{ fontSize: 11, color: '#666' }}>No subs available</span>}
                  {avail.map(sub => (
                    <button key={sub.id} onClick={() => dispatch(sub.id, ld.id)} style={{
                      background: '#0D0D0D', border: '1px solid #333', borderRadius: 8,
                      color: '#F5F5F0', padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    }}>{sub.name + ' (' + sub.split + ')'}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
      <Lbl sx={{ marginTop: 20 }}>{'All subs (' + String(subs.length) + ')'}</Lbl>
      {subs.length === 0 && <Empty text="Add your detailers here!" />}
      {subs.map(sub => (
        <div key={sub.id} style={{ marginBottom: 6 }}>
          <div style={{ ...S.card, borderRadius: editId === sub.id ? '12px 12px 0 0' : 12, marginBottom: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div onClick={() => setEditId(editId === sub.id ? null : sub.id)} style={{ cursor: 'pointer', flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{sub.name}</div>
                <div style={{ fontSize: 11, color: '#888' }}>{(sub.phone || 'No phone') + ' \u00B7 ' + sub.split}</div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {['available', 'on-job', 'off-today'].map(st => (
                  <button key={st} onClick={() => updateSubSt(sub.id, st)} style={{
                    width: 14, height: 14, borderRadius: '50%', background: SUB_STATUS_COLORS[st], padding: 0, cursor: 'pointer',
                    border: sub.status === st ? '2px solid #fff' : '2px solid #333',
                  }} />
                ))}
              </div>
            </div>
          </div>
          {editId === sub.id && <EditSubPanel sub={sub} saveSub={saveSub} removeSub={removeSub} />}
        </div>
      ))}
    </div>
  );
}

function EditSubPanel({ sub, saveSub, removeSub }) {
  const [nm, setNm] = useState(sub.name); const [ph, setPh] = useState(sub.phone || ''); const [sp, setSp] = useState(sub.split);
  return (
    <div style={{ background: '#1A1A1A', borderRadius: '0 0 12px 12px', border: '1px solid #2A2A2A', borderTop: 'none', padding: 14 }}>
      <FInput v={nm} s={setNm} p="Name" />
      <FInput v={ph} s={setPh} p="Phone" />
      <FSelect v={sp} s={setSp}><option value="60/40">60/40 Split</option><option value="50/50">50/50 Split</option></FSelect>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={() => saveSub(sub.id, { name: nm, phone: ph, split: sp })} style={{ ...S.bigBtn, flex: 1 }}>Save</button>
        <button onClick={() => removeSub(sub.id)} style={{ background: 'none', border: '1px solid #EF5350', borderRadius: 8, padding: '10px 16px', fontWeight: 700, fontSize: 12, cursor: 'pointer', color: '#EF5350' }}>Delete</button>
      </div>
    </div>
  );
}

// ═══ TEMPLATES ═══
function TemplatesTab() {
  const [openId, setOpenId] = useState(null);
  const [copied, setCopied] = useState(false);
  function copy(text) { try { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); } catch (e) {} }
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Quick Texts</div>
      <div style={{ fontSize: 12, color: '#888', marginBottom: 14 }}>Tap to preview, copy and paste</div>
      {TEMPLATES.map(t => (
        <div key={t.id}>
          <button onClick={() => { setOpenId(openId === t.id ? null : t.id); setCopied(false); }} style={{
            width: '100%', textAlign: 'left', background: openId === t.id ? '#E8952F15' : '#1A1A1A',
            border: '1px solid ' + (openId === t.id ? '#E8952F' : '#2A2A2A'),
            borderRadius: openId === t.id ? '12px 12px 0 0' : 12, padding: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10, color: '#F5F5F0', marginBottom: openId === t.id ? 0 : 8,
          }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>{t.label}</span>
          </button>
          {openId === t.id && (
            <div style={{ background: '#1A1A1A', borderRadius: '0 0 12px 12px', border: '1px solid #E8952F', borderTop: 'none', padding: 14, marginBottom: 8 }}>
              <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.6, whiteSpace: 'pre-wrap', background: '#0D0D0D', borderRadius: 8, padding: 12, marginBottom: 10 }}>{t.text}</div>
              <div style={{ fontSize: 10, color: '#666', marginBottom: 10 }}>Replace [BRACKETS] with actual info</div>
              <button onClick={() => copy(t.text)} style={{ width: '100%', background: copied ? '#66BB6A' : '#E8952F', border: 'none', borderRadius: 10, padding: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', color: '#000' }}>{copied ? '\u2713 Copied!' : 'Copy to Clipboard'}</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ═══ SHARED ═══
function Lbl({ children, c, sx }) { return <div style={{ fontSize: 11, fontWeight: 600, color: c || '#888', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, ...(sx || {}) }}>{children}</div>; }
function Empty({ text }) { return <div style={{ background: '#1A1A1A', borderRadius: 12, padding: 24, textAlign: 'center', color: '#555', fontSize: 13, marginBottom: 16 }}>{text}</div>; }
function Badge({ st }) { const c = STATUS_COLORS[st] || { bg: '#666', text: '#fff' }; return <div style={{ background: c.bg, color: c.text, padding: '3px 10px', borderRadius: 20, fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>{st}</div>; }
function SBtn({ l, c, fn }) { return <button onClick={fn} style={{ background: 'transparent', border: '1px solid ' + (c || '#E8952F'), borderRadius: 8, color: c || '#E8952F', padding: '6px 12px', fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>{l}</button>; }
function OBtn({ onClick, children }) { return <button onClick={onClick} style={{ background: '#E8952F', border: 'none', borderRadius: 10, color: '#000', padding: '8px 16px', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>{children}</button>; }
function FInput({ v, s, p }) { return <input placeholder={p} value={v} onChange={e => s(e.target.value)} style={S.input} />; }
function FSelect({ v, s, children }) { return <select value={v} onChange={e => s(e.target.value)} style={{ ...S.input, color: v ? '#F5F5F0' : '#888' }}>{children}</select>; }

const S = {
  shell: { fontFamily: "'DM Sans','Helvetica Neue',sans-serif", background: '#0D0D0D', color: '#F5F5F0', minHeight: '100vh', maxWidth: 480, margin: '0 auto', position: 'relative', paddingBottom: 80 },
  loadWrap: { fontFamily: "'DM Sans',sans-serif", background: '#0D0D0D', color: '#F5F5F0', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  header: { background: 'linear-gradient(135deg,#1A1A1A,#0D0D0D)', padding: '20px 20px 16px', borderBottom: '1px solid #2A2A2A', position: 'sticky', top: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, letterSpacing: 2, color: '#E8952F' },
  logoSub: { fontSize: 11, color: '#888', letterSpacing: 1, marginTop: -2 },
  dateBadge: { background: '#E8952F', borderRadius: 12, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: '#000' },
  toast: { position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', background: '#66BB6A', color: '#000', padding: '8px 20px', borderRadius: 20, fontSize: 12, fontWeight: 700, zIndex: 200 },
  nav: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', maxWidth: 480, width: '100%', background: 'rgba(13,13,13,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid #2A2A2A', display: 'flex', justifyContent: 'space-around', padding: '8px 0 12px', zIndex: 100 },
  navBtn: { background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, padding: '4px 8px', position: 'relative' },
  badge: { position: 'absolute', top: -2, right: -4, background: '#EF5350', width: 16, height: 16, borderRadius: '50%', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' },
  card: { background: '#1A1A1A', borderRadius: 14, padding: 14, border: '1px solid #2A2A2A' },
  input: { width: '100%', background: '#0D0D0D', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#F5F5F0', fontSize: 13, marginBottom: 8, boxSizing: 'border-box', outline: 'none' },
  textarea: { width: '100%', background: '#0D0D0D', border: '1px solid #333', borderRadius: 8, padding: '10px 12px', color: '#F5F5F0', fontSize: 13, marginBottom: 10, minHeight: 60, resize: 'vertical', outline: 'none', boxSizing: 'border-box' },
  bigBtn: { width: '100%', background: '#E8952F', border: 'none', borderRadius: 10, padding: 12, fontWeight: 700, fontSize: 14, cursor: 'pointer', color: '#000' },
};
