import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight, Bell, Bookmark, BriefcaseBusiness, CalendarDays, Check,
  ChevronDown, CircleHelp, Clock3, Compass, ExternalLink, Filter, Flame,
  GraduationCap, LayoutDashboard, Menu, Plus, Search, ShieldCheck, SlidersHorizontal,
  Sparkles, Target, Users, X, Zap
} from "lucide-react";

type Opportunity = { title: string; org: string; type: string; days: string; match: number; mode: string; benefit: string; tone: string; logo: string; eligible: string };
type WorkspaceView = "Home" | "Opportunities" | "Slot calendar" | "Commun-In" | "My applications" | "Saved";

const opportunities: Opportunity[] = [
  { title: "AI Innovation Challenge 2026", org: "NITI Aayog · Atal Innovation Mission", type: "Competition", days: "1 day left", match: 92, mode: "Online", benefit: "₹50,000 prize", tone: "urgent", logo: "A", eligible: "Likely eligible" },
  { title: "Google India Software Internship", org: "Google India", type: "Internship", days: "3 days left", match: 88, mode: "Bengaluru / Hybrid", benefit: "Paid · 12 weeks", tone: "soon", logo: "G", eligible: "Eligible" },
  { title: "SBI Youth for India Fellowship", org: "State Bank of India Foundation", type: "Fellowship", days: "8 days left", match: 84, mode: "Pan India", benefit: "₹18,000 / month", tone: "watch", logo: "S", eligible: "Check details" },
];

const filters = ["For you", "Closing soon", "Scholarships", "Internships", "Hackathons", "Research"];
const navItems = [
  { icon: Compass, label: "Home" }, { icon: Search, label: "Opportunities" },
  { icon: CalendarDays, label: "Slot calendar" }, { icon: Users, label: "Commun-In" },
  { icon: BriefcaseBusiness, label: "My applications" }, { icon: Bookmark, label: "Saved" },
] as const;

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
  const [activeNav, setActiveNav] = useState<WorkspaceView>("Home");
  const [saved, setSaved] = useState<string[]>(["SBI Youth for India Fellowship"]);
  const [role, setRole] = useState<"user" | "poster">("user");
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const visible = useMemo(() => opportunities.filter(o => `${o.title} ${o.org} ${o.type}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const save = (title: string) => { setSaved(s => s.includes(title) ? s.filter(x => x !== title) : [...s, title]); toast.success(saved.includes(title) ? "Removed from saved" : "Saved to your watchlist"); };
  const navigate = (label: WorkspaceView) => { setActiveNav(label); setMobileOpen(false); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileOpen ? "open" : ""}`}>
      <div className="brand"><div className="brand-mark">s</div><span>sloth</span><button className="close-mobile" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <div className="profile-chip"><div className="avatar">AR</div><div><strong>Arjun Rao</strong><small>Student · 420 points</small></div><ChevronDown size={15} className="ml-auto text-[#829087]" /></div>
      <div className="side-label">Your workspace</div>
      <nav>{navItems.map(({ icon: Icon, label }) => <button key={label} className={`nav-item ${activeNav === label && role === "user" ? "active" : ""}`} onClick={() => navigate(label)}><Icon size={18} /><span>{label}</span>{label === "Saved" && <b>{saved.length}</b>}</button>)}</nav>
      <div className="side-spacer" />
      <div className="sloth-points"><div className="points-icon"><Zap size={17} /></div><div><small>Sloth points</small><strong>420 <span>+12 this week</span></strong></div></div>
      <button className="help-link" onClick={() => toast.info("Safety guidance and support are coming soon") }><CircleHelp size={17} /> Help & safety</button>
      <div className="poster-switch"><div><small>Publishing opportunities?</small><strong>Switch to Poster</strong></div><button onClick={() => { setRole(role === "user" ? "poster" : "user"); toast.success(role === "user" ? "Poster workspace selected" : "Back to your personal workspace"); }}><ArrowUpRight size={16} /></button></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={21} /></button><div className="crumb"><span>Workspace</span><span>/</span><strong>{role === "user" ? activeNav : "Poster dashboard"}</strong></div><div className="top-actions"><button className="role-pill" onClick={() => setRole(role === "user" ? "poster" : "user")}>{role === "user" ? "Personal workspace" : "Poster workspace"}<ChevronDown size={14} /></button><button className="notification" onClick={() => toast.info("You are all caught up") }><Bell size={18} /><i /></button><div className="avatar mini">AR</div></div></header>
      {role === "poster" ? <PosterView /> : <WorkspaceContent view={activeNav} activeFilter={activeFilter} setActiveFilter={setActiveFilter} saved={saved} save={save} query={query} setQuery={setQuery} visible={visible} />}
    </main>
  </div>;
}

