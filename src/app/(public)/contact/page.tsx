"use client";

import { submitContactForm } from "@/actions/api/contactAction";
import { useRef, useState } from "react";
import { toast } from "sonner";

type FormErrors = {
  name?: string[];
  email?: string[];
  subject?: string[];
  message?: string[];
};

export default function ContactPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ⚠️ Prevent native form submission

    // Clear previous error messages (but NOT form data)
    setErrors({});
    setIsSubmitting(true); // 👈 Set submitting state

    const formData = new FormData(e.currentTarget);

    const result = await submitContactForm(formData);

    if (result.success) {
      toast.success(result.message);
      // ✅ ONLY clear form on SUCCESS
      formRef.current?.reset();
    } else {
      // ❌ On error: keep form data, show field errors
      if (result.errors) {
        setErrors(result.errors);
        toast.error("Please fix the errors below.");
      } else {
        toast.error(result.message || "Failed to send message.");
      }
    }
    setIsSubmitting(false); // 👈 Reset submitting state
  };

  return (
    <div className="min-h-screen mt-10 bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">Contact Us</h1>
          <p className="mt-4 text-lg text-gray-600">
            We’d love to hear from you! Send us a message.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            {/* ✅ Standard form with onSubmit */}
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="John Doe"
                />
                {errors.name?.[0] && (
                  <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="john@example.com"
                />
                {errors.email?.[0] && (
                  <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="How can we help?"
                />
                {errors.subject?.[0] && (
                  <p className="mt-1 text-sm text-red-600">{errors.subject[0]}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Your message..."
                ></textarea>
                {errors.message?.[0] && (
                  <p className="mt-1 text-sm text-red-600">{errors.message[0]}</p>
                )}
              </div>

           
              {/* ✅ Updated Button */}
              <button
                type="submit"
                disabled={isSubmitting} // 👈 Disable during submit
                className={`w-full font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed" // grayed out
                    : "bg-gradient-to-r from-orange-500 to-pink-500 text-white hover:from-orange-600 hover:to-pink-600"
                }`}
              >
                {isSubmitting ? "Submitting..." : "Send Message"}
              </button>
            </form>
          </div>

          {/* Map & Info (unchanged) */}
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Office</h2>
            <div className="space-y-4 mb-8">
              <div>
                <p className="text-gray-700 font-medium">📍 Location</p>
                <p className="text-gray-600">New Road, Kathmandu, Nepal</p>
              </div>
              <div>
                <p className="text-gray-700 font-medium">📞 Phone</p>
                <p className="text-gray-600">+977 980-000-0000</p>
              </div>
              <div>
                <p className="text-gray-700 font-medium">✉️ Email</p>
                <p className="text-gray-600">support@chimteshwarshop.com</p>
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3531.872799827716!2d85.3120444!3d27.7160854!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39eb195d3b5a9e27%3A0x4a8e7e5e4a0e4a0e!2sNew%20Road%2C%20Kathmandu%2044600!5e0!3m2!1sen!2snp!4v1717000000000!5m2!1sen!2snp"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Chimteshwar Shop - New Road, Kathmandu"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}