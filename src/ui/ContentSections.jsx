/**
 * ContentSections
 * ───────────────
 * All 6 portfolio sections as fixed-position panels.
 * Visibility controlled by scrollProgress matching section t-ranges.
 * Panels fade in/out via CSS opacity.
 */

import React, { useMemo } from 'react'
import { SECTIONS } from '../scenes/roadPath.js'

// Check if progress is within a section range
function inRange(progress, section) {
  const margin = 0.005
  return progress >= section.tStart - margin && progress <= section.tEnd + margin
}

export function ContentSections({ scrollProgress }) {
  const activeId = useMemo(() => {
    const found = SECTIONS.find(s => inRange(scrollProgress, s))
    return found ? found.id : null
  }, [scrollProgress])

  const getSide = (id) => {
    const s = SECTIONS.find(x => x.id === id)
    return s ? s.side : 'right'
  }

  return (
    <>
      <AboutPanel    active={activeId === 'about'}        side={getSide('about')} />
      <WorkPanel     active={activeId === 'work'}         side={getSide('work')} />
      <ProjectsPanel active={activeId === 'projects'}     side={getSide('projects')} />
      <InternPanel   active={activeId === 'internships'}  side={getSide('internships')} />
      <AchievPanel   active={activeId === 'achievements'} side={getSide('achievements')} />
      <ContactPanel  active={activeId === 'contact'}      side={getSide('contact')} />
    </>
  )
}

// ── Reusable panel wrapper ──────────────────────────────────────
function Panel({ active, side = 'right', children }) {
  return (
    <div className={`section-panel ${side} ${active ? 'visible' : ''}`}>
      <div className="panel-box">
        {children}
      </div>
    </div>
  )
}

