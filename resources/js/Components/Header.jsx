import { Link, usePage } from '@inertiajs/react';
import { User, ChevronDown, LogOut, Settings, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Header() {
    const { auth } = usePage().props;
    const user = auth?.user;
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Cerrar dropdown al hacer click fuera
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isMantenimientoActive = route().current('solicitudes.*');
    const isProfileActive = route().current('profile.*');

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 print:hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
                
                {/* Logos left */}
                <div className="flex items-center">
                    <Link href={route('solicitudes.index')} className="flex items-center">
                        <img 
                            src="/imgs/imgHeader.png" 
                            alt="Tecnológico Nacional de México" 
                            className="h-12 w-auto object-contain"
                        />
                    </Link>
                </div>

                {/* Navigation & Avatar right (Desktop) */}
                <div className="hidden md:flex items-center gap-7 text-[13px] font-semibold text-[#475569]">
                    
                    {/* Botón Mantenimiento (Historial de Solicitudes) */}
                    <Link
                        href={route('solicitudes.index')}
                        className={`flex items-center gap-1.5 transition-all py-1 ${
                            isMantenimientoActive 
                                ? "text-[#1A2E5E] font-bold border-b-2 border-[#1A2E5E]" 
                                : "hover:text-[#1A2E5E]"
                        }`}
                    >
                        Mantenimiento
                    </Link>

                    {/* Botón Perfil */}
                    <Link
                        href={route('profile.edit')}
                        className={`flex items-center gap-1.5 transition-all py-1 ${
                            isProfileActive 
                                ? "text-[#1A2E5E] font-bold border-b-2 border-[#1A2E5E]" 
                                : "hover:text-[#1A2E5E]"
                        }`}
                    >
                        Perfil
                    </Link>

                    {/* Avatar y Menú Desplegable de Usuario */}
                    <div className="relative ml-2" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setDropdownOpen(!dropdownOpen)}
                            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none"
                            aria-expanded={dropdownOpen}
                        >
                            <div 
                                className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                                style={{ backgroundColor: "#EBF0F6", color: "#1A2E5E" }}
                            >
                                <User size={20} strokeWidth={2.5} />
                            </div>
                            <ChevronDown size={14} className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Dropdown Menu */}
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-2.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                                <div className="px-4 py-2 border-b border-slate-100 space-y-1">
                                    <p className="text-xs font-bold text-slate-800 truncate">
                                        {user?.nombre || user?.name || 'Usuario'}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate">
                                        {user?.email}
                                    </p>
                                    {user?.departamento_nombre && (
                                        <p className="text-[11px] text-slate-600 font-medium truncate pt-0.5" title={user.departamento_nombre}>
                                            <span className="text-slate-400 font-normal">Depto: </span>
                                            {user.departamento_nombre}
                                        </p>
                                    )}
                                    {user?.rol && (
                                        <div className="pt-0.5">
                                            <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full border border-blue-100">
                                                Rol: {user.rol}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <Link
                                    href={route('profile.edit')}
                                    onClick={() => setDropdownOpen(false)}
                                    className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-[#1A2E5E] transition-colors"
                                >
                                    <Settings size={14} />
                                    Configuración de Perfil
                                </Link>

                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    onClick={() => setDropdownOpen(false)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                                >
                                    <LogOut size={14} />
                                    Cerrar Sesión
                                </Link>
                            </div>
                        )}
                    </div>

                </div>

                {/* Botón menú móvil */}
                <div className="flex md:hidden items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

            </div>

            {/* Menú móvil desplegable */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-3">
                    <div className="pb-3 border-b border-slate-100 space-y-1">
                        <p className="text-sm font-bold text-slate-800">
                            {user?.nombre || user?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                            {user?.email}
                        </p>
                        {user?.departamento_nombre && (
                            <p className="text-xs text-slate-600 font-medium">
                                <span className="text-slate-400 font-normal">Depto: </span>
                                {user.departamento_nombre}
                            </p>
                        )}
                        {user?.rol && (
                            <div className="pt-0.5">
                                <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-100">
                                    Rol: {user.rol}
                                </span>
                            </div>
                        )}
                    </div>

                    <Link
                        href={route('solicitudes.index')}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                            isMantenimientoActive ? 'bg-blue-50 text-[#1A2E5E]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Mantenimiento
                    </Link>

                    <Link
                        href={route('profile.edit')}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`block px-3 py-2 rounded-lg text-sm font-semibold ${
                            isProfileActive ? 'bg-blue-50 text-[#1A2E5E]' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        Perfil
                    </Link>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        onClick={() => setMobileMenuOpen(false)}
                        className="w-full text-left block px-3 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                        Cerrar Sesión
                    </Link>
                </div>
            )}
        </header>
    );
}
