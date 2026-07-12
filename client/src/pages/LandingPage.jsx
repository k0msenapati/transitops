import { useState } from 'react'
import { Link } from 'wouter'
import { useAuth } from '../context/AuthContext'

const landingStyles = `
  .landing-root {
    background-color: #030304 !important;
    background-image: 
      linear-gradient(rgba(255, 255, 255, 0.012) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.012) 1px, transparent 1px) !important;
    background-size: 40px 40px !important;
    background-position: center top !important;
    color: #9ea2a8 !important;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
    min-height: 100vh;
    font-size: 16px !important;
    line-height: 1.625 !important;
  }

  .landing-root h1, 
  .landing-root h2, 
  .landing-root h3, 
  .landing-root h4 {
    color: #ffffff !important;
    font-weight: 600 !important;
    letter-spacing: -0.02em !important;
  }

  /* Sharp premium action buttons */
  .landing-btn-primary {
    background-color: #ffffff !important;
    color: #030304 !important;
    font-weight: 500 !important;
    font-size: 14px !important;
    padding: 10px 22px !important;
    border-radius: 4px !important;
    transition: opacity 0.15s ease, transform 0.15s ease !important;
    border: 1px solid #ffffff !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1) !important;
  }

  .landing-btn-primary:hover {
    opacity: 0.9 !important;
    transform: translateY(-1px);
  }

  .landing-btn-secondary {
    background-color: rgba(255, 255, 255, 0.03) !important;
    color: #ffffff !important;
    font-weight: 500 !important;
    font-size: 14px !important;
    padding: 10px 22px !important;
    border-radius: 4px !important;
    border: 1px solid #222226 !important;
    transition: border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }

  .landing-btn-secondary:hover {
    border-color: #44444c !important;
    background-color: #0c0c0e !important;
    transform: translateY(-1px);
  }

  /* Focused layout containers */
  .landing-container {
    max-width: 900px !important;
    margin: 0 auto !important;
    padding: 0 24px !important;
    width: 100%;
  }

  .landing-nav-logo {
    font-size: 16px !important;
    font-weight: 700 !important;
    color: #ffffff !important;
    letter-spacing: -0.01em !important;
  }



  /* Feature row style */
  .landing-feature-col {
    border-top: 1px solid #141416 !important;
    padding-top: 24px !important;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .landing-meta-num {
    font-family: ui-monospace, SFMono-Regular, SF Mono, Menlo, Monaco, Consolas, monospace !important;
    font-size: 11px !important;
    color: var(--brand-color, #0d9488) !important;
    font-weight: 600 !important;
    letter-spacing: 0.05em !important;
  }

  /* Road Map Journey Steps */
  .landing-step-card {
    border-left: 2px solid #141416 !important;
    padding-left: 24px !important;
    position: relative;
  }

  .landing-step-card::before {
    content: "";
    position: absolute;
    left: -6px;
    top: 4px;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #141416;
    border: 2px solid #030304;
    transition: background-color 0.15s ease;
  }

  .landing-step-card.active::before {
    background-color: var(--brand-color, #0d9488);
    box-shadow: 0 0 8px var(--brand-color, #0d9488);
  }

  /* FAQ Row Style */
  .landing-faq-row {
    border-top: 1px solid #141416 !important;
    padding: 24px 0 !important;
    cursor: pointer;
    transition: color 0.15s ease;
  }

  .landing-faq-row:last-child {
    border-bottom: 1px solid #141416 !important;
  }

  .landing-faq-question {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 16px !important;
    font-weight: 500 !important;
    color: #e5e5ea !important;
  }

  .landing-faq-row:hover .landing-faq-question {
    color: #ffffff !important;
  }
`;

