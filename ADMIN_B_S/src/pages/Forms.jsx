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
  ChevronRight, 
  X, 
  Sparkles, 
  Check, 
  Tag, 
  Save, 
  Eye, 
  FileText, 
  Settings2,
  HelpCircle,
  Undo2
} from 'lucide-react';
import { api } from '../utils/api';

const Forms = () => {
  const confirm = useConfirm();
  const [categoriesTree, setCategoriesTree] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Selected category/subcategory ID
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [selectedCatName, setSelectedCatName] = useState('');
  const [selectedCatIsSub, setSelectedCatIsSub] = useState(false);
  
  // Form State
  const [formConfig, setFormConfig] = useState(null);
  const [formTitle, setFormTitle] = useState('');
  const [formFields, setFormFields] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewValues, setPreviewValues] = useState({});

  // Fetch Category Tree
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/categories/tree');
      if (res && res.success && res.data) {
        setCategoriesTree(res.data);
        
        // Default select first subcategory of the first category if available
        if (res.data.length > 0) {
          const firstCat = res.data[0];
          if (firstCat.subcategories && firstCat.subcategories.length > 0) {
            handleSelectCategory(firstCat.subcategories[0].id, firstCat.subcategories[0].name, true);
          } else {
            handleSelectCategory(firstCat.id, firstCat.name, false);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load categories tree', err);
      setError('Failed to fetch categories list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Handle category/subcategory selection
  const handleSelectCategory = async (id, name, isSubcategory) => {
    setSelectedCatId(id);
    setSelectedCatName(name);
    setSelectedCatIsSub(isSubcategory);
    setPreviewMode(false);
    setIsEditing(false);
    setPreviewValues({});
    
    try {
      setLoading(true);
      const res = await api.get(`/dynamic-forms/category/${id}`);
      if (res && res.success && res.data) {
        setFormConfig(res.data);
        setFormTitle(res.data.title || '');
        setFormFields(res.data.fields || []);
      } else {
        setFormConfig(null);
        setFormTitle('');
        setFormFields([]);
      }
    } catch (err) {
      console.error('Failed to load form config', err);
      // If 404 or empty, reset
      setFormConfig(null);
      setFormTitle('');
      setFormFields([]);
    } finally {
      setLoading(false);
    }
  };

  // Field Type Options
  const fieldTypes = [
    { value: 'Text', label: 'Single-line Text' },
    { value: 'Number', label: 'Numeric Value' },
    { value: 'Dropdown', label: 'Dropdown / Select' },
    { value: 'Textarea', label: 'Paragraph Text' },
    { value: 'Date', label: 'Date Picker' }
  ];

  // Helper to generate key from label
  const generateKeyFromLabel = (label) => {
    return label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  };

  // Add Field handler
  const handleAddField = () => {
    const defaultLabel = `New Field ${formFields.length + 1}`;
    const newField = {
      label: defaultLabel,
      field_key: generateKeyFromLabel(defaultLabel),
      field_type: 'Text',
      options: ''
    };
    setFormFields([...formFields, newField]);
    setIsEditing(true);
  };

  // Remove Field handler
  const handleRemoveField = (index) => {
    const updated = formFields.filter((_, i) => i !== index);
    setFormFields(updated);
    setIsEditing(true);
  };

  // Update Field property
  const handleUpdateField = (index, property, value) => {
    const updated = [...formFields];
    updated[index][property] = value;
    
    // Auto-generate key if label changes and field wasn't customized
    if (property === 'label') {
      updated[index]['field_key'] = generateKeyFromLabel(value);
    }
    
    setFormFields(updated);
    setIsEditing(true);
  };

  // Save Form Configuration
  const handleSaveForm = async (e) => {
    if (e) e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Please enter a Form Title');
      return;
    }
    if (formFields.length === 0) {
      toast.error('Please add at least one form field');
      return;
    }

    // Check duplicate keys
    const keys = formFields.map(f => f.field_key);
    if (new Set(keys).size !== keys.length) {
      toast.error('Error: Duplicate field keys found. Each field must have a unique key.');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        category_id: selectedCatId,
        title: formTitle.trim(),
        fields: formFields.map(f => ({
          label: f.label,
          field_key: f.field_key,
          field_type: f.field_type,
          options: f.field_type === 'Dropdown' ? f.options : ''
        }))
      };

      const res = await api.post('/dynamic-forms', payload);
      if (res && res.success) {
        setIsEditing(false);
        // Refresh form configuration
        await handleSelectCategory(selectedCatId, selectedCatName, selectedCatIsSub);
        toast.success('Form configuration saved successfully!');
      } else {
        toast.error(res.message || 'Failed to save form');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred while saving the form');
    } finally {
      setLoading(false);
    }
  };

  // Delete Form Configuration
  const handleDeleteForm = async () => {
    if (!formConfig || !formConfig.id) return;
    const confirmed = await confirm(`Are you sure you want to delete form "${formTitle}"? This will delete all field configurations for this category.`);
    if (!confirmed) {
      return;
    }

    try {
      setLoading(true);
      const res = await api.delete(`/dynamic-forms/${formConfig.id}`);
      if (res && res.success) {
        setFormConfig(null);
        setFormTitle('');
        setFormFields([]);
        setIsEditing(false);
        setPreviewMode(false);
        toast.success('Form configuration deleted successfully.');
      } else {
        toast.error(res.message || 'Failed to delete form');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'An error occurred while deleting the form');
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const categoriesCount = categoriesTree.length;

  return (
    <div className="space-y-4">
      
      {/* Upper Stats Card Container */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        <div className="bg-white rounded-xl border border-blue-100/80 p-2 flex items-center justify-between shadow-sm shadow-blue-50/70 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Business Domains</h3>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2 leading-none">{categoriesCount}</h1>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#4f6bff]">
            <Folder size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-emerald-100/80 p-2 flex items-center justify-between shadow-sm shadow-emerald-50/70 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Active Category Selection</h3>
            <h1 className="text-base font-extrabold text-emerald-700 mt-2 truncate max-w-[220px]" title={selectedCatName}>
              {selectedCatName || 'None selected'}
            </h1>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <Layers size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-sky-100/80 p-2 flex items-center justify-between shadow-sm shadow-sky-50/70 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div>
            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Configure Mode</h3>
            <h1 className="text-2xl font-extrabold text-blue-600 mt-2 leading-none">
              {formConfig ? 'Form Set Up' : 'No Form'}
            </h1>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-blue-500">
            <Sparkles size={24} />
          </div>
        </div>
      </div>

      {/* Main Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2">
        
        {/* Left Side: Category tree navigation */}
        <div className="lg:col-span-4 bg-white border border-gray-200 shadow-sm rounded-2xl overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 bg-white">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Folder className="text-[#4f6bff]" size={20} /> Marketplace Domains
            </h2>
          </div>

          <div className="px-5 py-3 bg-blue-50/70 border-b border-blue-100/80">
            <p className="text-xs text-blue-800 font-medium">Select a category or subcategory below to manage its custom listing form.</p>
          </div>

          <div className="divide-y divide-gray-100 overflow-y-auto max-h-[560px]">
            {loading && categoriesTree.length === 0 ? (
              <div className="p-8 text-center text-gray-400">Loading domains...</div>
            ) : categoriesTree.length === 0 ? (
              <div className="p-8 text-center text-gray-400">No categories found.</div>
            ) : (
              categoriesTree.map(cat => (
                <div key={cat.id} className="space-y-1">
                  
                  {/* Category Row */}
                  <div 
                    onClick={() => handleSelectCategory(cat.id, cat.name, false)}
                    className={`px-4 py-3.5 flex items-center justify-between cursor-pointer transition ${selectedCatId === cat.id ? 'bg-[#f4f7ff] border-l-4 border-blue-600 font-semibold' : 'hover:bg-gray-50/80 border-l-4 border-transparent'}`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <Folder size={15} />
                      </div>
                      <span className="text-sm font-semibold text-gray-800 leading-tight">{cat.name}</span>
                    </div>
                    <ChevronRight size={14} className="text-gray-400" />
                  </div>

                  {/* Subcategories (Nested) */}
                  {cat.subcategories && cat.subcategories.length > 0 && (
                    <div className="pl-6 pr-2 pb-2 space-y-1 bg-gray-50/30">
                      {cat.subcategories.map(sub => (
                        <div
                          key={sub.id}
                          onClick={() => handleSelectCategory(sub.id, sub.name, true)}
                          className={`px-3 py-2 rounded-lg flex items-center justify-between cursor-pointer transition text-xs ${
                            selectedCatId === sub.id 
                              ? 'bg-blue-600 text-white font-bold shadow-sm shadow-blue-100' 
                              : 'hover:bg-white hover:shadow-sm text-gray-600'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <Tag size={12} className={selectedCatId === sub.id ? 'text-white' : 'text-gray-400'} />
                            <span>{sub.name}</span>
                          </div>
                          {selectedCatId === sub.id && <Check size={12} className="text-white" />}
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Side: Form Builder Canvas */}
        <div className="lg:col-span-8 bg-white border border-gray-200 shadow-sm flex flex-col rounded-2xl overflow-hidden min-h-[560px]">
          
          {/* Header */}
          <div className="p-5 border-b border-gray-100 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-blue-600" size={20} /> 
                Listing Form Config
              </h2>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                Active Selection: <span className="font-semibold text-blue-600">{selectedCatName}</span> ({selectedCatIsSub ? 'Subcategory' : 'Parent Category'})
              </p>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              {formConfig && (
                <button
                  onClick={handleDeleteForm}
                  className="p-2.5 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition shadow-sm"
                  title="Delete Form Configuration"
                >
                  <Trash2 size={16} />
                </button>
              )}
              
              {formFields.length > 0 && (
                <button
                  onClick={() => setPreviewMode(!previewMode)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg border transition shadow-sm ${
                    previewMode 
                      ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' 
                      : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                  }`}
                >
                  {previewMode ? (
                    <>
                      <Undo2 size={14} /> Back to Editor
                    </>
                  ) : (
                    <>
                      <Eye size={14} /> Live Preview
                    </>
                  )}
                </button>
              )}
              
              {!previewMode && (formFields.length > 0 || formTitle) && (
                <button
                  onClick={handleSaveForm}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition rounded-lg shadow-sm shadow-blue-100"
                >
                  <Save size={14} /> Save Configuration
                </button>
              )}
            </div>
          </div>

          {/* Canvas Area */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col bg-slate-50/70">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm font-semibold">Loading Form Configuration...</p>
              </div>
            ) : !selectedCatId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 py-16">
                <Settings2 size={48} className="stroke-1" />
                <p>Select a Category or Subcategory from the left tree panel to begin.</p>
              </div>
            ) : previewMode ? (
              
              /* Live Preview Mode */
              <div className="space-y-6 max-w-2xl mx-auto w-full bg-white border border-gray-200 p-5 sm:p-6 rounded-2xl shadow-sm">
                <div className="border-b border-gray-100 pb-4 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      Seller View Preview
                    </span>
                    <h3 className="text-base font-extrabold text-gray-900 mt-1">{formTitle || 'Marketplace Form'}</h3>
                  </div>
                  <HelpCircle size={16} className="text-gray-400" title="This is a live test preview of how fields render to sellers." />
                </div>

                <div className="space-y-4">
                  {formFields.map((field, idx) => {
                    const id = field.field_key || `field_${idx}`;
                    
                    return (
                      <div key={idx} className="space-y-1.5 text-left">
                        <label className="text-xs font-extrabold text-gray-800 uppercase tracking-wider block">
                          {field.label || `Field ${idx + 1}`}
                        </label>
                        
                        {field.field_type === 'Textarea' ? (
                          <textarea
                            rows={3}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/60 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-800"
                            value={previewValues[id] || ''}
                            onChange={(e) => setPreviewValues({ ...previewValues, [id]: e.target.value })}
                          />
                        ) : field.field_type === 'Dropdown' ? (
                          <select
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/60 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-800"
                            value={previewValues[id] || ''}
                            onChange={(e) => setPreviewValues({ ...previewValues, [id]: e.target.value })}
                          >
                            <option value="">Select option...</option>
                            {(field.options || '')
                              .split(',')
                              .map(o => o.trim())
                              .filter(Boolean)
                              .map((opt, oIdx) => (
                                <option key={oIdx} value={opt}>{opt}</option>
                              ))
                            }
                          </select>
                        ) : (
                          <input
                            type={field.field_type === 'Number' ? 'number' : field.field_type === 'Date' ? 'date' : 'text'}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/60 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-800"
                            value={previewValues[id] || ''}
                            onChange={(e) => setPreviewValues({ ...previewValues, [id]: e.target.value })}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      console.log('Preview form values submitted:', previewValues);
                      toast.success('Test submit successful! Check console for values.');
                    }}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-green-600 hover:bg-green-700 transition rounded-lg shadow-sm"
                  >
                    Test Submit (Log to Console)
                  </button>
                </div>
              </div>
            ) : formFields.length === 0 && !formTitle ? (
              
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl bg-white p-8 text-center text-gray-400 py-16">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-3">
                  <FileText size={30} className="stroke-1 text-blue-500" />
                </div>
                <p className="font-semibold text-gray-700">No Form Configuration Configured</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm">
                  Sellers listing items in <strong className="text-gray-700">{selectedCatName}</strong> will only see general common inputs. Create a form config to request dynamic category-specific details.
                </p>
                <button
                  onClick={() => {
                    setFormTitle(`${selectedCatName} Details`);
                    setFormFields([
                      { label: 'Brand', field_key: 'brand', field_type: 'Dropdown', options: 'Apple, Samsung, OnePlus, Google' }
                    ]);
                    setIsEditing(true);
                  }}
                  className="mt-5 flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition rounded-lg shadow-sm shadow-blue-100"
                >
                  <Plus size={14} /> Create Dynamic Form
                </button>
              </div>
            ) : (
              
              /* Editor Mode */
              <div className="flex-1 flex flex-col space-y-5 max-w-4xl mx-auto w-full text-left">
                
                {/* Form Title config */}
                <div className="bg-white p-5 border border-gray-200 rounded-2xl shadow-sm space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                    Form Title (Publicly visible to Sellers)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Mobile Properties, Vehicle Details"
                    value={formTitle}
                    onChange={(e) => {
                      setFormTitle(e.target.value);
                      setIsEditing(true);
                    }}
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg bg-gray-50/60 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-800 font-semibold"
                  />
                </div>

                {/* Form Fields Canvas */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-700 flex items-center gap-1.5">
                      <Settings2 size={16} className="text-blue-500" />
                      Form Fields ({formFields.length})
                    </h3>
                    <button
                      onClick={handleAddField}
                      className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg transition shadow-sm bg-white"
                    >
                      <Plus size={14} /> Add Custom Field
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
                    {formFields.map((field, index) => (
                      <div key={index} className="bg-white p-4 sm:p-5 border border-gray-200 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center relative hover:border-blue-200 hover:shadow-md transition">
                        
                        {/* Remove Field Button */}
                        <button
                          onClick={() => handleRemoveField(index)}
                          className="absolute top-3 right-3 md:relative md:top-auto md:right-auto p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition self-end md:self-auto"
                          title="Remove Field"
                        >
                          <Trash2 size={15} />
                        </button>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 flex-1 w-full text-left">
                          
                          {/* Label input */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Field Label</span>
                            <input
                              type="text"
                              required
                              placeholder="e.g., RAM (GB)"
                              value={field.label}
                              onChange={(e) => handleUpdateField(index, 'label', e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/60 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-800 font-medium"
                            />
                          </div>

                          {/* Field Key */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">DB Column Key</span>
                            <input
                              type="text"
                              required
                              placeholder="e.g., ram_size"
                              value={field.field_key}
                              onChange={(e) => handleUpdateField(index, 'field_key', generateKeyFromLabel(e.target.value))}
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-500 bg-gray-50 font-mono"
                            />
                          </div>

                          {/* Field Type Select */}
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Input UI Type</span>
                            <select
                              value={field.field_type}
                              onChange={(e) => handleUpdateField(index, 'field_type', e.target.value)}
                              className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-gray-50/60 transition text-gray-800 font-medium"
                            >
                              {fieldTypes.map(ft => (
                                <option key={ft.value} value={ft.value}>{ft.label}</option>
                              ))}
                            </select>
                          </div>

                        </div>

                        {/* Dropdown Options (shows only if Dropdown type selected) */}
                        {field.field_type === 'Dropdown' && (
                          <div className="w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4 min-w-[220px] text-left">
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                                Dropdown Choices
                                <HelpCircle size={10} className="text-gray-400" title="Separate options with commas. Example: Option 1, Option 2" />
                              </span>
                              <input
                                type="text"
                                required
                                placeholder="Apple, Samsung, OnePlus"
                                value={field.options || ''}
                                onChange={(e) => handleUpdateField(index, 'options', e.target.value)}
                                className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg bg-gray-50/60 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition text-gray-800"
                              />
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200 flex flex-wrap justify-end gap-2.5">
                  <button
                    onClick={async () => {
                      const confirmed = await confirm('Discard all changes?');
                      if (confirmed) {
                        handleSelectCategory(selectedCatId, selectedCatName, selectedCatIsSub);
                      }
                    }}
                    className="px-4 py-2.5 text-xs border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition font-medium shadow-sm"
                  >
                    Discard Changes
                  </button>
                  <button
                    onClick={handleSaveForm}
                    className="px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-sm shadow-blue-100"
                  >
                    Save Changes
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default Forms;
