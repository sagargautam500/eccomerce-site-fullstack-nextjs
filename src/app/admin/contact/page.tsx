// app/admin/contacts/page.tsx
"use client";

import { useEffect, useState, useOptimistic } from "react";
import {
  getContactMessages,
  deleteContactMessage,
} from "@/actions/admin/contactAction";
import { toast } from "sonner";
import { format } from "date-fns";

type Contact = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
};

type Pagination = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
};

export default function AdminContactsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [loading, setLoading] = useState(true);

  // Optimistic UI for delete
  const [optimisticContacts, removeOptimisticContact] = useOptimistic(
    contacts,
    (state: Contact[], id: string) => state.filter((c) => c.id !== id)
  );

  const loadContacts = async () => {
    setLoading(true);
    const data = await getContactMessages({ page, search, limit: 10 });
    setContacts(data.contacts);
    setPagination(data.pagination);
    setLoading(false);
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      setPage(1);
      loadContacts();
    }, 1000); // 1 second

    return () => clearTimeout(delay);
  }, [search]);

  useEffect(() => {
    loadContacts();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // reset to page 1 on new search
    // useEffect will trigger reload
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;

    // Optimistic update
    removeOptimisticContact(id);

    const result = await deleteContactMessage(id);
    if (!result.success) {
      // Revert optimistic update
      loadContacts();
      toast.error("Failed to delete message.");
    } else {
      toast.success("Message deleted.");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Contact Messages
      </h1>

      {/* Search Form */}
      <div className="mb-6 flex gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or subject..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
        <button
          type="submit"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition"
        >
          Search
        </button>
        {(search || page > 1) && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setPage(1);
            }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
          >
            Clear
          </button>
        )}
      </div>

      {/* Stats */}
      <p className="text-sm text-gray-600 mb-4">
        Showing {Math.min((page - 1) * 10 + 1, pagination.totalItems)}–
        {Math.min(page * 10, pagination.totalItems)} of {pagination.totalItems}{" "}
        messages
      </p>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-8">Loading messages...</div>
      ) : optimisticContacts.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No contact messages found.
        </div>
      ) : (
        <div className="space-y-4">
          {optimisticContacts.map((contact) => (
            <div
              key={contact.id}
              className="border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition bg-white"
            >
              <div className="flex justify-between items-start gap-3">
                {/* Left section */}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {contact.name}
                  </h3>

                  <p className="text-sm text-gray-600">{contact.email}</p>

                  <p className="text-sm font-medium mt-1 text-gray-800">
                    {contact.subject}
                  </p>
                </div>

                {/* Delete button */}
                <button
                  onClick={() => handleDelete(contact.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Delete
                </button>
              </div>

              {/* Message */}
              <p className="mt-3 text-gray-700 whitespace-pre-line leading-relaxed">
                {contact.message}
              </p>

              {/* Date */}
              <p className="mt-4 text-xs text-gray-500 border-t pt-2">
                {format(new Date(contact.createdAt), "PPP p")}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            onClick={() =>
              setPage((p) => Math.min(pagination.totalPages, p + 1))
            }
            disabled={!pagination.hasNext}
            className="px-4 py-2 bg-gray-100 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