// Dot list item
function Item({ title, sub, tags, highlight }) {
  return (
    <div className="p-item" style={highlight ? { marginBottom: '0.9rem' } : {}}>
      <div className="p-item-dot" style={highlight ? { background: 'var(--c-cyan)', boxShadow: '0 0 8px var(--c-cyan)' } : {}} />
      <div>
        <div className="p-item-text">
          {title}
          {highlight && <span className="p-badge">★ {highlight}</span>}
        </div>
        {sub && <div className="p-item-sub">{sub}</div>}
        {tags && (
          <div style={{ marginTop: '0.25rem' }}>
            {tags.map(t => <span key={t} className="p-tag-pill">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  )
}

// ── SECTION 1: ABOUT ───────────────────────────────────────────
function AboutPanel({ active, side }) {
  return (
    <Panel active={active} side={side}>
      <div className="p-tag">// 01 — IDENTITY</div>
      <div className="p-title">ALFRED<br />JOHN</div>
      <div className="p-sub">ELECTRICAL & ELECTRONICS ENGINEER</div>
      <div className="p-divider" />
      <div className="p-body" style={{ marginBottom: '0.8rem' }}>
        Engineer designing intelligent infrastructure systems that bridge
        IoT hardware, renewable energy concepts, and AI-based simulation
        with real industrial exposure.
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {['IoT', 'Renewable Energy', 'AI Systems', 'Embedded', 'Industrial'].map(t => (
          <span key={t} className="p-tag-pill">{t}</span>
        ))}
      </div>
    </Panel>
  )
}

// ── SECTION 2: CURRENT WORK ────────────────────────────────────
function WorkPanel({ active, side }) {
  return (
    <Panel active={active} side={side}>
      <div className="p-tag">// 02 — ACTIVE BUILDS</div>
      <div className="p-title">CURRENTLY<br />BUILDING</div>
      <div className="p-divider" />
      <Item title="IoT Oil Storage Monitoring System" sub="Real-time tank level + automated dispensing" tags={['IoT', 'Sensors']} />
      <Item title="AI-Enhanced Smart Grid Simulation" sub="Fault detection + grid recovery algorithms" tags={['AI', 'Grid']} />
      <Item title="Industrial Safety Proximity Alert" sub="Worker zone detection embedded system" tags={['Safety', 'Embedded']} />
      <Item title="Embedded System Prototyping" sub="Hardware-level development & testing" tags={['Hardware']} />

      {/* Live HUD widget */}
      <div style={{
        marginTop: '1rem',
        padding: '0.6rem 0.8rem',
        background: 'rgba(0,229,255,0.04)',
        border: '1px solid var(--c-cyan-dim)',
        fontFamily: 'var(--f-mono)',
        fontSize: '0.58rem',
        letterSpacing: '0.08em',
        color: 'var(--c-cyan)',
      }}>
        <MiniStatusRow label="ENGINE POWER" value="92%" />
        <MiniStatusRow label="SYSTEM LOAD" value="ACTIVE" />
        <MiniStatusRow label="SIGNAL" value="STRONG" />
      </div>
    </Panel>
  )
}

function MiniStatusRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.18rem 0', borderBottom: '1px solid rgba(0,229,255,0.08)' }}>
      <span style={{ opacity: 0.5 }}>{label}</span>
      <span style={{ color: 'var(--c-amber)' }}>{value}</span>
    </div>
  )
}

// ── SECTION 3: PROJECTS ────────────────────────────────────────
function ProjectsPanel({ active, side }) {
  return (
    <Panel active={active} side={side}>
      <div className="p-tag">// 03 — PORTFOLIO</div>
      <div className="p-title">PROJECTS</div>
      <div className="p-divider" />

      <div style={{ marginBottom: '0.6rem', fontFamily: 'var(--f-mono)', fontSize: '0.6rem', color: 'var(--c-amber)', letterSpacing: '0.12em' }}>
        ▸ IOT & EMBEDDED
      </div>
      <Item title="Oil Monitoring & Dispensing System" tags={['IoT', 'Embedded']} />
      <Item title="RFID Currency Recognition Pen" sub="Assistive device for visually impaired" tags={['RFID', 'Accessibility']} />
      <Item title="IR-Based Currency Recognition" tags={['IR Sensing']} />
      <Item title="Wireless Quiz Buzzer System" tags={['Wireless', 'Real-time']} />

      <div style={{ margin: '0.7rem 0 0.6rem', fontFamily: 'var(--f-mono)', fontSize: '0.6rem', color: 'var(--c-amber)', letterSpacing: '0.12em' }}>
        ▸ RENEWABLE ENERGY
      </div>
      <Item title="TrackWind — Airflow Energy Harvesting" tags={['Renewable', 'Kinetic']} />
      <Item title="Pipe-Based Micro Turbine Concept" tags={['Micro-hydro']} />
      <Item title="Mechanical Traveler Charging System" tags={['Portable Energy']} />

      <div style={{ margin: '0.7rem 0 0.6rem', fontFamily: 'var(--f-mono)', fontSize: '0.6rem', color: 'var(--c-amber)', letterSpacing: '0.12em' }}>
        ▸ ARTIFICIAL INTELLIGENCE
      </div>
      <Item title="AI Resilient Grid Simulation" tags={['AI', 'Grid', 'Simulation']} />
      <Item title="L&T Smart Grid Safety" highlight="TOP 30 ALL INDIA" tags={['National', 'Hackathon']} />
      <Item title="Prompt-Driven App Development" tags={['LLM', 'Rapid Dev']} />
    </Panel>
  )
}

// ── SECTION 4: INTERNSHIPS ─────────────────────────────────────
function InternPanel({ active, side }) {
  return (
    <Panel active={active} side={side}>
      <div className="p-tag">// 04 — FIELD EXPOSURE</div>
      <div className="p-title">INDUSTRIAL<br />INTERNSHIPS</div>
      <div className="p-divider" />
      <div className="p-body" style={{ marginBottom: '1rem' }}>
        6 months across automation, rail infrastructure, and energy management sectors.
      </div>
      <Item
        title="Multi Tech Industrial Automation"
        sub="2 months — PLC programming, control panel wiring, automation systems"
        tags={['PLC', 'Automation', 'Control Systems']}
      />
      <Item
        title="Integral Coach Factory (ICF)"
        sub="2 months — Railway electrical systems, coach assembly, quality control"
        tags={['Railway', 'Manufacturing', 'QC']}
      />
      <Item
        title="Thrive Industrial Solutions"
        sub="2 months — Energy management, field installation, system integration"
        tags={['Energy Mgmt', 'Integration']}
      />
    </Panel>
  )
}

// ── SECTION 5: ACHIEVEMENTS ────────────────────────────────────
function AchievPanel({ active, side }) {
  return (
    <Panel active={active} side={side}>
      <div className="p-tag">// 05 — RECOGNITION</div>
      <div className="p-title">ACHIEVEMENTS</div>
      <div className="p-divider" />
      <Item
        title="L&T Smart Grid Safety"
        highlight="TOP 30 ALL INDIA"
        sub="AI-driven grid fault detection — national finalist"
        tags={['National', 'L&T', 'Grid']}
      />
      <Item
        title="SDG Hackathon Finalist"
        sub="IoT monitoring system aligned with Sustainable Development Goals"
        tags={['SDG', 'IoT', 'Finalist']}
      />
      <Item
        title="National Hackathon Participation"
        sub="Multiple national-level engineering competitions"
        tags={['National', 'Engineering']}
      />
      <Item
        title="Haydn's The Creation — Concert"
        sub="Bass vocalist in full orchestral concert performance"
        tags={['Music', 'Bass', 'Performance']}
      />
    </Panel>
  )
}

// ── SECTION 6: CONTACT ─────────────────────────────────────────
function ContactPanel({ active, side }) {
  return (
    <Panel active={active} side={side}>
      <div className="p-tag">// 06 — CONNECT</div>
      <div className="p-title">SYSTEM<br />READY</div>
      <div className="p-sub">OPEN FOR COLLABORATION</div>
      <div className="p-divider" />
      <div className="p-body" style={{ marginBottom: '1rem' }}>
        Available for roles in electrical engineering, IoT systems,
        renewable energy, and AI infrastructure.
      </div>

      <a className="contact-link" href="https://linkedin.com/in/alfred-john-97a320290" target="_blank" rel="noopener noreferrer">
        <div className="contact-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
            <rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>
          </svg>
        </div>
        linkedin.com/in/alfred-john-97a320290
      </a>

      <a className="contact-link" href="https://instagram.com/alred_john_64" target="_blank" rel="noopener noreferrer">
        <div className="contact-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
          </svg>
        </div>
        @alred_john_64
      </a>

      <a className="contact-link" href="mailto:alfredjohn631@gmail.com">
        <div className="contact-icon">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
        </div>
        alfredjohn631@gmail.com
      </a>

      <a href="/resume-alfred-john.pdf" download className="resume-btn">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
        DOWNLOAD RESUME
      </a>
    </Panel>
  )
}
