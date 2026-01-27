import { Link } from 'react-router-dom';

function NavDev() {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full bg-slate-900/80 backdrop-blur border-b border-slate-700 px-4 py-2 text-sm">
      <div className="flex items-center gap-4">
        <span className="font-semibold text-purple-300">DEV NAV</span>
        <Link to="/login" className="hover:text-purple-300">
          /login
        </Link>
        <Link to="/dashboard" className="hover:text-purple-300">
          /dashboard
        </Link>
      
      </div>
    </nav>
  );
}

export default NavDev;