export default function LandingPage() {
  const { token } = useAuth()
  const [activeFaq, setActiveFaq] = useState(null)
  const [activeStep, setActiveStep] = useState(0)

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index)
  }

  const faqs = [
    {
      q: "How does the platform enforce cargo limits?",
      a: "When dispatchers schedule a trip, they enter the cargo weight. The system automatically validates it against the vehicle's maximum registered load and blocks dispatch if it is overloaded."
    },
    {
      q: "How does role-based access help my team?",
      a: "By strictly limiting views. Dispatchers only see routing and dispatch maps, Safety Officers handle compliance and score audits, and Financial Analysts review cash and fuel metrics. This prevents accidents and confusion."
    },
    {
      q: "Are driver licenses audited automatically?",
      a: "Yes. The safety workspace keeps a constant registry of driver compliance metrics, automatically warning and blocking drivers who hold expired licenses or are suspended."
    },
    {
      q: "Can I export data for accounting?",
      a: "Yes. Financial Analysts can generate and export complete operational expenditure spreadsheets (including fuel logs, tolls, and maintenance services) to standard CSV format."
    }
  ]

  const steps = [
    {
      title: "Fleet Manager Setup",
      role: "Asset registry",
      description: "Registers vehicles (Vans, Trucks, Minis), tracks current odometer metrics, and enters repair invoices to schedule mechanic maintenance."
    },
    {
      title: "Safety Audits",
      role: "Operator verification",
      description: "Registers drivers, audits driving categories, reviews safety score cards, and flags license expiration dates."
    },
    {
      title: "Dispatcher Dispatch",
      role: "Live run management",
      description: "Assigns available vehicles and compliant drivers to trips. Compares weight requests to vehicle load caps in real-time."
    },
    {
      title: "Financial Auditing",
      role: "Operating ROI margins",
      description: "Records fuel fills and highway tolls to calculate vehicle-specific profitability returns and overall fleet utilization reports."
    }
  ]

  return (
    <div className="landing-root selection:bg-zinc-800">
      <style dangerouslySetInnerHTML={{ __html: landingStyles }} />

      {/* 1. Navbar */}
      <header className="border-b border-[#141416] bg-black/80 backdrop-blur-md sticky top-0 z-50">
        <div className="landing-container h-16 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-brand rounded flex items-center justify-center font-black text-white text-xs select-none">
              T
            </div>
            <span className="landing-nav-logo">TransitOps</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-[12px] font-medium tracking-wide text-zinc-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workspaces" className="hover:text-white transition-colors">Workspaces</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div>
            {token ? (
              <Link to="/dashboard">
                <button className="landing-btn-primary">
                  Dashboard
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="landing-btn-primary">
                  Launch Console
                </button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="pt-24 pb-16 text-center">
        <div className="landing-container max-w-2xl flex flex-col items-center">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand/10 border border-brand/25 text-brand rounded-full text-[11px] font-bold mb-8 select-none">
            <span className="animate-pulse">✦</span>
            <span>Early Access Console Node</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 leading-[1.08] max-w-xl">
            Logistics control, simplified.
          </h1>
          
          <p className="text-base md:text-[17px] text-[#868a92] max-w-lg mb-10 leading-relaxed font-medium">
            Manage inventories, dispatch drivers safely, enforce operator compliance, and track operating margins. A minimal, high-contrast dashboard for modern transport operations.
          </p>

          <div className="flex gap-4 mb-16">
            {token ? (
              <Link to="/dashboard">
                <button className="landing-btn-primary">
                  Enter Console
                </button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <button className="landing-btn-primary">
                    Launch Console
                  </button>
                </Link>
                <Link to="/register">
                  <button className="landing-btn-secondary">
                    Register Operator
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Premium Mock Dashboard Preview Frame (Eclipsed layout) */}
          <div className="w-full bg-[#0a0a0c] border border-[#1e1e24] rounded-lg overflow-hidden shadow-2xl shadow-brand/5 mt-4">
            {/* Glowing top line */}
            <div className="h-[1.5px] bg-gradient-to-r from-transparent via-brand to-transparent w-full" />
            
            {/* Window Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#0e0e11] border-b border-[#141416] text-[11px]">
              <div className="flex items-center gap-1.5 text-zinc-500">
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="w-2 h-2 rounded-full bg-zinc-800" />
                <span className="ml-2 font-bold text-[#b4b7bd]">TransitOps Console</span>
              </div>
              <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Active Dispatch Board</span>
            </div>

            {/* Window Content */}
            <div className="p-4 overflow-x-auto bg-[#060608]">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#141416] text-zinc-500 uppercase tracking-wider font-semibold">
                    <th className="pb-2.5 font-medium">Vehicle</th>
                    <th className="pb-2.5 font-medium">Type</th>
                    <th className="pb-2.5 font-medium">Driver</th>
                    <th className="pb-2.5 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#0c0c0e]">
                  <tr>
                    <td className="py-3 text-zinc-350 font-bold">TRK-11 (GJ01AB998)</td>
                    <td className="py-3 text-zinc-500">Heavy Truck</td>
                    <td className="py-3 text-zinc-400">John (HMV)</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-blue-955/20 border border-blue-900/40 text-blue-400 font-bold rounded text-[9px] uppercase tracking-wide">
                        On Trip
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 text-zinc-350 font-bold">VAN-05 (GJ01AB452)</td>
                    <td className="py-3 text-zinc-500">Light Van</td>
                    <td className="py-3 text-zinc-400">Alex (LMV)</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-emerald-955/20 border border-emerald-900/40 text-emerald-450 font-bold rounded text-[9px] uppercase tracking-wide">
                        Available
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Features Section (No bubbly cards, just clean columns with divider lines) */}
      <section id="features" className="py-28 border-t border-[#141416]">
        <div className="landing-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-10">
            
            {/* Feature 1 */}
            <div className="landing-feature-col">
              <span className="landing-meta-num">01 / REGISTRY</span>
              <h3 className="text-lg font-semibold text-white">Fleet Inventory</h3>
              <p className="text-sm text-[#7e828a] leading-relaxed">
                Centralize listings for vans and trucks. Record registration tags, capacities, and active maintenance intervals in a single clean index.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="landing-feature-col">
              <span className="landing-meta-num">02 / DISPATCH</span>
              <h3 className="text-lg font-semibold text-white">Smart Dispatching</h3>
              <p className="text-sm text-[#7e828a] leading-relaxed">
                Assign drivers to runs. The platform automatically audits driver credentials, checks load limits, and blocks schedules if weights are exceeded.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="landing-feature-col">
              <span className="landing-meta-num">03 / COSTING</span>
              <h3 className="text-lg font-semibold text-white">Cost Audits</h3>
              <p className="text-sm text-[#7e828a] leading-relaxed">
                Log fuel sheets, tolls, and repair garage invoices. Instantly calculate vehicle utilization ratios and profitability return metrics.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. RBAC Cool Explain (Interactive Workflow Split) */}
      <section id="workspaces" className="py-28 border-t border-[#141416]">
        <div className="landing-container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left Column: Brief (2/5 width) */}
            <div className="lg:col-span-2">
              <span className="landing-meta-num uppercase tracking-wider block mb-4">Workflow Journey</span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-4">
                End-to-End Transport Control.
              </h2>
              <p className="text-sm text-[#7e828a] leading-relaxed max-w-xs mb-6">
                TransitOps coordinates operations across roles in a secure path. Click through steps to see how security filters what you do.
              </p>
              
              <div className="hidden lg:flex flex-col gap-4 mt-8">
                {steps.map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`text-left text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      activeStep === idx ? 'text-brand' : 'text-zinc-650 hover:text-zinc-400'
                    }`}
                  >
                    Step {idx + 1}: {s.role}
                  </button>
                ))}
              </div>
            </div>

            {/* Right Column: Steps Timeline (3/5 width) */}
            <div className="lg:col-span-3 flex flex-col gap-8">
              {steps.map((s, idx) => {
                const active = activeStep === idx
                return (
                  <div 
                    key={idx}
                    onClick={() => setActiveStep(idx)}
                    className={`landing-step-card cursor-pointer transition-all duration-150 ${
                      active ? 'active' : 'opacity-50'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-4 mb-1">
                      <h4 className="text-sm font-semibold text-white">{s.title}</h4>
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{s.role}</span>
                    </div>
                    <p className="text-sm text-[#7e828a] leading-relaxed">{s.description}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ Section (Minimal list) */}
      <section id="faq" className="py-28 border-t border-[#141416]">
        <div className="landing-container max-w-2xl">
          <div className="text-center mb-16">
            <span className="landing-meta-num uppercase tracking-wider">FAQ</span>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-2">Common Questions</h2>
          </div>

          <div className="flex flex-col">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="landing-faq-row"
                onClick={() => toggleFaq(idx)}
              >
                <div className="landing-faq-question pr-4">
                  <span>{faq.q}</span>
                  <svg 
                    className={`w-4 h-4 text-zinc-500 shrink-0 transition-transform duration-150 ${
                      activeFaq === idx ? 'rotate-180 text-white' : ''
                    }`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </div>
                {activeFaq === idx && (
                  <div className="mt-4 text-sm text-[#7e828a] leading-relaxed max-w-xl">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Section (Clean border-only container) */}
      <section className="py-28 border-t border-[#141416]">
        <div className="landing-container text-center max-w-xl">
          <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-4">
            Simplify your logistics desk today.
          </h2>
          <p className="text-sm text-[#7e828a] mb-8 leading-relaxed max-w-xs mx-auto">
            Get instant control over operations. Choose a workspace and access the TransitOps console.
          </p>
          <div>
            {token ? (
              <Link to="/dashboard">
                <button className="landing-btn-primary">
                  Open Console
                </button>
              </Link>
            ) : (
              <Link to="/login">
                <button className="landing-btn-primary">
                  Launch Console
                </button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-[#141416] py-16 bg-black">
        <div className="landing-container flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-brand rounded flex items-center justify-center font-black text-white text-[10px] select-none">
              T
            </div>
            <span className="text-xs font-bold text-white tracking-tight">TransitOps</span>
          </div>

          <div className="flex gap-8 text-[12px] font-medium text-zinc-500">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#workspaces" className="hover:text-white transition-colors">Workspaces</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <span className="text-[10px] text-zinc-600 tracking-wider">
            &copy; 2026 TransitOps.
          </span>
        </div>
      </footer>
    </div>
  )
}
