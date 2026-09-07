import Header from '@/Components/Header';
import Footer from '@/Components/Footer';

export default function AuthenticatedLayout({ children }) {
    return (
        <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
            <Header />
            <main className="flex-1 w-full">
                {children}
            </main>
            <Footer />
        </div>
    );
}
