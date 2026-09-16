// @ts-nocheck
import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MaterialSymbol } from "../../../shared/components/MaterialSymbol";
import { useTranslation } from "../../../core/hooks/useTranslation";
import { normalizePhoneNumber } from "../../../core/utils/phoneNumber";
import { useAuth } from "../../../core/context/AuthContext";
import axios from "axios";
import {
  ArtisticBackground,
  ActivityCounter,
} from "../../../shared/components/auth/AuthLayoutComponents";

import { API_URL } from "../../../core/api/apiUrl";

interface OnboardingFormData {
  fullName: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female";
  profilePhoto: string | null;
  aadhaarDocument: string | null;
  referralCode: string;
}

export const SignupPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const profilePhotoInputRef = useRef<HTMLInputElement>(null);
  const aadhaarInputRef = useRef<HTMLInputElement>(null);

  // One-time cleanup: remove any stale draft persisted by an older build
  // that saved this form to localStorage (we no longer do that).
  useEffect(() => {
    localStorage.removeItem("signup_form_data");
  }, []);

  // If already authenticated, redirect to source or dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      const from =
        (location.state as any)?.from?.pathname ||
        (user.role === "female"
          ? "/female/dashboard"
          : user.role === "admin"
            ? "/admin/dashboard"
            : "/male/dashboard");
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, location]);

  const [formData, setFormData] = useState<OnboardingFormData>({
    fullName: "",
    phone: "",
    dateOfBirth: "",
    gender: "male",
    profilePhoto: null,
    aadhaarDocument: null,
    referralCode: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof OnboardingFormData, string>>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const calculateAge = (dob: string): number => {
    const today = new Date();
    const birthDate = new Date(dob);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof OnboardingFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = t("Full name is required");
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t("Phone number is required");
    } else {
      try {
        // Attempt to normalize - will throw if invalid
        normalizePhoneNumber(formData.phone);
      } catch (error: any) {
        newErrors.phone = t("Please enter a valid phone number");
      }
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t("Date of birth is required");
    } else {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 18) {
        newErrors.dateOfBirth = t("You must be at least 18 years old");
      }
    }

    if (!formData.gender) {
      newErrors.gender = t("Please select your gender");
    }

    if (!formData.profilePhoto) {
      newErrors.profilePhoto = t("Profile photo is required");
    }

    // Female-specific validation
    if (formData.gender === "female" && !formData.aadhaarDocument) {
      newErrors.aadhaarDocument = t(
        "Aadhaar verification is required for female users",
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({
          ...prev,
          profilePhoto: t("Please select a valid image file"),
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profilePhoto: reader.result as string,
        }));
        setErrors((prev) => ({ ...prev, profilePhoto: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          aadhaarDocument: reader.result as string,
        }));
        setErrors((prev) => ({ ...prev, aadhaarDocument: undefined }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Signup API call - Field names MUST match backend expectations
      const age = calculateAge(formData.dateOfBirth); // Calculate age from DOB

      // Normalize phone number (handles +91, 91, or 10-digit input)
      const normalizedPhone = normalizePhoneNumber(formData.phone);

      const payload = {
        phoneNumber: normalizedPhone,
        name: formData.fullName,
        age: age,
        dateOfBirth: formData.dateOfBirth,
        role: formData.gender,
        photos: formData.profilePhoto ? [formData.profilePhoto] : [],
        ...(formData.gender === "female" && {
          aadhaarCardUrl: formData.aadhaarDocument,
        }),
        referralCode: formData.referralCode,
      };

      const response = await axios.post(
        `${API_URL}/auth/signup-request`,
        payload,
      );

      // DON'T clear localStorage or store token yet - that happens AFTER OTP verification

      // Navigate to OTP verification page
      // Pass phone number and signup data for OTP verification and potential resend
      navigate("/otp-verification", {
        state: {
          mode: "signup",
          phoneNumber: normalizedPhone,
          signupData: payload, // For OTP resend if needed
          from: (location.state as any)?.from, // Pass along the 'from' location
        },
      });
    } catch (error: any) {
      console.error("Signup error:", error);
      // Convert technical errors to user-friendly messages
      const rawError = error.response?.data?.message || error.message || "";
      const userFriendlyError = getUserFriendlyError(rawError, t);
      setSubmitError(userFriendlyError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof OnboardingFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear submit error when user starts editing
    if (submitError) {
      setSubmitError(null);
    }
  };

  // Helper function to convert technical errors to user-friendly messages
  const getUserFriendlyError = (
    errorMessage: string,
    t: (key: string) => string,
  ): string => {
    const lowerError = errorMessage.toLowerCase();

    // Network/Connection errors
    if (
      lowerError.includes("network") ||
      lowerError.includes("timeout") ||
      lowerError.includes("econnrefused") ||
      lowerError.includes("fetch")
    ) {
      return t("signupErrorNetwork");
    }

    // Phone number already exists
    if (
      lowerError.includes("already") ||
      lowerError.includes("exists") ||
      lowerError.includes("duplicate") ||
      lowerError.includes("registered")
    ) {
      return t("signupErrorPhoneExists");
    }

    // Server errors
    if (
      lowerError.includes("500") ||
      lowerError.includes("server") ||
      lowerError.includes("internal")
    ) {
      return t("signupErrorServer");
    }

    // Validation errors from backend
    if (lowerError.includes("invalid") || lowerError.includes("valid")) {
      return t("signupErrorInvalidData");
    }

    // Rate limiting
    if (
      lowerError.includes("too many") ||
      lowerError.includes("rate") ||
      lowerError.includes("limit")
    ) {
      return t("signupErrorTooManyAttempts");
    }

    // Default fallback
    return t("signupErrorGeneric");
  };

  // Small reusable section header, mirrors the icon-chip pattern used across the app
  const SectionLabel = ({ icon, children }: { icon: string; children: React.ReactNode }) => (
    <div className="flex items-center gap-2 px-0.5 mb-3">
      <div className="size-6 rounded-lg bg-pink-50 flex items-center justify-center text-pink-500 shrink-0">
        <MaterialSymbol name={icon} size={14} />
      </div>
      <span className="text-[11px] font-black uppercase tracking-[0.14em] text-gray-400">
        {children}
      </span>
    </div>
  );

  return (
    <div className="relative min-h-screen flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8">
      <ArtisticBackground />

      <div className="relative z-10 max-w-md w-full">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-3">
            <div className="absolute inset-0 bg-gold/20 blur-2xl rounded-full animate-gold-pulse" />
            <img
              src="/logo.jpeg"
              alt="Dil Mate Logo"
              className="relative w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-[1.5rem] shadow-xl border border-white/50"
            />
            <div className="absolute -bottom-1.5 -right-1.5 size-7 rounded-full bg-premium-pink flex items-center justify-center shadow-lg border-2 border-white">
              <MaterialSymbol name="favorite" size={13} className="text-white" filled />
            </div>
          </div>

          <ActivityCounter />
        </div>

        {/* glass-card wrapper */}
        <div className="glass-card rounded-[2.25rem] sm:rounded-[2.75rem] p-5 sm:p-8 shadow-2xl border border-white/50">
          <div className="text-center mb-7">
            <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-pink-50 text-pink-500 mb-3 shadow-inner">
              <MaterialSymbol name="favorite" size={24} filled />
            </div>
            <h2 className="text-[26px] leading-tight font-black text-gray-900 mb-1.5 tracking-tight">
              {t("Create Your Account")}
            </h2>
            <p className="text-gray-500 text-sm font-semibold px-4">
              {t("Start your journey to find meaningful connections")}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Section: Your Details */}
            <div>
              <SectionLabel icon="badge">{t("Your Details")}</SectionLabel>

              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="sr-only">
                    {t("Full Name")}
                  </label>
                  <div className="relative group">
                    <div
                      className={`flex items-center bg-white/70 border-2 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 ${errors.fullName ? "border-red-400" : "border-gray-100 group-hover:border-pink-200 focus-within:border-pink-400 focus-within:shadow-[0_0_0_4px_rgba(244,63,94,0.08)]"}`}>
                      <div className="pl-3.5">
                        <div className="size-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                          <MaterialSymbol name="person" size={18} />
                        </div>
                      </div>
                      <input
                        id="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => handleChange("fullName", e.target.value)}
                        className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-transparent text-gray-900 text-base sm:text-lg font-bold placeholder:text-gray-300 focus:outline-none"
                        placeholder={t("Full Name")}
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.fullName && (
                      <p className="mt-2 ml-0.5 sm:ml-1 text-xs font-bold text-red-500">
                        {errors.fullName}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="sr-only">
                    {t("Contact Number")}
                  </label>
                  <div className="relative group transition-all duration-300">
                    <div
                      className={`flex items-center bg-white/70 border-2 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 ${errors.phone ? "border-red-400" : "border-gray-100 group-hover:border-pink-200 focus-within:border-pink-400 focus-within:shadow-[0_0_0_4px_rgba(244,63,94,0.08)]"}`}>
                      <div className="flex items-center shrink-0 gap-1.5 pl-3.5 pr-3 py-3 sm:py-4 border-r border-gray-100">
                        <img
                          src="https://flagcdn.com/w40/in.png"
                          srcSet="https://flagcdn.com/w80/in.png 2x"
                          width="20"
                          className="rounded-sm shadow-sm opacity-90"
                          alt="India Flag"
                        />
                        <span className="text-gray-900 font-black text-sm sm:text-base tracking-tight">
                          +91
                        </span>
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          let val = e.target.value.replace(/\D/g, "");
                          if (val.startsWith("91") && val.length > 10)
                            val = val.slice(2);
                          const final = val.length > 10 ? val.slice(-10) : val;
                          handleChange("phone", final);
                        }}
                        className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-transparent text-gray-900 text-base sm:text-lg font-bold placeholder:text-gray-300 focus:outline-none"
                        placeholder={t("Mobile Number")}
                        maxLength={10}
                        disabled={isSubmitting}
                      />
                      {formData.phone && (
                        <button
                          type="button"
                          onClick={() => handleChange("phone", "")}
                          className="pr-3 sm:pr-4 text-gray-300 hover:text-gray-500 transition-colors">
                          <MaterialSymbol
                            name="cancel"
                            size={20}
                            className="sm:scale-110"
                            filled
                          />
                        </button>
                      )}
                    </div>
                    {errors.phone && (
                      <div className="flex items-center gap-1.5 mt-2 ml-0.5 sm:ml-1 text-red-500 animate-in fade-in slide-in-from-top-1">
                        <MaterialSymbol name="error" size={16} filled />
                        <p className="text-xs font-bold leading-none">
                          {errors.phone}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="sr-only">
                    {t("Date of Birth")}
                  </label>
                  <div className="relative group text-gray-900">
                    <div
                      className={`flex items-center bg-white/70 border-2 rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all duration-300 ${errors.dateOfBirth ? "border-red-400" : "border-gray-100 group-hover:border-pink-200 focus-within:border-pink-400 focus-within:shadow-[0_0_0_4px_rgba(244,63,94,0.08)]"}`}>
                      <div className="pl-3.5">
                        <div className="size-9 rounded-xl bg-pink-50 flex items-center justify-center text-pink-500">
                          <MaterialSymbol name="calendar_today" size={17} />
                        </div>
                      </div>
                      <input
                        id="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) =>
                          handleChange("dateOfBirth", e.target.value)
                        }
                        max={
                          new Date(
                            new Date().setFullYear(new Date().getFullYear() - 18),
                          )
                            .toISOString()
                            .split("T")[0]
                        }
                        className="w-full px-3 py-3 sm:px-4 sm:py-4 bg-transparent text-gray-900 text-base sm:text-lg font-bold focus:outline-none invert-calendar-icon"
                        disabled={isSubmitting}
                      />
                    </div>
                    {errors.dateOfBirth && (
                      <p className="mt-2 ml-0.5 sm:ml-1 text-xs font-bold text-red-500">
                        {errors.dateOfBirth}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="referralCode" className="sr-only">
                    {t("Referral ID")}
                  </label>
                  <div className="relative group">
                    <div className="flex items-center bg-white/70 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden group-hover:border-pink-300 focus-within:border-pink-400">
                      <div className="pl-3.5">
                        <div className="size-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                          <MaterialSymbol name="redeem" size={18} />
                        </div>
                      </div>
                      <input
                        id="referralCode"
                        type="text"
                        value={formData.referralCode}
                        onChange={(e) =>
                          handleChange(
                            "referralCode",
                            e.target.value.toUpperCase().replace(/\s/g, ""),
                          )
                        }
                        className="w-full px-3 py-3 sm:py-4 bg-transparent text-gray-900 text-base sm:text-lg font-bold placeholder:text-gray-300 focus:outline-none"
                        placeholder={t("Referral code (optional)")}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Gender */}
            <div>
              <SectionLabel icon="wc">{t("I Am A")}</SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                {(["male", "female"] as const).map((gender) => (
                  <label
                    key={gender}
                    className={`relative flex flex-col items-center justify-center py-5 border-2 rounded-2xl cursor-pointer transition-all duration-300 ${
                      formData.gender === gender
                        ? "border-pink-400 bg-pink-50/70 shadow-[0_4px_16px_rgba(244,63,94,0.12)]"
                        : "border-gray-100 bg-white/50 hover:border-pink-200"
                    } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}>
                    <input
                      type="radio"
                      name="gender"
                      value={gender}
                      checked={formData.gender === gender}
                      onChange={(e) => handleChange("gender", e.target.value)}
                      className="hidden"
                      disabled={isSubmitting}
                    />
                    <div
                      className={`size-12 rounded-2xl flex items-center justify-center mb-2 transition-colors ${
                        formData.gender === gender
                          ? "bg-pink-500 text-white"
                          : "bg-gray-50 text-gray-400"
                      }`}>
                      <MaterialSymbol
                        name={gender === "male" ? "male" : "female"}
                        size={26}
                        filled={formData.gender === gender}
                      />
                    </div>
                    <span
                      className={`text-xs font-black uppercase tracking-wider ${formData.gender === gender ? "text-pink-600" : "text-gray-500"}`}>
                      {t(gender === "male" ? "Male" : "Female")}
                    </span>
                    {formData.gender === gender && (
                      <div className="absolute top-2.5 right-2.5">
                        <MaterialSymbol
                          name="check_circle"
                          size={18}
                          className="text-pink-500"
                          filled
                        />
                      </div>
                    )}
                  </label>
                ))}
              </div>
              {errors.gender && (
                <p className="mt-2 ml-1 text-xs font-bold text-red-500">
                  {errors.gender}
                </p>
              )}
            </div>

            {/* Section: Verification */}
            <div>
              <SectionLabel icon="verified_user">{t("Verification")}</SectionLabel>

              {/* Profile Photo - circular avatar uploader */}
              <div className="flex flex-col items-center">
                <div className="relative group">
                  {formData.profilePhoto ? (
                    <div className="relative size-32 rounded-full overflow-hidden border-4 border-white shadow-[0_8px_24px_rgba(244,63,94,0.18)] bg-gray-50">
                      <img
                        src={formData.profilePhoto}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => profilePhotoInputRef.current?.click()}
                          className="p-2.5 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white/40 transition-all">
                          <MaterialSymbol name="edit" size={20} />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            profilePhoto: null,
                          }));
                          if (profilePhotoInputRef.current) {
                            profilePhotoInputRef.current.value = "";
                          }
                        }}
                        className="absolute -top-0.5 -right-0.5 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg border-2 border-white"
                        disabled={isSubmitting}>
                        <MaterialSymbol name="close" size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => profilePhotoInputRef.current?.click()}
                      className={`size-32 rounded-full border-2 border-dashed flex flex-col items-center justify-center transition-all bg-white/50 ${
                        errors.profilePhoto
                          ? "border-red-400 bg-red-50/20"
                          : "border-gray-200 hover:border-pink-300 hover:bg-pink-50/30"
                      }`}
                      disabled={isSubmitting}>
                      <div className="size-12 bg-pink-100/60 rounded-full flex items-center justify-center mb-1.5">
                        <MaterialSymbol
                          name="add_a_photo"
                          size={22}
                          className="text-pink-500"
                        />
                      </div>
                      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                        {t("Add Photo")}
                      </span>
                    </button>
                  )}
                </div>
                <input
                  ref={profilePhotoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePhotoChange}
                  className="hidden"
                />
                <p className="text-[10px] text-gray-400 mt-2 uppercase tracking-widest font-semibold">
                  {t("JPG, PNG up to 5MB")}
                </p>
                {errors.profilePhoto && (
                  <p className="mt-1 text-xs font-bold text-red-500">
                    {errors.profilePhoto}
                  </p>
                )}
              </div>

              {/* Aadhaar Upload (Female Only) */}
              {formData.gender === "female" && (
                <div className="mt-5">
                  <div className="flex items-center gap-1.5 mb-2 ml-0.5">
                    <span className="text-xs font-bold text-gray-700">
                      {t("Aadhaar Verification")}
                    </span>
                    <span className="text-red-500 font-black text-xs">*</span>
                  </div>
                  <div className="relative group">
                    {formData.aadhaarDocument ? (
                      <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner bg-gray-50/50">
                        <img
                          src={formData.aadhaarDocument}
                          alt="Aadhaar"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => aadhaarInputRef.current?.click()}
                            className="p-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-white hover:bg-white/40 transition-all">
                            <MaterialSymbol name="edit" size={24} />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              aadhaarDocument: null,
                            }));
                            if (aadhaarInputRef.current) {
                              aadhaarInputRef.current.value = "";
                            }
                          }}
                          className="absolute top-3 right-3 p-1.5 bg-red-500/80 backdrop-blur-sm text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                          disabled={isSubmitting}>
                          <MaterialSymbol name="close" size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => aadhaarInputRef.current?.click()}
                        className={`w-full aspect-video border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all bg-white/50 ${
                          errors.aadhaarDocument
                            ? "border-red-400 bg-red-50/10"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/20"
                        }`}
                        disabled={isSubmitting}>
                        <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                          <MaterialSymbol
                            name="badge"
                            size={28}
                            className="text-blue-500"
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-500">
                          {t("Upload Aadhaar for verification")}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                          {t("Required for verification")}
                        </p>
                      </button>
                    )}
                  </div>
                  <input
                    ref={aadhaarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAadhaarChange}
                    className="hidden"
                  />
                  {errors.aadhaarDocument && (
                    <p className="mt-2 ml-1 text-xs font-bold text-red-500">
                      {errors.aadhaarDocument}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="flex items-center gap-3 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl animate-in fade-in slide-in-from-top-1">
                <MaterialSymbol
                  name="warning"
                  size={20}
                  className="text-red-500 flex-shrink-0"
                  filled
                />
                <p className="text-sm text-red-700 font-bold leading-tight">
                  {submitError}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full py-3 sm:py-4 bg-premium-pink text-white font-black text-base sm:text-lg rounded-2xl shadow-[0_10px_25px_-5px_rgba(255,77,109,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(255,77,109,0.5)] transform hover:scale-[1.02] active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:grayscale overflow-hidden">
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-3">
                  <MaterialSymbol
                    name="sync"
                    size={24}
                    className="animate-spin"
                  />
                  {t("Processing...")}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {t("Create Account")}
                  <MaterialSymbol name="arrow_forward" size={20} />
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-7 pt-6 border-t border-gray-100/50 text-center">
            <p className="text-gray-500 font-medium text-sm">
              {t("Already have an account?")}{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-pink-600 font-black hover:text-pink-700 transition-colors underline decoration-2 underline-offset-4"
                disabled={isSubmitting}>
                {t("Login Now")}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
