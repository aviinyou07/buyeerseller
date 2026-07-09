import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  ChevronRight,
  Globe2,
  LogOut,
  MapPin,
  Phone,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getlistings, normalizeProduct } from "../api/productsApi";
import {
  getOrders as getOrdersFromApi,
  getSales as getSalesFromApi,
} from "../api/ordersApi";
import { getProfileData, updateProfileData } from "../api/usersApi";
import { getWishlist as getWishlistFromApi } from "../api/wishlistsApi";
import { translateStaticText, useAppText } from "../appText";
import {
  PROFILE_IMAGE_KEY,
  formatCurrency,
  getCurrentUser,
  logout as logoutUser,
  saveCurrentUser,
} from "../services/marketplaceData";
import toast from 'react-hot-toast';

// const activityActions = [
//   {
//     label: "Wishlist",
//     detail: "Saved listings and favorites",
//     icon: Heart,
//   },
 

//   {
//     label: "My Listings",
//     detail: "Manage listings you are selling",
//     icon: Store,
//     action: "sell-page",
//   },
// ];





const moreActions = [
  {
    label: "Logout",
    detail: "Sign out from your account",
    icon: LogOut,
    danger: true,
    action: "logout",
  },
];


const formatPrice = (price) => formatCurrency(price);

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const normalizeOrder = (order) => ({
  id: order.order_id || order.id,
  title: order.product_title || order.title || "",
  seller: order.seller_name || order.seller || "",
  amount: order.amount || order.total_amount || order.product_price || 0,
  date: formatDate(order.created_at || order.date),
  status: order.order_status || order.status || "",
});

const normalizeSale = (sale) => ({
  id: sale.order_id || sale.id,
  title: sale.product_title || sale.title || "",
  buyer: sale.buyer_name || sale.buyer || "",
  amount: sale.amount || sale.total_amount || sale.product_price || 0,
  date: formatDate(sale.created_at || sale.date),
  status: sale.payment_status || sale.status || "",
});

const buildPopup = ({ title, subtitle, items }) => ({
  title,
  subtitle,
  items: items.filter((item) => item.detail || item.meta),
});

const translateProfileText = (value, language) => translateStaticText(value, language)

const translatedListingSummary = (listing, language) =>
  [listing.category, listing.subcategory]
    .filter(Boolean)
    .map((item) => translateProfileText(item, language))
    .join(" - ");

const SectionCard = ({ title, children }) => {
  const { t } = useAppText();
  const titleMap = {
    "My Activity": t("myActivity"),
    Account: t("account"),
    "Seller Tools": t("sellerTools"),
    More: t("more"),
  };

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-xs font-black uppercase tracking-normal text-slate-500">
        {titleMap[title] || title}
      </h2>
      <div className="overflow-hidden rounded-lg border border-slate-100 bg-white ">
        {children}
      </div>
    </section>
  );
};

const MenuRow = ({ item, onClick }) => {
  const Icon = item.icon;
  const { language, t } = useAppText();
  const labelMap = {
    Wishlist: t("wishlist"),
    "My Orders": t("myOrders"),
    "My Listings": t("myListings"),
    "Sales History": t("salesHistory"),
  };
  const detailMap = {
    "Saved listings and favorites": t("wishlistDetail"),
    "View your purchase history": t("ordersDetail"),
    "Manage listings you are selling": t("listingsSelling"),
    "Track sold listings and earnings": t("salesDetail"),
  };

  return (
    <button
      className="group flex w-full items-center gap-3 border-b border-slate-100 bg-white px-3.5 py-3.5 text-left"
      type="button"
      onClick={onClick}
    >
      <span
        className={`grid size-10 shrink-0 place-items-center rounded-lg  ${
          item.danger
            ? "bg-rose-50 text-rose-500 ring-1 ring-rose-100"
            : "bg-[#f1efff] text-[#4d49b9] ring-1 ring-[#ded9ff]"
        }`}
      >
        <Icon className="size-5" strokeWidth={2.1} />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={`block text-sm font-extrabold ${
            item.danger ? "text-rose-500" : "text-[#102a43]"
          }`}
        >
          {labelMap[item.label] || translateProfileText(item.label, language)}
        </span>
        <span className="mt-0.5 block truncate text-xs font-semibold text-slate-500">
          {detailMap[item.detail] ||
            translateProfileText(item.detail, language)}
        </span>
      </span>
      {item.badge && (
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#f1efff] px-2 py-1 text-[11px] font-black text-[#4d49b9]">
          <BadgeCheck className="size-3" />
          {item.badge}
        </span>
      )}
      <ChevronRight className="size-4 shrink-0 text-slate-400" />
    </button>
  );
};

