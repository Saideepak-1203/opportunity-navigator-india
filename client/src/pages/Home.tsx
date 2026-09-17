import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight, Bell, Bookmark, BriefcaseBusiness, CalendarDays, Check,
  ChevronDown, CircleHelp, Clock3, Compass, ExternalLink, Filter, Flame,
  GraduationCap, LayoutDashboard, Menu, Plus, Search, ShieldCheck, Sparkles,
  Target, Users, X, Zap
} from "lucide-react";

type Opportunity = { title: string; org: string; type: string; days: string; match: number; mode: string; benefit: string; tone: string; logo: string; eligible: string };

const opportunities: Opportunity[] = [
  { title: "AI Innovation Challenge 2026", org: "NITI Aayog · Atal Innovation Mission", type: "Competition", days: "1 day left", match: 92, mode: "Online", benefit: "₹50,000 prize", tone: "urgent", logo: "A", eligible: "Likely eligible" },
  { title: "Google India Software Internship", org: "Google India", type: "Internship", days: "3 days left", match: 88, mode: "Bengaluru / Hybrid", benefit: "Paid · 12 weeks", tone: "soon", logo: "G", eligible: "Eligible" },
  { title: "SBI Youth for India Fellowship", org: "State Bank of India Foundation", type: "Fellowship", days: "8 days left", match: 84, mode: "Pan India", benefit: "₹18,000 / month", tone: "watch", logo: "S", eligible: "Check details" },
];

const filters = ["For you", "Closing soon", "Scholarships", "Internships", "Hackathons", "Research"];

function Logo({ letter, className = "" }: { letter: string; className?: string }) {
  return <div className={`grid h-10 w-10 place-items-center rounded-xl bg-[#12231d] text-sm font-bold text-[#d9f99d] ${className}`}>{letter}</div>;
}

function OpportunityCard({ item, saved, onSave }: { item: Opportunity; saved: boolean; onSave: () => void }) {
  return <article className={`opportunity-card ${item.tone}`}>
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3"><Logo letter={item.logo} /><div><div className="mb-1 flex items-center gap-2"><span className="eyebrow">{item.type}</span><span className="verified"><ShieldCheck size={12} /> Official</span></div><h3>{item.title}</h3><p className="org">{item.org}</p></div></div>
      <button aria-label="Save opportunity" onClick={onSave} className={`icon-button ${saved ? "saved" : ""}`}><Bookmark size={17} fill={saved ? "currentColor" : "none"} /></button>
    </div>
    <div className="card-meta"><span className={`deadline ${item.tone}`}><Clock3 size={14} /> {item.days}</span><span><Target size={14} /> {item.match}% match</span><span>{item.mode}</span><span>{item.benefit}</span></div>
    <div className="flex items-center justify-between border-t border-[#e8ebe3] pt-3"><span className="eligibility"><Check size={14} /> {item.eligible}</span><button className="text-button" onClick={() => toast.success("Opening verified opportunity details")}>View details <ArrowUpRight size={15} /></button></div>
  </article>;
}

