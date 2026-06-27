import React from 'react';
import { createClient } from '@/lib/supabase-server';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import StorefrontCatalogue from '@/components/StorefrontCatalogue';
import CartDrawer from '@/components/CartDrawer';
import { Phone, MapPin, ShieldCheck, Heart } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering to ensure fresh server-side data on load
export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getInitialData() {
  try {
    const supabase = createClient();
    const [productsRes, bakewareRes] = await Promise.all([
      supabase
        .from('products')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('bakeware')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false }),
    ]);

    if (productsRes.error) {
      console.error('Products fetch error:', productsRes.error);
    }
    if (bakewareRes.error) {
      console.error('Bakeware fetch error:', bakewareRes.error);
    }

    return {
      products: productsRes.data || [],
      bakeware: bakewareRes.data || [],
    };
  } catch (err) {
    console.error('Failed to get initial data:', err);
    return { products: [], bakeware: [] };
  }
}

export default async function Home() {
  const { products, bakeware } = await getInitialData();
  const shopName = process.env.NEXT_PUBLIC_SHOP_NAME || 'Bake & Joy';
  const shopTagline = process.env.NEXT_PUBLIC_SHOP_TAGLINE || 'Fresh baked, straight to your door';
  const shopAddress = process.env.NEXT_PUBLIC_SHOP_ADDRESS || '123 Bakery Lane, Sweet Town';
  const ownerWhatsapp = process.env.NEXT_PUBLIC_OWNER_WHATSAPP || '';

  // Client-side event trigger to focus on search bar in catalogue
  const focusSearchScript = `
    (function() {
      window.triggerSearchFocus = function() {
        window.dispatchEvent(new Event('focus-storefront-search'));
      }
    })()
  `;

  return (
    <div className="flex-1 flex flex-col bg-brand-cream min-h-screen">
      <script dangerouslySetInnerHTML={{ __html: focusSearchScript }} />

      {/* Header */}
      <Header />

      {/* Hero Section */}
      <Hero shopName={shopName} shopTagline={shopTagline} />

      {/* Catalogue & Realtime Filter Grid */}
      <StorefrontCatalogue initialProducts={products} initialBakeware={bakeware} />

      {/* Footer */}
      <footer className="mt-auto border-t border-brand-brown/10 bg-[#3B1F0E] text-[#FDF6EC] py-12 px-6 md:px-12 text-left">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Shop branding & Info */}
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-black tracking-wide text-[#FDF6EC]">
              🍞 {shopName}
            </h3>
            <p className="text-sm text-[#FDF6EC]/70 leading-relaxed max-w-xs">
              {shopTagline}
            </p>
            <div className="flex gap-3 text-xs font-bold uppercase tracking-wider text-brand-amber">
              <ShieldCheck className="w-4 h-4" /> Payments via UPI/Cash Directly to Owner
            </div>
          </div>

          {/* Shop Location & Contact */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-amber">
              Contact & Address
            </h4>
            <div className="space-y-2.5 text-sm text-[#FDF6EC]/80 font-medium">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-5 h-5 text-brand-amber shrink-0 mt-0.5" />
                <span>{shopAddress}</span>
              </div>
              {ownerWhatsapp && (
                <div className="flex items-center gap-2.5 pt-1">
                  <Phone className="w-4 h-4 text-brand-amber shrink-0" />
                  <a
                    href={`https://wa.me/${ownerWhatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-brand-amber hover:underline transition-all"
                  >
                    +{ownerWhatsapp} (WhatsApp)
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Useful Links & Admin Access */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-brand-amber">
              Shop Policies
            </h4>
            <ul className="space-y-2.5 text-sm text-[#FDF6EC]/85 font-medium">
              <li>
                <span className="text-[#FDF6EC]/60 block text-xs">Note:</span>
                Payments are handled directly with the shop owner. We do not charge online payment gateways.
              </li>
              <li className="pt-4 border-t border-[#FDF6EC]/10">
                <Link
                  href="/admin"
                  className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-brand-amber hover:text-white transition-colors"
                >
                  🔐 Owner Dashboard Login &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-[#FDF6EC]/10 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#FDF6EC]/50 gap-4">
          <p>&copy; {new Date().getFullYear()} {shopName}. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-brand-amber fill-brand-amber" /> for sweet cravings.
          </p>
        </div>
      </footer>

      {/* Cart Slider Drawer */}
      <CartDrawer />
    </div>
  );
}
