import Header from '../components/Header';
import Footer from '../components/Footer';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background">
      <div className="w-full overflow-hidden rounded-lg " style={{ maxWidth: '300px', minWidth: '300px' }}>
        <div className="flex h-full flex-col" style={{ aspectRatio: '5 / 8' }}>
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </div>
  );
}
