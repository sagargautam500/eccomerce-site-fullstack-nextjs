// src/components/admin/AdminFooter.tsx
export default function AdminFooter() {
  return (
    <footer className="border-t bg-gray-700 border-gray-400 py-4 text-center text-sm text-white">
      <p>
        &copy; {new Date().getFullYear()} Chimteshwar Shop Admin. All rights reserved.
      </p>
    </footer>
  );
}