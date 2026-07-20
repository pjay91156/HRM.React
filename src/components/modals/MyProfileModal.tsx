import React, { useEffect, useRef, useState } from "react";
import { Mail, Briefcase, Building2, CalendarDays, User as UserIcon, Users, Camera } from "lucide-react";
import { toast } from "react-toastify";
import profileService from "../../services/profileService";
import { type MyProfile } from "../../models/Profile";
import { getMediaUrl } from "../../utils/media";
import Loader from "../common/Loader";

interface MyProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpdated: (profile: MyProfile) => void;
}

const MyProfileModal: React.FC<MyProfileModalProps> = ({ isOpen, onClose, onUpdated }) => {
    const [profile, setProfile] = useState<MyProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingPicture, setUploadingPicture] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [formData, setFormData] = useState({ firstName: "", lastName: "", phoneNumber: "" });
    const [errors, setErrors] = useState({ firstName: "", lastName: "", phoneNumber: "" });

    useEffect(() => {
        if (isOpen) {
            loadProfile();
        }
    }, [isOpen]);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const response = await profileService.getMyProfile();
            if (response.success) {
                const data: MyProfile = response.data;
                setProfile(data);
                setFormData({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phoneNumber: data.phoneNumber ?? ""
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: "" }));
    };

    const handlePictureSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = "";
        if (!file) return;

        const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Only JPG, PNG, and WEBP images are allowed.");
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image must be 2 MB or smaller.");
            return;
        }

        setUploadingPicture(true);
        try {
            const response = await profileService.updateMyProfilePicture(file);
            if (response.success) {
                setProfile(response.data);
                onUpdated(response.data);
            }
        } finally {
            setUploadingPicture(false);
        }
    };

    const validate = () => {
        const newErrors = { firstName: "", lastName: "", phoneNumber: "" };
        let isValid = true;

        if (!formData.firstName.trim()) {
            newErrors.firstName = "First Name is required";
            isValid = false;
        }

        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last Name is required";
            isValid = false;
        }

        if (formData.phoneNumber && !/^[0-9]{10}$/.test(formData.phoneNumber)) {
            newErrors.phoneNumber = "Phone must contain 10 digits";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            const response = await profileService.updateMyProfile(formData);
            if (response.success) {
                onUpdated(response.data);
                onClose();
            }
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const initials = profile
        ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
        : "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="relative w-full max-w-lg max-h-[90vh] flex flex-col rounded-xl bg-white dark:bg-slate-900 shadow-xl">

                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-100 dark:border-slate-800">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">My Profile</h2>
                    <button type="button" onClick={onClose} className="text-gray-400 dark:text-slate-500 hover:text-gray-600">✕</button>
                </div>

                {loading ? (
                    <div className="py-16">
                        <Loader />
                    </div>
                ) : !profile ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                        Unable to load profile.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                        <div className="flex-1 overflow-y-auto p-6 space-y-5 max-h-[calc(90vh-140px)]">

                            {/* Avatar + read-only summary */}
                            <div className="flex items-center gap-4 pb-2">
                                <div className="relative shrink-0">
                                    {getMediaUrl(profile.profilePictureUrl) ? (
                                        <img
                                            src={getMediaUrl(profile.profilePictureUrl)!}
                                            alt={`${profile.firstName} ${profile.lastName}`}
                                            className="w-14 h-14 rounded-full object-cover shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#6C63FF] to-indigo-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                            {initials}
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploadingPicture}
                                        title="Change photo"
                                        className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#6C63FF] hover:bg-[#5B52F5] text-white flex items-center justify-center shadow-sm border-2 border-white dark:border-slate-900 disabled:opacity-60"
                                    >
                                        {uploadingPicture ? <Loader size="sm" /> : <Camera size={12} />}
                                    </button>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handlePictureSelected}
                                    />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-semibold text-gray-900 dark:text-slate-100 truncate">
                                        {profile.firstName} {profile.lastName}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-slate-400 truncate">{profile.designationName}</p>
                                </div>
                            </div>

                            {/* Editable fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold mb-1">
                                        First Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 ${errors.firstName ? "border-red-500" : "border-gray-200 dark:border-slate-700"}`}
                                    />
                                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-1">
                                        Last Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 ${errors.lastName ? "border-red-500" : "border-gray-200 dark:border-slate-700"}`}
                                    />
                                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-1">Phone</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="9876543210"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className={`w-full rounded-lg border px-4 py-2.5 text-sm bg-gray-50 dark:bg-slate-950 ${errors.phoneNumber ? "border-red-500" : "border-gray-200 dark:border-slate-700"}`}
                                />
                                {errors.phoneNumber && <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>}
                            </div>

                            {/* Read-only details */}
                            <div className="pt-2 border-t border-gray-100 dark:border-slate-800 space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500 pt-3">
                                    Managed by HR
                                </p>

                                <div className="flex items-center gap-3 text-sm">
                                    <Mail size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                    <span className="text-gray-700 dark:text-slate-300">{profile.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <UserIcon size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                    <span className="text-gray-700 dark:text-slate-300">{profile.employeeCode}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Building2 size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                    <span className="text-gray-700 dark:text-slate-300">{profile.departmentName}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Briefcase size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                    <span className="text-gray-700 dark:text-slate-300">{profile.designationName}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <CalendarDays size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                    <span className="text-gray-700 dark:text-slate-300">
                                        Joined {new Date(profile.joiningDate).toLocaleDateString()}
                                    </span>
                                </div>
                                {profile.managerName && (
                                    <div className="flex items-center gap-3 text-sm">
                                        <Users size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
                                        <span className="text-gray-700 dark:text-slate-300">Reports to {profile.managerName}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3 p-6 border-t border-gray-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-xl">
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-lg border border-gray-300 dark:border-slate-600 px-5 py-2.5 text-sm font-medium bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="rounded-lg bg-[#6C63FF] hover:bg-[#5B52F5] px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                            >
                                {saving ? <Loader size="sm" /> : "Save Changes"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MyProfileModal;
