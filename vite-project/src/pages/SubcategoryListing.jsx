import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Eye,
  Heart,
  MapPin,
  Search,
  Star,
  Tag,
  ThumbsUp,
  PackageOpen,
} from "lucide-react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toggleListingLike } from "../api/listingEngagementApi";
import { getlistings, normalizeProduct } from "../api/productsApi";
import {
  addWishlistItem,
  getWishlist as getWishlistFromApi,
  removeWishlistItem,
} from "../api/wishlistsApi";
import { useAppText } from "../appText";
import { isAuthenticated } from "../services/marketplaceData";

const subcategoryNames = {
  mobile: "Mobiles",
  laptop: "Laptops",
  iron: "Irons",
  induction: "Induction Cooktops",
  headphones: "Headphones",
  speaker: "Speakers",
  camera: "Cameras",
  car: "Cars",
  bike: "Bikes",
  scooter: "Scooters",
  cycle: "Cycles",
  "auto-parts": "Auto Parts",
  property: "Property",
  sofa: "Sofas",
  bed: "Beds",
  table: "Tables",
  chair: "Chairs",
  mixer: "Mixers",
  fridge: "Fridges",
  "men-wear": "Men Wear",
  "women-wear": "Women Wear",
  shoes: "Shoes",
  bags: "Bags",
  watches: "Watches",
};

const subcategoryNameKeys = {
  mobile: "subMobiles",
  laptop: "subLaptops",
  iron: "subIrons",
  induction: "subInductionCooktops",
  headphones: "subHeadphones",
  speaker: "subSpeakers",
  camera: "subCameras",
  car: "subCars",
  bike: "subBikes",
  scooter: "subScooters",
  cycle: "subCycles",
  "auto-parts": "subAutoParts",
  property: "subProperty",
  sofa: "subSofas",
  bed: "subBeds",
  table: "subTables",
  chair: "subChairs",
  mixer: "subMixers",
  fridge: "subFridges",
  "men-wear": "subMenWear",
  "women-wear": "subWomenWear",
  shoes: "subShoes",
  bags: "subBags",
  watches: "subWatches",
};

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(price || 0));

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const getCardMeta = (product) => {
  return {
    companyName: product.companyName || product.sellerName || "",
    rating: product.rating || "",
    ratingCount: product.reviewsCount || "",
    offerBadge: product.offerBadge || "",
    isLiked: Boolean(product.isLiked),
    likes: Number(
      product.likesCount ??
        product.likes_count ??
        product.likeCount ??
        product.likes ??
        0,
    ),
    views: Number(
      product.viewsCount ??
        product.views_count ??
        product.viewCount ??
        product.views ??
        0,
    ),
  };
};

const productTextKeys = {
  "Like New": "likeNew",
  Good: "good",
  Fair: "fair",
  "Needs Repair": "needsRepair",
  "Good Condition": "goodCondition",
  "Limited Time Offer": "limitedTimeOffer",
  "Popular Deal": "popularDeal",
  "Best Price": "bestPrice",
};

const translateProductText = (value, t) => t(productTextKeys[value] || value);

const getDynamicSearchValues = (product) =>
  Array.isArray(product.overviewFields)
    ? product.overviewFields.flatMap((field) => [field.label, field.value])
    : [];

const ProductCardSkeleton = () => (
  <div className="grid min-h-[9.75rem] min-w-0 grid-cols-[7.75rem_minmax(0,1fr)] overflow-hidden border-b border-slate-200 bg-white py-3 sm:grid-cols-[10rem_minmax(0,1fr)]">
    <div className="h-full min-h-32 animate-pulse bg-slate-100" />
    <div className="grid min-w-0 grid-rows-[auto_1fr_auto] px-3">
      <div className="min-w-0 animate-pulse">
        <div className="h-4 w-3/4 rounded bg-slate-100" />
        <div className="mt-2 h-4 w-1/2 rounded bg-slate-100" />
        <div className="mt-3 flex items-center gap-2">
          <div className="h-5 w-12 rounded bg-slate-100" />
          <div className="h-3 w-20 rounded bg-slate-100" />
          <div className="h-5 w-16 rounded-full bg-slate-100" />
        </div>
        <div className="mt-3 h-3 w-2/3 rounded bg-slate-100" />
        <div className="mt-3 flex gap-2">
          <div className="h-6 w-24 rounded-md bg-slate-100" />
          <div className="h-6 w-16 rounded-md bg-slate-100" />
        </div>
      </div>
      <div className="flex items-center justify-between gap-2 pt-3">
        <div className="h-5 w-20 animate-pulse rounded bg-slate-100" />
        <div className="h-7 w-14 animate-pulse rounded-md bg-slate-100" />
      </div>
    </div>
  </div>
);

const playTingSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const ctx = new AudioContext();
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.error("Audio playback failed", e);
  }
};

const ProductCard = ({
  product,
  isWishlisted,
  onLikeChange,
  onLoginRequired,
  onViewDetails,
  onWishlistToggle,
}) => {
  const { t } = useAppText();
  const [likeAnimating, setLikeAnimating] = useState(false);
  const [bubbles, setBubbles] = useState([]);
  const meta = getCardMeta(product);
  const isLiked = Boolean(meta.isLiked);
  const likesCount = meta.likes;

  const handleWishlistClick = (event) => {
    event.stopPropagation();
    onWishlistToggle(product, !isWishlisted);
  };

  const handleLikeClick = async (event) => {
    event.stopPropagation();

    if (!isAuthenticated()) {
      onLoginRequired();
      return;
    }

    const nextIsLiked = !isLiked;
    const optimisticLikesCount = Math.max(
      0,
      likesCount + (nextIsLiked ? 1 : -1),
    );

    if (nextIsLiked) {
      setLikeAnimating(true);
      playTingSound();
      const newBubbles = Array.from({ length: 5 }).map((_, i) => ({
        id: Date.now() + i,
        tx: (Math.random() - 0.5) * 60,
        ty: -Math.random() * 60 - 20,
        scale: Math.random() * 0.5 + 0.5,
        rot: (Math.random() - 0.5) * 45,
      }));
      setBubbles(prev => [...prev, ...newBubbles]);
      
      setTimeout(() => {
        setLikeAnimating(false);
      }, 300);
      
      setTimeout(() => {
        setBubbles(prev => prev.filter(b => !newBubbles.find(nb => nb.id === b.id)));
      }, 1000);
    }

    onLikeChange(product.id, {
      isLiked: nextIsLiked,
      likesCount: optimisticLikesCount,
    });

    try {
      const result = await toggleListingLike(product.id);
      const nextLikeState = Boolean(result.isLiked);
      const nextLikesCount = Number(result.likesCount || 0);

      onLikeChange(product.id, {
        isLiked: nextLikeState,
        likesCount: nextLikesCount,
      });
    } catch (error) {
      console.error("[SubcategoryListing.handleLikeClick]", error);
      onLikeChange(product.id, {
        isLiked,
        likesCount,
      });
    }
  };

  return (
    <div
      className="group grid min-h-[9.75rem] min-w-0 cursor-pointer grid-cols-[7.75rem_minmax(0,1fr)] overflow-hidden border-b border-slate-200 bg-white py-3  sm:grid-cols-[10rem_minmax(0,1fr)]"
      role="button"
      tabIndex={0}
      onClick={() => onViewDetails(product)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onViewDetails(product);
        }
      }}
    >
      {/* Left Image */}
      <div className="relative h-full min-h-32 overflow-hidden bg-[#fbfaff] p-2">
        {product.image ? (
          <img
            alt={product.title}
            className="h-full w-full object-contain drop-shadow-sm"
            src={product.image}
          />
        ) : (
          <div className="grid h-full place-items-center text-[#4d49b9]">
            <PackageOpen className="size-9" />
          </div>
        )}

        {meta.offerBadge && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-amber-400 px-1.5 py-0.5 text-[9px] font-black text-[slate-900] shadow-sm">
            <Tag className="size-2.5" />
            {translateProductText(meta.offerBadge, t)}
          </span>
        )}
      </div>

      {/* Right Content */}
      <div className="grid min-w-0 grid-rows-[auto_1fr_auto] px-3">
        <div className="min-w-0">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <h2 className="line-clamp-2 text-sm font-black leading-5 tracking-normal text-[#101828] w-full">
                {product.title}
              </h2>
              {meta.companyName && (
                <p className="mt-0.5 truncate text-xs font-bold text-slate-500">
                  {meta.companyName}
                </p>
              )}
            </div>
          </div>

          <div className="mt-1.5 flex items-center gap-1.5">
            {meta.rating && (
              <span className="inline-flex items-center gap-1 rounded bg-[#2eb139] px-2 py-0.5 text-xs font-black text-white">
                {meta.rating}
                <Star className="size-3 fill-white" />
              </span>
            )}

            {meta.ratingCount && (
              <span className="text-xs font-semibold text-slate-500">
                {`${meta.ratingCount} ${t("ratings")}`}
              </span>
            )}

            {product.isVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#f1efff] px-2 py-0.5 text-[11px] font-black text-[#4d49b9]">
                <BadgeCheck className="size-3" />
                {t("verified")}
              </span>
            )}

            <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-[11px] font-black text-slate-500">
              <Eye className="size-3 text-[#4d49b9]" />
              {`${meta.views} views`}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600">
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3.5 shrink-0 text-[#4d49b9]" />
              <span className="truncate">{product.location}</span>
            </span>

            <span className="text-slate-300">•</span>

            <span className="font-black text-[slate-900]">
              {translateProductText(product.condition || "Good Condition", t)}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            {meta.offerBadge && (
              <span className="rounded-md border border-amber-100 bg-amber-50 px-2 py-1 text-[11px] font-black text-amber-700">
                {translateProductText(meta.offerBadge, t)}
              </span>
            )}

            {product.brand && (
              <span className="rounded-md border border-slate-200 bg-[#fbfaff] px-2 py-1 text-[11px] font-bold text-slate-700">
                {product.brand}
              </span>
            )}
          </div>
        </div>

        <div className=" flex items-center justify-between gap-2 pt-3">
          <div className="min-w-0">
            <span className="block text-md font-black leading-none text-[slate-900]">
              {formatPrice(product.price)}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
              className={`grid size-8 place-items-center rounded-full transition ${
                isWishlisted
                  ? "bg-rose-50 text-rose-500"
                  : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-rose-500"
              }`}
              type="button"
              onClick={handleWishlistClick}
            >
              <Heart
                className={`size-4 ${isWishlisted ? "fill-rose-500" : ""}`}
              />
            </button>
            <div className="relative">
              {bubbles.map(bubble => (
                <div
                  key={bubble.id}
                  className="absolute pointer-events-none animate-bubble text-indigo-600 z-50"
                  style={{
                    left: '50%',
                    top: '50%',
                    '--tx': `${bubble.tx}px`,
                    '--ty': `${bubble.ty}px`,
                    '--rot': `${bubble.rot}deg`,
                    '--scale': bubble.scale,
                    marginLeft: '-10px',
                    marginTop: '-10px',
                  }}
                >
                  <ThumbsUp size={20} className="fill-indigo-600" />
                </div>
              ))}
              <button
                aria-label={isLiked ? "Unlike product" : t("likeProduct")}
                className={`inline-flex h-8 items-center gap-1.5 rounded-full px-2.5 text-xs font-black transition ${
                  isLiked
                    ? "bg-indigo-50 text-indigo-600"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-indigo-600"
                } ${likeAnimating ? "animate-pop" : ""}`}
                type="button"
                onClick={handleLikeClick}
              >
                <ThumbsUp
                  className={`size-4 ${isLiked ? "fill-indigo-600" : ""}`}
                />
                <span>{likesCount}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubcategoryListing = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { t } = useAppText();
  const { categoryId = "electronics", subcategoryId = "mobile" } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const location = searchParams.get("location") || "";
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setlistings] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(() => new Set());
  const [errorMessage, setErrorMessage] = useState("");
  const rawSelectedTitle = subcategoryNames[subcategoryId] || "listings";
  const selectedTitle = t(
    subcategoryNameKeys[subcategoryId] || rawSelectedTitle,
  );

  const filteredlistings = useMemo(() => {
    const queryText = normalize(query);
    const locationText = normalize(location);
    const isSearchMode = Boolean(queryText || locationText);

    return listings.filter((product) => {
      if (!isSearchMode && subcategoryId !== 'all' && product.subcategoryId !== subcategoryId)
        return false;

      const searchableText = [
        product.title,
        product.brand,
        product.model,
        product.category,
        product.subcategory,
        product.condition,
        product.warranty,
        product.usedFor,
        product.usage,
        product.storage,
        product.ram,
        product.sellerName,
        product.description,
        ...getDynamicSearchValues(product),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const queryMatches = !queryText || searchableText.includes(queryText);
      const locationMatches =
        !locationText || normalize(product.location).includes(locationText);

      return queryMatches && locationMatches;
    });
  }, [location, listings, query, subcategoryId]);

  useEffect(() => {
    let isMounted = true;

    const loadlistings = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const isSearchMode = Boolean(query || location);
        const [response, wishlistResponse] = await Promise.all([
          getlistings(
            isSearchMode
              ? {
                  search: query || undefined,
                  location: location || undefined,
                }
              : {
                  subcategoryId: subcategoryId === 'all' ? undefined : subcategoryId,
                  categoryId,
                },
          ),
          isAuthenticated() ? getWishlistFromApi().catch(() => null) : null,
        ]);

        const nextWishlist =
          wishlistResponse?.wishlist || wishlistResponse?.data?.wishlist || [];

        if (isMounted) {
          const { isAuthenticated, getCurrentUser } = await import("../services/marketplaceData");
          const isAuth = isAuthenticated();
          const user = isAuth ? getCurrentUser() : null;
          let nextListings = (
            response.listings ||
            response.data?.listings ||
            []
          ).map(normalizeProduct);
          
          if (user) {
            nextListings = nextListings.filter(item => String(item.sellerId) !== String(user.id));
          }
          
          setlistings(nextListings);
          setWishlistIds(
            new Set(
              nextWishlist.map((item) => String(item.product_id || item.id)),
            ),
          );
        }
      } catch (error) {
        console.error("[SubcategoryListing.loadlistings]", error);
        if (isMounted) {
          setlistings([]);
          setErrorMessage(
            error.response?.data?.message ||
              "Unable to load listings right now.",
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadlistings();

    return () => {
      isMounted = false;
    };
  }, [categoryId, location, query, subcategoryId]);

  const handleViewDetails = (product) => {
    navigate(
      `/listings/${product.subcategoryId || subcategoryId}/${product.id}`,
      {
        state: {
          product,
          categoryTitle: product.subcategory || selectedTitle,
        },
      },
    );
  };

  const handleLikeChange = (productId, likeState) => {
    setlistings((currentlistings) =>
      currentlistings.map((product) =>
        String(product.id) === String(productId)
          ? {
              ...product,
              isLiked: likeState.isLiked,
              is_liked: likeState.isLiked,
              likesCount: likeState.likesCount,
              likes_count: likeState.likesCount,
            }
          : product,
      ),
    );
  };

  const handleWishlistToggle = async (product, nextIsWishlisted) => {
    const productKey = String(product.id);

    if (!isAuthenticated()) {
      navigate("/login", {
        state: {
          from: `${routeLocation.pathname}${routeLocation.search}`,
        },
      });
      return;
    }

    setWishlistIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIsWishlisted) {
        nextIds.add(productKey);
      } else {
        nextIds.delete(productKey);
      }
      return nextIds;
    });

    try {
      if (nextIsWishlisted) {
        await addWishlistItem(product.id);
      } else {
        await removeWishlistItem(product.id);
      }
    } catch (error) {
      console.error("[SubcategoryListing.handleWishlistToggle]", error);
      setWishlistIds((currentIds) => {
        const nextIds = new Set(currentIds);
        if (nextIsWishlisted) {
          nextIds.delete(productKey);
        } else {
          nextIds.add(productKey);
        }
        return nextIds;
      });
    }
  };

  const requireLoginForAction = () => {
    navigate("/login", {
      state: {
        from: `${routeLocation.pathname}${routeLocation.search}`,
      },
    });
  };

  return (
    <div className="min-h-dvh bg-[#f7fafc] text-[slate-900]">
      <header className="sticky top-0 z-30 overflow-hidden border-b border-white/80 bg-gradient-to-br from-[#ffffff] via-[#f1efff] to-[#e6e4ff] px-3 pb-4 pt-3">
        <div className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full bg-white/55" />
        <div className="pointer-events-none absolute -left-14 bottom-[-4.5rem] size-36 rounded-full bg-[#8f8cf5]/16" />
        <div className="relative mx-auto max-w-5xl space-y-3">
          <div className="flex items-center gap-3">
            <button
              aria-label={t("back")}
              className="grid size-10 shrink-0 place-items-center rounded-full border border-white/90 bg-white text-[slate-900] shadow-sm shadow-[#8f8cf5]/10 transition active:scale-95"
              type="button"
              onClick={() => navigate("/buy")}
            >
              <ArrowLeft className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-black tracking-normal">
                {t("searchMarketplace")}
              </h1>
              <p className="text-xs font-semibold text-[slate-900]/58">
                {t("showingCategory", { category: selectedTitle })}
              </p>
            </div>
          </div>

          <button
            className="flex h-12 w-full items-center gap-2 rounded-sm bg-white px-3 text-left shadow-sm shadow-[#8f8cf5]/10 ring-1 ring-white/90"
            type="button"
            onClick={() => {
              const params = new URLSearchParams();
              if (query) params.set("query", query);
              if (location) params.set("location", location);
              navigate(
                `/categories/${categoryId}/${subcategoryId}/search${
                  params.toString() ? `?${params.toString()}` : ""
                }`,
              );
            }}
          >
            <Search className="size-5 shrink-0 text-slate-500" />
            <span className="min-w-0 flex-1 text-sm font-semibold text-slate-400">
              {t("searchInCategory", { category: selectedTitle })}
            </span>
          </button>
          
          {(query || location) && (
            <div className="mt-3 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {query && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <Search className="size-3.5 text-indigo-500" />
                    {query}
                  </span>
                )}
                {location && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                    <MapPin className="size-3.5 text-indigo-500" />
                    {location}
                  </span>
                )}
              </div>
              <button
                type="button"
                className="shrink-0 inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wide text-slate-600 transition hover:bg-slate-200 active:scale-95"
                onClick={() => navigate(`/categories/${categoryId}/${subcategoryId}`)}
              >
                Reset
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 pt-3">
        <section className="space-y-3">
          {errorMessage && (
            <div className="bg-red-50 px-4 py-3 text-center text-sm font-black text-red-600">
              {errorMessage}
            </div>
          )}

          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-base font-black tracking-normal text-[#101828]">
                {filteredlistings.length} {t("Products", { defaultValue: "Products" })}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-slate-500">
                {query || location
                  ? t("resultsIn", { category: selectedTitle })
                  : t("bestMatches", { category: selectedTitle })}
              </p>
            </div>
          </div>
        </section>

        <section className="mt-3">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : filteredlistings.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredlistings.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isWishlisted={wishlistIds.has(String(product.id))}
                  onLikeChange={handleLikeChange}
                  onLoginRequired={requireLoginForAction}
                  onViewDetails={handleViewDetails}
                  onWishlistToggle={handleWishlistToggle}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white px-3 py-12 text-center shadow-sm shadow-slate-200/60 ring-1 ring-slate-100">
              <p className="text-base font-black">{t("nolistingsFound")}</p>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                {t("tryAnotherSearch")}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default SubcategoryListing;
