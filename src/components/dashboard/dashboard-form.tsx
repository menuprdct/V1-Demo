'use client';

import { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Image } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Modal } from '@/subComp/modal';

// Arabic translations configuration
const translations = {
  dashboard: {
    title: "لوحة تحكم الأطعمة",
    subtitle: "إدارة عناصر قائمة المطعم",
    addNewItem: "إضافة عنصر جديد",
    loading: "جاري تحميل العناصر...",
    totalItems: "إجمالي العناصر",
    categories: "الفئات", 
    averagePrice: "متوسط السعر",
    noItemsTitle: "لا توجد عناصر طعام حتى الآن",
    noItemsSubtitle: "ابدأ بإضافة أول عنصر في القائمة",
    addFirstItem: "إضافة أول عنصر"
  },
  form: {
    editTitle: "تعديل عنصر الطعام",
    addTitle: "إضافة عنصر طعام جديد",
    nameLabel: "الاسم",
    nameRequired: "*",
    namePlaceholder: "أدخل اسم العنصر",
    priceLabel: "السعر",
    priceRequired: "*",
    pricePlaceholder: "0.00",
    categoryLabel: "الفئة",
    categoryPlaceholder: "مثال: بيتزا، برجر، حلويات",
    imageUrlsLabel: "روابط الصور",
    imageUrlsPlaceholder: "https://example.com/image1.jpg, https://example.com/image2.jpg",
    imageUrlsHelp: "افصل بين عدة روابط بفواصل",
    cancel: "إلغاء",
    updateItem: "تحديث العنصر",
    updating: "جاري التحديث...",
    addItem: "إضافة عنصر",
    adding: "جاري الإضافة...",
    edit: "تعديل"
  },
  messages: {
    nameRequired: "الاسم مطلوب",
    priceRequired: "يجب أن يكون السعر أكبر من 0",
    fetchError: "فشل في جلب عناصر الطعام",
    updateError: "فشل في تحديث العنصر",
    updateSuccess: "تم تحديث العنصر بنجاح",
    addError: "فشل في إضافة العنصر", 
    addSuccess: "تم إضافة العنصر بنجاح",
    deleteConfirm: "هل أنت متأكد من حذف",
    deleteError: "فشل في حذف العنصر",
    deleteSuccess: "تم حذف العنصر بنجاح",
    unexpectedError: "حدث خطأ غير متوقع"
  }
};

// Get translation function
const t = (path: string): string => {
  const keys = path.split('.');
  let value: any = translations;
  
  for (const key of keys) {
    value = value[key];
    if (!value) return path; // Return path if translation not found
  }
  
  return value;
};

// Types based on your database schema
interface FoodItem {
  id: number;
  name: string;
  price: number;
  image_urls: string[] | null;
  category: string | null;
}

interface FormData {
  name: string;
  price: number;
  category: string;
  image_urls: string[];
}



