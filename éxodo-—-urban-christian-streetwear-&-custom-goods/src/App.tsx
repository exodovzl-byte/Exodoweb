import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { Benefits } from './components/home/Benefits';
import { CategoryCircles } from './components/home/CategoryCircles';
import { FeaturedProducts } from './components/home/FeaturedProducts';
import { CustomGuide } from './components/home/CustomGuide';
import { VerseSpotlight } from './components/home/VerseSpotlight';
import { CommunityGallery } from './components/home/CommunityGallery';
import { StoreCatalog } from './components/store/StoreCatalog';
import { ProductDetailModal } from './components/store/ProductDetailModal';
import { CustomLab } from './components/customLab/CustomLab';
import { DevotionalsPage } from './components/devotionals/DevotionalsPage';
import { AboutSection } from './components/about/AboutSection';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderTrackingModal } from './components/tracking/OrderTrackingModal';
import { AuthModal } from './components/auth/AuthModal';
import { AdminLoginModal } from './components/admin/AdminLoginModal';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';

const MainContent: React.FC = () => {
  const { currentPage, brandConfig, isAdminAuthenticated } = useStore();
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [trackingCodeToOpen, setTrackingCodeToOpen] = useState('');
  const { setIsTrackingModalOpen } = useStore();

  const handleOpenTrackingFromCheckout = (code: string) => {
    setTrackingCodeToOpen(code);
    setIsTrackingModalOpen(true);
  };

  // Render Home sections in dynamic customizable order
  const renderHomeSection = (sectionKey: string) => {
    switch (sectionKey) {
      case 'hero':
        return <Hero key="hero" />;
      case 'benefits':
        return <Benefits key="benefits" />;
      case 'categories':
        return <CategoryCircles key="categories" />;
      case 'featured':
        return <FeaturedProducts key="featured" />;
      case 'custom_guide':
        return <CustomGuide key="custom_guide" />;
      case 'verse_spotlight':
        return <VerseSpotlight key="verse_spotlight" />;
      case 'community':
        return <CommunityGallery key="community" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-black text-[#C8C3B3] font-sans selection:bg-[#C8C3B3] selection:text-black">
      
      {/* Navigation Header */}
      <Navbar />

      {/* Main View Router */}
      <main className="flex-1">
        {currentPage === 'inicio' && (
          <div className="animate-in fade-in duration-200">
            {brandConfig.homeSectionsOrder.map((sec) => renderHomeSection(sec))}
          </div>
        )}

        {currentPage === 'tienda' && <StoreCatalog />}

        {currentPage === 'personalizador' && <CustomLab />}

        {currentPage === 'palabra' && <DevotionalsPage />}

        {currentPage === 'nosotros' && <AboutSection />}

        {currentPage === 'admin' && (
          isAdminAuthenticated ? (
            <AdminDashboard />
          ) : (
            <div className="py-20 text-center text-sm text-neutral-400">
              Acceso restringido. Por favor ingresa la clave de administrador 2412.
            </div>
          )
        )}
      </main>

      {/* Footer */}
      {currentPage !== 'admin' && <Footer />}

      {/* Global Modals & Slide-overs */}
      <ProductDetailModal />
      <CartDrawer onOpenCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOpenTracking={handleOpenTrackingFromCheckout}
      />
      <OrderTrackingModal initialCode={trackingCodeToOpen} />
      <AuthModal />
      <AdminLoginModal />

      {/* Pinned WhatsApp Widget (+58 414-0153904) */}
      <FloatingWhatsApp />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <MainContent />
    </StoreProvider>
  );
}
