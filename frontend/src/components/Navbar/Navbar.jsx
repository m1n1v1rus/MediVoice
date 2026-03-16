import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Mic } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const links = [['/', 'Home'], ['/book', 'Book Appointment'], ['/login', 'Clinic Login']]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'glass-strong shadow-lg shadow-black/20' : 'bg-transparent'}`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <img src="/logo.svg" alt="MediVoice" className="h-9 group-hover:scale-105 transition-transform duration-300" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map(([p, l]) => (
            <Link key={p} to={p}
              className={`text-sm font-medium transition-all duration-300 hover:text-emerald-400 relative
              ${pathname === p ? 'text-emerald-400' : 'text-gray-400'}
              after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:bg-gradient-to-r after:from-emerald-400 after:to-cyan-400 after:transition-all after:duration-300
              ${pathname === p ? 'after:w-full' : 'after:w-0 hover:after:w-full'}`}>
              {l}
            </Link>
          ))}
          {/* Talk to AI — appears on scroll with smooth transition */}
          <Link to="/book"
            className={`group flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-full text-sm font-semibold hover:shadow-lg hover:shadow-emerald-500/25 transition-all duration-500 neon-glow
            ${scrolled ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-2 scale-90 pointer-events-none'}`}>
            <Mic className="w-4 h-4 group-hover:animate-pulse" />
            Talk to AI
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-gray-300 hover:text-emerald-400 transition-colors">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden glass-strong border-t border-white/5 animate-slide-up">
          <div className="px-6 py-4 flex flex-col gap-3">
            {links.map(([p, l]) => (
              <Link key={p} to={p} onClick={() => setOpen(false)}
                className={`py-2.5 px-3 rounded-lg transition-all duration-300 ${pathname === p ? 'text-emerald-400 bg-emerald-500/10' : 'text-gray-300 hover:text-emerald-400 hover:bg-white/5'}`}>{l}</Link>
            ))}
            <Link to="/book" onClick={() => setOpen(false)}
              className="mt-2 text-center flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white rounded-xl font-semibold neon-glow">
              <Mic className="w-4 h-4" /> Talk to AI
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}