export default function Dashboard() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  
  // Form states
  const [formData, setFormData] = useState<FormData>({
    name: '',
    price: 0,
    category: '',
    image_urls: []
  });

  // Fetch all food items from Supabase
  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = async (): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('food_items')
        .select('*')
        .order('id', { ascending: false });

      if (error) {
        console.error('Error fetching food items:', error);
        alert(t('messages.fetchError'));
      } else {
        setFoodItems(data || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(t('messages.unexpectedError'));
    } finally {
      setLoading(false);
    }
  };

  // Open edit modal with item data
  const openEditModal = (item: FoodItem): void => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price,
      category: item.category || '',
      image_urls: item.image_urls || []
    });
    setShowEditModal(true);
  };

  // Open add modal with empty form
  const openAddModal = (): void => {
    setEditingItem(null);
    setFormData({
      name: '',
      price: 0,
      category: '',
      image_urls: []
    });
    setShowAddModal(true);
  };

  // Close all modals and reset form
  const closeModals = (): void => {
    setShowEditModal(false);
    setShowAddModal(false);
    setEditingItem(null);
    setFormData({
      name: '',
      price: 0,
      category: '',
      image_urls: []
    });
    setSubmitting(false);
  };

  // Update form data with immediate state update
  const updateFormData = (field: keyof FormData, value: string | number | string[]): void => {
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      return newData;
    });
  };

  // Handle input change events specifically
  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const { value, type } = e.target;
    
    if (field === 'price') {
      const numValue = parseFloat(value) || 0;
      updateFormData(field, numValue);
    } else if (field === 'image_urls') {
      const urls = value.split(',').map(s => s.trim()).filter(Boolean);
      updateFormData(field, urls);
    } else {
      updateFormData(field, value);
    }
  };

  // Handle form submission
  const handleSubmit = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    
    if (!formData.name.trim()) {
      alert(t('messages.nameRequired'));
      return;
    }

    if (formData.price <= 0) {
      alert(t('messages.priceRequired'));
      return;
    }

    setSubmitting(true);
    
    const itemData = {
      name: formData.name.trim(),
      price: Number(formData.price),
      category: formData.category.trim() || null,
      image_urls: formData.image_urls.filter(url => url.trim() !== '')
    };

    try {
      if (editingItem) {
        // Update existing item
        const { error } = await supabase
          .from('food_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) {
          console.error('Error updating item:', error);
          alert(t('messages.updateError'));
        } else {
          // Update local state
          setFoodItems(prev => prev.map(item => 
            item.id === editingItem.id 
              ? { ...item, ...itemData } 
              : item
          ));
          alert(t('messages.updateSuccess'));
          closeModals();
        }
      } else {
        // Add new item
        const { data, error } = await supabase
          .from('food_items')
          .insert([itemData])
          .select()
          .single();

        if (error) {
          console.error('Error adding item:', error);
          alert(t('messages.addError'));
        } else {
          // Add to local state
          setFoodItems(prev => [data, ...prev]);
          alert(t('messages.addSuccess'));
          closeModals();
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(t('messages.unexpectedError'));
    } finally {
      setSubmitting(false);
    }
  };

  // Delete item with confirmation
  const deleteItem = async (id: number, name: string): Promise<void> => {
    if (!confirm(`${t('messages.deleteConfirm')} "${name}"؟`)) return;
    
    try {
      const { error } = await supabase
        .from('food_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting item:', error);
        alert(t('messages.deleteError'));
      } else {
        setFoodItems(prev => prev.filter(item => item.id !== id));
        alert(t('messages.deleteSuccess'));
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert(t('messages.unexpectedError'));
    }
  };

  // Calculate statistics
  const totalItems = foodItems.length;
  const totalCategories = new Set(foodItems.map(item => item.category).filter(Boolean)).size;
  const averagePrice = totalItems > 0 
    ? (foodItems.reduce((sum, item) => sum + item.price, 0) / totalItems)
    : 0;


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('dashboard.title')}</h1>
            <p className="text-gray-600 mt-1">{t('dashboard.subtitle')}</p>
          </div>
          <button
            onClick={openAddModal}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
            type="button"
          >
            <Plus className="w-5 h-5" />
            {t('dashboard.addNewItem')}
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">{t('dashboard.loading')}</span>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">{t('dashboard.totalItems')}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalItems}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">{t('dashboard.categories')}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">{totalCategories}</p>
              </div>
              <div className="bg-white rounded-2xl p-6 shadow-sm border">
                <h3 className="text-sm font-medium text-gray-500">{t('dashboard.averagePrice')}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  ${averagePrice.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Food Items Grid */}
            {foodItems.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
                <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('dashboard.noItemsTitle')}</h3>
                <p className="text-gray-600 mb-6">{t('dashboard.noItemsSubtitle')}</p>
                <button
                  onClick={openAddModal}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors inline-flex items-center gap-2"
                  type="button"
                >
                  <Plus className="w-5 h-5" />
                  {t('dashboard.addFirstItem')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {foodItems.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                    {/* Image */}
                    <div className="aspect-square rounded-t-2xl overflow-hidden bg-gray-100">
                      {item.image_urls && item.image_urls.length > 0 ? (
                        <img
                          src={item.image_urls[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center">
                                  <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg line-clamp-2">{item.name}</h3>
                        <span className="text-lg font-bold text-blue-600 ml-2">${item.price.toFixed(2)}</span>
                      </div>
                      
                      {item.category && (
                        <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm mb-3">
                          {item.category}
                        </span>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                          type="button"
                        >
                          <Edit className="w-4 h-4" />
                          {t('form.edit')}
                        </button>
                        <button
                          onClick={() => deleteItem(item.id, item.name)}
                          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={closeModals}
          title={t('form.editTitle')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.nameLabel')} <span className="text-red-500">{t('form.nameRequired')}</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder={t('form.namePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.priceLabel')} <span className="text-red-500">{t('form.priceRequired')}</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={handleInputChange('price')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder={t('form.pricePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.categoryLabel')}</label>
              <input
                type="text"
                value={formData.category}
                onChange={handleInputChange('category')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('form.categoryPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.imageUrlsLabel')}</label>
              <input
                type="text"
                value={formData.image_urls.join(', ')}
                onChange={handleInputChange('image_urls')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('form.imageUrlsPlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">{t('form.imageUrlsHelp')}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={closeModals}
                disabled={submitting}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {t('form.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? t('form.updating') : t('form.updateItem')}
              </button>
            </div>
          </div>
        </Modal>

        {/* Add Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={closeModals}
          title={t('form.addTitle')}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.nameLabel')} <span className="text-red-500">{t('form.nameRequired')}</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleInputChange('name')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder={t('form.namePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.priceLabel')} <span className="text-red-500">{t('form.priceRequired')}</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.price || ''}
                onChange={handleInputChange('price')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder={t('form.pricePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.categoryLabel')}</label>
              <input
                type="text"
                value={formData.category}
                onChange={handleInputChange('category')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('form.categoryPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('form.imageUrlsLabel')}</label>
              <input
                type="text"
                value={formData.image_urls.join(', ')}
                onChange={handleInputChange('image_urls')}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('form.imageUrlsPlaceholder')}
              />
              <p className="text-xs text-gray-500 mt-1">{t('form.imageUrlsHelp')}</p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={closeModals}
                disabled={submitting}
                className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {t('form.cancel')}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {submitting ? t('form.adding') : t('form.addItem')}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}