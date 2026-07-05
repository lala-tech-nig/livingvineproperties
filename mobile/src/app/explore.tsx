import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Search,
  MapPin,
  TrendingUp,
  Percent,
  Calendar,
  Building2,
  ChevronRight,
  Sparkles,
  RefreshCw,
} from 'lucide-react-native';

import api from '@/lib/axios';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PropertyProduct {
  _id: string;
  name: string;
  durationInMonths: number;
  roiPercent: number;
  description: string;
  principalOptions?: string[];
  isActive?: boolean;
}

// Fallback catalog list if not logged in yet
const FALLBACK_PROPERTIES = [
  {
    _id: "FALLBACK-01",
    name: "Yield Max Land Banking",
    durationInMonths: 12,
    roiPercent: 36,
    description: "Guaranteed asset banking plan with high-yield returns. Specially backed by physical prime land assets in Ibeju-Lekki expansion corridors.",
  },
  {
    _id: "FALLBACK-02",
    name: "Wealth Builder Plan",
    durationInMonths: 6,
    roiPercent: 18,
    description: "Optimized residential asset flipping program designed for high speed and mid-term wealth generation.",
  },
  {
    _id: "FALLBACK-03",
    name: "Short-Term Yield Plan",
    durationInMonths: 3,
    roiPercent: 8,
    description: "Commercial building lease backing designed for investors looking for quick cash flow rotations.",
  }
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const [products, setProducts] = useState<PropertyProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProp, setSelectedProp] = useState<PropertyProduct | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // Check if logged in first to determine if we can make auth requests
      if (typeof window !== 'undefined' && window.localStorage.getItem('token')) {
        const { data } = await api.get('/investment-products');
        setProducts(data || []);
      } else {
        // Not logged in, use default catalog preview
        setProducts(FALLBACK_PROPERTIES);
      }
    } catch (err) {
      console.log('Using default property catalog preview due to auth status.');
      setProducts(FALLBACK_PROPERTIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Wealth Plans Catalog</Text>
          <TouchableOpacity onPress={fetchProducts} disabled={loading} style={styles.refreshBtn}>
            <RefreshCw size={18} color="#de1f25" />
          </TouchableOpacity>
        </View>
        <Text style={styles.headerSubtitle}>Select high-yield estate banking plans to start building portfolio</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={18} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search wealth plans..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Loading Indicator */}
      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color="#de1f25" />
          <Text style={styles.loaderText}>Loading property options...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
          {filteredProducts.map((item) => (
            <TouchableOpacity
              key={item._id}
              style={styles.propertyCard}
              onPress={() => setSelectedProp(item)}
              activeOpacity={0.9}
            >
              <View style={styles.cardImageContainer}>
                <View style={styles.fallbackImageBg}>
                  <Building2 size={40} color="#fff" />
                  <Text style={styles.imageTag}>Living Vine Properties</Text>
                </View>
                <Text style={styles.statusBadge}>
                  VERIFIED YIELD
                </Text>
              </View>

              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                
                <View style={styles.metricGrid}>
                  <View style={styles.metricItem}>
                    <Percent size={14} color="#de1f25" />
                    <Text style={styles.metricLabel}>Expected ROI: </Text>
                    <Text style={styles.metricVal}>{item.roiPercent}%</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Calendar size={14} color="#de1f25" />
                    <Text style={styles.metricLabel}>Hold Period: </Text>
                    <Text style={styles.metricVal}>{item.durationInMonths} Months</Text>
                  </View>
                </View>

                <Text style={styles.cardDescription} numberOfLines={2}>
                  {item.description}
                </Text>

                <View style={styles.cardFooter}>
                  <Text style={styles.exploreText}>View Plan Details</Text>
                  <ChevronRight size={18} color="#de1f25" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* DETAIL MODAL */}
      <Modal visible={selectedProp !== null} animationType="slide" transparent>
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            {selectedProp && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTagText}>SECURE PLAN INFO</Text>
                  <TouchableOpacity onPress={() => setSelectedProp(null)}>
                    <Text style={styles.closeBtnText}>Close</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.modalTitle}>{selectedProp.name}</Text>
                
                <View style={styles.modalImagePlaceholder}>
                  <Building2 size={60} color="#de1f25" strokeWidth={1} />
                  <Text style={styles.placeholderLabel}>Living Vine Secure Asset</Text>
                </View>

                <Text style={styles.descriptionHeader}>About Property Plan</Text>
                <Text style={styles.descriptionBody}>{selectedProp.description}</Text>

                <View style={styles.yieldCard}>
                  <View style={styles.yieldHeader}>
                    <Sparkles size={18} color="#de1f25" />
                    <Text style={styles.yieldTitle}>Investment Summary</Text>
                  </View>
                  <View style={styles.yieldRow}>
                    <Text style={styles.yieldLabel}>Returns Ratio:</Text>
                    <Text style={styles.yieldVal}>{selectedProp.roiPercent}% Expected ROI</Text>
                  </View>
                  <View style={styles.yieldRow}>
                    <Text style={styles.yieldLabel}>Maturity Period:</Text>
                    <Text style={styles.yieldVal}>{selectedProp.durationInMonths} Months</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.investBtn}
                  onPress={() => {
                    setSelectedProp(null);
                    Alert.alert(
                      "Start Investment", 
                      "To invest in this property, open the dashboard tab, tap '+ New Plan', and select this category."
                    );
                  }}
                >
                  <Text style={styles.investBtnText}>Invest in this Plan</Text>
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  refreshBtn: {
    padding: 4,
  },
  searchSection: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    height: '100%',
    marginLeft: 8,
  },
  loaderBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 12,
  },
  listContainer: {
    padding: 20,
  },
  propertyCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    marginBottom: 20,
  },
  cardImageContainer: {
    height: 120,
    position: 'relative',
  },
  fallbackImageBg: {
    flex: 1,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageTag: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 8,
    opacity: 0.6,
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    fontSize: 9,
    fontWeight: '900',
    color: '#fff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    overflow: 'hidden',
    backgroundColor: '#de1f25',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  metricGrid: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 10,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  cardDescription: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 12,
  },
  exploreText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#de1f25',
  },

  // Modal Styles
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: SCREEN_WIDTH * 1.5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#de1f25',
    letterSpacing: 2,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748b',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalImagePlaceholder: {
    height: 140,
    backgroundColor: 'rgba(222,31,37,0.05)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(222,31,37,0.1)',
  },
  placeholderLabel: {
    fontSize: 12,
    color: '#de1f25',
    fontWeight: '700',
    marginTop: 8,
  },
  descriptionHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 6,
  },
  descriptionBody: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 16,
  },
  yieldCard: {
    backgroundColor: '#f8fafc',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  yieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  yieldTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  yieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  yieldLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  yieldVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  investBtn: {
    backgroundColor: '#de1f25',
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  investBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
});
