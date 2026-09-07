import { Phone, Mail, Clock } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-white pt-12 pb-8 border-t border-slate-200 mt-auto print:hidden">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
                
                {/* Top Section: Links, Address, Contact */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-[13px] text-slate-600">
                    
                    {/* Sitios web de interés */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-bold text-[15px] text-[#1A2E5E] mb-1">
                            Sitios web de interés
                        </h3>
                        <ul className="flex flex-col gap-2.5">
                            <li>
                                <a 
                                    href="https://www.tepic.tecnm.mx" 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="hover:text-[#2563EB] transition-colors"
                                >
                                    Tecnológico de Tepic
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="https://eve.ittepic.edu.mx" 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="hover:text-[#2563EB] transition-colors"
                                >
                                    EVE
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className="hover:text-[#2563EB] transition-colors"
                                >
                                    Ciencias Básicas
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className="hover:text-[#2563EB] transition-colors"
                                >
                                    Posgrado
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className="hover:text-[#2563EB] transition-colors"
                                >
                                    Laboratorio Nacional (LANAEPBI)
                                </a>
                            </li>
                            <li>
                                <a 
                                    href="#" 
                                    className="hover:text-[#2563EB] transition-colors"
                                >
                                    Perfil de Emergencias
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Dirección postal */}
                    <div className="flex flex-col gap-3">
                        <h3 className="font-bold text-[15px] text-[#1A2E5E] mb-1">
                            Dirección postal
                        </h3>
                        <p className="leading-relaxed">
                            Instituto Tecnológico de Tepic<br />
                            Avenida Tecnológico #2595<br />
                            Colonia Lagos del Country<br />
                            Tepic, Nayarit. México. C.P. 63175
                        </p>
                    </div>

                    {/* Contacto */}
                    <div>
                        <h3 className="font-bold text-[15px] text-[#1A2E5E] mb-4">
                            Contacto
                        </h3>
                    
                        <div className="space-y-3.5 text-sm text-slate-600">
                    
                            {/* Teléfono */}
                            <div className="flex items-center gap-3">
                                <Phone className="h-4 w-4 shrink-0 text-[#1A2E5E]" />
                                <span>+52 311 211 9400</span>
                            </div>
                    
                            {/* Correo */}
                            <div className="flex items-center gap-3">
                                <Mail className="h-4 w-4 shrink-0 text-[#1A2E5E]" />
                                <span className="break-all">desarrollo.sistemas.cc@ittepic.edu.mx</span>
                            </div>
                    
                            {/* Horario */}
                            <div className="flex items-center gap-3">
                                <Clock className="h-4 w-4 shrink-0 text-[#1A2E5E]" />
                                <span>Lunes a Viernes: 08:00 AM a 16:00 hrs</span>
                            </div>
                    
                        </div>
                    </div>

                </div>
                
                {/* Separator */}
                <div className="my-8 border-t border-slate-200" />
                
                {/* Bottom Section: Logo and Copyright */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <img 
                        src="/imgs/imgFooter.png" 
                        alt="Centro de Cómputo" 
                        className="h-[60px] w-auto object-contain"
                    />
                    
                    <div className="text-xs text-slate-400 text-center md:text-right">
                        <p>© {new Date().getFullYear()} Centro de Cómputo. Todos los derechos reservados</p>
                    </div>
                </div>

            </div>
        </footer>
    );
}