function WorkspaceContent({ view, activeFilter, setActiveFilter, saved, save, query, setQuery, visible }: { view: WorkspaceView; activeFilter: string; setActiveFilter: (value: string) => void; saved: string[]; save: (title: string) => void; query: string; setQuery: (value: string) => void; visible: Opportunity[] }) {
  if (view === "Opportunities") return <OpportunitiesView activeFilter={activeFilter} setActiveFilter={setActiveFilter} saved={saved} save={save} query={query} setQuery={setQuery} visible={visible} />;
  if (view === "Slot calendar") return <CalendarView />;
  if (view === "Commun-In") return <CommunityView />;
  if (view === "My applications") return <ApplicationsView />;
  if (view === "Saved") return <SavedView saved={saved} save={save} />;
  return <HomeView activeFilter={activeFilter} setActiveFilter={setActiveFilter} saved={saved} save={save} query={query} setQuery={setQuery} visible={visible} />;
}

function HomeView({ activeFilter, setActiveFilter, saved, save, query, setQuery, visible }: { activeFilter: string; setActiveFilter: (value: string) => void; saved: string[]; save: (title: string) => void; query: string; setQuery: (value: string) => void; visible: Opportunity[] }) {
  return <>
    <section className="welcome-row"><div><p className="kicker"><Sparkles size={15} /> Curated for your next move</p><h1>Good morning, Arjun<span>.</span></h1><p className="subhead">Make your next opportunity count. We found <strong>24 new matches</strong> for your profile.</p></div><button className="ai-button" onClick={() => toast.success("Navigator is tuning your recommendations")}>Ask Navigator <Sparkles size={16} /></button></section>
    <section className="hero-strip"><div className="hero-copy"><span className="hero-tag">YOUR WEEK AT A GLANCE</span><h2>Keep your momentum,<br /><em>not your tabs.</em></h2><p>3 deadlines this week · 1 action needed today</p></div><div className="week-dots"><div className="week-head"><span>Mon 14</span><span>Tue 15</span><span className="today">Wed 16</span><span>Thu 17</span><span>Fri 18</span></div><div className="week-bars"><i /><i className="filled" /><i className="filled lime" /><i /><i className="filled orange" /></div><div className="week-foot"><span>2 saved</span><span>Apply today</span><span>1 closing</span></div></div><div className="hero-arrow"><ArrowUpRight size={22} /></div></section>
    <OpportunityDiscovery activeFilter={activeFilter} setActiveFilter={setActiveFilter} saved={saved} save={save} query={query} setQuery={setQuery} visible={visible} compact />
    <section className="bottom-grid"><div className="calendar-card"><div className="card-heading"><div><p className="kicker">SLOT CALENDAR</p><h3>Your week, at a glance</h3></div><button className="more-button" onClick={() => toast.info("Select Slot calendar in the sidebar to open the full view") }><ArrowUpRight size={17} /></button></div><div className="timeline"><div className="time-label">TODAY <span>16 SEP</span></div><div className="timeline-line"><div className="timeline-dot" /><div className="timeline-item"><strong>AI Innovation Challenge</strong><small>Final submission · 11:59 PM</small></div><span className="urgent-text">1 day left</span></div><div className="time-label">FRI <span>19 SEP</span></div><div className="timeline-line muted-line"><div className="timeline-dot" /><div className="timeline-item"><strong>SBI Youth for India</strong><small>Application closes</small></div><span>4 days</span></div></div><button className="calendar-link" onClick={() => toast.info("Select Slot calendar in the sidebar to open the full view")}>Open full calendar <ArrowUpRight size={15} /></button></div><TrustCard /></section>
    <Footer />
  </>;
}