const InfoPopup = ({ data, onClose }) => {
  const { language } = useAppText();
  const title = translateProfileText(data.title, language);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102a43]/55 px-3 py-4 backdrop-blur-sm">
      <section className="max-h-[84dvh] w-full max-w-lg overflow-hidden rounded-lg bg-white ring-1 ring-white/70">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 p-4">
          <div>
            <h2 className="text-lg font-black text-[#102a43]">{title}</h2>
            <p className="mt-1 text-xs font-semibold text-slate-500">
              {translateProfileText(data.subtitle, language)}
            </p>
          </div>
          <button
            aria-label={title}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#102a43]  ring-1 ring-slate-200 active:scale-95"
            type="button"
            onClick={onClose}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[calc(84dvh-76px)] overflow-y-auto p-3">
          <div className="space-y-2">
            {data.items.length > 0 ? data.items.map((item) => (
              <div
                className="rounded-lg border border-slate-100 bg-white p-3.5"
                key={`${data.title}-${item.title}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-black text-[#102a43]">
                      {translateProfileText(item.title, language)}
                    </h3>
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {translateProfileText(item.detail, language)}
                    </p>
                  </div>
                  {item.meta && (
                    <span className="shrink-0 rounded-full bg-[#f1efff] px-2.5 py-1 text-[11px] font-black text-[#4d49b9]">
                      {translateProfileText(item.meta, language)}
                    </span>
                  )}
                </div>
              </div>
            )) : (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                {translateProfileText("No records found", language)}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

const ProfileLanguageToggle = () => {
  const { language, setLanguage, t } = useAppText();
  const options = [
    { value: "en", short: "EN", label: t("english") },
    { value: "hi", short: "HI", label: t("hindi") },
  ];

  return (
    <div className="flex w-full items-center justify-between gap-3 border-b border-slate-100 bg-white px-3.5 py-3.5 text-left">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-[#e9f8ff] text-[#25aee4] ring-1 ring-[#ccefff]">
          <Globe2 className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-extrabold text-[#102a43]">
            {t("language")}
          </span>
          <span className="mt-0.5 block text-xs font-semibold text-slate-500">
            {options.find((option) => option.value === language)?.label}
          </span>
        </span>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-full bg-slate-100 p-1 ring-1 ring-slate-200">
        {options.map((option) => {
          const isActive = language === option.value;

          return (
            <button
              className={`h-8 min-w-12 rounded-full px-3 text-xs font-black transition ${
                isActive
                  ? "bg-[#25aee4] text-white"
                  : "text-slate-500"
              }`}
              key={option.value}
              type="button"
              onClick={() => setLanguage(option.value)}
            >
              {option.short}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const { language, t } = useAppText();
  const fileInputRef = useRef(null);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [isListingsOpen, setIsListingsOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const [activePopup, setActivePopup] = useState(null);
  const [popupData, setPopupData] = useState(null);
  const [popupError, setPopupError] = useState("");
  const [listings, setListings] = useState([]);
  const [authUser, setAuthUser] = useState(() => getCurrentUser());
  const [profileImage, setProfileImage] = useState(
    () =>
      getCurrentUser().profileImage ||
      localStorage.getItem(PROFILE_IMAGE_KEY) ||
      "",
  );
  const [orders, setOrders] = useState([]);
  const [sales, setSales] = useState([]);
  const isPopupOpen = Boolean(
    activePopup || isListingsOpen || isOrdersOpen || isSalesOpen,
  );

  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    business_name: "",
    gst_number: "",
  });
  const [isEditLoading, setIsEditLoading] = useState(false);
  
  const handleEditClick = async () => {
    setIsEditing(true);
    setIsEditLoading(true);
    try {
      const response = await getProfileData();
      const pd = response.profileData || response.data?.profileData || {};
      const primaryAddress = pd.addresses?.find(a => a.is_default) || pd.addresses?.[0];
      const businessName = authUser.business_name || pd.sellerDetails?.business_name || "";
      const gstNumber = authUser.gst_number || pd.sellerDetails?.gst_number || "";
      
      setEditFormData({
        full_name: authUser.fullName || authUser.name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
        address: primaryAddress?.address_line || "",
        business_name: businessName,
        gst_number: gstNumber,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.full_name || !editFormData.email || !editFormData.phone || !editFormData.address) {
       toast.error(translateProfileText("Please fill all mandatory fields (Name, Email, Phone, Address)", language));
       return;
    }
    
    try {
      await updateProfileData(editFormData);
      const updatedUser = { ...authUser, fullName: editFormData.full_name, name: editFormData.full_name, email: editFormData.email, phone: editFormData.phone };
      setAuthUser(saveCurrentUser(updatedUser));
      setIsEditing(false);
      toast.success(translateProfileText("Profile updated successfully!", language));
    } catch (e) {
      const msg = e.response?.data?.message || e.message || "Failed to update profile";
      toast.error(translateProfileText(msg, language));
    }
  };

  const displayName = authUser.fullName || authUser.name || "";
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean);
  const profileInitials =
    nameParts.length > 1
      ? `${Array.from(nameParts[0])[0] || ""}${Array.from(nameParts.at(-1))[0] || ""}`.toLocaleUpperCase()
      : (Array.from(nameParts[0] || "")[0] || "").toLocaleUpperCase();
  const displayPhone = authUser.phone
    ? ` ${authUser.phone}`
    : "";
  const displayEmail = authUser.email;

  useEffect(() => {
    if (!isPopupOpen) return undefined;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isPopupOpen]);

  const openListings = async () => {
    const response = await getlistings({
      sellerId: authUser.id,
      status: "all",
      limit: 100,
    });
    setListings((response.listings || response.data?.listings || []).map(normalizeProduct));
    setIsListingsOpen(true);
  };

  const visibleListings = listings;

  const openOrders = async () => {
    const response = await getOrdersFromApi();
    setOrders((response.orders || response.data?.orders || []).map(normalizeOrder));
    setIsOrdersOpen(true);
  };

  const openSales = async () => {
    const response = await getSalesFromApi();
    setSales((response.sales || response.data?.sales || []).map(normalizeSale));
    setIsSalesOpen(true);
  };

  const openInfoPopup = async (label) => {
    setActivePopup(label);
    setPopupData(null);
    setPopupError("");

    try {
      if (label === "Wishlist") {
        const response = await getWishlistFromApi();
        const wishlist = response.wishlist || response.data?.wishlist || [];
        setPopupData(buildPopup({
          title: translateProfileText("Wishlist", language),
          subtitle: translateProfileText("Saved listings and favorites", language),
          items: wishlist.map((item) => ({
            title: item.title,
            detail: item.category_name || "",
            meta: formatPrice(item.price),
          })),
        }));
        return;
      }

      const [profileResponse, listingsResponse] = await Promise.all([
        getProfileData(),
        getlistings({ sellerId: authUser.id, status: "all", limit: 100 }),
      ]);
      const profileData = profileResponse.profileData || profileResponse.data?.profileData || {};
      const userListings = (listingsResponse.listings || listingsResponse.data?.listings || [])
        .map(normalizeProduct);

      const popupByLabel = {
        "Personal Information": buildPopup({
          title: translateProfileText("Personal Information", language),
          subtitle: translateProfileText("Your basic marketplace profile details", language),
          items: [
            { title: translateProfileText("Full Name", language), detail: authUser.fullName || "" },
            { title: translateProfileText("Email Address", language), detail: authUser.email || "" },
            { title: translateProfileText("Phone Number", language), detail: authUser.phone || "" },
          ],
        }),
        Addresses: buildPopup({
          title: translateProfileText("Addresses", language),
          subtitle: translateProfileText("Saved delivery and pickup addresses", language),
          items: (profileData.addresses || []).map((address) => ({
            title: address.title || "",
            detail: address.address_line || "",
            meta: address.is_default ? translateProfileText("Default", language) : "",
          })),
        }),
        "Bank Accounts": buildPopup({
          title: translateProfileText("Bank Accounts", language),
          subtitle: translateProfileText("Seller payout account details", language),
          items: (profileData.bankAccounts || []).map((account) => ({
            title: account.bank_name || "",
            detail: account.account_details || "",
            meta: account.is_primary ? translateProfileText("Primary", language) : "",
          })),
        }),
        "Manage Seller Profile": buildPopup({
          title: translateProfileText("Manage Seller Profile", language),
          subtitle: translateProfileText("Store name, seller rating and business details", language),
          items: [
            {
              title: translateProfileText("Active Listings", language),
              detail: String(userListings.length),
            },
          ],
        }),
        Earnings: buildPopup({
          title: translateProfileText("Earnings", language),
          subtitle: translateProfileText("Total earned and payment history", language),
          items: [
            {
              title: translateProfileText("Total Earned", language),
              detail: translateProfileText("From completed sales", language),
              meta: formatPrice(profileData.earnings?.totalEarned || 0),
            },
            {
              title: translateProfileText("Pending Payout", language),
              meta: formatPrice(profileData.earnings?.pendingPayout || 0),
            },
            {
              title: translateProfileText("Platform Fee", language),
              meta: formatPrice(profileData.earnings?.platformFee || 0),
            },
          ],
        }),
      };

      setPopupData(popupByLabel[label] || buildPopup({ title: label, subtitle: "", items: [] }));
    } catch (error) {
      console.error("[Profile.openInfoPopup]", error);
      setPopupError(error.response?.data?.message || "Unable to load this section right now.");
    }
  };

  const handleActionClick = async (item) => {
    if (item.action === "sell-page") {
      navigate("/sell");
    } else if (item.action === "listings") {
      await openListings();
    } else if (item.action === "sales") {
      await openSales();
    } else if (item.action === "orders") {
      await openOrders();
    } else if (item.action === "logout") {
      logoutUser();
      navigate("/login");
    } else {
      await openInfoPopup(item.label);
    }
  };

  const handleProfileImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const image = String(reader.result || "");
      setProfileImage(image);
      setAuthUser(saveCurrentUser({ ...authUser, profileImage: image }));
    };
    reader.readAsDataURL(file);
  };

  // const handleRemoveProfileImage = () => {
  //   setProfileImage("");
  //   localStorage.removeItem(PROFILE_IMAGE_KEY);
  //   setAuthUser(saveCurrentUser({ ...authUser, profileImage: "" }));

  //   if (fileInputRef.current) {
  //     fileInputRef.current.value = "";
  //   }
  // };

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#f4f7fb] via-[#f8fafc] to-white text-[#102a43]">
      <header className="sticky top-0 z-30 bg-[#f4f7fb]/95 px-3 pb-2 pt-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            aria-label={t("back")}
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#102a43]  ring-1 ring-slate-100"
            type="button"
            onClick={() => navigate("/buy")}
          >
            <ArrowLeft className="size-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black tracking-normal">
              {t("myProfile")}
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              {t("manageAccount")}
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-4 px-3 pb-8 pt-2">
        <section className="relative overflow-hidden  bg-[#e6e4ff] p-2.5 ">
          <div className="relative flex items-end gap-3 text-left">
            <div className="relative size-18 shrink-0 sm:size-20">
              <span className="grid size-18 place-items-center overflow-hidden rounded-full text-[#4d49b9]  ring-4 ring-white sm:size-20">
                {profileImage ? (
                  <img
                    alt={displayName}
                    className="h-full w-full object-cover"
                    src={profileImage}
                  />
                ) : (
                  <span className="text-2xl font-semibold leading-none sm:text-3xl">
                    {profileInitials}
                  </span>
                )}
              </span>
              <button
                aria-label={translateProfileText("Update photo", language)}
                className="absolute bottom-0 right-0 grid size-7 place-items-center rounded-full bg-[#4d49b9] text-white  ring-2 ring-white transition active:scale-95"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="size-3.5 sm:size-4" />
              </button>
              {/* {profileImage && (
                <button
                  aria-label={translateProfileText("Remove photo", language)}
                  className="absolute left-0 top-0 grid size-7 place-items-center rounded-full bg-white text-rose-500  ring-1 ring-rose-100 transition active:scale-95"
                  type="button"
                  onClick={handleRemoveProfileImage}
                >
                  <X className="size-4" />
                </button>
              )} */}
              <input
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                type="file"
                onChange={handleProfileImageChange}
              />
            </div>

            <div className="min-w-0 flex-1 p-2">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black tracking-normal">
                    {displayName}
                  </h2>
                  {displayEmail && (
                    <p className="mt-1 truncate text-xs font-semibold text-slate-500">
                      {displayEmail}
                    </p>
                  )}
                  {displayPhone && (
                    <p className="mt-2 flex min-w-0 items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <Phone className="size-3.5 shrink-0" />
                      <span className="truncate">{displayPhone}</span>
                    </p>
                  )}
                </div>
                {!isEditing && (
                  <button
                    onClick={handleEditClick}
                    className="text-[11px] font-bold text-[#4d49b9] bg-white px-3 py-1.5 rounded-full hover:bg-slate-50 ring-1 ring-[#4d49b9] transition-all shrink-0"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

       

        {/* <SectionCard title="My Activity">
          {activityActions.map((item) => (
            <MenuRow
              item={item}
              key={item.label}
              onClick={() => handleActionClick(item)}
            />
          ))}
        </SectionCard> */}

        

        {isEditing ? (
          <SectionCard title={translateProfileText("Edit Profile", language)}>
            {isEditLoading ? (
              <div className="p-4 text-center text-sm font-semibold text-slate-500">
                {translateProfileText("Loading...", language)}
              </div>
            ) : (
              <form onSubmit={handleEditSubmit} className="p-4 space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{translateProfileText("Full Name", language)} *</label>
                  <input required value={editFormData.full_name} onChange={e => setEditFormData({...editFormData, full_name: e.target.value})} className="w-full border border-slate-200 p-2 text-sm rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{translateProfileText("Email", language)} *</label>
                  <input type="email" required value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="w-full border border-slate-200 p-2 text-sm rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{translateProfileText("Phone Number", language)} *</label>
                  <input required value={editFormData.phone} onChange={e => setEditFormData({...editFormData, phone: e.target.value})} className="w-full border border-slate-200 p-2 text-sm rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{translateProfileText("Address", language)} *</label>
                  <textarea required value={editFormData.address} onChange={e => setEditFormData({...editFormData, address: e.target.value})} className="w-full border border-slate-200 p-2 text-sm rounded-md h-20" />
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{translateProfileText("Business Name (Optional)", language)}</label>
                  <input value={editFormData.business_name} onChange={e => setEditFormData({...editFormData, business_name: e.target.value})} className="w-full border border-slate-200 p-2 text-sm rounded-md" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">{translateProfileText("GST Number (Optional)", language)}</label>
                  <input value={editFormData.gst_number} onChange={e => setEditFormData({...editFormData, gst_number: e.target.value})} className="w-full border border-slate-200 p-2 text-sm rounded-md" />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2 text-sm font-bold text-slate-600 bg-slate-100 rounded-md hover:bg-slate-200">
                    {translateProfileText("Cancel", language)}
                  </button>
                  <button type="submit" className="flex-1 py-2 text-sm font-bold text-white bg-[#4d49b9] rounded-md hover:bg-[#3d3a95]">
                    {translateProfileText("Save Profile", language)}
                  </button>
                </div>
              </form>
            )}
          </SectionCard>
        ) : (
          <SectionCard title="More">
            <ProfileLanguageToggle />
            {moreActions.map((item) => (
              <MenuRow
                item={item}
                key={item.label}
                onClick={() => handleActionClick(item)}
              />
            ))}
          </SectionCard>
        )}
      </main>

      {activePopup && (
        <InfoPopup
          data={
            popupData || {
              title: activePopup,
              subtitle: popupError,
              items: [],
            }
          }
          onClose={() => {
            setActivePopup(null);
            setPopupData(null);
            setPopupError("");
          }}
        />
      )}

      {isListingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102a43]/55 px-3 py-4 backdrop-blur-sm">
          <section className="max-h-[84dvh] w-full max-w-lg overflow-hidden rounded-lg bg-white ring-1 ring-white/70">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 p-4">
              <div>
                <h2 className="text-lg font-black text-[#102a43]">
                  {t("myListings")}
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {translateProfileText(
                    "Active and draft ads from your seller account",
                    language,
                  )}
                </p>
              </div>
              <button
                aria-label={translateProfileText("Close my listings", language)}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#102a43]  ring-1 ring-slate-200 active:scale-95"
                type="button"
                onClick={() => setIsListingsOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[calc(84dvh-76px)] overflow-y-auto p-3">
              <div className="space-y-2">
                {visibleListings.length > 0 ? visibleListings.map((listing) => (
                  <div
                    className="rounded-lg border border-slate-100 bg-white p-3.5 "
                    key={listing.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-[#102a43]">
                          {listing.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {translatedListingSummary(listing, language) ||
                            t("marketplaceListing")}
                        </p>
                        {listing.location && (
                          <p className="mt-1 flex min-w-0 items-center gap-1 text-xs font-semibold text-slate-400">
                            <MapPin className="size-3.5 shrink-0" />
                            <span className="truncate">{listing.location}</span>
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-[#102a43]">
                          {formatPrice(listing.price)}
                        </p>
                        <span className="mt-1 inline-flex rounded-full bg-[#f1efff] px-2.5 py-1 text-[11px] font-black text-[#4d49b9]">
                          {translateProfileText(
                            listing.status || "Active",
                            language,
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 text-xs font-semibold text-slate-400">
                      <span>
                        {translateProfileText(
                          listing.postedAt || "Recently posted",
                          language,
                        )}
                      </span>
                      <span>
                        {translateProfileText("Listing ID", language)}:{" "}
                        {listing.id}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                    {translateProfileText("No records found", language)}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {isOrdersOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102a43]/55 px-3 py-4 backdrop-blur-sm">
          <section className="max-h-[84dvh] w-full max-w-lg overflow-hidden rounded-lg bg-white ring-1 ring-white/70">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 p-4">
              <div>
                <h2 className="text-lg font-black text-[#102a43]">
                  {t("myOrders")}
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {translateProfileText(
                    "Recent purchases and delivery updates",
                    language,
                  )}
                </p>
              </div>
              <button
                aria-label={translateProfileText("Close my orders", language)}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#102a43]  ring-1 ring-slate-200 active:scale-95"
                type="button"
                onClick={() => setIsOrdersOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[calc(84dvh-76px)] overflow-y-auto p-3">
              <div className="space-y-2">
                {orders.length > 0 ? orders.map((order) => (
                  <div
                    className="rounded-lg border border-slate-100 bg-white p-3.5"
                    key={order.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-[#102a43]">
                          {order.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {translateProfileText("Seller", language)}:{" "}
                          {order.seller}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {order.date}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-[#102a43]">
                          {formatPrice(order.amount)}
                        </p>
                        <span className="mt-1 inline-flex rounded-full bg-[#f1efff] px-2.5 py-1 text-[11px] font-black text-[#4d49b9]">
                          {translateProfileText(order.status, language)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2 border-t border-slate-100 pt-2 text-xs font-semibold text-slate-400">
                      {translateProfileText("Order ID", language)}: {order.id}
                    </div>
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                    {translateProfileText("No records found", language)}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}

      {isSalesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102a43]/55 px-3 py-4 backdrop-blur-sm">
          <section className="max-h-[84dvh] w-full max-w-lg overflow-hidden rounded-lg bg-white  ring-1 ring-white/70">
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 p-4">
              <div>
                <h2 className="text-lg font-black text-[#102a43]">
                  {t("salesHistory")}
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  {translateProfileText(
                    "Recent sold listings and earnings",
                    language,
                  )}
                </p>
              </div>
              <button
                aria-label={translateProfileText(
                  "Close sales history",
                  language,
                )}
                className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-[#102a43]  ring-1 ring-slate-200 active:scale-95"
                type="button"
                onClick={() => setIsSalesOpen(false)}
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="max-h-[calc(84dvh-76px)] overflow-y-auto p-3">
              <div className="space-y-2">
                {sales.length > 0 ? sales.map((sale) => (
                  <div
                    className="rounded-lg border border-slate-100 bg-white p-3.5"
                    key={sale.id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black text-[#102a43]">
                          {sale.title}
                        </h3>
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          {translateProfileText("Buyer", language)}:{" "}
                          {sale.buyer}
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-400">
                          {sale.date}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-black text-[#102a43]">
                          {formatPrice(sale.amount)}
                        </p>
                        <span className="mt-1 inline-flex rounded-full bg-[#f1efff] px-2.5 py-1 text-[11px] font-black text-[#4d49b9]">
                          {translateProfileText(sale.status, language)}
                        </span>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm font-semibold text-slate-500">
                    {translateProfileText("No records found", language)}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Profile;
