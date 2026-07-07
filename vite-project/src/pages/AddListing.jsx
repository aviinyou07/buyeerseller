import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  ImagePlus,
  MapPin,
  PackageOpen,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { getCategories, getCategoryForm } from "../api/categoriesApi";
import { createProduct, getProduct, normalizeProduct, updateProduct } from "../api/productsApi";
import { translateStaticText, useAppText } from "../appText";
import {
  formatCurrency,
  getUserListings,
} from "../services/marketplaceData";

const normalizeApiField = (field) => ({
  name: field.name,
  label: field.label || field.name,
  type: field.type || "text",
  options: Array.isArray(field.options) ? field.options : [],
  isRequired: Boolean(field.isRequired),
});

const normalizeApiCategories = (apiCategories) =>
  apiCategories.map((category) => ({
    id: category.slug || String(category.id),
    title: category.title,
    items: (category.subcategories || category.items || []).map((item) => {
      const id = item.slug || String(item.id);

      return {
        id,
        name: item.name,
        fields: (item.fields || []).map(normalizeApiField),
      };
    }),
  }));

const customFieldTypes = [
  { value: "text", label: "Text" },
  { value: "number", label: "Number" },
  { value: "date", label: "Date" },
  { value: "textarea", label: "Long Text" },
];

const offerBadgeOptions = [
  "",
  "Limited Time Offer",
  "Popular Deal",
  "Best Price",
];

const commonListingFields = [
  {
    name: "title",
    label: "Listing title",
    type: "text",
    placeholder: "Example: iPhone 13 128GB",
    isRequired: true,
  },
  {
    name: "price",
    label: "Expected price",
    type: "number",
    placeholder: "Enter price",
    isRequired: true,
  },
  {
    name: "location",
    label: "Pickup location",
    type: "text",
    placeholder: "Area, City",
    isRequired: true,
  },
  {
    name: "brand",
    label: "Brand",
    type: "text",
    placeholder: "Brand / Maker",
  },
  {
    name: "condition",
    label: "Condition",
    type: "text",
    placeholder: "e.g. Good, Like New, Fair",
  },
  {
    name: "warranty",
    label: "Warranty",
    type: "text",
    placeholder: "e.g. 1 Year, None",
  },
  {
    name: "usedFor",
    label: "Used For",
    type: "text",
    placeholder: "e.g. Daily Use",
  },
  {
    name: "description",
    label: "Description",
    type: "textarea",
    placeholder: "Write important details, reason for selling, accessories, etc.",
  },
];

const translateFormText = (value, language) => translateStaticText(value, language)

const isBlank = (value) => String(value || "").trim() === "";

