import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useConfirm } from '../contexts/ConfirmContext';
import { 
  Folder, 
  FolderPlus, 
  Layers, 
  Plus, 
  Edit, 
  Trash2, 
  Image, 
  Search, 
  ChevronRight, 
  X, 
  Sparkles, 
  Check, 
  Eye, 
  EyeOff, 
  Tag
} from 'lucide-react';
import { api } from '../utils/api';

const Categories = () => {
  const confirm = useConfirm();
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Selected Category for viewing subcategories
  const [selectedCatId, setSelectedCatId] = useState(null);
  
  // Modals state
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categoryModalMode, setCategoryModalMode] = useState('add'); // 'add' or 'edit'
  const [categoryFormData, setCategoryFormData] = useState({
    id: null,
    name: '',
    description: '',
    accent: 'blue',
  });

  const [isSubcategoryModalOpen, setIsSubcategoryModalOpen] = useState(false);
  const [subcategoryModalMode, setSubcategoryModalMode] = useState('add'); // 'add' or 'edit'
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    id: null,
    parent_id: '',
    name: '',
    image: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');


  // Load categories tree from backend
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/categories/tree');
      if (res && res.success && res.data) {
        setCategoriesTree(res.data);
        
        // Select first category by default if none selected
        if (res.data.length > 0 && !selectedCatId) {
          setSelectedCatId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load categories', err);
      toast.error('Failed to fetch categories list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Selected Category object helper
  const selectedCategory = categoriesTree.find(c => c.id === selectedCatId) || null;

  // Category Actions
  const handleOpenCategoryModal = (mode, category = null) => {
    setCategoryModalMode(mode);
    if (mode === 'edit' && category) {
      setCategoryFormData({
        id: category.id,
        name: category.name,
        description: category.description || '',
        accent: category.accent || 'blue',
      });
    } else {
      setCategoryFormData({
        id: null,
        name: '',
        description: '',
        accent: 'blue',
      });
    }
    setIsCategoryModalOpen(true);
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!categoryFormData.name.trim()) return;

    try {
      setLoading(true);
      if (categoryModalMode === 'add') {
        const payload = {
          name: categoryFormData.name.trim(),
          description: categoryFormData.description.trim(),
          accent: categoryFormData.accent
        };
        const res = await api.post('/categories', payload);
        if (res && res.success && res.data) {
          setSelectedCatId(res.data.id);
          toast.success('Category created successfully');
        }
      } else {
        const payload = {
          name: categoryFormData.name.trim(),
          description: categoryFormData.description.trim(),
          accent: categoryFormData.accent
        };
        await api.put(`/categories/${categoryFormData.id}`, payload);
        toast.success('Category updated successfully');
      }
      setIsCategoryModalOpen(false);
      loadCategories();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const confirmed = await confirm(`Are you sure you want to delete category "${name}"? All subcategories, listings, forms, and schemes associated with it will be deleted permanently.`);
    if (!confirmed) {
      return;
    }
    try {
      setLoading(true);
      await api.delete(`/categories/${id}`);
      if (selectedCatId === id) setSelectedCatId(null);
      loadCategories();
      toast.success('Category deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete category.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCategoryStatus = async (id) => {
    try {
      await api.patch(`/categories/${id}/toggle`, {});
      loadCategories();
      toast.success('Category status toggled successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to toggle status');
    }
  };

  // Subcategory Actions
  const handleOpenSubcategoryModal = (mode, subcat = null, parentId = null) => {
    setSubcategoryModalMode(mode);
    if (mode === 'edit' && subcat) {
      setSubcategoryFormData({
        id: subcat.id,
        parent_id: subcat.parent_id || selectedCatId || '',
        name: subcat.name,
        image: subcat.image || '',
      });
      setImageFile(null);
      setImagePreview(subcat.image || '');
    } else {
      setSubcategoryFormData({
        id: null,
        parent_id: parentId || selectedCatId || '',
        name: '',
        image: '',
      });
      setImageFile(null);
      setImagePreview('');
    }
    setIsSubcategoryModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    if (!subcategoryFormData.name.trim() || !subcategoryFormData.parent_id) return;

    try {
      setLoading(true);
      const parentId = parseInt(subcategoryFormData.parent_id, 10);
      const formData = new FormData();
      formData.append('name', subcategoryFormData.name.trim());
      formData.append('parent_id', subcategoryFormData.parent_id);
      
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (subcategoryFormData.image) {
        formData.append('image', subcategoryFormData.image);
      }

      if (subcategoryModalMode === 'add') {
        await api.post('/categories', formData);
        toast.success('Subcategory created successfully');
      } else {
        await api.put(`/categories/${subcategoryFormData.id}`, formData);
        toast.success('Subcategory updated successfully');
      }

      setIsSubcategoryModalOpen(false);
      setImageFile(null);
      setImagePreview('');
      
      // Auto-select parent category so user sees the newly added/edited subcategory immediately
      setSelectedCatId(parentId);
      loadCategories();
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubcategory = async (id, name) => {
    const confirmed = await confirm(`Are you sure you want to delete subcategory "${name}"?`);
    if (!confirmed) {
      return;
    }
    try {
      setLoading(true);
      await api.delete(`/categories/${id}`);
      loadCategories();
      toast.success('Subcategory deleted successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to delete subcategory');
    } finally {
      setLoading(false);
    }
  };

  // Color options helper for categories
  const accents = [
    { value: 'blue', label: 'Blue', colorClass: 'bg-blue-500' },
    { value: 'green', label: 'Green', colorClass: 'bg-green-500' },
    { value: 'orange', label: 'Orange', colorClass: 'bg-orange-500' },
    { value: 'purple', label: 'Purple', colorClass: 'bg-purple-500' },
    { value: 'red', label: 'Red', colorClass: 'bg-red-500' },
    { value: 'teal', label: 'Teal', colorClass: 'bg-teal-500' },
  ];

  // Stats computation
  const totalCats = categoriesTree.length;
  const totalSubs = categoriesTree.reduce((acc, curr) => acc + (curr.subcategories?.length || 0), 0);
  const activeCats = categoriesTree.filter(c => c.is_active).length;

  if (isCategoryModalOpen) {
    return (
      <div className="space-y-6 w-full mx-auto animate-[fadeIn_.2s_ease] text-left">
        {/* Header with Back button */}
        <div className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-sm shadow-sm">
          <button
            type="button"
            onClick={() => setIsCategoryModalOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
          >
            <X size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {categoryModalMode === 'add' ? 'Add New Category' : 'Edit Category'}
            </h1>
            <p className="text-xs text-gray-500">
              {categoryModalMode === 'add' ? 'Create a new business domain for your marketplace.' : `Update details for category "${categoryFormData.name}".`}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <form onSubmit={handleCategorySubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Category Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Electronics, Fashion, Real Estate"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-gray-800 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Description
              </label>
              <textarea
                rows={4}
                placeholder="Briefly describe what this category includes"
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full resize-none px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition text-gray-800"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Accent Theme Color
              </label>
              <p className="text-xs text-gray-500">This color will be used in the marketplace UI to highlight this category.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {accents.map(acc => (
                  <button
                    key={acc.value}
                    type="button"
                    onClick={() => setCategoryFormData(prev => ({ ...prev, accent: acc.value }))}
                    className={`px-4 py-3 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition border ${
                      categoryFormData.accent === acc.value 
                        ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold' 
                        : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full shadow-inner ${acc.colorClass}`} />
                    {acc.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="px-5 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm"
              >
                {loading ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isSubcategoryModalOpen) {
    return (
      <div className="space-y-6 w-full mx-auto animate-[fadeIn_.2s_ease] text-left">
        {/* Header with Back button */}
        <div className="flex items-center gap-4 bg-white p-4 border border-gray-200 rounded-sm shadow-sm">
          <button
            type="button"
            onClick={() => setIsSubcategoryModalOpen(false)}
            className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition"
          >
            <X size={18} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              {subcategoryModalMode === 'add' ? 'Add New Subcategory' : 'Edit Subcategory'}
            </h1>
            <p className="text-xs text-gray-500">
              {subcategoryModalMode === 'add' ? 'Add a sub-level category to organize listing details.' : `Update details for subcategory "${subcategoryFormData.name}".`}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-gray-200 rounded-sm shadow-sm overflow-hidden">
          <form onSubmit={handleSubcategorySubmit} className="p-6 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Parent Category
              </label>
              <select
                required
                value={subcategoryFormData.parent_id}
                onChange={(e) => setSubcategoryFormData(prev => ({ ...prev, parent_id: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 bg-white text-gray-800 font-medium"
              >
                <option value="" disabled>Select parent category</option>
                {categoriesTree.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Subcategory Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Mobile, Laptop, Cycles, Auto Parts"
                value={subcategoryFormData.name}
                onChange={(e) => setSubcategoryFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition text-gray-800 font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                Subcategory Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition text-gray-800 font-medium"
              />
              <p className="text-[10px] text-gray-500">Provide an image illustrating the items in this subcategory.</p>
            </div>

            {imagePreview && (
              <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50/50 p-4">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">Image Preview</span>
                <div className="h-40 rounded-lg bg-white overflow-hidden flex items-center justify-center border border-gray-200 max-w-sm">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSubcategoryModalOpen(false)}
                className="px-5 py-2.5 text-sm border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-600 transition font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-xl transition-all shadow-sm"
              >
                {loading ? 'Saving...' : 'Save Subcategory'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* Upper Stats Card Container */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#e0e7ff] rounded-lg border border-white/60 p-2 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Categories</h3>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{totalCats}</h1>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#dbe5ff] to-[#eef2ff] flex items-center justify-center text-[#4f6bff]">
            <Folder size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#f1fff7] via-[#e8fff1] to-[#dff7e8] rounded-lg border border-white/60 p-2 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Total Subcategories</h3>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{totalSubs}</h1>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#ccf5db] to-[#e9fff1] flex items-center justify-center text-green-600">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#f5fcff] via-[#eff9ff] to-[#e6f4ff] rounded-lg border border-white/60 p-2 flex items-center justify-between shadow-sm">
          <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Active Categories</h3>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-1">{activeCats}</h1>
          </div>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d8edff] to-[#f1f8ff] flex items-center justify-center text-blue-500">
            <Sparkles size={24} />
          </div>
        </div>
      </div>

      {/* Main Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        
        {/* Left Side: Category list */}
        <div className="lg:col-span-5 bg-white border border-gray-200 shadow-sm flex flex-col rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Folder className="text-[#4f6bff]" size={20} /> Categories
            </h2>
            <button
              onClick={() => handleOpenCategoryModal('add')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition rounded-lg shadow-sm"
            >
              <Plus size={14} /> Add Category
            </button>
          </div>

          <div className="p-3 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Select a category to view and manage its subcategories.</p>
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[500px]">
            {loading && categoriesTree.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Loading...</div>
            ) : categoriesTree.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No categories found. Click Add to create one.</div>
            ) : (
              categoriesTree.map(cat => (
                <div 
                  key={cat.id} 
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`p-4 flex items-center justify-between cursor-pointer transition ${selectedCatId === cat.id ? 'bg-[#f4f7ff] border-l-4 border-blue-600' : 'hover:bg-gray-50/50'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${
                      cat.accent === 'green' ? 'bg-green-500' :
                      cat.accent === 'orange' ? 'bg-orange-500' :
                      cat.accent === 'purple' ? 'bg-purple-500' :
                      cat.accent === 'red' ? 'bg-red-500' :
                      cat.accent === 'teal' ? 'bg-teal-500' : 'bg-blue-500'
                    }`}>
                      <Tag size={16} />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                        {cat.name}
                        {!cat.is_active && (
                          <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">Inactive</span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500">slug: {cat.slug} | {cat.subcategories?.length || 0} subcategories</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleToggleCategoryStatus(cat.id)}
                      className={`p-1.5 rounded-lg border transition ${cat.is_active ? 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100' : 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'}`}
                      title={cat.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {cat.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                    </button>
                    <button
                      onClick={() => handleOpenCategoryModal('edit', cat)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 rounded-lg transition"
                      title="Edit Category"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-lg transition"
                      title="Delete Category"
                    >
                      <Trash2 size={14} />
                    </button>
                    <ChevronRight size={18} className="text-gray-400 hidden sm:block" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Subcategories Grid */}
        <div className="lg:col-span-7 bg-white border border-gray-200 shadow-sm flex flex-col rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Layers className="text-green-600" size={20} /> 
              Subcategories for {selectedCategory ? selectedCategory.name : 'Selected Category'}
            </h2>
            {selectedCategory && (
              <button
                onClick={() => handleOpenSubcategoryModal('add')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition rounded-lg shadow-sm"
              >
                <Plus size={14} /> Add Subcategory
              </button>
            )}
          </div>

          <div className="p-4 flex-1">
            {!selectedCategory ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                <Folder size={48} className="mb-2 stroke-1" />
                <p>Select a category to view subcategories.</p>
              </div>
            ) : !selectedCategory.subcategories || selectedCategory.subcategories.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400">
                <Layers size={40} className="mb-2 stroke-1" />
                <p className="font-semibold text-gray-700">No Subcategories Yet</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">Subcategories represent the nested items (e.g. Mobile, Laptop under Electronics). Click Add Subcategory to create the first one.</p>
                <button
                  onClick={() => handleOpenSubcategoryModal('add')}
                  className="mt-4 flex items-center gap-1 px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 transition rounded shadow-sm"
                >
                  <Plus size={14} /> Add Subcategory
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {selectedCategory.subcategories.map(subcat => (
                  <div key={subcat.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col bg-white">
                    {/* Subcategory Image preview */}
                    <div className="h-28 bg-gray-100 relative overflow-hidden flex items-center justify-center border-b border-gray-100 group">
                      {subcat.image ? (
                        <img 
                          src={subcat.image} 
                          alt={subcat.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <Image size={32} className="text-gray-400 stroke-1" />
                      )}
                      
                      <div className="absolute top-2 right-2 flex items-center gap-1">
                        <button
                          onClick={() => handleOpenSubcategoryModal('edit', subcat)}
                          className="p-1.5 bg-white/95 backdrop-blur shadow-sm hover:bg-white text-blue-600 rounded-lg border border-gray-100 transition"
                          title="Edit Subcategory"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteSubcategory(subcat.id, subcat.name)}
                          className="p-1.5 bg-white/95 backdrop-blur shadow-sm hover:bg-white text-red-600 rounded-lg border border-gray-100 transition"
                          title="Delete Subcategory"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-bold text-gray-800">{subcat.name}</h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 truncate">slug: {subcat.slug}</p>
                      </div>
                      <div className="mt-3 pt-2.5 border-t border-gray-50 flex items-center justify-between text-xs">
                        <span className="text-gray-400">ID: {subcat.id}</span>
                        <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-semibold">Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;
