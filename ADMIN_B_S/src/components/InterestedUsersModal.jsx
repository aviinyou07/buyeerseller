import { Mail, MessageSquareText, Phone, UserRound, X, Eye, Heart, Star, MessageCircle } from "lucide-react";

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return String(num || 0);
};

const formatDate = (value) => {
  if (!value) return "Recently";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const statusStyles = {
  pending: "bg-orange-100 text-orange-600",
  contacted: "bg-blue-100 text-blue-700",
  converted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-600",
};

const InterestedUsersModal = ({
  errorMessage,
  interestedUsers,
  isLoading,
  onClose,
  product,
}) => {
  const hasUsers = interestedUsers.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/45 px-4 py-5 backdrop-blur-sm">
      <section className="max-h-[86vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gray-50 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
              Interested Buyers
            </p>
            <h2 className="mt-1 truncate text-lg font-semibold text-gray-900">
              {product?.title || "Product interest"}
            </h2>
            {product && (
              <div className="mt-2 flex items-center gap-4 text-xs font-semibold text-gray-500">
                <span className="flex items-center gap-1"><Eye size={14} className="text-gray-400" /> {formatNumber(product.viewsCount)}</span>
                <span className="flex items-center gap-1"><Heart size={14} className="text-gray-400" /> {formatNumber(product.likesCount)}</span>
                <span className="flex items-center gap-1"><MessageCircle size={14} className="text-gray-400" /> {formatNumber(product.reviewsCount)}</span>
                <span className="flex items-center gap-1 text-orange-500"><Star size={14} className="fill-current" /> {product.averageRating ? product.averageRating.toFixed(1) : "0.0"}</span>
              </div>
            )}
          </div>
          <button
            aria-label="Close interested users"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:text-gray-900"
            type="button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[calc(86vh-84px)] overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  className="rounded-lg border border-gray-100 bg-white p-4"
                  key={item}
                >
                  <div className="flex animate-pulse gap-3">
                    <div className="h-11 w-11 rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-1/2 rounded bg-gray-100" />
                      <div className="h-3 w-3/4 rounded bg-gray-100" />
                      <div className="h-3 w-2/3 rounded bg-gray-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : errorMessage ? (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-8 text-center">
              <p className="text-sm font-semibold text-red-600">
                {errorMessage}
              </p>
            </div>
          ) : hasUsers ? (
            <div className="space-y-3">
              {interestedUsers.map((user) => {
                const normalizedStatus = String(user.status || "pending").toLowerCase();

                return (
                  <article
                    className="rounded-lg border border-gray-100 bg-white p-4"
                    key={user.buyerId || `${user.email}-${user.createdAt}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-start gap-3">
                        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                          <UserRound size={20} />
                        </span>
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-gray-900">
                            {user.name}
                          </h3>
                          <div className="mt-1 space-y-1 text-xs font-medium text-gray-500">
                            {user.email && (
                              <p className="flex min-w-0 items-center gap-1.5">
                                <Mail size={13} className="shrink-0" />
                                <span className="truncate">{user.email}</span>
                              </p>
                            )}
                            {user.phone && (
                              <p className="flex min-w-0 items-center gap-1.5">
                                <Phone size={13} className="shrink-0" />
                                <span className="truncate">{user.phone}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-sm px-2.5 py-1 text-[11px] font-semibold capitalize ${
                          statusStyles[normalizedStatus] || statusStyles.pending
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <div className="mt-3 rounded-lg bg-gray-50 px-3 py-2.5">
                      <p className="flex items-start gap-2 text-sm leading-5 text-gray-600">
                        <MessageSquareText size={15} className="mt-0.5 shrink-0 text-blue-600" />
                        <span>{user.message || "No message added."}</span>
                      </p>
                    </div>

                    <p className="mt-3 text-xs font-medium text-gray-400">
                      Interested on {formatDate(user.createdAt)}
                    </p>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-4 py-10 text-center">
              <UserRound className="mx-auto text-gray-300" size={40} />
              <h3 className="mt-3 text-sm font-semibold text-gray-900">
                No interested users yet
              </h3>
              <p className="mx-auto mt-1 max-w-sm text-xs font-medium leading-5 text-gray-500">
                Buyer interest for this product will appear here once available.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default InterestedUsersModal;