const Field = ({ field, value, onChange, error }) => {
  const { language, t } = useAppText();
  const label = translateFormText(field.label, language);
  const placeholder = field.placeholder
    ? translateFormText(field.placeholder, language)
    : "";
  const inputClass =
    `h-12 w-full border bg-white px-3 text-sm font-semibold text-[#102a43] outline-none placeholder:text-slate-400 ${
      error ? "border-red-300 ring-1 ring-red-200" : "border-slate-100"
    }`;

  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-black text-[#102a43]">
          {label}
        </span>
        <textarea
          className={`min-h-28 w-full resize-none border bg-white px-3 py-3 text-sm font-semibold leading-5 text-[#102a43] outline-none placeholder:text-slate-400 ${
            error ? "border-red-300 ring-1 ring-red-200" : "border-slate-100"
          }`}
          placeholder={placeholder}
          required
          value={value || ""}
          onChange={(event) => onChange(field.name, event.target.value)}
        />
        {error && <span className="mt-1 block text-xs font-bold text-red-500">{error}</span>}
      </label>
    );
  }

  if (field.type === "select") {
    return (
      <label className="block">
        <span className="mb-1.5 block text-sm font-black text-[#102a43]">
          {label}
        </span>
        <select
          className={inputClass}
          required
          value={value || ""}
          onChange={(event) => onChange(field.name, event.target.value)}
        >
          <option value="">{t("selectField", { field: label })}</option>
          {(field.options || []).map((option) => (
            <option key={option} value={option}>
              {translateFormText(option, language)}
            </option>
          ))}
        </select>
        {error && <span className="mt-1 block text-xs font-bold text-red-500">{error}</span>}
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-black text-[#102a43]">
        {label}
      </span>
      <input
        className={inputClass}
        placeholder={placeholder}
        required
        type={field.type || "text"}
        value={value || ""}
        onChange={(event) => onChange(field.name, event.target.value)}
      />
      {error && <span className="mt-1 block text-xs font-bold text-red-500">{error}</span>}
    </label>
  );
};

const listingTextKeys = {
  Active: "active",
  Rejected: "rejected",
  Sold: "sold",
  "Like New": "likeNew",
  Good: "good",
  Fair: "fair",
  Recently: "recently",
  Electronics: "electronics",
  Vehicles: "vehicles",
  "Home & Kitchen": "homeKitchen",
  Fashion: "fashion",
  Mobile: "subMobile",
  Laptop: "subLaptop",
  Iron: "subIron",
  Induction: "subInduction",
  Headphones: "subHeadphones",
  Speaker: "subSpeaker",
  Camera: "subCamera",
  Car: "subCar",
  Bike: "subBike",
  Scooter: "subScooter",
  Cycle: "subCycle",
  "Auto Parts": "subAutoParts",
  Sofa: "subSofa",
  Bed: "subBed",
  Table: "subTable",
  Chair: "subChair",
  Mixer: "subMixer",
  Fridge: "subFridge",
  "Men Wear": "subMenWear",
  "Women Wear": "subWomenWear",
  Shoes: "subShoes",
  Bags: "subBags",
  Watches: "subWatches",
  "Limited Time Offer": "limitedTimeOffer",
  "Popular Deal": "popularDeal",
  "Best Price": "bestPrice",
};

const translateListingText = (value, t) => t(listingTextKeys[value] || value);

const buildListingOverviewFields = (fields, values) =>
  fields
    .map((field) => ({
      name: field.name,
      label: field.label,
      type: field.type || "text",
      value: values[field.name],
    }))
    .filter((field) => String(field.value || "").trim());

const normalizeLookupText = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const commonFieldMatchers = [
  {
    keys: ["title", "listing_title", "product_title", "name"],
    patterns: [/\btitle\b/i, /\bproduct\s*name\b/i, /\blisting\s*name\b/i],
  },
  {
    keys: ["price", "expected_price", "amount"],
    patterns: [/\bprice\b/i, /\bamount\b/i, /\bcost\b/i],
  },
  {
    keys: ["brand", "brand_name"],
    patterns: [/\bbrand\b/i],
  },
  {
    keys: ["description", "product_description", "details"],
    patterns: [/\bdescription\b/i, /\bdetails?\b/i],
  },
  {
    keys: ["location", "pickup_location", "city"],
    patterns: [/\blocation\b/i, /\bcity\b/i],
  },
  {
    keys: ["condition"],
    patterns: [/\bcondition\b/i],
  },
  {
    keys: ["warranty"],
    patterns: [/\bwarranty\b/i],
  },
  {
    keys: ["usedFor", "used_for", "usedfor"],
    patterns: [/\bused\s*for\b/i],
  },
];

const isCommonListingField = (field) => {
  const lookupText = `${field.name || ""} ${field.label || ""}`;
  const normalizedName = normalizeLookupText(field.name);

  return commonFieldMatchers.some(
    ({ keys, patterns }) => {
      const normalizedKeys = keys.map(normalizeLookupText);

      if (normalizedKeys.includes(normalizedName)) return true;
      if (normalizedName) return false;

      return patterns.some((pattern) => pattern.test(lookupText));
    },
  );
};

const getResolvedFieldValue = (values, fields, keys, patterns = []) => {
  const normalizedKeys = keys.map(normalizeLookupText);
  const directKey = Object.keys(values).find(
    (key) =>
      normalizedKeys.includes(normalizeLookupText(key)) && !isBlank(values[key]),
  );

  if (directKey) {
    return { value: values[directKey], fieldName: directKey };
  }

  const matchedField = fields.find((field) => {
    const lookupText = `${field.name || ""} ${field.label || ""}`;
    const normalizedFieldName = normalizeLookupText(field.name);

    return (
      !isBlank(values[field.name]) &&
      (normalizedKeys.includes(normalizedFieldName) ||
        patterns.some((pattern) => pattern.test(lookupText)))
    );
  });

  return {
    value: matchedField ? values[matchedField.name] : "",
    fieldName: matchedField?.name || keys[0],
  };
};

const getMatchingFieldName = (fields, keys, patterns = []) => {
  const normalizedKeys = keys.map(normalizeLookupText);
  const matchedField = fields.find((field) => {
    const lookupText = `${field.name || ""} ${field.label || ""}`;
    const normalizedFieldName = normalizeLookupText(field.name);

    return (
      normalizedKeys.includes(normalizedFieldName) ||
      patterns.some((pattern) => pattern.test(lookupText))
    );
  });

  return matchedField?.name || keys[0];
};

const setHydratedFieldValue = (values, fields, keys, patterns, value) => {
  if (isBlank(value)) return;
  values[getMatchingFieldName(fields, keys, patterns)] = value;
};

const hydrateListingFormValues = (listing, fields) => {
  if (!listing) return {};

  const nextValues = { ...listing };
  (listing.overviewFields || []).forEach((field) => {
    if (field.name) {
      nextValues[field.name] = field.value;
    }
  });

  setHydratedFieldValue(nextValues, fields, ["title", "listing_title", "product_title", "name"], [/\btitle\b/i, /\bproduct\s*name\b/i, /\blisting\s*name\b/i], listing.title);
  setHydratedFieldValue(nextValues, fields, ["price", "expected_price", "amount"], [/\bprice\b/i, /\bamount\b/i, /\bcost\b/i], listing.price);
  setHydratedFieldValue(nextValues, fields, ["brand", "brand_name"], [/\bbrand\b/i], listing.brand);
  setHydratedFieldValue(nextValues, fields, ["description", "product_description", "details"], [/\bdescription\b/i, /\bdetails?\b/i], listing.description);
  setHydratedFieldValue(nextValues, fields, ["location", "pickup_location", "city"], [/\blocation\b/i, /\bcity\b/i], listing.location);
  nextValues.offerBadge = listing.offerBadge || "";

  return nextValues;
};

const getCustomFieldsForListing = (listing) =>
  (listing?.overviewFields || [])
    .filter((field) => String(field.name || "").startsWith("custom_"))
    .map((field) => ({
      name: field.name,
      label: field.label,
      type: field.type || "text",
    }));

const ListingCard = ({ listing }) => {
  const { t } = useAppText();

  return (
    <article className="grid grid-cols-[6.5rem_minmax(0,1fr)] overflow-hidden border border-slate-100 bg-white">
      <div className="h-28 bg-[#f1efff]">
        {listing.image ? (
          <img
            alt={listing.title}
            className="h-full w-full object-cover"
            src={listing.image}
          />
        ) : (
          <div className="grid h-full place-items-center text-[#4d49b9]">
            <PackageOpen className="size-8" />
          </div>
        )}
      </div>

      <div className="min-w-0 p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-black text-[#102a43]">
              {listing.title}
            </h2>
            <p className="mt-1 truncate text-sm font-semibold text-slate-500">
              {[listing.category, listing.subcategory]
                .filter(Boolean)
                .map((item) => translateListingText(item, t))
                .join(" - ") || t("marketplaceListing")}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[#f1efff] px-2 py-1 text-[10px] font-black text-[#4d49b9]">
            {translateListingText(listing.status || "Active", t)}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-base font-black text-[#102a43]">
            {formatCurrency(listing.price)}
          </span>
          <span className="text-[11px] font-bold text-slate-400">
            {translateListingText(listing.postedAt || "Recently", t)}
          </span>
        </div>

        {listing.location && (
          <p className="mt-2 flex min-w-0 items-center gap-1 text-sm font-semibold text-slate-500">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">{listing.location}</span>
          </p>
        )}
      </div>
    </article>
  );
};

const AddListing = () => {
  const navigate = useNavigate();  
  const { listingId } = useParams();
  const location = useLocation();
  const { language, t } = useAppText();
  const savedListings = useMemo(() => getUserListings(), []);
  const routeEditingListing = useMemo(
    () =>
      savedListings.find((listing) => String(listing.id) === String(listingId)) ||
      location.state?.listing,
    [listingId, location.state?.listing, savedListings],
  );
  const [editingListing, setEditingListing] = useState(routeEditingListing || null);
  const isEditing = Boolean(listingId);
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [listings, setListings] = useState(() => savedListings);
  const [categories, setCategories] = useState([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState("");
  const [backendFormFields, setBackendFormFields] = useState([]);
  const [formValues, setFormValues] = useState(() =>
    isEditing ? { ...(editingListing || {}) } : {},
  );
  const [customFields, setCustomFields] = useState(() =>
    isEditing ? getCustomFieldsForListing(editingListing) : [],
  );
  const [newField, setNewField] = useState({
    label: "",
    type: "text",
  });
  const [listingPhotos, setListingPhotos] = useState(() =>
    isEditing
      ? (editingListing?.photos?.length ? editingListing.photos : [editingListing?.image]).filter(Boolean).slice(0, 4)
      : [],
  );
  const [listingPhotoFiles, setListingPhotoFiles] = useState([]);
  const [validationErrors, setValidationErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (!isEditing) return undefined;

    const loadEditingListing = async () => {
      try {
        const response = await getProduct(listingId);
        const nextListing = normalizeProduct(response.product || response.data?.product || {});

        if (isMounted) {
          setEditingListing(nextListing);
          setCustomFields(getCustomFieldsForListing(nextListing));
          setListingPhotos((nextListing.photos?.length ? nextListing.photos : [nextListing.image]).filter(Boolean).slice(0, 4));
        }
      } catch (error) {
        console.error("[AddListing.loadEditingListing]", error);
        if (isMounted && routeEditingListing) {
          const fallbackListing = normalizeProduct(routeEditingListing);
          setEditingListing(fallbackListing);
          setCustomFields(getCustomFieldsForListing(fallbackListing));
          setListingPhotos((fallbackListing.photos?.length ? fallbackListing.photos : [fallbackListing.image]).filter(Boolean).slice(0, 4));
        }
      }
    };

    loadEditingListing();

    return () => {
      isMounted = false;
    };
  }, [isEditing, listingId, routeEditingListing]);

  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        setCategoryError("");
        const apiCategories = await getCategories();
        const nextCategories = normalizeApiCategories(apiCategories);

        if (isMounted && nextCategories.length) {
          setCategories(nextCategories);
          setSelectedCategoryId((current) =>
            nextCategories.some((category) => category.id === current)
              ? current
              : nextCategories[0].id,
          );
        }
      } catch (error) {
        console.error("[AddListing.loadCategories]", error);

        if (isMounted) {
          setCategoryError("Unable to load categories right now.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingCategories(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === selectedCategoryId),
    [categories, selectedCategoryId],
  );

  const selectedSubcategory = useMemo(
    () =>
      selectedCategory?.items.find((item) => item.id === selectedSubcategoryId),
    [selectedCategory, selectedSubcategoryId],
  );

  useEffect(() => {
    let isMounted = true;

    const loadCategoryForm = async () => {
      if (!selectedSubcategoryId) {
        setBackendFormFields([]);
        return;
      }

      try {
        const formConfig = await getCategoryForm(selectedSubcategoryId);
        const nextFields = (formConfig?.fields || []).map(normalizeApiField);

        if (isMounted) {
          setBackendFormFields(nextFields);
        }
      } catch (error) {
        console.error("[AddListing.loadCategoryForm]", error);

        if (isMounted) {
          setBackendFormFields([]);
        }
      }
    };

    loadCategoryForm();

    return () => {
      isMounted = false;
    };
  }, [selectedSubcategoryId]);

  const dynamicFields = useMemo(
    () =>
      (backendFormFields.length ? backendFormFields : selectedSubcategory?.fields || [])
        .filter((field) => !isCommonListingField(field)),
    [backendFormFields, selectedSubcategory],
  );

  useEffect(() => {
    if (!isEditing || !editingListing || !categories.length) return;

    const matchedCategory = categories.find((category) =>
      category.items.some((item) => String(item.id) === String(editingListing.subcategoryId)),
    );

    if (matchedCategory) {
      // Prefill edit route selection after backend details are loaded.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelectedCategoryId(matchedCategory.id);
      setSelectedSubcategoryId(editingListing.subcategoryId);
    }
  }, [categories, editingListing, isEditing]);

  useEffect(() => {
    if (!isEditing || !editingListing || !selectedSubcategory) return;

    // Hydrate dynamic backend fields once their admin form config is available.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFormValues(hydrateListingFormValues(editingListing, [...commonListingFields, ...dynamicFields, ...customFields]));
  }, [backendFormFields, customFields, dynamicFields, editingListing, isEditing, selectedSubcategory]);

  const showToast = (message, type = "error") => {
    setToast({ message, type });
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(null), 2800);
  };

  const validateListingForm = () => {
    const requiredFields = [
      ...commonListingFields.filter((field) => field.isRequired),
      ...dynamicFields.filter((field) => field.isRequired),
      ...customFields,
    ];
    const nextErrors = {};

    if (!selectedSubcategory) {
      nextErrors.subcategory = "Please select a subcategory.";
    }

    requiredFields.forEach((field) => {
      if (isBlank(formValues[field.name])) {
        nextErrors[field.name] = `${field.label} is required.`;
      }
    });

    const listingFields = [...commonListingFields, ...dynamicFields, ...customFields];
    const listingTitle = getResolvedFieldValue(
      formValues,
      listingFields,
      ["title", "listing_title", "product_title", "name"],
      [/\btitle\b/i, /\bproduct\s*name\b/i, /\blisting\s*name\b/i],
    );
    const listingPrice = getResolvedFieldValue(
      formValues,
      listingFields,
      ["price", "expected_price", "amount"],
      [/\bprice\b/i, /\bamount\b/i, /\bcost\b/i],
    );

    if (isBlank(listingTitle.value)) {
      nextErrors[listingTitle.fieldName] = "Title is required.";
    }

    if (isBlank(listingPrice.value)) {
      nextErrors[listingPrice.fieldName] = "Expected price is required.";
    }

    if (!isBlank(listingPrice.value) && Number(listingPrice.value) <= 0) {
      nextErrors[listingPrice.fieldName] =
        "Expected price must be greater than 0.";
    }

    setValidationErrors(nextErrors);
    return nextErrors;
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId("");
    setBackendFormFields([]);
    setFormValues({});
    setCustomFields([]);
    setValidationErrors({});
  };

  const handleSubcategoryChange = (subcategoryId) => {
    setSelectedSubcategoryId(subcategoryId);
    setBackendFormFields([]);
    setValidationErrors((current) => {
      const next = { ...current };
      delete next.subcategory;
      return next;
    });
  };

  const updateField = (name, value) => {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
    setValidationErrors((current) => {
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const addCustomField = () => {
    const label = newField.label.trim();

    if (!label) {
      showToast("Field name is required.");
      return;
    }

    const fieldName = `custom_${Date.now()}`;

    setCustomFields((current) => [
      ...current,
      {
        name: fieldName,
        label,
        type: newField.type,
        placeholder: t("enterField", { field: label.toLowerCase() }),
      },
    ]);
    setNewField({
      label: "",
      type: "text",
    });
  };

  const removeCustomField = (fieldName) => {
    setCustomFields((current) =>
      current.filter((field) => field.name !== fieldName),
    );
    setFormValues((current) => {
      const next = { ...current };
      delete next[fieldName];
      return next;
    });
  };

  const handlePhotoUpload = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    if (!selectedFiles.length) return;

    const availableSlots = Math.max(4 - listingPhotoFiles.length, 0);
    if (availableSlots === 0) {
      showToast("You can upload up to 4 photos only.");
      event.target.value = "";
      return;
    }

    if (selectedFiles.length > availableSlots) {
      showToast("You can upload up to 4 photos only.");
    }

    const nextFiles = [...listingPhotoFiles, ...selectedFiles.slice(0, availableSlots)];
    const previews = nextFiles.map((file) => URL.createObjectURL(file));
    setListingPhotoFiles(nextFiles);
    setListingPhotos(previews);
    event.target.value = "";
  };

  const resetForm = () => {
    setSelectedCategoryId(categories[0]?.id || "");
    setSelectedSubcategoryId("");
    setBackendFormFields([]);
    setFormValues({});
    setCustomFields([]);
    setNewField({
      label: "",
      type: "text",
    });
    setListingPhotos([]);
    setListingPhotoFiles([]);
    setValidationErrors({});
  };

  const handlePostListing = async () => {
    const errors = validateListingForm();

    if (Object.keys(errors).length > 0) {
      showToast(Object.values(errors)[0]);
      return;
    }

    if (isEditing && !editingListing?.id) {
      showToast("Listing details are still loading.");
      return;
    }

    const overviewFields = buildListingOverviewFields(
      [...dynamicFields, ...customFields],
      formValues,
    );
    const listingFields = [...commonListingFields, ...dynamicFields, ...customFields];
    const listingTitle = getResolvedFieldValue(
      formValues,
      listingFields,
      ["title", "listing_title", "product_title", "name"],
      [/\btitle\b/i, /\bproduct\s*name\b/i, /\blisting\s*name\b/i],
    ).value;
    const listingPrice = getResolvedFieldValue(
      formValues,
      listingFields,
      ["price", "expected_price", "amount"],
      [/\bprice\b/i, /\bamount\b/i, /\bcost\b/i],
    ).value;
    const listingBrand = getResolvedFieldValue(
      formValues,
      listingFields,
      ["brand", "brand_name"],
      [/\bbrand\b/i],
    ).value;
    const listingDescription = getResolvedFieldValue(
      formValues,
      listingFields,
      ["description", "product_description", "details"],
      [/\bdescription\b/i, /\bdetails?\b/i],
    ).value;
    const listingLocation = getResolvedFieldValue(
      formValues,
      listingFields,
      ["location", "pickup_location", "city"],
      [/\blocation\b/i, /\bcity\b/i],
    ).value;
    const listingCondition = getResolvedFieldValue(
      formValues,
      listingFields,
      ["condition"],
      [/\bcondition\b/i],
    ).value;
    const listingWarranty = getResolvedFieldValue(
      formValues,
      listingFields,
      ["warranty"],
      [/\bwarranty\b/i],
    ).value;
    const listingUsedFor = getResolvedFieldValue(
      formValues,
      listingFields,
      ["usedFor", "used_for"],
      [/\bused\s*for\b/i],
    ).value;
    const listingOfferBadge = formValues.offerBadge || "";

    const nextListing = {
      ...formValues,
      title: listingTitle,
      price: listingPrice,
      brand: listingBrand,
      description: listingDescription,
      location: listingLocation,
      condition: listingCondition,
      warranty: listingWarranty,
      usedFor: listingUsedFor,
      offerBadge: listingOfferBadge,
      overviewFields,
      category: selectedCategory?.title,
      subcategory: selectedSubcategory.name,
      subcategoryId: selectedSubcategory.id,
    };

    const productFormData = new FormData();
    productFormData.append("title", listingTitle);
    productFormData.append("price", listingPrice);
    productFormData.append("subcategory_slug", selectedSubcategory.id);
    productFormData.append("brand", listingBrand);
    productFormData.append("description", listingDescription);
    productFormData.append("location", listingLocation);
    productFormData.append("condition", listingCondition);
    productFormData.append("warranty", listingWarranty);
    productFormData.append("usedFor", listingUsedFor);
    productFormData.append("offer_badge", listingOfferBadge);
    productFormData.append(
      "custom_fields",
      JSON.stringify({
        overviewFields,
      }),
    );

    listingPhotoFiles.forEach((file) => {
      productFormData.append("photos", file);
    });

    try {
      setIsSubmitting(true);
      if (isEditing) {
        await updateProduct(editingListing.id, productFormData);
        setListings((current) =>
          current.map((listing) =>
            String(listing.id) === String(editingListing.id)
              ? { ...listing, ...nextListing }
              : listing,
          ),
        );
      } else {
        await createProduct(productFormData);
      }
      resetForm();
      navigate("/sell");
    } catch (error) {
      console.error("[AddListing.handlePostListing]", error);
      showToast(error.response?.data?.message || "Unable to post listing right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isFormOpen) {
    return (
      <div className="min-h-dvh bg-[#f7fafc] text-[#102a43]">
        <header className="sticky top-0 z-20 bg-white px-3 pb-3 pt-3">
          <div className="mx-auto max-w-5xl">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h1 className="truncate text-lg font-black tracking-normal">
                  {t("myListings")}
                </h1>
                <p className="text-sm font-semibold text-slate-500">
                  {t("listingsSelling")}
                </p>
              </div>
              <button
                className="flex h-10 shrink-0 items-center justify-center gap-2 bg-[#4d49b9] px-3 text-sm font-black text-white"
                type="button"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="size-4" />
                {t("add")}
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-5xl space-y-3 px-3 pt-3">
          {listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <section className="bg-white px-4 py-12 text-center ring-1 ring-slate-100">
              <PackageOpen className="mx-auto size-10 text-slate-300" />
              <h2 className="mt-3 text-base font-black text-[#102a43]">
                {t("noListingsYet")}
              </h2>
              <p className="mx-auto mt-1 max-w-sm text-sm font-semibold leading-5 text-slate-500">
                {t("addFirstProduct")}
              </p>
              <button
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 bg-[#4d49b9] px-5 text-sm font-black text-white"
                type="button"
                onClick={() => setIsFormOpen(true)}
              >
                <Plus className="size-4" />
                {t("addListing")}
              </button>
            </section>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-[#f7fafc] text-[#102a43]">
      {toast && (
        <div
          className={`fixed left-3 right-3 top-3 z-50 mx-auto flex max-w-md items-center gap-2 border px-3 py-3 text-sm font-black shadow-lg ${
            toast.type === "error"
              ? "border-red-100 bg-red-50 text-red-700"
              : "border-emerald-100 bg-emerald-50 text-emerald-700"
          }`}
          role="status"
        >
          <CircleAlert className="size-4 shrink-0" />
          <span className="leading-5">{toast.message}</span>
        </div>
      )}
      <header className="sticky top-0 z-20 overflow-hidden bg-white px-3 pb-2 pt-3">
        {/* <div className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full bg-white/55" /> */}
        {/* <div className="pointer-events-none absolute -left-14 bottom-[-4.5rem] size-36 rounded-full bg-[#8f8cf5]/16" /> */}
        <div className="relative mx-auto max-w-5xl">
          <div className="flex items-center gap-3">
            <button
              aria-label={t("back")}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/90 bg-white text-[#102a43] "
              type="button"
              onClick={() => navigate("/sell")}
            >
              <ArrowLeft className="size-5" />
            </button>
            <div>
              <h1 className="text-lg font-black tracking-normal">
                {isEditing ? "Edit Listing" : t("sellItem")}
              </h1>
              <p className="text-sm font-semibold text-[#102a43]/58">
                {isEditing ? "Update your listing details" : t("addListingDetails")}
              </p>
            </div>
          </div>
        </div>
      </header>
      <main className="relative z-10 mx-auto max-w-5xl space-y-4 px-3 pb-4 pt-3">
        <section className=" border border-slate-100 bg-white p-3.5">
          <div className="mt-1 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-[#102a43]">
                {t("category")}
              </span>
              <select
                className="h-12 w-full border border-slate-100 bg-white px-3 text-sm font-semibold text-[#102a43]  outline-none "
                disabled={isLoadingCategories}
                value={selectedCategoryId}
                onChange={(event) => handleCategoryClick(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
              {categoryError && (
                <span className="mt-1 block text-xs font-bold text-red-500">
                  {categoryError}
                </span>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-black text-[#102a43]">
                {t("subcategory")}
              </span>
              <select
                className={`h-12 w-full border bg-white px-3 text-sm font-semibold text-[#102a43] outline-none ${
                  validationErrors.subcategory
                    ? "border-red-300 ring-1 ring-red-200"
                    : "border-slate-100"
                }`}
                disabled={isLoadingCategories}
                required
                value={selectedSubcategoryId}
                onChange={(event) => handleSubcategoryChange(event.target.value)}
              >
                <option value="">{t("selectSubcategory")}</option>
                {selectedCategory?.items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {validationErrors.subcategory && (
                <span className="mt-1 block text-xs font-bold text-red-500">
                  {validationErrors.subcategory}
                </span>
              )}
            </label>
          </div>
        </section>

        <section className=" border border-slate-100 bg-white p-3.5 ">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-[#f1efff] text-[#4d49b9] ring-1 ring-[#ded2ff]">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-black tracking-normal">
                  {t("listingDetails")}
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  {selectedSubcategory
                    ? t("requiredInfo", { item: selectedSubcategory.name })
                    : t("selectSubcategoryFields")}
                </p>
              </div>
            </div>
            {selectedSubcategory && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f1efff] px-3 py-1.5 text-sm font-black text-[#4d49b9]">
                <CheckCircle2 className="size-3.5" />
                {t("ready")}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {commonListingFields.map((field) => (
              <div
                className={field.type === "textarea" ? "sm:col-span-2" : ""}
                key={field.name}
              >
                <Field
                  field={field}
                  value={formValues[field.name]}
                  error={validationErrors[field.name]}
                  onChange={updateField}
                />
              </div>
            ))}

            {dynamicFields.map((field) => (
              <div
                className={field.type === "textarea" ? "sm:col-span-2" : ""}
                key={field.name}
              >
                <Field
                  field={field}
                  value={formValues[field.name]}
                  error={validationErrors[field.name]}
                  onChange={updateField}
                />
              </div>
            ))}

            {customFields.map((field) => (
              <div className="relative" key={field.name}>
                <Field
                  field={field}
                  value={formValues[field.name]}
                  error={validationErrors[field.name]}
                  onChange={updateField}
                />
                <button
                  aria-label={t("removeField", { field: field.label })}
                  className="absolute right-2 top-0 grid size-7 place-items-center rounded-full text-slate-400 active:scale-95"
                  type="button"
                  onClick={() => removeCustomField(field.name)}
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <label className="mt-3 block">
            <span className="mb-1.5 block text-sm font-black text-[#102a43]">
              Offer Badge
            </span>
            <select
              className="h-12 w-full border border-slate-100 bg-white px-3 text-sm font-semibold text-[#102a43] outline-none"
              value={formValues.offerBadge || ""}
              onChange={(event) => updateField("offerBadge", event.target.value)}
            >
              {offerBadgeOptions.map((badge) => (
                <option key={badge || "none"} value={badge}>
                  {badge ? translateListingText(badge, t) : "No Badge"}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-3  border border-dashed border-[#c9c8ff] bg-[#fbfaff] p-3">
            <div className="mb-3">
              <h3 className="text-sm font-black text-[#102a43]">
                {t("addCustomField")}
              </h3>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {t("addMissingDetail")}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                className="h-12 w-full  border border-slate-100 bg-white px-3 text-sm font-semibold text-[#102a43]  outline-none placeholder:text-slate-400 "
                placeholder={t("fieldName")}
                type="text"
                value={newField.label}
                onChange={(event) =>
                  setNewField((current) => ({
                    ...current,
                    label: event.target.value,
                  }))
                }
              />
              <select
                className="h-12 w-full  border border-slate-100 bg-white px-3 text-sm font-semibold text-[#102a43] outline-none"
                value={newField.type}
                onChange={(event) =>
                  setNewField((current) => ({
                    ...current,
                    type: event.target.value,
                  }))
                }
              >
                {customFieldTypes.map((fieldType) => (
                  <option key={fieldType.value} value={fieldType.value}>
                    {translateFormText(fieldType.label, language)}
                  </option>
                ))}
              </select>
              <button
                className="flex h-12 items-center justify-center gap-2  bg-[#7f7db6]  px-4 text-sm font-black text-white sm:col-span-2"
                type="button"
                onClick={addCustomField}
              >
                <Plus className="size-4" />
                {t("add")}
              </button>
            </div>
          </div>

          <label className="mt-3 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-[#c9c8ff] bg-[#fbfaff] px-4 py-5 text-center">
            <ImagePlus className="size-7 text-[#4d49b9]" />
            <span className="text-sm font-black text-[#102a43]">
              {t("addProductPhotos")}
            </span>
            <span className="text-sm font-semibold text-slate-500">
              {t("photoHelp")}
            </span>
            {listingPhotos.length > 0 && (
              <div className="mt-2 grid grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, index) => {
                  const photo = listingPhotos[index];

                  return (
                    <span
                      className="relative grid size-16 place-items-center overflow-hidden border border-[#ded2ff] bg-white text-[10px] font-black text-slate-400"
                      key={photo || index}
                    >
                      {photo ? (
                        <img
                          alt={t("selectedListing")}
                          className="h-full w-full object-cover"
                          src={photo}
                        />
                      ) : (
                        index + 1
                      )}
                      {index === 0 && photo && (
                        <span className="absolute bottom-0 left-0 right-0 bg-[#4d49b9] py-0.5 text-[9px] font-black text-white">
                          Main
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
            <input
              accept="image/*"
              className="hidden"
              multiple
              type="file"
              onChange={handlePhotoUpload}
            />
          </label>

          <button
            className="mt-4 flex h-12 w-full items-center justify-center gap-2  bg-[#7f7db6]  text-sm font-black text-white "
            disabled={isSubmitting}
            type="button"
            onClick={handlePostListing}
          >
            <MapPin className="size-4" />
            {isSubmitting ? "Posting..." : isEditing ? "Save Changes" : t("postListing")}
          </button>
        </section>
      </main>
    </div>
  );
};

export default AddListing;
