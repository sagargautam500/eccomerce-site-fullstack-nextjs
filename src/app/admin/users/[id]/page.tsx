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

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">User Details</h1>

      <div className="border p-4 rounded-lg bg-white">
        <p><strong>Name:</strong> {data.name ?? "No Name"}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Role:</strong> <span className={`px-2 py-1 rounded text-xs ${
          data.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
        }`}>{data.role}</span></p>
        <p><strong>Created At:</strong> {new Date(data.createdAt).toLocaleString()}</p>
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
    </div>
  );
}