function OpportunityDiscovery({ activeFilter, setActiveFilter, saved, save, query, setQuery, visible, compact = false }: { activeFilter: string; setActiveFilter: (value: string) => void; saved: string[]; save: (title: string) => void; query: string; setQuery: (value: string) => void; visible: Opportunity[]; compact?: boolean }) {
  return <><section className="section-head"><div><p className="kicker">DISCOVERY ENGINE</p><h2>Opportunities that fit <em>you.</em></h2></div>{compact && <button className="view-all" onClick={() => toast.info("Select Opportunities in the sidebar to browse everything")}>View all <ArrowUpRight size={16} /></button>}</section><div className="toolbar"><div className="search-box"><Search size={18} /><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by skill, interest or organization" /><kbd>⌘ K</kbd></div><button className="filter-button"><SlidersHorizontal size={16} /> Filters <span>2</span></button></div><div className="filter-row">{filters.map(f => <button key={f} className={activeFilter === f ? "active" : ""} onClick={() => setActiveFilter(f)}>{f}</button>)}</div><div className="opportunity-grid">{visible.map(item => <OpportunityCard key={item.title} item={item} saved={saved.includes(item.title)} onSave={() => save(item.title)} />)}</div></>;
}

function OpportunitiesView({ activeFilter, setActiveFilter, saved, save, query, setQuery, visible }: { activeFilter: string; setActiveFilter: (value: string) => void; saved: string[]; save: (title: string) => void; query: string; setQuery: (value: string) => void; visible: Opportunity[] }) {
  return <div className="workspace-page"><section className="page-intro"><div><p className="kicker"><Search size={15} /> DISCOVERY ENGINE</p><h1>Find your next <em>move.</em></h1><p className="subhead">Browse opportunities ranked by fit, urgency, and trust.</p></div><button className="filter-button page-filter"><Filter size={16} /> More filters</button></section><OpportunityDiscovery activeFilter={activeFilter} setActiveFilter={setActiveFilter} saved={saved} save={save} query={query} setQuery={setQuery} visible={visible} /><div className="discovery-note"><ShieldCheck size={18} /><span><strong>Trust-first discovery.</strong> Every opportunity is checked against its official source before it reaches your feed.</span></div></div>;
}

function CalendarView() {
  const days = [{ day: "16", name: "WED", count: 2, tone: "urgent" }, { day: "17", name: "THU", count: 0, tone: "" }, { day: "18", name: "FRI", count: 1, tone: "watch" }, { day: "19", name: "SAT", count: 2, tone: "soon" }, { day: "20", name: "SUN", count: 0, tone: "" }];
  return <div className="workspace-page"><section className="page-intro"><div><p className="kicker"><CalendarDays size={15} /> DEADLINE INTELLIGENCE</p><h1>Your time, <em>made visible.</em></h1><p className="subhead">See what is closing soon, what you saved, and what is coming next.</p></div><button className="ai-button" onClick={() => toast.success("Reminder preferences saved")}>Set reminders <Bell size={16} /></button></section><div className="calendar-summary"><div><span>THIS WEEK</span><strong>3 deadlines</strong><small>1 needs action today</small></div><div><span>SAVED DEADLINES</span><strong>2 opportunities</strong><small>Across 2 categories</small></div><div><span>NEXT OPENING</span><strong>18 Sep</strong><small>Google India Internship</small></div></div><div className="full-calendar-card"><div className="card-heading"><div><p className="kicker">SEPTEMBER 2026</p><h3>What needs your attention</h3></div><div className="calendar-toggle"><button className="active">Timeline</button><button>Month</button><button>List</button></div></div><div className="day-strip">{days.map(d => <div className={`day-cell ${d.day === "16" ? "today" : ""}`} key={d.day}><span>{d.name}</span><strong>{d.day}</strong>{d.count > 0 && <i className={d.tone}>{d.count}</i>}</div>)}</div><div className="calendar-events"><div className="event urgent"><div className="event-date">TODAY<strong>16 SEP</strong></div><div className="event-body"><div className="event-icon"><Flame size={17} /></div><div><strong>AI Innovation Challenge 2026</strong><small>NITI Aayog · Final submission at 11:59 PM</small></div><span>1 day left</span></div></div><div className="event soon"><div className="event-date">FRI<strong>18 SEP</strong></div><div className="event-body"><div className="event-icon"><BriefcaseBusiness size={17} /></div><div><strong>Google India Software Internship</strong><small>Google India · Application closes</small></div><span>3 days</span></div></div><div className="event watch"><div className="event-date">SAT<strong>19 SEP</strong></div><div className="event-body"><div className="event-icon"><GraduationCap size={17} /></div><div><strong>SBI Youth for India Fellowship</strong><small>State Bank of India Foundation · Application closes</small></div><span>8 days</span></div></div></div></div></div>;
}

