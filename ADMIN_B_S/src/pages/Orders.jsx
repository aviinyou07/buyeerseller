import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  PackageOpen,
  Search,
  Star,
  UsersRound,
} from "lucide-react";
import InterestedUsersModal from "../components/InterestedUsersModal";
import {
  getProductInterestedUsers,
  getSellerlistingstats,
} from "../utils/productInsightsApi";

const summaryCards = [
  {
    key: "views",
    title: "Total Views",
    icon: <Eye size={24} className="text-[#4f6bff]" />,
    cardBg: "bg-gradient-to-br from-[#f5f7ff] via-[#eef2ff] to-[#e0e7ff]",
    iconBg: "bg-gradient-to-br from-[#dbe5ff] to-[#eef2ff]",
  },
  {
    key: "likes",
    title: "Total Likes",
    icon: <Heart size={24} className="text-rose-600" />,
    cardBg: "bg-gradient-to-br from-[#fff5f7] via-[#ffeef2] to-[#ffe3ea]",
    iconBg: "bg-gradient-to-br from-[#ffd6e0] to-[#fff0f4]",
  },
  {
    key: "reviews",
    title: "Total Reviews",
    icon: <MessageCircle size={24} className="text-orange-500" />,
    cardBg: "bg-gradient-to-br from-[#fffaf0] via-[#fff4df] to-[#ffe8bf]",
    iconBg: "bg-gradient-to-br from-[#ffe3ad] to-[#fff1d1]",
  },
  {
    key: "interested",
    title: "Total Interested Buyers",
    icon: <UsersRound size={24} className="text-green-600" />,
    cardBg: "bg-gradient-to-br from-[#f1fff7] via-[#e8fff1] to-[#dff7e8]",
    iconBg: "bg-gradient-to-br from-[#ccf5db] to-[#e9fff1]",
  },
];

const formatNumber = (value) => Number(value || 0).toLocaleString("en-IN");

const formatCurrency = (price) =>
  `₹${Number(price || 0).toLocaleString("en-IN")}`;

const ProductImage = ({ product }) => (
  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-blue-50 text-blue-600">
    {product.image ? (
      <img
        alt={product.title}
        className="h-full w-full object-cover"
        src={product.image}
      />
    ) : (
      <div className="grid h-full w-full place-items-center">
        <PackageOpen size={22} />
      </div>
    )}
  </div>
);