export default function Home() {
  const [activeFilter, setActiveFilter] = useState("For you");
  const [saved, setSaved] = useState<string[]>(["SBI Youth for India Fellowship"]);
  const [role, setRole] = useState<"user" | "poster">("user");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const visible = useMemo(() => opportunities.filter(o => `${o.title} ${o.org} ${o.type}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const save = (title: string) => { setSaved(s => s.includes(title) ? s.filter(x => x !== title) : [...s, title]); toast.success(saved.includes(title) ? "Removed from saved" : "Saved to your watchlist"); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark">s</div><span>sloth</span><button className="close-mobile" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="profile-chip"><div className="avatar">AR</div><div><strong>Arjun Rao</strong><small>Student · 420 points</small></div><ChevronDown size={15} className="ml-auto text-[#829087]" /></div>
      <div className="side-label">Your workspace</div>
      <nav>{[[Compass, "Home"], [Search, "Opportunities"], [CalendarDays, "Slot calendar"], [Users, "Commun-In"], [BriefcaseBusiness, "My applications"], [Bookmark, "Saved"]].map(([Icon, label], i) => <button key={label as string} className={`nav-item ${i === 0 ? "active" : ""}`} onClick={() => toast.info(`${label} view is ready for your profile`)}><Icon size={18} /><span>{label as string}</span>{label === "Saved" && <b>{saved.length}</b>}</button>)}</nav>
      <div className="side-spacer" />
      <div className="sloth-points"><div className="points-icon"><Zap size={17} /></div><div><small>Sloth points</small><strong>420 <span>+12 this week</span></strong></div></div>
      <button className="help-link"><CircleHelp size={17} /> Help & safety</button>
      <div className="poster-switch"><div><small>Publishing opportunities?</small><strong>Switch to Poster</strong></div><button onClick={() => { setRole(role === "user" ? "poster" : "user"); toast.success(role === "user" ? "Poster workspace selected" : "Back to your personal workspace"); }}><ArrowUpRight size={16} /></button></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><div className="crumb"><span>Workspace</span><span>/</span><strong>{role === "user" ? "For you" : "Poster dashboard"}</strong></div><div className="top-actions"><button className="role-pill" onClick={() => setRole(role === "user" ? "poster" : "user")}>{role === "user" ? "Personal workspace" : "Poster workspace"}<ChevronDown size={14} /></button><button className="notification"><Bell size={18} /><i /></button><div className="avatar mini">AR</div></div></header>
      {role === "poster" ? <PosterView /> : <>
      <section className="welcome-row"><div><p className="kicker"><Sparkles size={15} /> Curated for your next move</p><h1>Good morning, Arjun<span>.</span></h1><p className="subhead">Make your next opportunity count. We found <strong>24 new matches</strong> for your profile.</p></div><button className="ai-button" onClick={() => toast.success("Navigator is tuning your recommendations")}>Ask Navigator <Sparkles size={16} /></button></section>
      <section className="hero-strip"><div className="hero-copy"><span className="hero-tag">YOUR WEEK AT A GLANCE</span><h2>Keep your momentum,<br /><em>not your tabs.</em></h2><p>3 deadlines this week · 1 action needed today</p></div><div className="week-dots"><div className="week-head"><span>Mon 14</span><span>Tue 15</span><span className="today">Wed 16</span><span>Thu 17</span><span>Fri 18</span></div><div className="week-bars"><i /><i className="filled" /><i className="filled lime" /><i /><i className="filled orange" /></div><div className="week-foot"><span>2 saved</span><span>Apply today</span><span>1 closing</span></div></div><div className="hero-arrow"><ArrowUpRight size={22} /></div></section>
      <section className="section-head"><div><p className="kicker">DISCOVERY ENGINE</p><h2>Opportunities that fit <em>you.</em></h2></div><button className="view-all" onClick={() => toast.info("Showing all opportunities")}>View all <ArrowUpRight size={16} /></button></section>
      <div className="toolbar"><div className="search-box"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by skill, interest or organization" /><kbd>⌘ K</kbd></div><button className="filter-button"><Filter size={16} /> Filters <span>2</span></button></div>
      <div className="filter-row">{filters.map(f => <button key={f} className={activeFilter === f ? "active" : ""} onClick={() => setActiveFilter(f)}>{f}</button>)}</div>
      <div className="opportunity-grid">{visible.map(item => <OpportunityCard key={item.title} item={item} saved={saved.includes(item.title)} onSave={() => save(item.title)} />)}</div>
      <section className="bottom-grid"><div className="calendar-card"><div className="card-heading"><div><p className="kicker">SLOT CALENDAR</p><h3>Your week, at a glance</h3></div><button className="more-button"><ArrowUpRight size={17} /></button></div><div className="timeline"><div className="time-label">TODAY <span>16 SEP</span></div><div className="timeline-line"><div className="timeline-dot" /><div className="timeline-item"><strong>AI Innovation Challenge</strong><small>Final submission · 11:59 PM</small></div><span className="urgent-text">1 day left</span></div><div className="time-label">FRI <span>19 SEP</span></div><div className="timeline-line muted-line"><div className="timeline-dot" /><div className="timeline-item"><strong>SBI Youth for India</strong><small>Application closes</small></div><span>4 days</span></div></div><button className="calendar-link" onClick={() => toast.info("Calendar view coming next")}>Open full calendar <ArrowUpRight size={15} /></button></div><div className="trust-card"><div className="trust-orbit"><ShieldCheck size={27} /></div><p className="kicker">TRUST LAYER</p><h3>Information you can<br /><em>act on.</em></h3><p>Every listing is checked against its official source and timestamped, so you know what to trust.</p><div className="trust-stat"><strong>98.4%</strong><span>of active listings verified</span></div><a href="#" onClick={e => { e.preventDefault(); toast.info("Trust methodology coming soon"); }}>How verification works <ArrowUpRight size={15} /></a></div></section>
      <footer><span>© 2026 Sloth Technologies</span><span>Built for the next generation of India <span className="dot-sep">·</span> <a href="#">Trust & safety</a> <span className="dot-sep">·</span> <a href="#">For posters</a></span></footer>
      </>}
    </main>
  </div>;
}

function PosterView() { return <div className="poster-view"><div className="poster-banner"><div><p className="kicker"><LayoutDashboard size={15} /> POSTER WORKSPACE</p><h1>Make good work <em>discoverable.</em></h1><p className="subhead">Publish with clarity. Reach the people who are ready to act.</p></div><button className="ai-button"><Plus size={17} /> Post an opportunity</button></div><div className="poster-stats">{[["Active opportunities","12","+2 this month"],["Total applications","1,248","+18% vs last month"],["Avg. match quality","86%","Across all listings"],["Next slot","18 Sep","Low traffic · recommended"]].map(([a,b,c]) => <div className="stat-card" key={a}><small>{a}</small><strong>{b}</strong><span>{c}</span></div>)}</div><div className="poster-content"><div className="poster-panel"><div className="card-heading"><div><p className="kicker">MY OPPORTUNITIES</p><h3>Recent performance</h3></div><button className="view-all">View all <ArrowUpRight size={15} /></button></div>{["National Student Design Sprint","GreenTech Fellowship 2026","Campus Innovators Meet-up"].map((x,i) => <div className="poster-row" key={x}><Logo letter={['N','G','C'][i]} /><div><strong>{x}</strong><small>{[432,289,167][i]} applications · {['92%','81%','76%'][i]} match</small></div><span className="status-live">Live</span><ArrowUpRight size={16} /></div>)}</div><div className="poster-panel traffic"><div className="card-heading"><div><p className="kicker">SLOT INTELLIGENCE</p><h3>Best time to publish</h3></div><CalendarDays size={19} /></div><div className="traffic-date"><strong>18</strong><span>SEP<br />2026</span><div><b>Low competition</b><small>Only 3 similar listings</small></div></div><button className="recommendation"><Sparkles size={15} /> Recommended publishing date <ArrowUpRight size={15} /></button></div></div></div> }
