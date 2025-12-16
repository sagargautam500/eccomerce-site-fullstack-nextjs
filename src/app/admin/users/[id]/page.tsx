// src/app/admin/users/[id]/page.tsx
import { getUserDetails } from "@/actions/admin/userActions";
import Link from "next/link";

export default async function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getUserDetails(id);

  if (!data) {
    return <div className="p-6">User not found</div>;
  }

  interface AddressProps {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    zipCode?: string | null;
    country: string;
    isDefault: boolean;
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">User Details</h1>

      <div className="border p-4 rounded-lg bg-white">
        <p>
          <strong>Name:</strong> {data.name ?? "No Name"}
        </p>
        <p>
          <strong>Email:</strong> {data.email}
        </p>
        <p>
          <strong>Role:</strong>{" "}
          <span
            className={`px-2 py-1 rounded text-xs ${
              data.role === "admin"
                ? "bg-purple-100 text-purple-800"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {data.role}
          </span>
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {new Date(data.createdAt).toLocaleString()}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* ✅ Updated Link: pass userId as search param */}
        <Link
          href={`/admin/orders?userId=${encodeURIComponent(id)}`}
          className="p-4 border rounded-lg hover:bg-gray-100 transition text-center bg-white"
        >
          <div className="font-medium text-blue-600">View Orders</div>
          <div className="text-2xl font-bold mt-1">{data.orderCount}</div>
        </Link>

        <div className="p-4 border rounded-lg bg-white text-center">
          <div className="font-medium text-gray-600">Cart Items</div>
          <div className="text-2xl font-bold mt-1">{data.cartItemCount}</div>
        </div>

        <div className="p-4 border rounded-lg bg-white text-center">
          <div className="font-medium text-gray-600">Wishlist</div>
          <div className="text-2xl font-bold mt-1">{data.wishlistCount}</div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="border p-4 rounded-lg bg-white mt-4">
        <h2 className="text-xl font-semibold mb-4">Saved Addresses</h2>
        {data.addresses && data.addresses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.addresses.map((addr: AddressProps) => (
              <div
                key={addr.id}
                className="border p-3 rounded-lg bg-gray-50 relative"
              >
                {addr.isDefault && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded">
                    Default
                  </span>
                )}
                <p className="font-medium text-gray-900">{addr.fullName}</p>
                <p className="text-sm text-gray-600">{addr.phone}</p>
                <div className="mt-2 text-sm text-gray-700">
                  <p>{addr.addressLine}</p>
                  <p>
                    {addr.city}, {addr.state} {addr.zipCode || ""}
                  </p>
                  <p>{addr.country}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">No addresses saved.</p>
        )}
      </div>
    </div>
  );
}
