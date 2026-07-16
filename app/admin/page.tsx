"use client";
import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Lock, Plus, Trash2, Edit3, Settings, Eye, Search, Shield, BarChart3, ShoppingCart, Receipt, 
  Package, FolderTree, Ticket, Users, RefreshCw, Award, CheckCircle2, TrendingUp,
  Globe, ShoppingBag, Gift, ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import { useRouter as useNavigate } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import { getProductImage, onImgError } from '@/lib/productImages';
import {
  fetchProducts,
  upsertProduct,
  dbDeleteProduct,
  fetchCategories,
  insertCategory,
  dbDeleteCategory,
  fetchCoupons,
  upsertCoupon,
  dbDeleteCoupon,
  fetchProfiles,
  updateUserRole,
  fetchWhatsappRequests,
  updateWhatsappRequestStatus,
  fetchOrders,
  insertOrder,
  updateOrderStatusDb,
  Product,
  Order,
  Coupon,
  UserProfile
} from '@/lib/db';


export default function AdminPortal() {
  const router = useNavigate(); const navigate = (path: string) => router.push(path);
  const { user } = useAuth();
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  
  // Tabs matching the reference image
  const [activeTab, setActiveTab] = useState<'dashboard' | 'whatsapp' | 'pos_billing' | 'analytics' | 'orders' | 'products' | 'categories' | 'coupons' | 'users'>('whatsapp');
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // POS Billing states
  const [billingCustomerName, setBillingCustomerName] = useState('');
  const [billingCustomerPhone, setBillingCustomerPhone] = useState('');
  const [billingSource, setBillingSource] = useState<'OFFLINE' | 'ONLINE'>('OFFLINE');
  const [billingItems, setBillingItems] = useState<{ id: string; name: string; size: string; price: number; quantity: number; isCustom?: boolean }[]>([]);
  const [billingCoupon, setBillingCoupon] = useState('');
  const [billingDiscountType, setBillingDiscountType] = useState<'₹' | '%'>('₹');
  const [billingDiscountValue, setBillingDiscountValue] = useState<number>(0);
  const [billingDeliveryFee, setBillingDeliveryFee] = useState<number>(0);
  const [billingAmountReceived, setBillingAmountReceived] = useState<number>(0);
  const [showCatalogModal, setShowCatalogModal] = useState(false);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [activeCatalogRowId, setActiveCatalogRowId] = useState<string | null>(null);

  // Products state
  const [products, setProducts] = useState<Product[]>([]);
  const [productsSearch, setProductsSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [prodImageFile, setProdImageFile] = useState<File | null>(null);

  // Form states for product
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodHerbs, setProdHerbs] = useState('');
  const [prodBenefits, setProdBenefits] = useState('');
  const [prodSizes, setProdSizes] = useState<{ size: string; price: number; isAvailable?: boolean }[]>([{ size: '', price: 0, isAvailable: true }]);
  const [prodIsAvailable, setProdIsAvailable] = useState(true);
  const [prodDetails, setProdDetails] = useState('');
  const [prodHowToUse, setProdHowToUse] = useState('');
  const [prodTamilName, setProdTamilName] = useState('');
  const [prodNutritionalInfo, setProdNutritionalInfo] = useState('');

  // Orders state
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Filter state for dashboard/whatsapp center
  const [periodFilter, setPeriodFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [whatsappSearch, setWhatsappSearch] = useState('');
    const [whatsappCustomStart, setWhatsappCustomStart] = useState('');
  const [whatsappCustomEnd, setWhatsappCustomEnd] = useState('');

        
  // Filters for Orders Hub tab (Bills)
  const [ordersSourceFilter, setOrdersSourceFilter] = useState<'ALL' | 'OFFLINE' | 'ONLINE' | 'MANUAL'>('ALL');
  const [ordersDateFilter, setOrdersDateFilter] = useState<'ALL' | 'TODAY' | 'WEEK' | 'MONTH' | 'CUSTOM'>('ALL');
  const [ordersSearchInvoice, setOrdersSearchInvoice] = useState('');
  const [ordersSearchName, setOrdersSearchName] = useState('');
  const [ordersSearchPhone, setOrdersSearchPhone] = useState('');
  const [ordersStartDate, setOrdersStartDate] = useState('');
  const [ordersEndDate, setOrdersEndDate] = useState('');

  // Analytics Period Filters
  const [analyticsPeriodFilter, setAnalyticsPeriodFilter] = useState<'all' | 'today' | 'week' | 'month' | 'year' | 'custom'>('all');
  const [analyticsStartDate, setAnalyticsStartDate] = useState('');
  const [analyticsEndDate, setAnalyticsEndDate] = useState('');
  const [analyticsSubTab, setAnalyticsSubTab] = useState<'revenue' | 'today' | 'products' | 'coupons'>('revenue');
  const [analyticsTodaySearchPhone, setAnalyticsTodaySearchPhone] = useState('');

  // Category and Coupon list state
  const [categories, setCategories] = useState<string[]>(['Hair Care', 'Skin Care', 'Nutrition', 'Pooja Items']);
  const [coupons, setCoupons] = useState<Coupon[]>([
    { code: 'VILLAGES', discount: 15, minOrder: 1, expiryDate: '2026-06-19', usageLimit: 20, usedCount: 0, status: 'ACTIVE' },
    { code: 'MNMKL', discount: 10, minOrder: 1, expiryDate: '2026-07-31', usageLimit: 100, usedCount: 0, status: 'ACTIVE' },
    { code: 'WELCOME', discount: 10, minOrder: 10, expiryDate: '2026-12-31', usageLimit: 50, usedCount: 1, status: 'ACTIVE' },
    { code: 'SAVE10', discount: 10, minOrder: 1, expiryDate: '', usageLimit: 0, usedCount: 0, status: 'ACTIVE' }
  ]);
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Form states for category/coupon
  const [newCatName, setNewCatName] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponDiscount, setNewCouponDiscount] = useState<number>(10);
  const [newCouponMinOrder, setNewCouponMinOrder] = useState<number>(1);
  const [newCouponExpiryDate, setNewCouponExpiryDate] = useState('');
  const [newCouponUsageLimit, setNewCouponUsageLimit] = useState<number>(20);
  const [editingCouponCode, setEditingCouponCode] = useState<string | null>(null);

    const [whatsappRequests, setWhatsappRequests] = useState<any[]>([]);
  
  // Helper to get Invoice ID for WhatsApp requests (DB is now sequential)
  const getWhatsAppInvoice = (orderId: string) => {
    return orderId;
  };

  

    

  const loadData = async () => {
    try {
      const [prods, cats, coups, profs, ords, whatsapps] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchCoupons(),
        fetchProfiles(),
        fetchOrders(),
        fetchWhatsappRequests()
      ]);
      setProducts(prods);
      setCategories(cats);
      setCoupons(coups);
      setUsersList(profs);
      setOrders(ords);
      setWhatsappRequests(whatsapps);
          } catch (err) {
      console.error("Error loading dashboard data", err);
    }
  };

  useEffect(() => {
    const checkRoleAndLoad = async () => {
      if (!user) {
        setIsAuthenticated(false);
        setCheckingAuth(false);
        return;
      }
      try {
        const profs = await fetchProfiles();
        const me = profs.find(p => p.id === user.id);
        if (me && me.role === 'Admin') {
          setIsAuthenticated(true);
          await loadData();
        } else {
          setIsAuthenticated(false);
        }
      } catch (e) {
        console.error(e);
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
      }
    };
    checkRoleAndLoad();
  }, [user]);


  const handleRefresh = async () => {
    await loadData();
    alert('Dashboard data refreshed successfully!');
  };

  const handleLogout = () => {
    // Auth hook handles logout, just redirect
    navigate('/');
  };

  // Add/Remove size fields in form
  const addSizeField = () => {
    setProdSizes([...prodSizes, { size: '', price: 0, isAvailable: true }]);
  };

  const removeSizeField = (index: number) => {
    const newSizes = [...prodSizes];
    newSizes.splice(index, 1);
    setProdSizes(newSizes);
  };

  const handleSizeChangeInForm = (index: number, field: 'size' | 'price' | 'isAvailable', value: any) => {
    const newSizes = [...prodSizes];
    if (field === 'size') {
      newSizes[index].size = value as string;
    } else if (field === 'price') {
      newSizes[index].price = Number(value);
    } else {
      newSizes[index].isAvailable = Boolean(value);
    }
    setProdSizes(newSizes);
  };


  // Open Edit Product form
  const startEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdName(prod.name);
    setProdCategory(prod.category);
    setProdDesc(prod.description);
    setProdHerbs(prod.herbs || '');
    setProdBenefits(prod.benefits.join('\n'));
    setProdSizes(prod.sizes.length > 0 ? prod.sizes.map((s: any) => ({ ...s, isAvailable: s.isAvailable !== false })) : [{ size: '', price: 0, isAvailable: true }]);
    setProdIsAvailable(prod.isAvailable !== false);

    setProdDetails(prod.details || '');
    setProdHowToUse(prod.howToUse || '');
    setProdTamilName(prod.tamilName || '');
    setProdNutritionalInfo(
      prod.nutritionalInfo
        ? (prod.nutritionalInfo as any).map((n: any) => `${n.label}: ${n.value}`).join('\n')
        : ''
    );
    setProdImageFile(null);
    setIsAddingProduct(false);
  };

  // Open Add Product form
  const startAddProduct = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCategory(categories.length > 0 ? categories[0] : '');
    setProdDesc('');
    setProdHerbs('');
    setProdBenefits('');
    setProdSizes([{ size: '', price: 0, isAvailable: true }]);
    setProdIsAvailable(true);

    setProdDetails('');
    setProdHowToUse('');
    setProdTamilName('');
    setProdNutritionalInfo('');
    setProdImageFile(null);
    setIsAddingProduct(true);
  };

  // Save product (Add or Edit)
  const saveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalCategory = prodCategory;
    if (!finalCategory && categories.length > 0) {
      finalCategory = categories[0];
    }
    
    if (!finalCategory) {
      alert('Please create and select a category first.');
      return;
    }

    const cleanSizes = prodSizes
      .filter(s => s.size.trim() !== '' && s.price > 0)
      .map(s => ({ size: s.size, price: s.price, isAvailable: s.isAvailable !== false }));
    if (cleanSizes.length === 0) {
      alert('Please add at least one valid size option with a price.');
      return;
    }

    const benefitsArray = prodBenefits.split('\n').filter(b => b.trim() !== '');

    const nutritionalInfoArray = prodNutritionalInfo
      .split('\n')
      .filter(line => line.includes(':'))
      .map(line => {
        const parts = line.split(':');
        const label = parts[0].trim();
        const value = parts.slice(1).join(':').trim();
        return { label, value };
      });

    const newProd: Product = {
      id: editingProduct ? editingProduct.id : prodName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: prodName,
      category: finalCategory,
      description: prodDesc,
      image: editingProduct ? editingProduct.image : '/mahizham_hair_oil.png',
      herbs: prodHerbs || 'Proprietary Blend',
      benefits: benefitsArray.length > 0 ? benefitsArray : ['Supports overall well-being'],
      sizes: cleanSizes,
      isAvailable: prodIsAvailable,
      details: prodDetails || 'Premium formulation crafted with care.',
      howToUse: prodHowToUse || 'Use as directed on the packaging.',
      tamilName: prodTamilName,
      nutritionalInfo: nutritionalInfoArray.length > 0 ? nutritionalInfoArray : undefined
    };

    setIsSavingProduct(true);
    try {
      const imgUrl = await upsertProduct(newProd, prodImageFile || undefined);
      newProd.image = imgUrl;
      setProducts(prev => {
        const exists = prev.find(p => p.id === newProd.id);
        if (exists) return prev.map(p => p.id === newProd.id ? newProd : p);
        return [...prev, newProd];
      });
      setIsAddingProduct(false);
      setEditingProduct(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save product');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await dbDeleteProduct(id);
        setProducts(prev => prev.filter(p => p.id !== id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete product');
      }
    }
  };

  // Order status updates
  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      if (whatsappRequests.some(o => o.id === orderId)) {
        await updateWhatsappRequestStatus(orderId, newStatus);
        setWhatsappRequests(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      
      } else {
        await updateOrderStatusDb(orderId, newStatus);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }

      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };



  // Category additions
  const addCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    if (categories.includes(newCatName.trim())) {
      alert('Category already exists.');
      return;
    }
    try {
      await insertCategory(newCatName.trim());
      setCategories([...categories, newCatName.trim()]);
      setNewCatName('');
    } catch (err) {
      console.error(err);
      alert('Failed to add category');
    }
  };

  const deleteCategory = async (cat: string) => {
    const isCategoryInUse = products.some(p => p.category === cat);
    if (isCategoryInUse) {
      alert(`Cannot delete category "${cat}" because it is currently assigned to one or more formulations. Please reassign or delete those formulations first.`);
      return;
    }

    if (window.confirm(`Are you sure you want to delete category "${cat}"?`)) {
      try {
        await dbDeleteCategory(cat);
        setCategories(categories.filter(c => c !== cat));
      } catch (err: any) {
        console.error(err);
        if (err?.code === '23503') {
          alert('Database Error: Cannot delete this category because it is still linked to existing products.');
        } else {
          alert('Failed to delete category');
        }
      }
    }
  };

  // Coupon additions
  const addCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim() || newCouponDiscount <= 0) return;
    
    const formattedCode = newCouponCode.trim().toUpperCase();
    
    try {
      if (editingCouponCode) {
        // Update existing coupon
        const updatedCoupon: Coupon = {
          code: formattedCode,
          discount: newCouponDiscount,
          minOrder: newCouponMinOrder,
          expiryDate: newCouponExpiryDate,
          usageLimit: newCouponUsageLimit,
          usedCount: coupons.find(c => c.code === editingCouponCode)?.usedCount || 0,
          status: coupons.find(c => c.code === editingCouponCode)?.status || 'ACTIVE'
        };
        await upsertCoupon(updatedCoupon);
        setCoupons(prev => prev.map(c => c.code === editingCouponCode ? updatedCoupon : c));
        setEditingCouponCode(null);
      } else {
        // Create new coupon
        if (coupons.some(c => c.code.toUpperCase() === formattedCode)) {
          alert('Coupon code already exists.');
          return;
        }
        const newCp: Coupon = {
          code: formattedCode,
          discount: newCouponDiscount,
          minOrder: newCouponMinOrder,
          expiryDate: newCouponExpiryDate,
          usageLimit: newCouponUsageLimit,
          usedCount: 0,
          status: 'ACTIVE'
        };
        await upsertCoupon(newCp);
        setCoupons([...coupons, newCp]);
      }
      
      // Reset form states
      setNewCouponCode('');
      setNewCouponDiscount(10);
      setNewCouponMinOrder(1);
      setNewCouponExpiryDate('');
      setNewCouponUsageLimit(20);
    } catch (err) {
      console.error(err);
      alert('Failed to save coupon');
    }
  };

  const startEditCoupon = (cp: Coupon) => {
    setEditingCouponCode(cp.code);
    setNewCouponCode(cp.code);
    setNewCouponDiscount(cp.discount);
    setNewCouponMinOrder(cp.minOrder);
    setNewCouponExpiryDate(cp.expiryDate || '');
    setNewCouponUsageLimit(cp.usageLimit || 0);
  };

  const deleteCoupon = async (code: string) => {
    try {
      await dbDeleteCoupon(code);
      setCoupons(coupons.filter(c => c.code !== code));
    } catch (err) {
      console.error(err);
      alert('Failed to delete coupon');
    }
  };

  const toggleCouponStatus = async (code: string) => {
    const cp = coupons.find(c => c.code === code);
    if (!cp) return;
    try {
      const updated = { ...cp, status: cp.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' as 'ACTIVE'|'INACTIVE' };
      await upsertCoupon(updated);
      setCoupons(prev => prev.map(c => c.code === code ? updated : c));
    } catch (err) {
      console.error(err);
      alert('Failed to toggle coupon status');
    }
  };

  const formatCouponExpiry = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  const isCouponExpired = (dateStr?: string) => {
    if (!dateStr) return false;
    const expiry = new Date(dateStr);
    if (isNaN(expiry.getTime())) return false;
    const today = new Date();
    today.setHours(0,0,0,0);
    return expiry < today;
  };

  const handleGenerateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewCouponCode(code);
  };

  // WhatsApp message builder and dynamic formatter matching the screenshot
  const formatWhatsAppMessage = (order: Order) => {
    const eSparkle = String.fromCodePoint(0x2728);
    const eBell = String.fromCodePoint(0x1F514);
    const ePerson = String.fromCodePoint(0x1F464);
    const ePhone = String.fromCodePoint(0x1F4DE);
    const eMobile = String.fromCodePoint(0x1F4F1);
    const ePin = String.fromCodePoint(0x1F4CD);
    const eCart = String.fromCodePoint(0x1F6D2);
    const ePackage = String.fromCodePoint(0x1F4E6);
    const eTag = String.fromCodePoint(0x1F516);
    const eCheck = String.fromCodePoint(0x2705);
    const eDollar = String.fromCodePoint(0x1F4B5);
    const eMoney = String.fromCodePoint(0x1F4B0);
    const eTruck = String.fromCodePoint(0x1F69A);
    const eTicket = String.fromCodePoint(0x1F3AB);
    
    let message = `${eSparkle} *New Order Inquiry (${order.id})* ${eBell}\n\n`;
    
    message += `${ePerson} *Customer Details:*\n`;
    message += `• ${ePhone} Name: ${order.customerName}\n`;
    message += `• ${eMobile} Phone: ${order.customerPhone.split('_')[0]}\n`;
    message += `• ${ePin} Delivery Address: ${order.customerAddress}\n\n`;

    message += `${eCart} *Items:*\n\n`;
    
    order.items.forEach((item: any, index: number) => {
      const prod = products.find(p => p.id === item.productId);
      const category = prod ? prod.category : 'General';
      const subPrice = item.price * item.quantity;
      
      message += `${ePackage} *${index + 1}. ${item.name}*\n`;
      message += `• ${eTag} Category: ${category}\n`;
      message += `• 📏 Size: ${item.size || '—'}\n`;
      message += `• Qty: ${item.quantity}\n`;
      message += `• ${eDollar} *Subtotal:* ₹${subPrice.toLocaleString('en-IN')}\n\n`;
    });

    message += `*Billing Summary:*\n`;
    message += `${eDollar} *Subtotal:* ₹${(order.subtotal || order.totalPrice).toLocaleString('en-IN')}\n`;
    if (order.couponCode) {
      message += `${eTicket} *Coupon Applied (${order.couponCode}):* -₹${(order.couponDiscount || 0).toLocaleString('en-IN')}\n`;
    }
    message += `${eMoney} *Total Amount:* ₹${order.totalPrice.toLocaleString('en-IN')}\n\n`;
    
    message += `${eTruck} *Delivery Details:* Delivery charges may apply based on location.\n`;
    message += `${ePhone} *GPay Number:* 7904199050\n\n`;
    message += `Please let me know the delivery details and next steps! ${eSparkle}`;
    
    return message;
  };



  // POS Billing Helper Functions
  const getSubtotal = () => billingItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  
  const getCouponDiscount = (subtotal: number) => {
    if (!billingCoupon) return 0;
    const found = coupons.find(c => c.code === billingCoupon);
    if (!found) return 0;
    return (subtotal * found.discount) / 100;
  };

  const getManualDiscount = (subtotal: number) => {
    if (billingDiscountType === '₹') {
      return billingDiscountValue;
    } else {
      return (subtotal * billingDiscountValue) / 100;
    }
  };

  const getGrandTotal = () => {
    const subtotal = getSubtotal();
    const couponDisc = getCouponDiscount(subtotal);
    const manualDisc = getManualDiscount(subtotal);
    const delivery = billingDeliveryFee;
    return Math.max(0, subtotal - couponDisc - manualDisc + delivery);
  };

  const addCustomItem = () => {
    setBillingItems([
      ...billingItems,
      { id: Math.random().toString(), name: '', size: '', price: 0, quantity: 1, isCustom: true }
    ]);
  };

  const removeBillingItem = (id: string) => {
    setBillingItems(billingItems.filter(it => it.id !== id));
  };

  const updateBillingItem = (id: string, field: string, value: any) => {
    setBillingItems(billingItems.map(it => {
      if (it.id === id) {
        return { ...it, [field]: value };
      }
      return it;
    }));
  };

  const selectCatalogProductForActiveRow = (prod: Product, sz: { size: string; price: number }) => {
    if (activeCatalogRowId) {
      setBillingItems(billingItems.map(it => {
        if (it.id === activeCatalogRowId) {
          return {
            ...it,
            name: prod.name,
            size: sz.size,
            price: sz.price,
            isCustom: false
          };
        }
        return it;
      }));
      setActiveCatalogRowId(null);
      setShowCatalogModal(false);
    }
  };

  const generateNextInvoiceId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 7; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const year = new Date().getFullYear();
    return `INV-${year}-${code}`;
  };

  const handleCheckoutPOS = async () => {
    const subtotal = getSubtotal();
    const couponDisc = getCouponDiscount(subtotal);
    const manualDisc = getManualDiscount(subtotal);
    const grandTotal = getGrandTotal();
    const balance = billingAmountReceived >= grandTotal ? billingAmountReceived - grandTotal : 0;

    const nextInvoiceId = generateNextInvoiceId();

    // Create the order object to append to stored orders database
    const newOrder: Order = {
      id: nextInvoiceId,
      customerName: billingCustomerName || 'Walk-in Customer',
      customerPhone: billingCustomerPhone || '7904199050',
      customerEmail: '', // Not required for offline POS checkout
      customerAddress: billingSource === 'OFFLINE' ? 'Offline POS Shop' : 'Online Shipping Address',
      source: billingSource,
      items: billingItems.map(it => ({
        productId: it.isCustom ? 'custom' : 'catalog',
        name: it.name || 'Unnamed Item',
        size: it.size || '—',
        quantity: it.quantity,
        price: it.price
      })),
      subtotal: subtotal,
      totalPrice: grandTotal,
      status: 'Completed', // POS orders are completed immediately on checkout
      createdAt: new Date().toISOString(),
      couponCode: billingCoupon || undefined,
      couponDiscount: couponDisc,
      manualDiscount: manualDisc,
      deliveryCharge: billingDeliveryFee,
      cashReceived: billingAmountReceived,
      changeReturned: balance
    };

    try {
      // Save order
      await insertOrder(newOrder);
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
    } catch (err) {
      console.error(err);
      alert('Failed to save POS bill');
      return;
    }

    // Format WhatsApp invoice
    const invoiceUrl = `${window.location.origin}/invoice/${newOrder.id}`;
    const eHerb = String.fromCodePoint(0x1F33F); // 🌿
    const eParty = String.fromCodePoint(0x1F389); // 🎉
    const eInvoice = String.fromCodePoint(0x1F4C4); // 📄
    const eLink = String.fromCodePoint(0x1F517); // 🔗
    const eSparkles = String.fromCodePoint(0x2728); // ✨

    const invoiceMessage = [
      `${eHerb} *Sri Organic - Purchase Successful!* ${eParty}`,
      ``,
      `Hi ${billingCustomerName || 'Customer'},`,
      `Thank you for shopping with us! ${eSparkles}`,
      ``,
      `${eInvoice} View, download or print your digital invoice here:`,
      `${eLink} ${invoiceUrl}`,
      ``,
      `Have a great day!`
    ].join('\n');

    // Copy invoice URL to clipboard
    navigator.clipboard.writeText(invoiceUrl).catch(() => {});

    // Open WhatsApp — use api.whatsapp.com/send for consistent behaviour across devices
    const targetPhone = billingCustomerPhone ? billingCustomerPhone.replace(/\D/g, '') : '7904199050';
    const formattedPhone = targetPhone.length === 10 ? `91${targetPhone}` : targetPhone;
    const waUrl = `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodeURIComponent(invoiceMessage)}`;
    const waLink = document.createElement('a');
    waLink.href = waUrl;
    waLink.target = '_blank';
    waLink.rel = 'noopener noreferrer';
    document.body.appendChild(waLink);
    waLink.click();
    document.body.removeChild(waLink);

    // Reset POS input fields
    setBillingCustomerName('');
    setBillingCustomerPhone('');
    setBillingItems([]);
    setBillingCoupon('');
    setBillingDiscountValue(0);
    setBillingDeliveryFee(0);
    setBillingAmountReceived(0);
  };

  // Filter storefront orders (WhatsApp requests) by time period
  const getFilteredOrders = (excludeSearch = false) => {
    const now = new Date();
    // Only show storefront requests
    let list = [...whatsappRequests];
    
    // Period filter
    list = list.filter(o => {
      const oDate = new Date(o.createdAt);
      if (periodFilter === 'today') {
        return oDate.toDateString() === now.toDateString();
      }
      if (periodFilter === 'week') {
        const currentDay = now.getDay();
        const diffToMonday = currentDay === 0 ? 6 : currentDay - 1; // 0 is Sunday, make Monday=0
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);
        return oDate >= startOfWeek;
      }
      if (periodFilter === 'month') {
        return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
      }
      if (periodFilter === 'year') {
        return oDate.getFullYear() === now.getFullYear();
      }
      if (periodFilter === 'custom') {
        const oDateStr = o.createdAt.split('T')[0];
        if (whatsappCustomStart && oDateStr < whatsappCustomStart) return false;
        if (whatsappCustomEnd && oDateStr > whatsappCustomEnd) return false;
      }
      return true; // all
    });

    // Search filter
    if (!excludeSearch && whatsappSearch) {
      const s = whatsappSearch.toLowerCase();
      list = list.filter(o => 
        (o.customerName || '').toLowerCase().includes(s) || 
        (o.customerPhone || '').toLowerCase().includes(s) || 
        getWhatsAppInvoice(o.id).toLowerCase().includes(s)
      );
    }
    
    return list;
  };

  const filteredOrdersList = getFilteredOrders();

  // Helper for filtering POS Bills in the Orders Hub tab
  const getFilteredBills = () => {
    // 1. Only show POS bills (ID starting with POS- or INV-)
    let list = orders.filter(o => o.id.startsWith('POS-') || o.id.startsWith('INV-'));

    // 2. Filter by source (OFFLINE, ONLINE, MANUAL)
    if (ordersSourceFilter !== 'ALL') {
      list = list.filter(o => {
        const src = o.source || (o.items.some((it: any) => it.productId === 'custom') ? 'MANUAL' : (o.customerAddress.includes('Offline') ? 'OFFLINE' : 'ONLINE'));
        return src === ordersSourceFilter;
      });
    }

    // 3. Filter by Date range
    const now = new Date();
    if (ordersDateFilter === 'TODAY') {
      list = list.filter(o => new Date(o.createdAt).toDateString() === now.toDateString());
    } else if (ordersDateFilter === 'WEEK') {
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      list = list.filter(o => new Date(o.createdAt) >= oneWeekAgo);
    } else if (ordersDateFilter === 'MONTH') {
      list = list.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
      });
    } else if (ordersDateFilter === 'CUSTOM') {
      if (ordersStartDate) {
        list = list.filter(o => o.createdAt.split('T')[0] >= ordersStartDate);
      }
      if (ordersEndDate) {
        list = list.filter(o => o.createdAt.split('T')[0] <= ordersEndDate);
      }
    }

    // 4. Search text matches
    if (ordersSearchInvoice) {
      list = list.filter(o => o.id.toLowerCase().includes(ordersSearchInvoice.toLowerCase()));
    }
    if (ordersSearchName) {
      list = list.filter(o => o.customerName.toLowerCase().includes(ordersSearchName.toLowerCase()));
    }
    if (ordersSearchPhone) {
      list = list.filter(o => o.customerPhone.toLowerCase().includes(ordersSearchPhone.toLowerCase()));
    }

    return list;
  };

  const filteredBills = getFilteredBills();

  const handleExportCSV = () => {
    if (filteredBills.length === 0) {
      alert("No bills available to export.");
      return;
    }

    const headers = [
      "Bill ID",
      "Date",
      "Customer Name",
      "Customer Phone",
      "Source",
      "Items Purchased",
      "Total Price (INR)",
      "Status",
      "Coupon Code",
      "Coupon Discount (INR)",
      "Manual Discount (INR)",
      "Delivery Charge (INR)",
      "Cash Paid (INR)",
      "Change Return (INR)"
    ];

    const csvRows = [
      headers.join(",")
    ];

    filteredBills.forEach(o => {
      const src = o.source || (o.items.some((it: any) => it.productId === 'custom') ? 'MANUAL' : (o.customerAddress.includes('Offline') ? 'OFFLINE' : 'ONLINE'));
      const itemsString = o.items.map((it: any) => `${it.name} x${it.quantity} (${it.size}, Rs. ${it.price})`).join(" | ");

      const cleanPhone = o.customerPhone.split('_')[0];
      const oDate = new Date(o.createdAt);
      const yyyy = oDate.getFullYear();
      const mm = String(oDate.getMonth() + 1).padStart(2, '0');
      const dd = String(oDate.getDate()).padStart(2, '0');
      const hh = String(oDate.getHours()).padStart(2, '0');
      const min = String(oDate.getMinutes()).padStart(2, '0');
      const formattedDate = `${yyyy}-${mm}-${dd} ${hh}:${min}`;

      const row = [
        `"${o.id}"`,
        `"${formattedDate}"`,
        `"${o.customerName.replace(/"/g, '""')}"`,
        `"=""${cleanPhone}"""`,
        `"${src}"`,
        `"${itemsString.replace(/"/g, '""')}"`,
        o.totalPrice,
        `"${o.status}"`,
        `"${(o.couponCode || "").replace(/"/g, '""')}"`,
        o.couponDiscount || 0,
        o.manualDiscount || 0,
        o.deliveryCharge || 0,
        o.cashReceived || 0,
        o.changeReturned || 0
      ];

      csvRows.push(row.join(","));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateSuffix = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `sri_organic_bills_${dateSuffix}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculated stats metrics for WhatsApp center (storefront ORD- orders only)
  const ordersFilteredByPeriod = getFilteredOrders(true);

  const totalRequestsCount = ordersFilteredByPeriod.length;
  const pendingOrdersCount = ordersFilteredByPeriod.filter(o => o.status === 'Pending').length;
  const contactedOrdersCount = ordersFilteredByPeriod.filter(o => o.status === 'Processing').length;
  const completedOrdersCount = ordersFilteredByPeriod.filter(o => o.status === 'Completed').length;

  return (
    <div className="min-h-screen md:h-screen bg-[#FAF9F5] flex flex-col md:flex-row font-poppins text-primary antialiased md:overflow-hidden">
      
      {/* AUTHENTICATION VIEW */}
      {checkingAuth ? (
        <div className="flex-grow flex items-center justify-center p-6 bg-[#FAF9F5] min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <Settings className="w-10 h-10 text-primary animate-spin" />
            <h3 className="font-display text-xl font-bold text-primary">Verifying access...</h3>
          </div>
        </div>
      ) : !isAuthenticated ? (
        <div className="flex-grow flex items-center justify-center p-6 bg-[#FAF9F5] min-h-screen">
          <motion.div 
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-white border border-outline-variant/30 rounded-2xl p-10 max-w-lg w-full shadow-xl text-center space-y-8"
          >
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto border border-red-100">
              <Lock className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="font-display text-2xl font-bold text-primary tracking-tight">Access Denied</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed px-2">
              You must be logged in as an Administrator to view this page.
            </p>
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => navigate('/login')}
                className="w-1/2 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold tracking-widest uppercase py-4 rounded-xl shadow transition-colors cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-1/2 border border-outline-variant/40 text-primary hover:bg-[#FAF9F5] text-xs font-bold tracking-widest uppercase py-4 rounded-xl transition-all cursor-pointer"
              >
                Return to Store
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          {/* LEFT SIDEBAR NAVIGATION */}
          <div className={`relative bg-white border-b md:border-b-0 md:border-r border-outline-variant/25 flex flex-col shrink-0 shadow-sm justify-between md:h-full transition-all duration-300 ease-in-out ${isSidebarOpen ? 'w-full md:w-72 p-8' : 'w-full md:w-[90px] p-4 items-center'}`}>
            
            {/* Toggle Button */}
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="absolute -right-3.5 top-12 bg-white border border-outline-variant/30 shadow-sm rounded-full p-1.5 text-primary hover:bg-[#FAF9F5] z-50 hidden md:block cursor-pointer"
            >
              {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>

            <div className="w-full">
              {/* Branding Section */}
              <div className={`flex flex-col gap-6 mb-10 pb-6 border-b border-outline-variant/10 ${!isSidebarOpen && 'items-center'}`}>
                <div className={`flex items-center gap-3.5 ${!isSidebarOpen && 'justify-center'}`}>
                  <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10 shrink-0">
                    <Settings className="w-6 h-6 text-primary animate-spin-slow" />
                  </div>
                  {isSidebarOpen && (
                    <div className="whitespace-nowrap transition-opacity duration-300">
                      <h2 className="text-base font-bold text-primary tracking-wide">Business ERP</h2>
                      <span className="text-[11px] text-on-surface-variant uppercase tracking-widest font-semibold block">Sri Organic</span>
                    </div>
                  )}
                </div>
                {/* Top Actions */}
                <div className={`flex gap-2.5 w-full ${!isSidebarOpen && 'flex-col items-center'}`}>
                  <button
                    onClick={() => navigate('/')}
                    className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-[#FAF9F5] text-primary hover:bg-outline-variant/20 transition-all cursor-pointer border border-outline-variant/20 text-xs font-bold ${!isSidebarOpen && 'w-10 flex-none'}`}
                    title="Exit Console"
                  >
                    <X className="w-3.5 h-3.5 shrink-0" />
                    {isSidebarOpen && <span>Exit</span>}
                  </button>
                  <button
                    onClick={handleLogout}
                    className={`flex-1 h-10 flex items-center justify-center gap-2 rounded-xl bg-red-50 text-error hover:bg-red-100 transition-all cursor-pointer border border-red-200/50 text-xs font-bold ${!isSidebarOpen && 'w-10 flex-none'}`}
                    title="Log Out"
                  >
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    {isSidebarOpen && <span>Logout</span>}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 w-full">                <button
                  onClick={() => { setActiveTab('whatsapp'); }}
                  className={`w-full flex items-center text-xs font-bold tracking-wider uppercase py-4 rounded-xl transition-all cursor-pointer ${isSidebarOpen ? 'justify-between px-4.5' : 'justify-center px-0 relative'} ${
                    activeTab === 'whatsapp'
                      ? 'bg-[#2B3E2F] text-white shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                  title="WhatsApp"
                >
                  <div className={`flex items-center ${isSidebarOpen ? 'gap-3.5' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 text-[#25D366] shrink-0">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    {isSidebarOpen && <span>WhatsApp</span>}
                  </div>
                  {pendingOrdersCount > 0 && (
                    <span className={`${isSidebarOpen ? 'bg-secondary text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full' : 'absolute top-2 right-2 w-2.5 h-2.5 bg-secondary rounded-full'}`}>
                      {isSidebarOpen ? pendingOrdersCount : ''}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => { setActiveTab('pos_billing'); }}
                  className={`w-full flex items-center text-xs font-bold tracking-wider uppercase py-4 rounded-xl transition-all cursor-pointer ${isSidebarOpen ? 'px-4.5 gap-3.5' : 'justify-center px-0'} ${
                    activeTab === 'pos_billing'
                      ? 'bg-[#2B3E2F] text-white shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                  title="POS Billing"
                >
                  <Receipt className="w-4.5 h-4.5 text-orange-500 shrink-0" />
                  {isSidebarOpen && <span className="whitespace-nowrap truncate">POS Billing</span>}
                </button>

                <button
                  onClick={() => { setActiveTab('analytics'); }}
                  className={`w-full flex items-center text-xs font-bold tracking-wider uppercase py-4 rounded-xl transition-all cursor-pointer ${isSidebarOpen ? 'px-4.5 gap-3.5' : 'justify-center px-0'} ${
                    activeTab === 'analytics'
                      ? 'bg-[#2B3E2F] text-white shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                  title="POS Analytics"
                >
                  <BarChart3 className="w-4.5 h-4.5 shrink-0" />
                  {isSidebarOpen && <span className="whitespace-nowrap truncate">POS Analytics</span>}
                </button>

                <button
                  onClick={() => { setActiveTab('orders'); setSelectedOrder(null); }}
                  className={`w-full flex items-center text-xs font-bold tracking-wider uppercase py-4 rounded-xl transition-all cursor-pointer ${isSidebarOpen ? 'justify-between px-4.5' : 'justify-center px-0'} ${
                    activeTab === 'orders'
                      ? 'bg-[#2B3E2F] text-white shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                  title="Orders"
                >
                  <div className={`flex items-center ${isSidebarOpen ? 'gap-3.5' : ''}`}>
                    <ShoppingCart className="w-4.5 h-4.5 shrink-0" />
                    {isSidebarOpen && <span>Orders</span>}
                  </div>
                </button>

                

                <button
                  onClick={() => { setActiveTab('products'); setEditingProduct(null); setIsAddingProduct(false); }}
                  className={`w-full flex items-center text-xs font-bold tracking-wider uppercase py-4 rounded-xl transition-all cursor-pointer ${isSidebarOpen ? 'px-4.5 gap-3.5' : 'justify-center px-0'} ${
                    activeTab === 'products'
                      ? 'bg-[#2B3E2F] text-white shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                  title="Inventory"
                >
                  <Package className="w-4.5 h-4.5 shrink-0" />
                  {isSidebarOpen && <span className="whitespace-nowrap truncate">Inventory</span>}
                </button>

                <button
                  onClick={() => { setActiveTab('categories'); }}
                  className={`w-full flex items-center text-xs font-bold tracking-wider uppercase py-4 rounded-xl transition-all cursor-pointer ${isSidebarOpen ? 'px-4.5 gap-3.5' : 'justify-center px-0'} ${
                    activeTab === 'categories'
                      ? 'bg-[#2B3E2F] text-white shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                  title="Categories"
                >
                  <FolderTree className="w-4.5 h-4.5 shrink-0" />
                  {isSidebarOpen && <span className="whitespace-nowrap truncate">Categories</span>}
                </button>

                <button
                  onClick={() => { setActiveTab('coupons'); }}
                  className={`w-full flex items-center text-xs font-bold tracking-wider uppercase py-4 rounded-xl transition-all cursor-pointer ${isSidebarOpen ? 'px-4.5 gap-3.5' : 'justify-center px-0'} ${
                    activeTab === 'coupons'
                      ? 'bg-[#2B3E2F] text-white shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                  title="Coupons"
                >
                  <Ticket className="w-4.5 h-4.5 shrink-0" />
                  {isSidebarOpen && <span className="whitespace-nowrap truncate">Coupons</span>}
                </button>

                <button
                  onClick={() => { setActiveTab('users'); }}
                  className={`w-full flex items-center text-xs font-bold tracking-wider uppercase py-4 rounded-xl transition-all cursor-pointer ${isSidebarOpen ? 'px-4.5 gap-3.5' : 'justify-center px-0'} ${
                    activeTab === 'users'
                      ? 'bg-[#2B3E2F] text-white shadow-md'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
                  }`}
                  title="Users"
                >
                  <Users className="w-4.5 h-4.5 shrink-0" />
                  {isSidebarOpen && <span className="whitespace-nowrap truncate">Users</span>}
                </button>
              </div>
            </div>
          </div>

          {/* MAIN DASHBOARD CONTENT AREA */}
          <div data-lenis-prevent="true" className="flex-grow flex flex-col pt-5 px-6 pb-6 md:pt-6 md:px-10 md:pb-8 overflow-y-auto overscroll-contain w-full">
            
            {/* TAB 1: WHATSAPP CENTER (Matches Vercel Screenshot layout) */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-10">
                {/* Header Title Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold tracking-tight text-primary flex items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#25D366]">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      WhatsApp Center
                    </h1>
                    <span className="bg-[#FEF3C7] text-[#D97706] text-xs font-bold px-3 py-1.5 rounded-full border border-[#FDE68A]">
                      {pendingOrdersCount} pending
                    </span>
                  </div>
                  
                  {/* Filters Container */}
                  <div className="flex flex-col xl:flex-row items-end xl:items-center gap-4 self-start sm:self-auto w-full xl:w-auto">

                    {/* Period selection filters and Refresh button */}
                    <div className="flex items-center gap-3 w-full xl:w-auto overflow-x-auto pb-1 xl:pb-0">
                      <div className="bg-[#ECEEEB] p-1.5 rounded-full flex gap-1 shrink-0">
                        {(['all', 'today', 'week', 'month', 'year', 'custom'] as const).map(f => (
                          <button
                            key={f}
                            onClick={() => setPeriodFilter(f)}
                            className={`text-[10px] sm:text-xs font-semibold py-2 px-3 sm:px-4 rounded-full transition-all cursor-pointer uppercase whitespace-nowrap ${
                              periodFilter === f
                                ? 'bg-[#2B3E2F] text-white shadow-sm'
                                : 'text-on-surface-variant hover:text-primary'
                            }`}
                          >
                            {f === 'all' ? 'All' : f === 'today' ? 'Today' : f === 'week' ? 'Week' : f === 'month' ? 'Month' : f === 'year' ? 'Year' : 'Custom'}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={handleRefresh}
                        className="bg-white border border-outline-variant/35 hover:border-secondary text-primary font-bold text-xs py-3 px-4 rounded-full flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                      </button>
                    </div>
                  </div>
                </div>

                {/* Custom Date Pickers */}
                <AnimatePresence>
                  {periodFilter === 'custom' && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0, marginTop: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginTop: -24 }}
                      exit={{ opacity: 0, height: 0, marginTop: 0 }}
                      className="flex flex-wrap items-center gap-4 bg-[#FAF9F5] p-4 rounded-2xl border border-outline-variant/20 shadow-sm overflow-hidden"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">From:</span>
                        <input
                          type="date"
                          value={whatsappCustomStart}
                          onChange={(e) => setWhatsappCustomStart(e.target.value)}
                          className="text-sm font-medium bg-white border border-outline-variant/30 rounded-lg px-3 py-2 focus:outline-none focus:border-secondary"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">To:</span>
                        <input
                          type="date"
                          value={whatsappCustomEnd}
                          onChange={(e) => setWhatsappCustomEnd(e.target.value)}
                          className="text-sm font-medium bg-white border border-outline-variant/30 rounded-lg px-3 py-2 focus:outline-none focus:border-secondary"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Metrics Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white border border-outline-variant/20 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
                    <span className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-widest text-center">Total Requests</span>
                    <span className="block text-4xl font-extrabold text-primary text-center">{totalRequestsCount}</span>
                  </div>
                  <div className="bg-[#FEFCE8] border border-outline-variant/20 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
                    <span className="block text-[11px] font-bold text-[#D97706] uppercase tracking-widest text-center">Pending</span>
                    <span className="block text-4xl font-extrabold text-[#D97706] text-center">{pendingOrdersCount}</span>
                  </div>
                  <div className="bg-[#EFF6FF] border border-outline-variant/20 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
                    <span className="block text-[11px] font-bold text-[#2563EB] uppercase tracking-widest text-center">Contacted</span>
                    <span className="block text-4xl font-extrabold text-[#2563EB] text-center">{contactedOrdersCount}</span>
                  </div>
                  <div className="bg-[#F0FDF4] border border-outline-variant/20 rounded-2xl p-6 shadow-sm space-y-3 flex flex-col justify-between">
                    <span className="block text-[11px] font-bold text-[#16A34A] uppercase tracking-widest text-center">Completed</span>
                    <span className="block text-4xl font-extrabold text-[#16A34A] text-center">{completedOrdersCount}</span>
                  </div>
                </div>

                {/* Customer Requests Panel */}
                <div className="bg-white border border-outline-variant/20 rounded-3xl overflow-hidden shadow-md">
                  <div className="p-6 md:p-8 bg-[#FAF9F5]/30 border-b border-outline-variant/20 flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#25D366]">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                      <h3 className="text-lg font-bold text-primary">Customer Requests</h3>
                      <span className="text-xs font-bold text-[#4B5563] bg-gray-100 py-1 px-3 rounded-full">
                        {filteredOrdersList.length} requests
                      </span>
                    </div>

                    {/* Styled Search Bar matching theme */}
                    <div className="relative w-full md:w-64">
                      <Search className="w-4 h-4 text-[#2B3E2F] absolute left-4 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search requests..."
                          value={whatsappSearch}
                          onChange={(e) => setWhatsappSearch(e.target.value)}
                          className="pl-11 pr-4 py-2.5 bg-[#F5F2EB] border border-[#2B3E2F]/30 hover:border-[#2B3E2F]/60 focus:border-[#2B3E2F] rounded-full text-xs font-semibold focus:outline-none w-full text-primary shadow-sm"
                      />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    {filteredOrdersList.length === 0 ? (
                      <div className="p-16 text-center text-on-surface-variant text-sm italic">
                        No requests found in this period filter.
                      </div>
                    ) : (
                      <table className="w-full text-left text-xs min-w-[900px]">
                        <thead>
                          <tr className="text-[#888888] text-[10px] font-bold tracking-widest uppercase border-b border-outline-variant/20">
                            <th className="px-4 py-4 font-bold">ORD ID</th>
                            <th className="px-4 py-4 font-bold">CUSTOMER</th>
                            <th className="px-4 py-4 font-bold">PHONE</th>
                            <th className="px-4 py-4 font-bold">ADDRESS</th>
                            <th className="px-4 py-4 font-bold text-center">PRODUCTS</th>
                            <th className="px-4 py-4 font-bold">EST. TOTAL</th>
                            <th className="px-4 py-4 font-bold">DATE & TIME</th>
                            <th className="px-4 py-4 font-bold">STATUS</th>
                            <th className="px-4 py-4 font-bold text-right">DETAILS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {filteredOrdersList.map(o => (
                            <Fragment key={o.id}>
                              <tr className="hover:bg-[#FAF9F5]/20 transition-colors">
                                <td className="px-4 py-4 font-bold text-[#111111]">{o.id}</td>
                                <td className="px-4 py-4 font-bold text-[#111111]">{o.customerName}</td>
                                <td className="px-4 py-4 font-medium text-[#444444]">{o.customerPhone.split('_')[0]}</td>
                                <td className="px-4 py-4 max-w-[150px] truncate text-[#666666]">{o.customerAddress}</td>
                                <td className="px-4 py-4 text-center">
                                  <span className="bg-[#E0E7FF] text-[#4F46E5] px-2 py-0.5 rounded-full font-bold text-[10px]">
                                    {o.items.reduce((sum: number, it: any) => sum + it.quantity, 0)}
                                  </span>
                                </td>
                                <td className="px-4 py-4 font-bold text-[#111111]">₹{o.totalPrice.toLocaleString('en-IN')}</td>
                                <td className="px-4 py-4 text-[#888888] font-medium text-[11px]">
                                  {new Date(o.createdAt).toLocaleDateString('en-GB', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })} <br/> {new Date(o.createdAt).toLocaleTimeString('en-US', { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  }).toLowerCase()}
                                </td>
                                <td className="px-4 py-4">
                                  <select
                                    value={o.status}
                                    onChange={(e) => updateOrderStatus(o.id, e.target.value as Order['status'])}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border focus:outline-none transition-all cursor-pointer ${
                                      o.status === 'Completed'
                                        ? 'text-[#16A34A] border-[#16A34A]/30 bg-[#F0FDF4]'
                                        : o.status === 'Processing'
                                        ? 'text-[#2563EB] border-[#2563EB]/30 bg-[#EFF6FF]'
                                        : o.status === 'Cancelled'
                                        ? 'text-[#DC2626] border-[#DC2626]/30 bg-[#FEF2F2]'
                                        : 'text-[#D97706] border-[#D97706]/30 bg-[#FFFBEB]'
                                    }`}
                                  >
                                    <option value="Pending">Pending</option>
                                    <option value="Processing">Contacted</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                  </select>
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <button
                                    onClick={() => {
                                      setExpandedOrderId(expandedOrderId === o.id ? null : o.id);
                                    }}
                                    className={`font-bold text-xs px-5 py-2.5 rounded-xl transition-all inline-block cursor-pointer ${
                                      expandedOrderId === o.id
                                        ? 'bg-[#1F2937] text-white hover:bg-black'
                                        : 'bg-blue-50 text-[#4F46E5] border border-blue-100 hover:bg-blue-100'
                                    }`}
                                  >
                                    {expandedOrderId === o.id ? 'Close' : 'View'}
                                  </button>
                                </td>
                              </tr>
                              {expandedOrderId === o.id && (
                                <tr className="bg-white">
                                  <td colSpan={9} className="px-8 py-6 border-b border-outline-variant/20 bg-white">
                                    <div className="border border-outline-variant/30 rounded-2xl p-6 space-y-6 text-left">
                                      {/* Row 1: Name, Phone, Address */}
                                      <div className="text-sm font-semibold text-[#1F2937] flex flex-wrap gap-x-6 gap-y-2 pb-4 border-b border-outline-variant/10">
                                        <span>Name: <strong className="text-primary font-bold">{o.customerName}</strong></span>
                                        <span>Phone: <strong className="text-primary font-bold">{o.customerPhone.split('_')[0]}</strong></span>
                                        <span>Address: <strong className="text-primary font-bold">{o.customerAddress}</strong></span>
                                      </div>

                                      {/* Products Table */}
                                      <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs font-medium">
                                          <thead>
                                            <tr className="bg-[#FAF9F6] text-primary border-b border-outline-variant/20 font-bold uppercase tracking-wider">
                                              <th className="px-4 py-3">Product</th>
                                              <th className="px-4 py-3">Variant</th>
                                              <th className="px-4 py-3">Size / Weight</th>
                                              <th className="px-4 py-3 text-center">Qty</th>
                                              <th className="px-4 py-3">Unit Price</th>
                                              <th className="px-4 py-3 text-right">Line Total</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-outline-variant/10">
                                            {o.items.map((it: any, idx: number) => (
                                              <tr key={idx} className="hover:bg-[#FAF9F5]/20">
                                                <td className="px-4 py-3 font-semibold text-primary">{it.name}</td>
                                                <td className="px-4 py-3 text-on-surface-variant">{it.size || '—'}</td>
                                                <td className="px-4 py-3 text-on-surface-variant">{it.size ? `${it.quantity} ${it.size}` : '—'}</td>
                                                <td className="px-4 py-3 text-center font-bold">{it.quantity}</td>
                                                <td className="px-4 py-3">₹{it.price}</td>
                                                <td className="px-4 py-3 text-right font-bold text-primary">₹{it.price * it.quantity}</td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </div>

                                      {/* Totals Breakdown */}
                                      <div className="flex flex-col gap-2 bg-[#FAF9F6]/50 p-4 rounded-xl border border-outline-variant/15">
                                        <div className="flex justify-between items-center">
                                          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Subtotal</span>
                                          <span className="text-sm font-bold text-primary">₹{o.subtotal || o.totalPrice}</span>
                                        </div>
                                        {o.couponCode && (
                                          <div className="flex justify-between items-center text-[#16A34A]">
                                            <span className="text-xs font-bold uppercase tracking-wider">Discount ({o.couponCode})</span>
                                            <span className="text-sm font-bold">-₹{o.couponDiscount || 0}</span>
                                          </div>
                                        )}
                                        <div className="flex justify-between items-center pt-2 border-t border-outline-variant/15 mt-1">
                                          <span className="text-xs font-bold text-primary uppercase tracking-wider">Grand Total</span>
                                          <span className="text-xl font-bold text-primary">₹{o.totalPrice}</span>
                                        </div>
                                      </div>

                                      {/* WhatsApp message block */}
                                      <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                          <span className="block text-xs font-bold text-primary uppercase tracking-wider">WhatsApp Message</span>
                                          <button
                                            onClick={() => {
                                              const msg = formatWhatsAppMessage(o);
                                              navigator.clipboard.writeText(msg);
                                              alert('Message copied to clipboard!');
                                              // Open WhatsApp Web using the override phone number "7904199050"
                                              const adminNumber = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP_1 || "917904199050";
                                              window.open(`https://wa.me/${adminNumber}?text=${encodeURIComponent(msg)}`, '_blank');
                                            }}
                                            className="bg-[#10B981] hover:bg-[#059669] text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
                                          >
                                            Copy Message
                                          </button>
                                        </div>
                                        <div className="bg-[#FAF9F6] border border-outline-variant/30 rounded-2xl p-6 font-mono text-sm text-[#374151] whitespace-pre-wrap leading-relaxed shadow-inner">
                                          {formatWhatsAppMessage(o)}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </Fragment>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB: POS BILLING PANEL */}
            {activeTab === 'pos_billing' && (
              <div className="space-y-6 text-left">
                {/* Header Title Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-4 border-b border-outline-variant/15">
                  <div className="flex items-center gap-3">
                    <div className="border-l-4 border-[#2B3E2F] pl-3">
                      <h1 className="text-3xl font-extrabold tracking-tight text-primary font-poppins">POS Billing Panel</h1>
                      <p className="text-xs text-on-surface-variant font-medium mt-1">
                        Quick invoice generator & database synced checkout
                      </p>
                    </div>
                  </div>
                  
                  {/* Toggle switches offline/online */}
                  <div className="flex items-center bg-[#FAF9F5] border border-outline-variant/35 rounded-full p-1 self-start sm:self-auto shadow-sm">
                    <button
                      onClick={() => setBillingSource('OFFLINE')}
                      className={`text-xs font-bold py-2.5 px-5 rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                        billingSource === 'OFFLINE'
                          ? 'bg-[#2B3E2F] text-white shadow-sm'
                          : 'text-[#4B5563] hover:text-primary'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      OFFLINE (POS)
                    </button>
                    <button
                      onClick={() => setBillingSource('ONLINE')}
                      className={`text-xs font-bold py-2.5 px-5 rounded-full transition-all cursor-pointer flex items-center gap-2 ${
                        billingSource === 'ONLINE'
                          ? 'bg-[#C27D38] text-white shadow-sm'
                          : 'text-[#4B5563] hover:text-primary'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                      ONLINE ORDER
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column - Details and items (2/3 width) */}
                  <div className="lg:col-span-2 space-y-6">
                    
                    {/* Customer Details Card */}
                    <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                        <Users className="w-4.5 h-4.5 text-[#2B3E2F]" />
                        <span>Customer Details</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Customer Name</label>
                          <input
                            type="text"
                            placeholder="Enter name"
                            value={billingCustomerName}
                            onChange={(e) => setBillingCustomerName(e.target.value)}
                            className="w-full bg-[#FAF9F6] border border-outline-variant/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Mobile Number (WhatsApp)</label>
                          <input
                            type="tel"
                            placeholder="Enter 10-digit number"
                            value={billingCustomerPhone}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '');
                              if (val.length <= 10) {
                                setBillingCustomerPhone(val);
                              }
                            }}
                            className="w-full bg-[#FAF9F6] border border-outline-variant/35 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Order Items Card */}
                    <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-sm space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-outline-variant/10">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                          <Receipt className="w-4.5 h-4.5 text-[#2B3E2F]" />
                          <span>Order Items</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setBillingItems([])}
                            className="bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            Clear Order
                          </button>
                          <button
                            onClick={addCustomItem}
                            className="bg-white hover:bg-[#2B3E2F] hover:text-white text-[#2B3E2F] border border-[#2B3E2F]/20 font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            + Add Custom Item
                          </button>
                        </div>
                      </div>

                      {/* Items List Rows */}
                      <div className="space-y-3">
                        {billingItems.length === 0 ? (
                          <div className="text-center py-10 text-on-surface-variant text-sm italic">
                            No items added to this bill. Add custom items or select from catalog.
                          </div>
                        ) : (
                          billingItems.map((it) => (
                            <div key={it.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-[#FAF9F6]/40 p-4 rounded-xl border border-outline-variant/15">
                              {/* Item Description */}
                              <div className="md:col-span-6 space-y-1.5">
                                <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Item Name / Description</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Type custom product description..."
                                    value={it.name}
                                    onChange={(e) => updateBillingItem(it.id, 'name', e.target.value)}
                                    className="flex-grow bg-white border border-outline-variant/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold"
                                  />
                                  <button
                                    onClick={() => {
                                      setActiveCatalogRowId(it.id);
                                      setShowCatalogModal(true);
                                    }}
                                    className="bg-white border border-outline-variant/30 hover:bg-[#FAF9F6] text-primary font-bold text-[10px] uppercase px-3 py-2.5 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer whitespace-nowrap"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#2B3E2F]"></span>
                                    Catalog
                                  </button>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="md:col-span-3 space-y-1.5">
                                <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Price (₹)</label>
                                <input
                                  type="number"
                                  placeholder="0"
                                  value={it.price || ''}
                                  onChange={(e) => updateBillingItem(it.id, 'price', Number(e.target.value))}
                                  className="w-full bg-white border border-outline-variant/35 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold"
                                />
                              </div>

                              {/* Qty Counter */}
                              <div className="md:col-span-2 space-y-1.5">
                                <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Qty</label>
                                <div className="flex items-center border border-outline-variant/35 rounded-xl bg-white overflow-hidden">
                                  <button
                                    onClick={() => updateBillingItem(it.id, 'quantity', Math.max(1, it.quantity - 1))}
                                    className="px-3 py-2.5 hover:bg-[#FAF9F6] font-bold text-xs text-[#4B5563] cursor-pointer"
                                  >
                                    -
                                  </button>
                                  <span className="flex-grow text-center font-bold text-xs text-primary">{it.quantity}</span>
                                  <button
                                    onClick={() => updateBillingItem(it.id, 'quantity', it.quantity + 1)}
                                    className="px-3 py-2.5 hover:bg-[#FAF9F6] font-bold text-xs text-[#4B5563] cursor-pointer"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Delete Action */}
                              <div className="md:col-span-1 flex justify-center pb-2.5">
                                <button
                                  onClick={() => removeBillingItem(it.id)}
                                  className="text-red-500 hover:text-red-700 p-2.5 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Invoice Receipt Box (1/3 width) */}
                  <div className="space-y-6">
                    <div className="bg-white border border-outline-variant/20 rounded-2xl p-5 shadow-sm space-y-4">
                      
                      {/* Receipt Header details block */}
                      <div className="border border-outline-variant/30 rounded-xl p-4 bg-[#FAF9F6]/40 space-y-3">
                        <div className="flex justify-between items-center text-[10px] font-extrabold uppercase tracking-widest text-[#4B5563]">
                          <span>Source</span>
                          <span className={`px-2.5 py-0.5 rounded-md font-bold text-[9px] ${
                            billingSource === 'OFFLINE' 
                              ? 'bg-[#FAF9F5] text-[#2B3E2F] border border-[#2B3E2F]/20' 
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}>
                            {billingSource}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold text-primary">
                          <span className="text-[#4B5563]">Customer</span>
                          <span>{billingCustomerName || '-'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs font-semibold text-primary">
                          <span className="text-[#4B5563]">Phone</span>
                          <span>{billingCustomerPhone || '-'}</span>
                        </div>
                      </div>

                      {/* Receipt Items scrollable breakdown */}
                      <div className="flex-grow min-h-[120px] border-b border-dashed border-outline-variant/30 py-3">
                        {billingItems.length === 0 ? (
                          <div className="text-center py-10 text-[#9CA3AF] text-xs font-semibold">
                            No items added yet
                          </div>
                        ) : (
                          <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                            {billingItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs font-semibold text-primary">
                                <span>
                                  {item.name || 'Unnamed Item'}
                                  {item.size ? ` (${item.size})` : ''}
                                  <span className="text-[#6B7280] font-medium ml-1">x{item.quantity}</span>
                                </span>
                                <span>₹{item.price * item.quantity}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Form calculations (Discounts, Coupons, Delivery, Total) */}
                      <div className="space-y-4 pt-1">
                        
                        {/* Coupon Selection */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Apply Coupon</label>
                          <select
                            value={billingCoupon}
                            onChange={(e) => setBillingCoupon(e.target.value)}
                            className="w-full bg-white border border-outline-variant/35 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold cursor-pointer"
                          >
                            <option value="">No Coupon</option>
                            {coupons
                              .filter(c => c.status === 'ACTIVE' && (c.usageLimit === 0 || c.usedCount < c.usageLimit))
                              .map((c, i) => (
                              <option key={i} value={c.code}>{c.code} ({c.discount}% off)</option>
                            ))}
                          </select>
                        </div>

                        {/* Manual Discount */}
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Manual Discount</label>
                          <div className="flex rounded-xl border border-outline-variant/35 bg-white overflow-hidden">
                            <select
                              value={billingDiscountType}
                              onChange={(e) => setBillingDiscountType(e.target.value as '₹' | '%')}
                              className="bg-[#FAF9F6] border-r border-outline-variant/35 px-3.5 py-2 text-xs focus:outline-none font-bold text-primary cursor-pointer"
                            >
                              <option value="₹">₹</option>
                              <option value="%">%</option>
                            </select>
                            <input
                              type="number"
                              placeholder="0"
                              value={billingDiscountValue || ''}
                              onChange={(e) => setBillingDiscountValue(Number(e.target.value))}
                              className="flex-grow px-3 py-2 text-xs focus:outline-none text-[#1F2937] font-semibold"
                            />
                          </div>
                        </div>

                        {/* Delivery */}
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-semibold text-[#4B5563]">Delivery</span>
                          <div className="w-24">
                            <input
                              type="number"
                              placeholder="0"
                              value={billingDeliveryFee || ''}
                              onChange={(e) => setBillingDeliveryFee(Number(e.target.value))}
                              className="w-full bg-white border border-outline-variant/35 rounded-xl px-3 py-1.5 text-xs text-right focus:outline-none text-[#1F2937] font-semibold"
                            />
                          </div>
                        </div>

                        {/* Calculation Summary Row */}
                        <div className="space-y-1.5 border-t border-outline-variant/10 pt-3">
                          <div className="flex justify-between text-xs font-medium text-[#4B5563]">
                            <span>Subtotal ({billingItems.reduce((sum, it) => sum + it.quantity, 0)} items)</span>
                            <span>₹{getSubtotal()}</span>
                          </div>
                          {billingCoupon && (
                            <div className="flex justify-between text-xs font-medium text-green-600">
                              <span>Coupon Discount</span>
                              <span>-₹{getCouponDiscount(getSubtotal()).toFixed(2)}</span>
                            </div>
                          )}
                          {billingDiscountValue > 0 && (
                            <div className="flex justify-between text-xs font-medium text-green-600">
                              <span>Manual Discount</span>
                              <span>-₹{getManualDiscount(getSubtotal()).toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        {/* Grand Total */}
                        <div className="flex justify-between items-center border-t border-outline-variant/20 pt-4">
                          <span className="text-sm font-extrabold text-primary uppercase tracking-wider">Grand Total</span>
                          <span className="text-2xl font-extrabold text-primary">₹{getGrandTotal().toFixed(2)}</span>
                        </div>

                        {/* Cash Amount Received & Change Balance */}
                        <div className="border border-outline-variant/30 rounded-xl p-4 bg-[#FAF9F6]/40 space-y-3 mt-3">
                          <span className="block text-[10px] font-extrabold uppercase tracking-widest text-[#4B5563]">Cash Payment</span>
                          <div className="space-y-1.5">
                            <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Amount Received (₹)</label>
                            <input
                              type="number"
                              placeholder="0.00"
                              value={billingAmountReceived || ''}
                              onChange={(e) => setBillingAmountReceived(Number(e.target.value))}
                              className="w-full bg-white border border-outline-variant/35 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold"
                            />
                          </div>
                          {billingAmountReceived > 0 && billingAmountReceived >= getGrandTotal() && (
                            <div className="flex justify-between items-center text-xs font-semibold text-green-700 bg-green-50 p-2 rounded-lg border border-green-200">
                              <span>Change Return</span>
                              <span>₹{(billingAmountReceived - getGrandTotal()).toFixed(2)}</span>
                            </div>
                          )}
                        </div>

                        {/* Checkout Send Button */}
                        <button
                          onClick={handleCheckoutPOS}
                          disabled={billingItems.length === 0}
                          className={`w-full font-bold text-xs py-4 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer ${
                            (billingItems.length === 0)
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                              : 'bg-[#2B3E2F] hover:bg-[#1E2B21] text-white'
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-4 h-4 ${(billingItems.length === 0) ? 'text-gray-500' : 'text-[#25D366]'}`}>
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                          <span>SEND BILL VIA WHATSAPP</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Catalog Popover Modal */}
                {showCatalogModal && (
                  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl">
                      <div className="flex justify-between items-center pb-3 border-b border-outline-variant/15">
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-[#2B3E2F]" />
                          <h3 className="text-lg font-bold text-primary uppercase tracking-wider font-poppins">Select Product Variant</h3>
                        </div>
                        <button
                          onClick={() => {
                            setShowCatalogModal(false);
                            setActiveCatalogRowId(null);
                          }}
                          className="p-1 hover:bg-slate-100 rounded-full cursor-pointer text-gray-400 hover:text-gray-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Search Catalog Input */}
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        className="w-full bg-[#FAF9F6] border border-outline-variant/35 rounded-xl px-4 py-2.5 text-sm focus:outline-none text-[#1F2937] font-semibold"
                      />

                      {/* Products List scrollable wrapper */}
                      <div className="max-h-[350px] overflow-y-auto space-y-4 pr-1">
                        {products
                          .filter(p => p.name.toLowerCase().includes(catalogSearch.toLowerCase()))
                          .map((prod) => (
                            <div key={prod.id} className="border border-outline-variant/20 rounded-xl p-4 space-y-3 bg-[#FAF9F6]/20">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-bold text-primary text-sm">{prod.name}</h4>
                                  <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-slate-100 px-2 py-0.5 rounded-md">
                                    {prod.category}
                                  </span>
                                </div>
                              </div>

                              {/* Pack sizes grid */}
                              <div className="flex flex-wrap gap-2 pt-1">
                                {prod.sizes.map((sz: any, sIdx: any) => (
                                  <button
                                    key={sIdx}
                                    onClick={() => {
                                      if (activeCatalogRowId) {
                                        selectCatalogProductForActiveRow(prod, sz);
                                      } else {
                                        // fallback to normal add if row was not set
                                        setBillingItems([
                                          ...billingItems,
                                          {
                                            id: Math.random().toString(),
                                            name: prod.name,
                                            size: sz.size,
                                            price: sz.price,
                                            quantity: 1
                                          }
                                        ]);
                                        setShowCatalogModal(false);
                                      }
                                    }}
                                    className="bg-white border border-outline-variant/30 hover:border-primary hover:bg-[#FAF9F5] text-primary text-xs font-bold py-2 px-3.5 rounded-xl shadow-sm transition-all cursor-pointer"
                                  >
                                    {sz.size} — ₹{sz.price}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}


            {/* TAB 3: POS ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 text-left">
                {/* Header Title & Refresh */}
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary font-poppins">POS Analytics</h1>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">
                      Real-time revenue, product performance, categories breakdown, and coupon usage
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      alert('Analytics refreshed successfully!');
                    }}
                    className="flex items-center gap-2 border border-outline-variant/35 hover:bg-[#FAF9F5] px-4 py-2.5 rounded-xl text-xs font-bold text-primary transition-all cursor-pointer bg-white shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4 text-primary animate-spin-slow" />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Period Selector Row */}
                {analyticsSubTab !== 'today' && (
                  <>
                    <div className="flex flex-wrap items-center gap-3 bg-[#FAF9F6]/50 p-3 rounded-2xl border border-outline-variant/15">
                      <span className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider pl-2">Period:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {(['all', 'today', 'week', 'month', 'year', 'custom'] as const).map(p => (
                          <button
                            key={p}
                            onClick={() => setAnalyticsPeriodFilter(p)}
                            className={`text-xs font-bold py-1.5 px-4 rounded-xl transition-all cursor-pointer ${
                              analyticsPeriodFilter === p
                                ? 'bg-[#2B3E2F] text-white shadow-sm'
                                : 'bg-white border border-outline-variant/35 text-[#4B5563] hover:bg-[#FAF9F5]'
                            }`}
                          >
                            {p === 'all' ? 'All Time' : p === 'today' ? 'Today' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : p === 'year' ? 'This Year' : 'Custom'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom date pickers if 'custom' is active */}
                    {analyticsPeriodFilter === 'custom' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF9F6]/40 p-4 rounded-2xl border border-outline-variant/15 max-w-xl">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-[#4B5563] uppercase tracking-wider">Start Date</label>
                          <input
                            type="date"
                            value={analyticsStartDate}
                            onChange={(e) => setAnalyticsStartDate(e.target.value)}
                            className="w-full bg-white border border-outline-variant/35 rounded-xl px-3 py-1.5 text-xs text-primary font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-[#4B5563] uppercase tracking-wider">End Date</label>
                          <input
                            type="date"
                            value={analyticsEndDate}
                            onChange={(e) => setAnalyticsEndDate(e.target.value)}
                            className="w-full bg-white border border-outline-variant/35 rounded-xl px-3 py-1.5 text-xs text-primary font-semibold focus:outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Sub-tabs Row */}
                <div className="flex border-b border-outline-variant/15 max-w-md">
                  {(['revenue', 'today', 'products', 'coupons'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setAnalyticsSubTab(tab)}
                      className={`px-4 py-2 font-bold text-xs transition-all cursor-pointer border-b-2 ${
                        analyticsSubTab === tab
                          ? 'border-primary text-primary'
                          : 'border-transparent text-on-surface-variant hover:text-primary'
                      }`}
                    >
                      {tab === 'revenue' ? 'REVENUE' : tab === 'today' ? "TODAY'S SALES" : tab === 'products' ? 'PRODUCTS' : 'COUPONS'}
                    </button>
                  ))}
                </div>

                {/* Compute Dynamic Metrics */}
                {(() => {
                  const getSourceOfOrder = (o: Order) => {
                    if (o.source) return o.source;
                    if (o.items.some((it: any) => it.productId === 'custom')) return 'MANUAL';
                    if (o.customerAddress.includes('Offline')) return 'OFFLINE';
                    return 'ONLINE';
                  };

                  // Filter POS bills based on period selection
                  const getFilteredAnalyticsBills = () => {
                    let list = orders.filter(o => o.id.startsWith('POS-') || o.id.startsWith('INV-'));
                    const now = new Date();
                    
                    if (analyticsPeriodFilter === 'today') {
                      list = list.filter(o => new Date(o.createdAt).toDateString() === now.toDateString());
                    } else if (analyticsPeriodFilter === 'week') {
                      const dayOfWeek = now.getDay() || 7;
                      const monday = new Date(now);
                      monday.setDate(monday.getDate() - dayOfWeek + 1);
                      monday.setHours(0,0,0,0);
                      const nextMonday = new Date(monday);
                      nextMonday.setDate(nextMonday.getDate() + 7);
                      list = list.filter(o => {
                        const oDate = new Date(o.createdAt);
                        return oDate >= monday && oDate < nextMonday;
                      });
                    } else if (analyticsPeriodFilter === 'month') {
                      list = list.filter(o => {
                        const oDate = new Date(o.createdAt);
                        return oDate.getMonth() === now.getMonth() && oDate.getFullYear() === now.getFullYear();
                      });
                    } else if (analyticsPeriodFilter === 'year') {
                      list = list.filter(o => new Date(o.createdAt).getFullYear() === now.getFullYear());
                    } else if (analyticsPeriodFilter === 'custom') {
                      if (analyticsStartDate) {
                        list = list.filter(o => o.createdAt.split('T')[0] >= analyticsStartDate);
                      }
                      if (analyticsEndDate) {
                        list = list.filter(o => o.createdAt.split('T')[0] <= analyticsEndDate);
                      }
                    }
                    return list;
                  };

                  const analyticsBills = getFilteredAnalyticsBills();

                  // 1. Total Revenue
                  const totalRevVal = analyticsBills.reduce((sum, o) => sum + o.totalPrice, 0);

                  // 2. Completed Bills
                  const completedBillsCount = analyticsBills.length;

                  // 3. Offline Bills
                  const offlineBillsVal = analyticsBills
                    .filter(o => getSourceOfOrder(o) === 'OFFLINE')
                    .reduce((sum, o) => sum + o.totalPrice, 0);
                  const offlineBillsCount = analyticsBills.filter(o => getSourceOfOrder(o) === 'OFFLINE').length;

                  // 4. Online Bills
                  const onlineBillsVal = analyticsBills
                    .filter(o => getSourceOfOrder(o) === 'ONLINE')
                    .reduce((sum, o) => sum + o.totalPrice, 0);
                  const onlineBillsCount = analyticsBills.filter(o => getSourceOfOrder(o) === 'ONLINE').length;

                  // 5. Total Items Sold
                  const totalItemsSold = analyticsBills.reduce((sum, o) => {
                    return sum + o.items.reduce((itemSum: any, it: any) => itemSum + it.quantity, 0);
                  }, 0);

                  // 6. Avg Order Value
                  const avgOrderValue = completedBillsCount > 0 ? Math.round(totalRevVal / completedBillsCount) : 0;

                  // 7. Top Product
                  const productCounts: Record<string, number> = {};
                  analyticsBills.forEach(o => {
                    o.items.forEach((it: any) => {
                      productCounts[it.name] = (productCounts[it.name] || 0) + it.quantity;
                    });
                  });
                  let topProduct = '—';
                  let maxProdCount = 0;
                  Object.entries(productCounts).forEach(([name, count]) => {
                    if (count > maxProdCount) {
                      maxProdCount = count;
                      topProduct = name;
                    }
                  });

                  // Top items list by revenue helper
                  const getTopItemsByRevenue = (filteredOrders: Order[]) => {
                    const itemsMap: { [name: string]: { name: string; qty: number; revenue: number } } = {};
                    filteredOrders.forEach(o => {
                      o.items.forEach((it: any) => {
                        const name = it.name;
                        if (!itemsMap[name]) {
                          itemsMap[name] = { name, qty: 0, revenue: 0 };
                        }
                        itemsMap[name].qty += it.quantity;
                        itemsMap[name].revenue += it.price * it.quantity;
                      });
                    });
                    return Object.values(itemsMap).sort((a, b) => b.revenue - a.revenue);
                  };

                  const topItemsList = getTopItemsByRevenue(analyticsBills);

                  // Yearly monthly revenue calculation
                  const getYearlyMonthlyRevenue = () => {
                    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const now = new Date();
                    let currentYear = now.getFullYear();
                    if (currentYear === 2026 && now.getMonth() >= 9) {
                      currentYear = 2027;
                    }
                    return months.map((m, idx) => {
                      const rev = orders
                        .filter(o => {
                          if (!o.id.startsWith('POS-') && !o.id.startsWith('INV-')) return false;
                          const oDate = new Date(o.createdAt);
                          return oDate.getFullYear() === currentYear && oDate.getMonth() === idx;
                        })
                        .reduce((sum, o) => sum + o.totalPrice, 0);
                      return { label: m, value: rev };
                    });
                  };

                  const yearlyTrend = getYearlyMonthlyRevenue();
                  const maxYearlyVal = Math.max(...yearlyTrend.map(d => d.value), 1);
                  const totalYearlyRevenue = yearlyTrend.reduce((sum, d) => sum + d.value, 0);

                  // Weekly revenue calculation
                  const getWeeklyRevenue = () => {
                    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                    const now = new Date();
                    // get current week's Monday
                    const dayOfWeek = now.getDay() || 7; 
                    const monday = new Date(now);
                    monday.setDate(monday.getDate() - dayOfWeek + 1);
                    monday.setHours(0,0,0,0);
                    
                    return days.map((d, idx) => {
                      const dayStart = new Date(monday);
                      dayStart.setDate(dayStart.getDate() + idx);
                      const dayEnd = new Date(dayStart);
                      dayEnd.setDate(dayEnd.getDate() + 1);
                      
                      const rev = orders
                        .filter(o => {
                          if (!o.id.startsWith('POS-') && !o.id.startsWith('INV-')) return false;
                          const oDate = new Date(o.createdAt);
                          return oDate >= dayStart && oDate < dayEnd;
                        })
                        .reduce((sum, o) => sum + o.totalPrice, 0);
                      return { label: d, value: rev };
                    });
                  };

                  const weeklyTrend = getWeeklyRevenue();
                  const maxWeeklyVal = Math.max(...weeklyTrend.map(d => d.value), 1);
                  const totalWeeklyRevenue = weeklyTrend.reduce((sum, d) => sum + d.value, 0);

                  // Render Revenue subtab
                  if (analyticsSubTab === 'revenue') {
                    const cards = [
                      { title: 'Total Revenue', value: `₹${totalRevVal.toLocaleString()}`, subtext: 'POS + manual combined', icon: Receipt, bg: 'bg-[#ECFDF5]', fg: 'text-[#10B981]' },
                      { title: 'Completed Bills', value: `${completedBillsCount}`, subtext: 'POS + manual bills', icon: CheckCircle2, bg: 'bg-[#F0FDF4]', fg: 'text-[#16A34A]' },
                      { title: 'Offline Bills', value: `₹${offlineBillsVal.toLocaleString()}`, subtext: 'Walk-in POS sales', icon: Receipt, bg: 'bg-[#EFF6FF]', fg: 'text-[#2563EB]' },
                      { title: 'Online Bills', value: `₹${onlineBillsVal.toLocaleString()}`, subtext: 'Online POS sales', icon: Receipt, bg: 'bg-[#F3E8FF]', fg: 'text-[#A855F7]' },
                      { title: 'Total Offline Bills', value: `${offlineBillsCount}`, subtext: 'Walk-in POS orders', icon: ShoppingBag, bg: 'bg-[#FFF5F5]', fg: 'text-[#FF4D4D]' },
                      { title: 'Total Online Bills', value: `${onlineBillsCount}`, subtext: 'Online channel orders', icon: Globe, bg: 'bg-[#EEF2FF]', fg: 'text-[#4F46E5]' },
                      { title: 'Total Items Sold', value: `${totalItemsSold}`, subtext: 'From completed bills', icon: Package, bg: 'bg-[#F3E8FF]', fg: 'text-[#A855F7]' },
                      { title: 'Avg Order Value', value: `₹${avgOrderValue.toLocaleString()}`, subtext: 'Per completed order', icon: TrendingUp, bg: 'bg-[#FFF7ED]', fg: 'text-[#EA580C]' },
                      { title: 'Top Product', value: topProduct.length > 15 ? `${topProduct.slice(0, 15)}...` : topProduct, subtext: 'Most sold item', icon: Award, bg: 'bg-[#FFF1F2]', fg: 'text-[#E11D48]' },
                    ];

                    return (
                      <div className="space-y-4">
                        {/* 4 cards grid (Top Row) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {cards.slice(0, 4).map((c, i) => (
                            <div key={i} className="bg-white border border-outline-variant/20 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-primary/25 transition-all">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">{c.title}</span>
                                  <span className="block text-xl font-extrabold text-primary font-poppins">{c.value}</span>
                                </div>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.bg}`}>
                                  <c.icon className={`w-4 h-4 ${c.fg}`} />
                                </div>
                              </div>
                              <div className="text-[10px] font-semibold text-on-surface-variant/80 border-t border-outline-variant/10 pt-2">
                                <span>{c.subtext}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        {/* 5 cards grid (Bottom Row) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                          {cards.slice(4).map((c, i) => (
                            <div key={i} className="bg-white border border-outline-variant/20 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-primary/25 transition-all">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">{c.title}</span>
                                  <span className="block text-xl font-extrabold text-primary font-poppins">{c.value}</span>
                                </div>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.bg}`}>
                                  <c.icon className={`w-4 h-4 ${c.fg}`} />
                                </div>
                              </div>
                              <div className="text-[10px] font-semibold text-on-surface-variant/80 border-t border-outline-variant/10 pt-2">
                                <span>{c.subtext}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Trend & Order Details Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          <div className="lg:col-span-8 space-y-6">
                            {/* Card 1: Revenue Trend This Year */}
                            <div className="bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm space-y-6">
                              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
                                <div>
                                  <h3 className="text-sm font-bold text-primary font-poppins uppercase tracking-wider font-poppins">Revenue Trend This Year <span className="text-[#B91C1C] ml-1">{new Date().getFullYear()}</span></h3>
                                  <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-2xl font-extrabold text-primary">₹{totalYearlyRevenue.toLocaleString()}</span>
                                    <span className="bg-[#FFF7ED] text-[#EA580C] px-2 py-0.5 rounded text-[10px] font-bold">Avg ₹{Math.round(totalYearlyRevenue / 12).toLocaleString()}/mo</span>
                                  </div>
                                </div>
                              </div>

                              {/* Bar Chart Container */}
                              <div className="h-56 flex items-end justify-between gap-1 pt-6 px-2">
                                {yearlyTrend.map((d, idx) => {
                                  const heightPercent = maxYearlyVal > 0 ? (d.value / maxYearlyVal) * 100 : 0;
                                  const isCurrentMonth = new Date().getMonth() === idx;
                                  return (
                                    <div key={idx} className="flex flex-col items-center flex-grow h-full justify-end">
                                      <div className="relative w-full max-w-[28px] group flex flex-col justify-end items-center cursor-pointer" style={{ height: `${Math.max(4, heightPercent)}%` }}>
                                        {/* Tooltip on Hover */}
                                        <div className="absolute bottom-full mb-2 bg-primary text-white text-[10px] font-bold py-1 px-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                          ₹{d.value.toLocaleString()}
                                        </div>
                                        
                                        {/* Optional percentage header for selected or highest value */}
                                        {d.value > 0 && d.value === maxYearlyVal && (
                                          <span className="text-[8px] font-bold text-[#EA580C] absolute bottom-full mb-1">Max</span>
                                        )}

                                        {/* The Bar */}
                                        <div 
                                          className={`w-full h-full rounded-t-lg transition-all duration-500 ${
                                            isCurrentMonth 
                                              ? 'bg-[#881337] hover:bg-[#6b0f2b]' 
                                              : 'bg-[#B91C1C]/15 group-hover:bg-[#B91C1C]/35'
                                          }`}
                                        />
                                      </div>
                                      {/* Month Label */}
                                      <span className="text-[10px] font-bold text-[#6B7280] mt-2 uppercase">{d.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Card 2: Revenue This Week */}
                            <div className="bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm space-y-6">
                              <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
                                <div>
                                  <h3 className="text-sm font-bold text-primary font-poppins uppercase tracking-wider font-poppins">Revenue This Week <span className="text-[#B91C1C] ml-1">{(() => {
                                    const d = new Date();
                                    d.setHours(0, 0, 0, 0);
                                    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
                                    const week1 = new Date(d.getFullYear(), 0, 4);
                                    const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
                                    return `(Week ${weekNum} of ${d.getFullYear()})`;
                                  })()}</span></h3>
                                  <div className="flex items-baseline gap-2 mt-1">
                                    <span className="text-xs text-on-surface-variant">₹{totalWeeklyRevenue.toLocaleString()} total</span>
                                  </div>
                                </div>
                              </div>

                              {/* Bar Chart Container */}
                              <div className="h-56 flex items-end justify-between gap-1 pt-6 px-2">
                                {weeklyTrend.map((d, idx) => {
                                  const heightPercent = maxWeeklyVal > 0 ? (d.value / maxWeeklyVal) * 100 : 0;
                                  const dayOfWeek = (new Date().getDay() || 7) - 1; // 0 for Mon
                                  const isCurrentDay = dayOfWeek === idx;
                                  return (
                                    <div key={idx} className="flex flex-col items-center flex-grow h-full justify-end">
                                      <div className="relative w-full max-w-[28px] group flex flex-col justify-end items-center cursor-pointer" style={{ height: `${Math.max(4, heightPercent)}%` }}>
                                        {/* Tooltip on Hover */}
                                        <div className="absolute bottom-full mb-2 bg-primary text-white text-[10px] font-bold py-1 px-2 rounded shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                          ₹{d.value.toLocaleString()}
                                        </div>
                                        
                                        {/* Optional max marker */}
                                        {d.value > 0 && d.value === maxWeeklyVal && (
                                          <span className="text-[8px] font-bold text-[#EA580C] absolute bottom-full mb-1">Max</span>
                                        )}

                                        {/* The Bar */}
                                        <div 
                                          className={`w-full h-full rounded-t-lg transition-all duration-500 ${
                                            isCurrentDay
                                              ? 'bg-[#881337] hover:bg-[#6b0f2b]' 
                                              : 'bg-[#D5CBAE] group-hover:bg-[#C5BBAE]'
                                          }`}
                                        />
                                      </div>
                                      {/* Day Label */}
                                      <span className="text-[10px] font-bold text-[#6B7280] mt-2 uppercase">{d.label}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Right Column: Order Source & Top Items */}
                          <div className="lg:col-span-4 space-y-6">
                            {/* Order Source Split */}
                            <div className="bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm space-y-4">
                              <div className="pb-2 border-b border-outline-variant/10">
                                <h3 className="text-sm font-bold text-primary font-poppins uppercase tracking-wider">Order Source</h3>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold text-primary">
                                    <span className="text-red-600">OFFLINE</span>
                                    <span>{offlineBillsCount}</span>
                                  </div>
                                  <div className="w-full bg-[#FAF9F6] h-2 rounded-full overflow-hidden border border-outline-variant/10">
                                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${completedBillsCount > 0 ? (offlineBillsCount / completedBillsCount) * 100 : 0}%` }} />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold text-primary">
                                    <span className="text-green-600">ONLINE</span>
                                    <span>{onlineBillsCount}</span>
                                  </div>
                                  <div className="w-full bg-[#FAF9F6] h-2 rounded-full overflow-hidden border border-outline-variant/10">
                                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${completedBillsCount > 0 ? (onlineBillsCount / completedBillsCount) * 100 : 0}%` }} />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Top Items by Revenue */}
                            <div className="bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm space-y-4">
                              <div className="pb-2 border-b border-[#E5E7EB]">
                                <h3 className="text-sm font-bold text-primary font-poppins uppercase tracking-wider">Top Items by Revenue</h3>
                              </div>
                              <div className="space-y-4">
                                {topItemsList.slice(0, 3).map((item, idx) => {
                                  const totalTopRev = topItemsList.reduce((sum, it) => sum + it.revenue, 0) || 1;
                                  const pct = (item.revenue / totalTopRev) * 100;
                                  return (
                                    <div key={idx} className="space-y-1">
                                      <div className="flex justify-between text-xs font-bold">
                                        <div className="flex gap-2 text-primary items-center">
                                          <span className="text-[10px] text-gray-400 font-extrabold w-4">{idx + 1}</span>
                                          <span className="truncate max-w-[120px]">{item.name}</span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                          <span className="text-primary">₹{item.revenue.toLocaleString()}</span>
                                          <span className="text-[10px] text-gray-500 font-medium">{item.qty} pcs</span>
                                        </div>
                                      </div>
                                      <div className="w-full bg-[#FAF9F6] h-1.5 rounded-full overflow-hidden border border-[#E5E7EB]">
                                        <div className="bg-red-700 h-full rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                                {topItemsList.length === 0 && (
                                  <div className="text-center text-xs text-gray-400 italic py-4">No item sales found</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render Today's Sales subtab
                  if (analyticsSubTab === 'today') {
                    const todayDateStr = new Date().toDateString();
                    const todayOrdersAll = orders.filter(o => 
                      (o.id.startsWith('POS-') || o.id.startsWith('INV-')) && 
                      new Date(o.createdAt).toDateString() === todayDateStr
                    );
                    
                    const todaySalesVal = todayOrdersAll.reduce((sum, o) => sum + o.totalPrice, 0);
                    const todayBillsCount = todayOrdersAll.length;
                    const todayItemsSoldCount = todayOrdersAll.reduce((sum, o) => {
                      return sum + o.items.reduce((itemSum: any, it: any) => itemSum + it.quantity, 0);
                    }, 0);
                    const todayAvgOrderValue = todayBillsCount > 0 ? Math.round(todaySalesVal / todayBillsCount) : 0;

                    const todayOfflineVal = todayOrdersAll
                      .filter(o => getSourceOfOrder(o) === 'OFFLINE')
                      .reduce((sum, o) => sum + o.totalPrice, 0);
                    const todayOnlineVal = todayOrdersAll
                      .filter(o => getSourceOfOrder(o) === 'ONLINE')
                      .reduce((sum, o) => sum + o.totalPrice, 0);

                    const todayTopItems = getTopItemsByRevenue(todayOrdersAll).slice(0, 3);

                    // Filtered transactions for Today's Transactions table
                    const filteredTodayOrders = todayOrdersAll.filter(o => {
                      if (analyticsTodaySearchPhone.trim()) {
                        return o.customerPhone.includes(analyticsTodaySearchPhone.trim());
                      }
                      return true;
                    });

                    const cards = [
                      { title: "Today's Revenue", value: `₹${todaySalesVal.toLocaleString()}`, subtext: 'Completed today', icon: Receipt, bg: 'bg-[#ECFDF5]', fg: 'text-[#10B981]' },
                      { title: "Today's Bills", value: `${todayBillsCount}`, subtext: 'Completed today', icon: CheckCircle2, bg: 'bg-[#EFF6FF]', fg: 'text-[#3B82F6]' },
                      { title: "Today's Items Sold", value: `${todayItemsSoldCount} pcs`, subtext: 'Quantity sold today', icon: Package, bg: 'bg-[#F3E8FF]', fg: 'text-[#A855F7]' },
                      { title: "Today's Avg Order Value", value: `₹${todayAvgOrderValue.toLocaleString()}`, subtext: 'Per invoice today', icon: TrendingUp, bg: 'bg-[#FFF7ED]', fg: 'text-[#EA580C]' },
                    ];

                    return (
                      <div className="space-y-8">
                        {/* 4 cards row */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          {cards.map((c, i) => (
                            <div key={i} className="bg-white border border-outline-variant/20 rounded-2xl p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-primary/25 transition-all">
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">{c.title}</span>
                                  <span className="block text-xl font-extrabold text-primary font-poppins">{c.value}</span>
                                </div>
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${c.bg}`}>
                                  <c.icon className={`w-4 h-4 ${c.fg}`} />
                                </div>
                              </div>
                              <div className="text-[10px] font-semibold text-on-surface-variant/80 border-t border-outline-variant/10 pt-2">
                                <span>{c.subtext}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Transactions and channel split row */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                          {/* Left column: Today's Transactions */}
                          <div className="lg:col-span-8 bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/10">
                              <h3 className="text-sm font-bold text-primary font-poppins uppercase tracking-wider font-poppins">Today's Transactions</h3>
                              <div className="relative w-full sm:w-60">
                                <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                                <input
                                  type="text"
                                  placeholder="Search contact no..."
                                  value={analyticsTodaySearchPhone}
                                  onChange={(e) => setAnalyticsTodaySearchPhone(e.target.value)}
                                  className="w-full pl-9 pr-4 py-1.5 bg-[#FAF9F6] border border-outline-variant/35 rounded-xl text-xs focus:outline-none text-[#1F2937] font-semibold"
                                />
                              </div>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs border-collapse">
                                <thead>
                                  <tr className="border-b border-[#E5E7EB] text-[#6B7280] uppercase font-bold text-[10px] tracking-wider bg-[#FAF9F6]/50">
                                    <th className="py-3 px-4">Invoice ID</th>
                                    <th className="py-3 px-4">Customer No</th>
                                    <th className="py-3 px-4">Source</th>
                                    <th className="py-3 px-4">Items</th>
                                    <th className="py-3 px-4 text-right">Grand Total</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {filteredTodayOrders.map((o, idx) => {
                                    const src = getSourceOfOrder(o);
                                    const itemCount = o.items.reduce((sum: any, it: any) => sum + it.quantity, 0);
                                    return (
                                      <tr key={idx} className="border-b border-[#F3F4F6] hover:bg-[#FAF9F6]/30 font-semibold text-primary">
                                        <td className="py-3.5 px-4 font-mono font-bold text-[#2B3E2F]">{o.id}</td>
                                        <td className="py-3.5 px-4">{o.customerPhone.split('_')[0]}</td>
                                        <td className="py-3.5 px-4">
                                          <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                                            src === 'OFFLINE' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
                                          }`}>
                                            {src}
                                          </span>
                                        </td>
                                        <td className="py-3.5 px-4">{itemCount} pcs</td>
                                        <td className="py-3.5 px-4 text-right font-extrabold text-[#111827]">₹{o.totalPrice.toLocaleString()}</td>
                                      </tr>
                                    );
                                  })}
                                  {filteredTodayOrders.length === 0 && (
                                    <tr>
                                      <td colSpan={5} className="py-10 text-center text-gray-400 italic">No transactions found for today.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Right column: Today's channel split & Today's top items */}
                          <div className="lg:col-span-4 space-y-6">
                            {/* Today's Channel Split */}
                            <div className="bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm space-y-4">
                              <div className="pb-2 border-b border-outline-variant/10">
                                <h3 className="text-sm font-bold text-primary font-poppins uppercase tracking-wider font-poppins">Today's Channel Split</h3>
                              </div>
                              <div className="space-y-4">
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-red-600 font-bold">OFFLINE</span>
                                    <span className="text-primary">₹{todayOfflineVal.toLocaleString()}</span>
                                  </div>
                                  <div className="w-full bg-[#FAF9F6] h-2 rounded-full overflow-hidden border border-[#E5E7EB]">
                                    <div className="bg-red-500 h-full rounded-full" style={{ width: `${todaySalesVal > 0 ? (todayOfflineVal / todaySalesVal) * 100 : 0}%` }} />
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs font-bold">
                                    <span className="text-green-600 font-bold">ONLINE</span>
                                    <span className="text-primary">₹{todayOnlineVal.toLocaleString()}</span>
                                  </div>
                                  <div className="w-full bg-[#FAF9F6] h-2 rounded-full overflow-hidden border border-[#E5E7EB]">
                                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${todaySalesVal > 0 ? (todayOnlineVal / todaySalesVal) * 100 : 0}%` }} />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Today's Top Items */}
                            <div className="bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm space-y-4">
                              <div className="pb-2 border-b border-[#E5E7EB]">
                                <h3 className="text-sm font-bold text-primary font-poppins uppercase tracking-wider font-poppins">Today's Top Items</h3>
                              </div>
                              <div className="space-y-4">
                                {todayTopItems.map((item, idx) => {
                                  const totalTodayTop = todayTopItems.reduce((sum, it) => sum + it.revenue, 0) || 1;
                                  const pct = (item.revenue / totalTodayTop) * 100;
                                  return (
                                    <div key={idx} className="space-y-1">
                                      <div className="flex justify-between text-xs font-bold">
                                        <div className="flex gap-2 text-primary items-center">
                                          <span className="text-[10px] text-gray-400 font-extrabold w-4">{idx + 1}</span>
                                          <span className="truncate max-w-[120px]">{item.name}</span>
                                        </div>
                                        <div className="flex gap-2 items-center">
                                          <span className="text-primary">₹{item.revenue.toLocaleString()}</span>
                                          <span className="text-[10px] text-gray-500 font-medium">{item.qty} pcs</span>
                                        </div>
                                      </div>
                                      <div className="w-full bg-[#FAF9F6] h-1.5 rounded-full overflow-hidden border border-[#E5E7EB]">
                                        <div className="bg-red-700 h-full rounded-full" style={{ width: `${pct}%` }} />
                                      </div>
                                    </div>
                                  );
                                })}
                                {todayTopItems.length === 0 && (
                                  <div className="text-center text-xs text-gray-400 italic py-4">No sales recorded today</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Render Products subtab
                  if (analyticsSubTab === 'products') {
                    const totalRevPeriod = topItemsList.reduce((sum, it) => sum + it.revenue, 0) || 1;
                    return (
                      <div className="bg-white border border-outline-variant/20 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="pb-3 border-b border-outline-variant/10">
                          <h3 className="text-sm font-bold text-primary font-poppins uppercase tracking-wider font-poppins">Product Sales Leaderboard</h3>
                        </div>

                        {/* Leaderboard Table */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[#E5E7EB] text-[#6B7280] uppercase font-bold text-[10px] tracking-wider bg-[#FAF9F6]/50">
                                <th className="py-3 px-4 w-16">Rank</th>
                                <th className="py-3 px-4">Product Name</th>
                                <th className="py-3 px-4 w-32">Qty Sold</th>
                                <th className="py-3 px-4 w-36 text-right">Revenue</th>
                                <th className="py-3 px-4 w-60">Market Share</th>
                              </tr>
                            </thead>
                            <tbody>
                              {topItemsList.map((item, idx) => {
                                const pct = (item.revenue / totalRevPeriod) * 100;
                                return (
                                  <tr key={idx} className="border-b border-[#F3F4F6] hover:bg-[#FAF9F6]/30 font-semibold text-primary">
                                    <td className="py-4 px-4 font-bold text-gray-400">{idx + 1}</td>
                                    <td className="py-4 px-4 font-bold">{item.name}</td>
                                    <td className="py-4 px-4">{item.qty} pcs</td>
                                    <td className="py-4 px-4 text-right font-extrabold text-primary">₹{item.revenue.toLocaleString()}</td>
                                    <td className="py-4 px-4">
                                      <div className="flex items-center gap-3">
                                        <div className="flex-grow bg-[#FAF9F6] h-2 rounded-full overflow-hidden border border-[#E5E7EB]">
                                          <div className="bg-red-700 h-full rounded-full" style={{ width: `${pct}%` }} />
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-500 w-10 text-right">{pct.toFixed(1)}%</span>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                              {topItemsList.length === 0 && (
                                <tr>
                                  <td colSpan={5} className="py-10 text-center text-gray-400 italic">No products sold in this period.</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }

                  // Render Coupons subtab
                  if (analyticsSubTab === 'coupons') {
                    const totalDiscountsGiven = analyticsBills.reduce((sum, o) => sum + (o.couponDiscount || 0) + (o.manualDiscount || 0), 0);
                    const discountedOrdersCount = analyticsBills.filter(o => (o.couponDiscount || 0) > 0 || (o.manualDiscount || 0) > 0).length;
                    const avgDiscountPerOrder = discountedOrdersCount > 0 ? Math.round(totalDiscountsGiven / discountedOrdersCount) : 0;

                    const promoCampaignOrders = analyticsBills.filter(o => (o.couponDiscount || 0) > 0 || (o.manualDiscount || 0) > 0);

                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Left column: Discount Summary */}
                        <div className="lg:col-span-4 space-y-4">
                          <div className="bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
                            <h3 className="text-sm font-bold text-primary font-poppins uppercase tracking-wider pb-2 border-b border-[#E5E7EB] font-poppins">Discount Summary</h3>
                            
                            {/* Stat 1 */}
                            <div className="bg-[#FAF9F6]/50 border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-between space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Total Discounts Given</span>
                                  <span className="block text-xl font-extrabold text-primary font-poppins mt-1">₹{totalDiscountsGiven.toLocaleString()}</span>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 text-sm font-bold">%</div>
                              </div>
                            </div>

                            {/* Stat 2 */}
                            <div className="bg-[#FAF9F6]/50 border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-between space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Discounted Orders</span>
                                  <span className="block text-xl font-extrabold text-primary font-poppins mt-1">{discountedOrdersCount}</span>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-sm font-bold">🎫</div>
                              </div>
                            </div>

                            {/* Stat 3 */}
                            <div className="bg-[#FAF9F6]/50 border border-[#E5E7EB] rounded-2xl p-4 flex flex-col justify-between space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="block text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Avg Discount Per Order</span>
                                  <span className="block text-xl font-extrabold text-primary font-poppins mt-1">₹{avgDiscountPerOrder.toLocaleString()}</span>
                                </div>
                                <div className="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center text-green-600 text-sm font-bold">₹</div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Right column: Promo Campaign Performance */}
                        <div className="lg:col-span-8 bg-white border border-[#E5E7EB] rounded-3xl p-6 shadow-sm space-y-4">
                          <div className="pb-3 border-b border-[#E5E7EB]">
                            <h3 className="text-sm font-bold text-primary font-poppins uppercase tracking-wider font-poppins">Promo Campaign Performance</h3>
                          </div>
                          
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse">
                              <thead>
                                <tr className="border-b border-[#E5E7EB] text-[#6B7280] uppercase font-bold text-[10px] tracking-wider bg-[#FAF9F6]/50">
                                  <th className="py-3 px-4">Transaction ID</th>
                                  <th className="py-3 px-4">Customer</th>
                                  <th className="py-3 px-4 text-right">Order Total</th>
                                  <th className="py-3 px-4 text-right">Discount Applied</th>
                                </tr>
                              </thead>
                              <tbody>
                                {promoCampaignOrders.map((o, idx) => {
                                  const discAmt = (o.couponDiscount || 0) + (o.manualDiscount || 0);
                                  return (
                                    <tr key={idx} className="border-b border-[#F3F4F6] hover:bg-[#FAF9F6]/30 font-semibold text-primary">
                                      <td className="py-3.5 px-4 font-mono font-bold">{o.id}</td>
                                      <td className="py-3.5 px-4">{o.customerName}</td>
                                      <td className="py-3.5 px-4 text-right">₹{o.totalPrice.toLocaleString()}</td>
                                      <td className="py-3.5 px-4 text-right text-red-600 font-extrabold">-₹{discAmt.toLocaleString()}</td>
                                    </tr>
                                  );
                                })}
                                {promoCampaignOrders.length === 0 && (
                                  <tr>
                                    <td colSpan={4} className="py-10 text-center text-gray-400 italic">No discounted orders found in this period.</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return null;
                })()}
              </div>
            )}

            {/* TAB: GIFTS RECEIVED */}
            {activeTab === 'orders' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Orders List */}
                <div className="lg:col-span-7 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h1 className="text-3xl font-bold tracking-tight text-primary font-poppins">Billing & Invoice Hub</h1>
                      <p className="text-sm text-on-surface-variant mt-1 font-medium">
                        Filter POS sales records, track offline/online sources, and manage transactions.
                      </p>
                    </div>
                    <button
                      onClick={handleExportCSV}
                      className="bg-[#2B3E2F] hover:bg-[#1b2b20] text-white font-body text-xs font-bold tracking-widest uppercase py-3.5 px-6 rounded-full flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>

                  {/* Filter controls row 1: Source classification */}
                  <div className="flex flex-wrap gap-2">
                    {(['ALL', 'OFFLINE', 'ONLINE', 'MANUAL'] as const).map(src => (
                      <button
                        key={src}
                        onClick={() => setOrdersSourceFilter(src)}
                        className={`text-xs font-bold py-2 px-4 rounded-full transition-all cursor-pointer ${
                          ordersSourceFilter === src
                            ? 'bg-[#2B3E2F] text-white shadow-sm'
                            : 'bg-white border border-outline-variant/35 text-primary hover:bg-[#FAF9F5]'
                        }`}
                      >
                        {src === 'ALL' ? 'All Bills' : src === 'OFFLINE' ? 'Offline' : src === 'ONLINE' ? 'Online' : 'Manual'}
                      </button>
                    ))}
                  </div>

                  {/* Filter controls row 2: Date presets */}
                  <div className="flex flex-wrap items-center gap-2">
                    {(['TODAY', 'WEEK', 'MONTH', 'CUSTOM'] as const).map(dt => (
                      <button
                        key={dt}
                        onClick={() => setOrdersDateFilter(dt)}
                        className={`text-xs font-bold py-2 px-4 rounded-full transition-all cursor-pointer ${
                          ordersDateFilter === dt
                            ? 'bg-[#2B3E2F] text-white shadow-sm'
                            : 'bg-white border border-outline-variant/35 text-primary hover:bg-[#FAF9F5]'
                        }`}
                      >
                        {dt === 'TODAY' ? 'Today' : dt === 'WEEK' ? 'This Week' : dt === 'MONTH' ? 'This Month' : 'Custom Range'}
                      </button>
                    ))}
                    
                    {(ordersDateFilter !== 'ALL' || ordersStartDate || ordersEndDate || ordersSearchInvoice || ordersSearchName || ordersSearchPhone) && (
                      <button
                        onClick={() => {
                          setOrdersSourceFilter('ALL');
                          setOrdersDateFilter('ALL');
                          setOrdersSearchInvoice('');
                          setOrdersSearchName('');
                          setOrdersSearchPhone('');
                          setOrdersStartDate('');
                          setOrdersEndDate('');
                        }}
                        className="text-xs font-bold text-red-600 hover:text-red-800 transition-colors cursor-pointer ml-2"
                      >
                        Clear Dates
                      </button>
                    )}
                  </div>

                  {/* Filter controls row 3: Search inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#FAF9F6]/40 p-4 rounded-2xl border border-outline-variant/15">
                    {/* Invoice/Bill No */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-[#4B5563] uppercase tracking-wider">Invoice / Bill No</label>
                      <input
                        type="text"
                        placeholder="Invoice / Bill No"
                        value={ordersSearchInvoice}
                        onChange={(e) => setOrdersSearchInvoice(e.target.value)}
                        className="w-full bg-white border border-outline-variant/35 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold"
                      />
                    </div>
                    
                    {/* Customer Name */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-[#4B5563] uppercase tracking-wider">Customer Name</label>
                      <input
                        type="text"
                        placeholder="Customer Name"
                        value={ordersSearchName}
                        onChange={(e) => setOrdersSearchName(e.target.value)}
                        className="w-full bg-white border border-outline-variant/35 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold"
                      />
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-[#4B5563] uppercase tracking-wider">Mobile Number</label>
                      <input
                        type="text"
                        placeholder="Mobile Number"
                        value={ordersSearchPhone}
                        onChange={(e) => setOrdersSearchPhone(e.target.value)}
                        className="w-full bg-white border border-outline-variant/35 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold"
                      />
                    </div>
                  </div>

                  {/* Custom range date picker (shown only when CUSTOM is active) */}
                  {ordersDateFilter === 'CUSTOM' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#FAF9F6]/40 p-4 rounded-2xl border border-outline-variant/15 mt-2">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#4B5563] uppercase tracking-wider">Start Date</label>
                        <input
                          type="date"
                          value={ordersStartDate}
                          onChange={(e) => setOrdersStartDate(e.target.value)}
                          className="w-full bg-white border border-outline-variant/35 rounded-xl px-3 py-1.5 text-xs text-primary font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-[#4B5563] uppercase tracking-wider">End Date</label>
                        <input
                          type="date"
                          value={ordersEndDate}
                          onChange={(e) => setOrdersEndDate(e.target.value)}
                          className="w-full bg-white border border-outline-variant/35 rounded-xl px-3 py-1.5 text-xs text-primary font-semibold focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Bills List Table */}
                  <div className="bg-white border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
                    {filteredBills.length === 0 ? (
                      <div className="p-12 text-center text-on-surface-variant text-sm italic">
                        No billing records found matching the active filters.
                      </div>
                    ) : (
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-sm min-w-[800px]">
                          <thead>
                          <tr className="bg-surface-container-low text-primary font-bold border-b border-outline-variant/25">
                            <th className="px-6 py-4">Bill ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Source</th>
                            <th className="px-6 py-4">Total</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {filteredBills.map(o => {
                            const src = o.source || (o.items.some((it: any) => it.productId === 'custom') ? 'MANUAL' : (o.customerAddress.includes('Offline') ? 'OFFLINE' : 'ONLINE'));
                            return (
                              <tr 
                                key={o.id} 
                                className={`hover:bg-[#FAF9F5]/40 transition-colors cursor-pointer ${
                                  selectedOrder && selectedOrder.id === o.id ? 'bg-[#2B3E2F]/5' : ''
                                }`}
                                onClick={() => setSelectedOrder(o)}
                              >
                                <td className="px-6 py-4 font-bold text-primary">{o.id}</td>
                                <td className="px-6 py-4">
                                  <div className="font-semibold">{o.customerName}</div>
                                  <div className="text-xs text-on-surface-variant mt-0.5">{o.customerPhone.split('_')[0]}</div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                                    src === 'MANUAL' 
                                      ? 'bg-purple-50 text-purple-700 border border-purple-200' 
                                      : src === 'OFFLINE' 
                                      ? 'bg-[#FAF9F5] text-[#2B3E2F] border border-[#2B3E2F]/20' 
                                      : 'bg-amber-50 text-amber-800 border border-amber-200'
                                  }`}>
                                    {src}
                                  </span>
                                </td>
                                <td className="px-6 py-4 font-bold text-primary">₹{o.totalPrice}</td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                                    o.status === 'Completed'
                                      ? 'bg-green-50 text-green-700 border-green-200'
                                      : o.status === 'Processing'
                                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                                      : o.status === 'Cancelled'
                                      ? 'bg-red-50 text-red-700 border-red-200'
                                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                  }`}>
                                    {o.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                  <Eye className="w-5 h-5 text-on-surface-variant hover:text-primary ml-auto transition-colors" />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details Panel */}
                <div className="lg:col-span-5">
                  <AnimatePresence mode="wait">
                    {selectedOrder ? (
                      <motion.div
                        key={selectedOrder.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="bg-white border border-outline-variant/20 rounded-2xl p-8 shadow-md space-y-6 sticky top-4"
                      >
                        <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                          <div>
                            <h4 className="text-lg font-bold text-primary">{selectedOrder.id}</h4>
                            <span className="text-xs text-on-surface-variant">
                              Placed: {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                            </span>
                          </div>
                        </div>

                        {/* Customer Details */}
                        <div className="space-y-3 bg-[#FAF9F5] p-5 rounded-xl border border-outline-variant/20">
                          <span className="block text-xs font-bold text-primary uppercase tracking-wider">Shipping details</span>
                          <div className="space-y-2 text-sm text-primary">
                            <div className="font-bold">{selectedOrder.customerName}</div>
                            <div>Phone: {selectedOrder.customerPhone.split('_')[0]}</div>
                            <div>Email: {selectedOrder.customerEmail}</div>
                            <div className="text-on-surface-variant italic leading-relaxed pt-2 border-t border-outline-variant/10 mt-2">
                              {selectedOrder.customerAddress}
                            </div>
                          </div>
                        </div>

                        {/* Items Purchased */}
                        <div className="space-y-4">
                          <span className="block text-xs font-bold text-primary uppercase tracking-wider">Items Summary</span>
                          <div className="space-y-3.5">
                            {selectedOrder.items.map((it: any, idx: any) => (
                              <div key={idx} className="flex justify-between items-center text-sm text-primary">
                                <div>
                                  <span className="font-bold">{it.name}</span>
                                  <div className="text-xs text-on-surface-variant mt-0.5">{it.size} × {it.quantity}</div>
                                </div>
                                <span className="font-semibold">₹{it.price * it.quantity}</span>
                              </div>
                            ))}
                          </div>
                          <div className="border-t border-outline-variant/20 pt-5 space-y-2.5">
                            {(() => {
                              const subtotal = selectedOrder.items.reduce((sum: any, it: any) => sum + (it.price * it.quantity), 0);
                              const couponDisc = selectedOrder.couponDiscount || 0;
                              const manualDisc = selectedOrder.manualDiscount || 0;
                              const delivFee = selectedOrder.deliveryCharge || 0;
                              const cashRec = selectedOrder.cashReceived || 0;
                              const changeRet = selectedOrder.changeReturned || 0;

                              return (
                                <>
                                  <div className="flex justify-between text-xs text-on-surface-variant font-semibold">
                                    <span>Subtotal:</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                  </div>
                                  {(couponDisc > 0 || selectedOrder.couponCode) && (
                                    <div className="flex justify-between text-xs text-green-700 font-bold">
                                      <span>Coupon Discount ({selectedOrder.couponCode || 'Promo'}):</span>
                                      <span>-₹{couponDisc.toFixed(2)}</span>
                                    </div>
                                  )}
                                  {manualDisc > 0 && (
                                    <div className="flex justify-between text-xs text-green-700 font-bold">
                                      <span>Manual Discount:</span>
                                      <span>-₹{manualDisc.toFixed(2)}</span>
                                    </div>
                                  )}
                                  {delivFee > 0 && (
                                    <div className="flex justify-between text-xs text-on-surface-variant font-semibold">
                                      <span>Delivery Fee:</span>
                                      <span>₹{delivFee.toFixed(2)}</span>
                                    </div>
                                  )}
                                  <div className="border-t border-dashed border-outline-variant/20 pt-3.5 flex justify-between items-center text-base font-extrabold text-primary">
                                    <span>Grand Total:</span>
                                    <span>₹{selectedOrder.totalPrice.toFixed(2)}</span>
                                  </div>
                                  {cashRec > 0 && (
                                    <div className="border-t border-outline-variant/10 pt-2.5 space-y-1.5 bg-[#FAF9F5] p-3 rounded-lg border border-outline-variant/10">
                                      <div className="flex justify-between text-xs text-on-surface-variant font-semibold">
                                        <span>Cash Paid:</span>
                                        <span>₹{cashRec.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between text-xs text-green-700 font-extrabold">
                                        <span>Change Return:</span>
                                        <span>₹{changeRet.toFixed(2)}</span>
                                      </div>
                                    </div>
                                  )}
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="bg-white border border-outline-variant/20 rounded-2xl p-12 text-center text-on-surface-variant text-sm italic">
                        Select an order from the list to manage customer details, address logs, and delivery status.
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* TAB 5: INVENTORY (PRODUCTS) */}
            {activeTab === 'products' && (
              <div className="space-y-8">
                
                {/* List Products View */}
                {!isAddingProduct && !editingProduct ? (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="text-3xl font-bold tracking-tight text-primary">Inventory Manager</h1>
                        <p className="text-sm text-on-surface-variant mt-1">Maintain formulation names, botanical ingredients, size configurations, and price lists.</p>
                      </div>
                      <button
                        onClick={startAddProduct}
                        className="bg-secondary hover:bg-secondary-container text-white font-body text-xs font-bold tracking-widest uppercase py-3.5 px-6 rounded-full flex items-center gap-1.5 shadow transition-colors cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Product
                      </button>
                    </div>

                    <div className="bg-white border border-outline-variant/20 rounded-3xl overflow-hidden shadow-md">
                      {/* Search Bar */}
                      <div className="p-4 border-b border-outline-variant/20 bg-[#FAF9F5]/30 flex justify-between items-center">
                        <div className="relative w-full max-w-md">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search products by name..."
                            value={productsSearch}
                            onChange={(e) => setProductsSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-outline-variant/35 rounded-xl text-sm focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold"
                          />
                        </div>
                        <span className="text-xs font-bold text-on-surface-variant bg-white px-3 py-1.5 rounded-lg border border-outline-variant/20 hidden sm:block">
                          {products.filter(p => p.name.toLowerCase().includes(productsSearch.toLowerCase())).length} formulations
                        </span>
                      </div>

                      <table className="w-full text-left text-sm min-w-[700px]">
                        <thead>
                          <tr className="bg-surface-container-low text-primary font-bold border-b border-outline-variant/25">
                            <th className="px-6 py-5">Product Details</th>
                            <th className="px-6 py-5">Category</th>
                            <th className="px-6 py-5">Size Packs & Prices</th>
                            <th className="px-6 py-5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/10">
                          {products
                            .filter(p => p.name.toLowerCase().includes(productsSearch.toLowerCase()))
                            .map(p => (
                            <tr key={p.id} className="hover:bg-[#FAF9F5]/40 transition-colors">
                              <td className="px-6 py-5 max-w-md">
                                <div className="flex items-center gap-4">
                                  <div className="w-16 h-16 shrink-0 bg-white border border-outline-variant/20 rounded-xl p-1.5 shadow-sm flex items-center justify-center">
                                    <img src={getProductImage(p.name, p.category, p.image, 'tile')} alt={p.name} onError={onImgError} className="w-full h-full object-contain mix-blend-multiply" />
                                  </div>
                                  <div>
                                    <div className="text-base font-bold text-primary">{p.name}</div>
                                    <div className="text-xs text-on-surface-variant mt-1.5 leading-relaxed line-clamp-2">{p.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-5">
                                <span className="inline-block whitespace-nowrap bg-primary/5 text-primary border border-primary/10 px-3 py-1.5 rounded-full font-semibold text-xs">
                                  {p.category}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <div className="flex flex-wrap gap-2">
                                  {p.sizes.map((s: any, idx: any) => (
                                    <span key={idx} className="bg-secondary/10 text-secondary border border-secondary/15 px-3 py-1 rounded text-xs font-bold">
                                      {s.size}: ₹{s.price}
                                    </span>
                                  ))}
                                </div>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <div className="flex justify-end gap-3">
                                  <button
                                    onClick={() => startEditProduct(p)}
                                    className="w-10 h-10 rounded-full border border-outline-variant/35 hover:border-primary flex items-center justify-center text-on-surface-variant hover:text-primary transition-all cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(p.id)}
                                    className="w-10 h-10 rounded-full border border-outline-variant/35 hover:border-error flex items-center justify-center text-on-surface-variant hover:text-error transition-all cursor-pointer"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* ADD / EDIT PRODUCT FORM VIEW */
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-outline-variant/20 rounded-3xl p-8 md:p-10 shadow-md space-y-8"
                  >
                    <div className="flex justify-between items-center border-b border-outline-variant/20 pb-4">
                      <h3 className="text-xl font-bold text-primary">
                        {editingProduct ? `Edit Formulation: ${editingProduct.name}` : 'Create New Formulation'}
                      </h3>
                      <button
                        onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                        className="text-xs font-bold text-on-surface-variant hover:underline cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>

                    <form onSubmit={saveProductSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Name */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-primary uppercase tracking-wider">Product Name</label>
                          <input
                            type="text"
                            value={prodName}
                            onChange={(e) => setProdName(e.target.value)}
                            className="w-full border border-outline-variant/40 rounded-xl py-3.5 px-4 text-xs text-primary focus:outline-none focus:border-secondary"
                            placeholder="e.g. Herbal Shikakai Powder"
                            required
                          />
                        </div>

                        {/* Product Image */}
                        <div className="space-y-3">
                          <label className="block text-xs font-bold text-primary uppercase tracking-wider">Product Image Upload</label>
                          
                          {/* Paste Zone */}
                          <div 
                            className="border-2 border-dashed border-outline-variant/40 rounded-xl p-6 text-center bg-[#FAF9F5]/30 hover:bg-[#FAF9F5] focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/50 cursor-pointer transition-all"
                            tabIndex={0}
                            onPaste={(e) => {
                              const items = e.clipboardData?.items;
                              if (!items) return;
                              for (let i = 0; i < items.length; i++) {
                                if (items[i].type.indexOf('image') !== -1) {
                                  const file = items[i].getAsFile();
                                  if (file) {
                                    setProdImageFile(file);
                                  }
                                  break;
                                }
                              }
                            }}
                          >
                            <span className="text-sm font-bold text-secondary">Click here and press Ctrl+V to paste image</span>
                            {prodImageFile && (
                              <div className="mt-3">
                                <span className="text-[11px] font-bold text-white bg-green-600 px-3 py-1.5 rounded-full inline-block shadow-sm">
                                  ✓ {prodImageFile.name || 'Pasted Image'} ready
                                </span>
                              </div>
                            )}
                          </div>
                          
                          {/* File Browser Fallback */}
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">OR BROWSE</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => setProdImageFile(e.target.files?.[0] || null)}
                              className="flex-1 border border-outline-variant/40 rounded-xl py-2 px-3 text-xs text-primary focus:outline-none focus:border-secondary file:mr-3 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                            />
                          </div>

                          {editingProduct?.image && !prodImageFile && (
                            <p className="text-[10px] text-gray-500 italic mt-1">Current image will be kept if no new file is uploaded.</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-primary uppercase tracking-wider">Category</label>
                          <select
                            value={prodCategory}
                            onChange={(e) => setProdCategory(e.target.value)}
                            className="w-full border border-outline-variant/40 rounded-xl py-3.5 px-4 text-xs text-primary focus:outline-none focus:border-secondary bg-white"
                          >
                            {categories.map((c, i) => (
                              <option key={i} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>

                        {/* Description (Card short description) */}
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-primary uppercase tracking-wider">Card Description (Short)</label>
                          <textarea
                            value={prodDesc}
                            onChange={(e) => setProdDesc(e.target.value)}
                            rows={4}
                            className="w-full border border-outline-variant/40 rounded-xl py-3.5 px-4 text-xs text-primary focus:outline-none focus:border-secondary"
                            placeholder="Describe the formulation's purpose and highlights..."
                            required
                          />
                        </div>
                      </div>


                      {(prodCategory === 'Nutrition' || prodName.toLowerCase().includes('wellness')) && (
                        <div className="grid grid-cols-1 gap-6">
                          <div className="space-y-2">
                            <label className="block text-xs font-bold text-primary uppercase tracking-wider">Nutritional Facts (One per line, e.g. Energy: 431 Kcal)</label>
                            <textarea
                              value={prodNutritionalInfo}
                              onChange={(e) => setProdNutritionalInfo(e.target.value)}
                              rows={4}
                              className="w-full border border-outline-variant/40 rounded-xl py-3.5 px-4 text-xs text-primary focus:outline-none focus:border-secondary"
                              placeholder="Energy: 431 Kcal&#10;Carbohydrates: 63.9 g..."
                            />
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 gap-6">
                        {/* Availability Toggle */}
                        <div className="space-y-2 flex flex-col justify-center pt-2">
                          <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-3">Inventory Status</label>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer"
                              checked={prodIsAvailable}
                              onChange={(e) => setProdIsAvailable(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-outline-variant/40 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#10B981]"></div>
                            <span className={`ml-4 text-sm font-bold tracking-wide ${prodIsAvailable ? 'text-[#10B981]' : 'text-error'}`}>
                              {prodIsAvailable ? 'IN STOCK' : 'OUT OF STOCK'}
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Sizes List manager */}
                      <div className="space-y-4 border-t border-outline-variant/20 pt-6">
                        <div className="flex justify-between items-center">
                          <label className="block text-xs font-bold text-primary uppercase tracking-wider">Pack Sizes & Pricing</label>
                          <button
                            type="button"
                            onClick={addSizeField}
                            className="text-secondary hover:text-secondary-container text-xs font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" /> Add Size Option
                          </button>
                        </div>

                        <div className="space-y-3">
                          {prodSizes.map((sizeObj, idx) => (
                            <div key={idx} className="flex gap-4 items-center">
                              <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
                                <input
                                  type="text"
                                  value={sizeObj.size}
                                  onChange={(e) => handleSizeChangeInForm(idx, 'size', e.target.value)}
                                  className="w-full border border-outline-variant/40 rounded-xl py-3 px-4 text-xs text-primary focus:outline-none focus:border-secondary font-semibold"
                                  placeholder="e.g. 100ml or 250g"
                                  required
                                />
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-primary">₹</span>
                                  <input
                                    type="number"
                                    value={sizeObj.price || ''}
                                    onChange={(e) => handleSizeChangeInForm(idx, 'price', e.target.value)}
                                    className="w-full border border-outline-variant/40 rounded-xl py-3 pl-8 pr-4 text-xs text-primary focus:outline-none focus:border-secondary font-semibold"
                                    placeholder="Price in INR"
                                    required
                                  />
                                </div>
                                <div className="flex items-center gap-3 bg-[#FAF9F5]/40 border border-outline-variant/30 rounded-xl px-4 py-2 select-none">
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={sizeObj.isAvailable !== false}
                                      onChange={(e) => handleSizeChangeInForm(idx, 'isAvailable', e.target.checked)}
                                      className="sr-only peer"
                                    />
                                    <div className="w-10 h-5 bg-outline-variant/40 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-gray-300 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                                  </label>
                                  <span className={`text-xs font-bold ${sizeObj.isAvailable !== false ? 'text-[#10B981]' : 'text-error'}`}>
                                    {sizeObj.isAvailable !== false ? 'In Stock' : 'Out of Stock'}
                                  </span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeSizeField(idx)}
                                disabled={prodSizes.length === 1}
                                className="w-10 h-10 rounded-full border border-outline-variant/30 hover:border-error flex items-center justify-center text-on-surface-variant hover:text-error disabled:opacity-40 disabled:hover:border-outline-variant/30 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-outline-variant/20 pt-6 flex justify-end gap-4">
                        <button
                          type="button"
                          onClick={() => { setEditingProduct(null); setIsAddingProduct(false); }}
                          className="border border-outline-variant/40 text-primary hover:bg-[#FAF9F5] text-xs font-bold tracking-widest uppercase py-4 px-8 rounded-full transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingProduct}
                          className={`flex items-center gap-2 bg-primary hover:bg-primary-container text-on-primary text-xs font-bold tracking-widest uppercase py-4 px-10 rounded-full shadow transition-colors ${isSavingProduct ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          {isSavingProduct ? (
                            <>
                              <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                            </>
                          ) : (
                            editingProduct ? 'Save Changes' : 'Create Product'
                          )}
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB 6: CATEGORIES MANAGER */}
            {activeTab === 'categories' && (
              <div className="space-y-8 max-w-3xl">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-primary">Categories</h1>
                  <p className="text-sm text-on-surface-variant mt-1">Organize catalog formulations into groups.</p>
                </div>

                <div className="bg-white border border-outline-variant/20 rounded-2xl p-6 shadow-sm space-y-6">
                  <form onSubmit={addCategory} className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Enter new category name..."
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="flex-grow border border-outline-variant/40 rounded-xl py-3 px-4 text-xs text-primary focus:outline-none focus:border-secondary"
                      required
                    />
                    <button
                      type="submit"
                      className="bg-primary hover:bg-primary-container text-on-primary text-xs font-bold px-6 py-3 rounded-xl uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add
                    </button>
                  </form>

                  <div className="space-y-3">
                    <span className="block text-xs font-bold text-primary uppercase tracking-wider">Active Categories</span>
                    <div className="divide-y divide-outline-variant/10">
                      {categories.map((c, i) => (
                        <div key={i} className="py-3.5 flex justify-between items-center">
                          <span className="font-semibold text-sm">{c}</span>
                          <button
                            onClick={() => deleteCategory(c)}
                            className="text-on-surface-variant hover:text-error transition-colors cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 7: COUPONS MANAGER */}
            {activeTab === 'coupons' && (
              <div className="space-y-6 max-w-6xl">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-primary font-poppins">Coupon Management</h1>
                </div>

                {/* Top Alert banner */}
                <div className="bg-[#EBF5FF] text-[#1E40AF] border border-[#BFDBFE] px-5 py-3 rounded-xl text-xs font-semibold">
                  Coupon discount applies to product subtotal only — not delivery charge.
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left Column: + New Coupon Form */}
                  <div className="lg:col-span-5 bg-white border border-outline-variant/20 rounded-2xl p-6 shadow-sm space-y-6">
                    <h3 className="text-sm font-bold text-primary uppercase tracking-wider font-poppins">
                      {editingCouponCode ? 'Edit Coupon' : '+ New Coupon'}
                    </h3>
                    
                    <form onSubmit={addCoupon} className="space-y-4">
                      {/* Coupon Code Input and Generate Button */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Coupon Code *</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. PILLOW"
                            value={newCouponCode}
                            onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                            className="flex-grow border border-outline-variant/35 rounded-xl py-3 px-4 text-xs text-primary focus:outline-none focus:border-primary uppercase font-bold"
                            required
                          />
                          <button
                            type="button"
                            onClick={handleGenerateCouponCode}
                            className="bg-[#2B3E2F] hover:bg-[#1E2B21] text-white text-[10px] font-bold px-4 py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Generate
                          </button>
                        </div>
                      </div>

                      {/* Discount % and Min Order in 2 columns */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Discount % *</label>
                          <input
                            type="number"
                            value={newCouponDiscount || ''}
                            onChange={(e) => setNewCouponDiscount(Number(e.target.value))}
                            className="w-full border border-outline-variant/35 rounded-xl py-3 px-4 text-xs text-primary focus:outline-none focus:border-primary font-semibold"
                            min={1}
                            max={100}
                            required
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Min Order (₹)</label>
                          <input
                            type="number"
                            value={newCouponMinOrder || ''}
                            onChange={(e) => setNewCouponMinOrder(Number(e.target.value))}
                            className="w-full border border-outline-variant/35 rounded-xl py-3 px-4 text-xs text-primary focus:outline-none focus:border-primary font-semibold"
                            min={0}
                            required
                          />
                        </div>
                      </div>

                      {/* Expiry Date and Usage Limit in 2 columns */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Expiry Date</label>
                          <input
                            type="date"
                            value={newCouponExpiryDate}
                            onChange={(e) => setNewCouponExpiryDate(e.target.value)}
                            className="w-full border border-outline-variant/35 rounded-xl py-2.5 px-4 text-xs text-primary focus:outline-none focus:border-primary font-semibold"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Usage Limit</label>
                          <input
                            type="number"
                            value={newCouponUsageLimit || ''}
                            onChange={(e) => setNewCouponUsageLimit(Number(e.target.value))}
                            className="w-full border border-outline-variant/35 rounded-xl py-3 px-4 text-xs text-primary focus:outline-none focus:border-primary font-semibold"
                            min={0}
                            required
                          />
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 flex gap-3">
                        {editingCouponCode && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCouponCode(null);
                              setNewCouponCode('');
                              setNewCouponDiscount(10);
                              setNewCouponMinOrder(1);
                              setNewCouponExpiryDate('');
                              setNewCouponUsageLimit(20);
                            }}
                            className="w-1/3 border border-outline-variant/40 hover:bg-[#FAF9F5] text-primary text-[10px] font-bold py-3 rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          type="submit"
                          className={`bg-[#2B3E2F] hover:bg-[#1E2B21] text-white text-[10px] font-bold py-3.5 rounded-xl uppercase tracking-wider transition-colors cursor-pointer ${
                            editingCouponCode ? 'w-2/3' : 'w-full'
                          }`}
                        >
                          {editingCouponCode ? 'Update Coupon' : 'Create Coupon'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: All Coupons List */}
                  <div className="lg:col-span-7 bg-white border border-outline-variant/20 rounded-2xl p-6 shadow-sm space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-outline-variant/10">
                      <h3 className="text-sm font-bold text-primary uppercase tracking-wider font-poppins">
                        All Coupons ({coupons.length})
                      </h3>
                      <button
                        onClick={handleRefresh}
                        className="text-xs text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1 cursor-pointer font-bold"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Refresh
                      </button>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                      {coupons.length === 0 ? (
                        <div className="p-8 text-center text-on-surface-variant text-xs italic">
                          No coupons configured yet.
                        </div>
                      ) : (
                        coupons.map((cp) => {
                          const expired = isCouponExpired(cp.expiryDate);
                          return (
                            <div
                              key={cp.code}
                              className="bg-[#FAF9F6]/50 border border-outline-variant/15 rounded-xl p-4 space-y-2 flex flex-col justify-between hover:bg-[#FAF9F6] transition-colors relative"
                            >
                              {/* Header info */}
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-primary text-base tracking-wide font-poppins">{cp.code}</span>
                                  <span 
                                    onClick={() => toggleCouponStatus(cp.code)}
                                    className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider cursor-pointer border ${
                                      cp.status === 'ACTIVE'
                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                                    }`}
                                  >
                                    {cp.status}
                                  </span>
                                </div>
                                <div className="flex gap-3 text-[10px] font-bold">
                                  <button
                                    onClick={() => startEditCoupon(cp)}
                                    className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => deleteCoupon(cp.code)}
                                    className="text-red-600 hover:text-red-800 transition-colors cursor-pointer"
                                  >
                                    Del
                                  </button>
                                </div>
                              </div>

                              {/* Details */}
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-primary">
                                  {cp.discount}% off <span className="text-on-surface-variant/70 font-medium">· min ₹{cp.minOrder}</span>
                                </div>
                                <div className="text-[11px] text-on-surface-variant flex flex-wrap items-center gap-1.5 font-medium">
                                  <span>Used {cp.usedCount} times</span>
                                  {cp.expiryDate && (
                                    <>
                                      <span>•</span>
                                      <span>expires {formatCouponExpiry(cp.expiryDate)}</span>
                                    </>
                                  )}
                                </div>
                              </div>

                              {/* Expired badge */}
                              {expired && (
                                <div className="text-[10px] font-bold text-red-600 uppercase tracking-wider mt-1">
                                  Expired
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 8: USERS MANAGER */}
            {activeTab === 'users' && (
              <div className="space-y-6 max-w-6xl text-left">
                {/* Header Title & Refresh */}
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/15">
                  <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-primary font-poppins">User Management</h1>
                    <p className="text-xs text-on-surface-variant font-medium mt-1">
                      Manage registered clients and promote store administrators
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      try {
                        const stored = await fetchProfiles();
                        setUsersList(stored);
                        alert('User list refreshed successfully!');
                      } catch (err) {
                        console.error(err);
                        alert('Failed to refresh user list');
                      }
                    }}
                    className="flex items-center gap-2 border border-outline-variant/35 hover:bg-[#FAF9F5] px-4 py-2.5 rounded-xl text-xs font-bold text-primary transition-all cursor-pointer bg-white shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4 text-primary" />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* Search Bar */}
                <div className="relative max-w-md">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/70">
                    <Search className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="w-full bg-white border border-outline-variant/35 rounded-xl pl-11 pr-4 py-3.5 text-xs focus:outline-none focus:border-primary transition-all text-[#1F2937] font-semibold shadow-sm"
                  />
                </div>

                {/* Users Table */}
                <div className="bg-white border border-outline-variant/20 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-[#FAF9F6]/80 text-[#374151] font-bold border-b border-outline-variant/25">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Mobile</th>
                        <th className="px-6 py-4">Joined</th>
                        <th className="px-6 py-4">Role</th>
                        <th className="px-6 py-4">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/10">
                      {usersList
                        .filter(u => 
                          u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
                        )
                        .map((u, i) => {
                          const dateObj = new Date(u.joinedDate);
                          const joinedFormatted = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;
                          
                          return (
                            <tr key={i} className="hover:bg-[#FAF9F5]/40 transition-colors">
                              <td className="px-6 py-4.5 font-bold text-primary text-sm">{u.name}</td>
                              <td className="px-6 py-4.5 text-on-surface-variant font-medium">{u.email}</td>
                              <td className="px-6 py-4.5 text-on-surface-variant font-bold">{u.mobile}</td>
                              <td className="px-6 py-4.5 text-on-surface-variant font-medium">{joinedFormatted}</td>
                              <td className="px-6 py-4.5">
                                {u.role === 'Admin' ? (
                                  <span className="bg-[#DCFCE7] text-[#166534] border border-[#BBF7D0] px-3 py-1.5 rounded-xl font-bold text-[10px] inline-flex items-center gap-1.5">
                                    <Shield className="w-3.5 h-3.5" />
                                    <span>Admin</span>
                                  </span>
                                ) : (
                                  <span className="bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB] px-3 py-1.5 rounded-xl font-bold text-[10px] inline-flex items-center gap-1.5">
                                    <Users className="w-3.5 h-3.5" />
                                    <span>Customer</span>
                                  </span>
                                )}
                              </td>
                              <td className="px-6 py-4.5">
                                {u.role === 'Admin' ? (
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Remove admin permissions from ${u.name}?`)) {
                                        try {
                                          await updateUserRole(u.id, 'Customer');
                                          setUsersList(usersList.map(item => 
                                            item.id === u.id ? { ...item, role: 'Customer' } : item
                                          ));
                                        } catch (err) {
                                          console.error(err);
                                          alert('Failed to update user role');
                                        }
                                      }
                                    }}
                                    className="border border-[#FECACA] hover:bg-[#FEF2F2] text-[#991B1B] bg-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Remove Admin</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Promote ${u.name} to store administrator?`)) {
                                        try {
                                          await updateUserRole(u.id, 'Admin');
                                          setUsersList(usersList.map(item => 
                                            item.id === u.id ? { ...item, role: 'Admin' } : item
                                          ));
                                        } catch (err) {
                                          console.error(err);
                                          alert('Failed to update user role');
                                        }
                                      }
                                    }}
                                    className="border border-[#86EFAC] hover:bg-[#F0FDF4] text-[#166534] bg-white px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>Make Admin</span>
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Admin Footer */}
            <div className="mt-auto pt-10 border-t border-outline-variant/20 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-gray-400 shrink-0">
              <div className="flex-1 text-left sm:text-left text-center">
                © 2026 Sri Organic. All Rights Reserved
              </div>
              <div className="flex-1 flex justify-center items-center gap-1.5">
                <span>Powered by</span>
                <a
                  href="https://cenexasystems.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-[#2B3E2F] transition-colors"
                >
                  Cenexa Systems
                </a>{" "}
                © 2026
              </div>
              <div className="flex-1 text-right sm:text-right text-center tracking-widest uppercase text-primary/70">
                Pure • Organic • Proven
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