function CommunityView() {
  return <div className="workspace-page"><section className="page-intro"><div><p className="kicker"><Users size={15} /> COMMUN-IN</p><h1>Don't navigate <em>alone.</em></h1><p className="subhead">Find people working toward the same opportunity, goal, or idea.</p></div><button className="ai-button" onClick={() => toast.success("Your community post draft is ready")}>Start a conversation <Plus size={16} /></button></section><div className="community-grid"><div className="community-main"><div className="community-tabs"><button className="active">For you</button><button>Following</button><button>Trending</button></div>{[["Riya Mehta", "Designing a better way to prepare for AI hackathons — anyone building a team for the NITI challenge?", "AI Innovation Challenge", "18 min ago", "24"], ["Kunal Shah", "Sharing a simple checklist that helped me submit my first fellowship application without the last-minute panic.", "Career moves", "1 hr ago", "41"], ["Aarav & 7 others", "Looking for a backend teammate who enjoys solving real climate problems. We have an idea and 5 days to build.", "GreenTech Sprint", "3 hrs ago", "67"]].map(([name, text, tag, time, replies], i) => <article className="post-card" key={name}><div className="post-top"><div className={`avatar community-avatar c${i}`}>{name[0]}</div><div><strong>{name}</strong><small>{time}</small></div><button className="more-button"><ExternalLink size={14} /></button></div><p>{text}</p><div className="post-bottom"><span className="post-tag">{tag}</span><span><Users size={13} /> {replies} replies</span><button>Join thread <ArrowUpRight size={14} /></button></div></article>)}</div><aside className="community-aside"><div className="aside-card"><p className="kicker">YOUR CIRCLES</p><h3>Spaces that move you forward</h3>{[["AI builders India", "1.8k members", "AI"], ["Fellowship seekers", "624 members", "FS"], ["Campus founders", "432 members", "CF"]].map(([name, count, logo]) => <div className="circle-row" key={name}><Logo letter={logo} className="small-logo" /><div><strong>{name}</strong><small>{count}</small></div><ArrowUpRight size={15} /></div>)}<button className="calendar-link">Explore all circles <ArrowUpRight size={14} /></button></div><div className="aside-card invite-card"><Sparkles size={18} /><h3>Have an idea?</h3><p>Start a circle for something you care about.</p><button className="text-button">Create a circle <Plus size={14} /></button></div></aside></div></div>;
}

function ApplicationsView() {
  const rows = [["AI Innovation Challenge 2026", "NITI Aayog", "In review", "Submitted 14 Sep", "urgent"], ["Google India Software Internship", "Google India", "Application started", "Last updated 12 Sep", "soon"], ["SBI Youth for India Fellowship", "State Bank of India Foundation", "Saved to apply", "Deadline 24 Sep", "watch"]];
  return <div className="workspace-page"><section className="page-intro"><div><p className="kicker"><BriefcaseBusiness size={15} /> APPLICATION TRACKER</p><h1>Your progress, <em>in one place.</em></h1><p className="subhead">A clear view of every opportunity you are moving toward.</p></div><button className="ai-button" onClick={() => toast.success("Application tracker refreshed")}>Refresh tracker <Sparkles size={16} /></button></section><div className="application-stats"><div><strong>03</strong><span>Active applications</span></div><div><strong>01</strong><span>Needs your action</span></div><div><strong>00</strong><span>Decisions this week</span></div><div><strong>68%</strong><span>Profile complete</span></div></div><div className="applications-card"><div className="card-heading"><div><p className="kicker">ALL APPLICATIONS</p><h3>Keep moving forward</h3></div><button className="filter-button"><Filter size={15} /> Filter</button></div>{rows.map(([title, org, status, date, tone]) => <div className="application-row" key={title}><Logo letter={title[0]} /><div className="application-name"><strong>{title}</strong><small>{org}</small></div><span className={`application-status ${tone}`}>{status}</span><span className="application-date">{date}</span><button className="more-button" onClick={() => toast.info(`Opening ${title}`)}><ArrowUpRight size={15} /></button></div>)}</div></div>;
}

