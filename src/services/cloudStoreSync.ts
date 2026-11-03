import { doc, getDoc, setDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { db } from './firestoreCashService';
import { 
  BrandConfig, 
  Product, 
  LabPricingConfig, 
  CustomLabMockup, 
  ArtworkDesign, 
  HeroSlide, 
  Order, 
  AboutContent, 
  SocialLinks,
  PartnerSalaryWithdrawal,
  TreasuryAccounts,
  CashTransaction,
  DebtRecord,
  DailyCashClose,
  CategoryCircle,
  Devotional,
  PrayerRequest
} from '../types';

export interface StoreCloudState {
  brandConfig?: BrandConfig;
  products?: Product[];
  labPricingConfig?: LabPricingConfig;
  customLabMockups?: CustomLabMockup[];
  artworkDesigns?: ArtworkDesign[];
  heroSlides?: HeroSlide[];
  collections?: string[];
  orders?: Order[];
  partnerWithdrawals?: PartnerSalaryWithdrawal[];
  exchangeRateBCV?: number;
  treasuryAccounts?: TreasuryAccounts;
  transactions?: CashTransaction[];
  debts?: DebtRecord[];
  cashCloses?: DailyCashClose[];
  aboutContent?: AboutContent;
  socialLinks?: SocialLinks;
  categoryCircles?: CategoryCircle[];
  collectionCircles?: CategoryCircle[];
  devotionals?: Devotional[];
  prayerRequests?: PrayerRequest[];
  customCostItems?: any[];
  updatedAt?: string;
  updatedBy?: string;
}

const STORE_COLLECTION = 'store_data';
const STORE_DOCUMENT = 'main';
const LOCAL_SYNC_TIMESTAMP_KEY = 'exodo_cloud_sync_timestamp';

/**
 * Save store data to Firestore in real-time, with fallback to backend API and local cache.
 */
export async function saveStoreDataToCloud(
  partialData: Partial<StoreCloudState>,
  updatedBy: string = 'Administrador'
): Promise<{ success: boolean; firestore: boolean; server: boolean }> {
  const timestamp = new Date().toISOString();
  const payload: StoreCloudState = {
    ...partialData,
    updatedAt: timestamp,
    updatedBy,
  };

  let firestoreSuccess = false;
  let serverSuccess = false;

  // 1. Save to local storage cache immediately
  try {
    if (partialData.brandConfig) {
      localStorage.setItem('exodo_brand_config', JSON.stringify(partialData.brandConfig));
    }
    if (partialData.products) {
      localStorage.setItem('exodo_products', JSON.stringify(partialData.products));
    }
    if (partialData.labPricingConfig) {
      localStorage.setItem('exodo_lab_pricing', JSON.stringify(partialData.labPricingConfig));
    }
    if (partialData.customLabMockups) {
      localStorage.setItem('exodo_custom_lab_mockups', JSON.stringify(partialData.customLabMockups));
    }
    if (partialData.artworkDesigns) {
      localStorage.setItem('exodo_artwork_library', JSON.stringify(partialData.artworkDesigns));
    }
    if (partialData.heroSlides) {
      localStorage.setItem('exodo_hero_slides', JSON.stringify(partialData.heroSlides));
    }
    if (partialData.collections) {
      localStorage.setItem('exodo_collections', JSON.stringify(partialData.collections));
    }
    if (partialData.orders !== undefined) {
      localStorage.setItem('exodo_orders', JSON.stringify(partialData.orders));
    }
    if (partialData.partnerWithdrawals !== undefined) {
      localStorage.setItem('exodo_partner_withdrawals', JSON.stringify(partialData.partnerWithdrawals));
    }
    if (partialData.exchangeRateBCV !== undefined) {
      localStorage.setItem('exodo_exchange_rate_bcv', partialData.exchangeRateBCV.toString());
    }
    if (partialData.treasuryAccounts !== undefined) {
      localStorage.setItem('exodo_treasury_accounts', JSON.stringify(partialData.treasuryAccounts));
    }
    if (partialData.transactions !== undefined) {
      localStorage.setItem('exodo_cash_transactions', JSON.stringify(partialData.transactions));
      localStorage.setItem('exodo_transactions', JSON.stringify(partialData.transactions));
    }
    if (partialData.debts !== undefined) {
      localStorage.setItem('exodo_debts', JSON.stringify(partialData.debts));
    }
    if (partialData.cashCloses !== undefined) {
      localStorage.setItem('exodo_cash_closes', JSON.stringify(partialData.cashCloses));
    }
    if (partialData.categoryCircles !== undefined) {
      localStorage.setItem('exodo_category_circles', JSON.stringify(partialData.categoryCircles));
    }
    if (partialData.collectionCircles !== undefined) {
      localStorage.setItem('exodo_collection_circles', JSON.stringify(partialData.collectionCircles));
    }
    if (partialData.devotionals !== undefined) {
      localStorage.setItem('exodo_devotionals', JSON.stringify(partialData.devotionals));
    }
    if (partialData.prayerRequests !== undefined) {
      localStorage.setItem('exodo_prayer_requests', JSON.stringify(partialData.prayerRequests));
    }
    if (partialData.aboutContent !== undefined) {
      localStorage.setItem('exodo_about_content', JSON.stringify(partialData.aboutContent));
    }
    if (partialData.socialLinks !== undefined) {
      localStorage.setItem('exodo_social_links', JSON.stringify(partialData.socialLinks));
    }
    if (partialData.customCostItems !== undefined) {
      localStorage.setItem('exodo_custom_cost_items', JSON.stringify(partialData.customCostItems));
    }
    localStorage.setItem(LOCAL_SYNC_TIMESTAMP_KEY, timestamp);
  } catch (e) {
    console.warn('[CloudStoreSync] Error guardando en caché local:', e);
  }

  // 2. Persist to Firestore (Real-time Cloud Database)
  try {
    const docRef = doc(db, STORE_COLLECTION, STORE_DOCUMENT);
    await setDoc(docRef, payload, { merge: true });
    firestoreSuccess = true;
    console.log('[CloudStoreSync] ☁️ Guardado en Firestore con éxito');
  } catch (err) {
    console.warn('[CloudStoreSync] Advertencia al guardar en Firestore:', err);
  }

  // 3. Persist to Express/Vite backend server endpoint as dual cloud backup
  try {
    const response = await fetch('/api/store-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      serverSuccess = true;
      console.log('[CloudStoreSync] 💾 Guardado en servidor backend con éxito');
    }
  } catch (err) {
    // Backend API might not be available in pure client static deploys
    console.debug('[CloudStoreSync] Endpoint /api/store-data no respondió:', err);
  }

  return {
    success: firestoreSuccess || serverSuccess,
    firestore: firestoreSuccess,
    server: serverSuccess,
  };
}

/**
 * Fetch latest store data from Firestore or backend server
 */
export async function fetchStoreDataFromCloud(): Promise<StoreCloudState | null> {
  // 1. Try Firestore first
  try {
    const docRef = doc(db, STORE_COLLECTION, STORE_DOCUMENT);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data() as StoreCloudState;
      console.log('[CloudStoreSync] 📥 Datos recuperados de Firestore con éxito');
      return data;
    }
  } catch (err) {
    console.warn('[CloudStoreSync] Firestore no disponible, intentando servidor backend:', err);
  }

  // 2. Fallback to server endpoint
  try {
    const res = await fetch('/api/store-data');
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        console.log('[CloudStoreSync] 📥 Datos recuperados del servidor backend con éxito');
        return json.data as StoreCloudState;
      }
    }
  } catch (err) {
    console.debug('[CloudStoreSync] Fallback a servidor también omitido:', err);
  }

  return null;
}

/**
 * Real-time listener for Firestore store updates across devices.
 * Calls onUpdate whenever admin saves changes on PC, phone, or another tab.
 */
export function subscribeToStoreDataCloud(
  onUpdate: (data: StoreCloudState) => void,
  onError?: (error: any) => void
): Unsubscribe {
  try {
    const docRef = doc(db, STORE_COLLECTION, STORE_DOCUMENT);
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as StoreCloudState;
          console.log('[CloudStoreSync] 🔄 Actualización en tiempo real recibida:', data.updatedAt);
          onUpdate(data);
        }
      },
      (error) => {
        console.warn('[CloudStoreSync] Error en suscripción en tiempo real de Firestore:', error);
        if (onError) onError(error);
      }
    );
  } catch (e) {
    console.warn('[CloudStoreSync] No se pudo inicializar listener de Firestore:', e);
    return () => {};
  }
}