const ProductInsightsSkeleton = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
      {[1, 2, 3, 4].map((item) => (
        <div
          className="rounded-lg border border-gray-100 bg-white p-4"
          key={item}
        >
          <div className="flex animate-pulse items-center justify-between">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-gray-100" />
              <div className="h-8 w-16 rounded bg-gray-100" />
            </div>
            <div className="h-12 w-12 rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div className="flex animate-pulse items-center gap-3" key={item}>
            <div className="h-12 w-12 rounded-lg bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-1/3 rounded bg-gray-100" />
              <div className="h-3 w-1/5 rounded bg-gray-100" />
            </div>
            <div className="h-8 w-28 rounded bg-gray-100" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const Orders = () => {
  const [listings, setlistings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interestedUsers, setInterestedUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadInsights = async () => {
      try {
        setLoading(true);
        setError("");
        const stats = await getSellerlistingstats();

        if (isMounted) {
          setlistings(stats);
        }
      } catch (err) {
        console.error("[ProductInsights.loadInsights]", err);
        if (isMounted) {
          setlistings([]);
          setError("Unable to load product insights. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadInsights();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredlistings = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    if (!term) return listings;

    return listings.filter((product) =>
      product.title.toLowerCase().includes(term),
    );
  }, [listings, searchTerm]);

  const summary = useMemo(
    () =>
      listings.reduce(
        (totals, product) => ({
          views: totals.views + product.viewsCount,
          likes: totals.likes + product.likesCount,
          reviews: totals.reviews + product.reviewsCount,
          interested: totals.interested + product.interestedCount,
        }),
        {
          views: 0,
          likes: 0,
          reviews: 0,
          interested: 0,
        },
      ),
    [listings],
  );

  const handleViewInterestedUsers = async (product) => {
    setSelectedProduct(product);
    setInterestedUsers([]);
    setUsersError("");
    setIsModalOpen(true);

    try {
      setUsersLoading(true);
      const users = await getProductInterestedUsers(product.productId);
      setInterestedUsers(users);
    } catch (err) {
      console.error("[ProductInsights.loadInterestedUsers]", err);
      setUsersError("Unable to load interested users. Please try again.");
    } finally {
      setUsersLoading(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setInterestedUsers([]);
    setUsersError("");
  };

  return (
    <div className="space-y-4">


      {loading ? (
        <ProductInsightsSkeleton />
      ) : error ? (
        <section className="rounded-lg border border-red-100 bg-red-50 px-4 py-12 text-center">
          <PackageOpen className="mx-auto text-red-300" size={42} />
          <h2 className="mt-3 text-base font-semibold text-red-600">
            {error}
          </h2>
        </section>
      ) : listings.length === 0 ? (
        <section className="rounded-lg border border-dashed border-gray-200 bg-white px-4 py-14 text-center">
          <PackageOpen className="mx-auto text-gray-300" size={44} />
          <h2 className="mt-3 text-base font-semibold text-gray-900">
            No product insights available yet.
          </h2>
          <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-gray-500">
            Views, likes, reviews, ratings, and buyer interest will appear here once data is available.
          </p>
        </section>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {summaryCards.map((item) => (
              <div
                key={item.key}
                className={`${item.cardBg} flex items-center justify-between rounded-lg border border-white/60 p-2 shadow-sm`}
              >
                <div>
                  <h3 className="text-[12px] sm:text-sm font-semibold text-gray-600">
                    {item.title}
                  </h3>
                  <h1 className="mt-1 sm:mt-2 text-[24px] sm:text-3xl font-bold leading-none text-gray-900">
                    {formatNumber(summary[item.key])}
                  </h1>
                </div>
                <div
                  className={`flex h-[40px] w-[40px] sm:h-12 sm:w-12 scale-75 sm:scale-100 items-center justify-center rounded-xl ${item.iconBg}`}
                >
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white text-gray-800 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-[18px] font-semibold text-[#111827]">
                  Product-wise Stats
                </h2>
                <p className="text-sm text-gray-500">
                  Engagement details for listed seller listings.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden sm:inline-block text-sm font-semibold text-gray-500 whitespace-nowrap">
                  {filteredlistings.length} listings
                </span>
                <div className="relative w-full md:w-[300px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Search listings..."
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-sm text-gray-800">
                    <th className="px-5 py-3 font-semibold">Product</th>
                    <th className="px-5 py-3 font-semibold">Price</th>
                    <th className="px-5 py-3 font-semibold">Views</th>
                    <th className="px-5 py-3 font-semibold">Likes</th>
                    <th className="px-5 py-3 font-semibold">Reviews</th>
                    <th className="px-5 py-3 font-semibold">Rating</th>
                    <th className="px-5 py-3 font-semibold">Interested</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredlistings.map((product) => (
                    <tr 
                      key={product.productId} 
                      className="hover:bg-gray-50/60 cursor-pointer"
                      onClick={() => handleViewInterestedUsers(product)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <ProductImage product={product} />
                          <span className="max-w-[220px] truncate text-sm font-semibold text-gray-900">
                            {product.title}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-gray-800">
                        {formatCurrency(product.price)}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                        {formatNumber(product.viewsCount)}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                        {formatNumber(product.likesCount)}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                        {formatNumber(product.reviewsCount)}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-orange-500">
                          <Star className="h-4 w-4 fill-current" />
                          {product.averageRating ? product.averageRating.toFixed(1) : "0.0"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-700">
                        {formatNumber(product.interestedCount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {filteredlistings.map((product) => (
                <article
                  className="rounded-lg border border-gray-100 bg-white p-4"
                  key={product.productId}
                >
                  <div className="flex gap-3">
                    <ProductImage product={product} />
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate text-sm font-semibold text-gray-900">
                        {product.title}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-blue-600">
                        {formatCurrency(product.price)}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-orange-500">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        {product.averageRating ? product.averageRating.toFixed(1) : "0.0"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-semibold text-gray-600">
                    <span className="rounded-lg bg-gray-50 px-3 py-2">
                      Views: {formatNumber(product.viewsCount)}
                    </span>
                    <span className="rounded-lg bg-gray-50 px-3 py-2">
                      Likes: {formatNumber(product.likesCount)}
                    </span>
                    <span className="rounded-lg bg-gray-50 px-3 py-2">
                      Reviews: {formatNumber(product.reviewsCount)}
                    </span>
                    <span className="rounded-lg bg-gray-50 px-3 py-2">
                      Interested: {formatNumber(product.interestedCount)}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            {filteredlistings.length === 0 && (
              <div className="px-4 py-12 text-center">
                <PackageOpen className="mx-auto text-gray-300" size={40} />
                <h3 className="mt-3 text-sm font-semibold text-gray-900">
                  No matching listings found.
                </h3>
              </div>
            )}
          </div>
        </>
      )}

      {isModalOpen && (
        <InterestedUsersModal
          errorMessage={usersError}
          interestedUsers={interestedUsers}
          isLoading={usersLoading}
          product={selectedProduct}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Orders;