function SavedView({ saved, save }: { saved: string[]; save: (title: string) => void }) {
  const savedItems = opportunities.filter(o => saved.includes(o.title));
  return <div className="workspace-page"><section className="page-intro"><div><p className="kicker"><Bookmark size={15} /> WATCHLIST</p><h1>Good things, <em>saved.</em></h1><p className="subhead">Your shortlist, ready when you are. No tab-hoarding required.</p></div><div className="saved-count"><strong>{saved.length}</strong><span>saved<br />opportunities</span></div></section><div className="saved-layout"><div><div className="saved-header"><h3>Saved for later</h3><span>{saved.length} items</span></div><div className="opportunity-grid">{savedItems.length ? savedItems.map(item => <OpportunityCard key={item.title} item={item} saved onSave={() => save(item.title)} />) : <div className="empty-state"><Bookmark size={25} /><h3>Your watchlist is clear.</h3><p>Save opportunities from the discovery feed and they will show up here.</p></div>}</div></div><div className="save-tip"><div className="trust-orbit"><Clock3 size={21} /></div><p className="kicker">A SMALL REMINDER</p><h3>Save now.<br /><em>Decide later.</em></h3><p>Sloth keeps your shortlist organized and your deadlines visible, so you can choose with less pressure.</p><button className="text-button" onClick={() => toast.info("Opening Opportunities")}>Browse opportunities <ArrowUpRight size={14} /></button></div></div></div>;
}

function TrustCard() { return <div className="trust-card"><div className="trust-orbit"><ShieldCheck size={27} /></div><p className="kicker">TRUST LAYER</p><h3>Information you can<br /><em>act on.</em></h3><p>Every listing is checked against its official source and timestamped, so you know what to trust.</p><div className="trust-stat"><strong>98.4%</strong><span>of active listings verified</span></div><a href="#" onClick={e => { e.preventDefault(); toast.info("Trust methodology coming soon"); }}>How verification works <ArrowUpRight size={15} /></a></div>; }
function Footer() { return <footer><span>© 2026 Sloth Technologies</span><span>Built for the next generation of India <span className="dot-sep">·</span> <a href="#">Trust & safety</a> <span className="dot-sep">·</span> <a href="#">For posters</a></span></footer>; }

function PosterView() { return <div className="poster-view"><div className="poster-banner"><div><p className="kicker"><LayoutDashboard size={15} /> POSTER WORKSPACE</p><h1>Make good work <em>discoverable.</em></h1><p className="subhead">Publish with clarity. Reach the people who are ready to act.</p></div><button className="ai-button"><Plus size={17} /> Post an opportunity</button></div><div className="poster-stats">{[["Active opportunities", "12", "+2 this month"], ["Total applications", "1,248", "+18% vs last month"], ["Avg. match quality", "86%", "Across all listings"], ["Next slot", "18 Sep", "Low traffic · recommended"]].map(([a, b, c]) => <div className="stat-card" key={a}><small>{a}</small><strong>{b}</strong><span>{c}</span></div>)}</div><div className="poster-content"><div className="poster-panel"><div className="card-heading"><div><p className="kicker">MY OPPORTUNITIES</p><h3>Recent performance</h3></div><button className="view-all">View all <ArrowUpRight size={15} /></button></div>{["National Student Design Sprint", "GreenTech Fellowship 2026", "Campus Innovators Meet-up"].map((x, i) => <div className="poster-row" key={x}><Logo letter={['N', 'G', 'C'][i]} /><div><strong>{x}</strong><small>{[432, 289, 167][i]} applications · {['92%', '81%', '76%'][i]} match</small></div><span className="status-live">Live</span><ArrowUpRight size={16} /></div>)}</div><div className="poster-panel traffic"><div className="card-heading"><div><p className="kicker">SLOT INTELLIGENCE</p><h3>Best time to publish</h3></div><CalendarDays size={19} /></div><div className="traffic-date"><strong>18</strong><span>SEP<br />2026</span><div><b>Low competition</b><small>Only 3 similar listings</small></div></div><button className="recommendation"><Sparkles size={15} /> Recommended publishing date <ArrowUpRight size={15} /></button></div></div></div>; }
