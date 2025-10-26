import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, ProfileFormData } from '../../lib/validations/profile-schema';
import { useEffect, useState } from 'react';

const DEFAULT_PROFILE: ProfileFormData = {
  name: 'Demo User',
  email: 'demo@example.com',
  timezone: 'UTC',
  language: 'en',
  bio: '',
};

export function ProfileSettings() {
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    watch,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    mode: 'onBlur',
    defaultValues: (() => {
      const saved = localStorage.getItem('userProfile');
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    })(),
  });

  const onSubmit = (data: ProfileFormData) => {
    localStorage.setItem('userProfile', JSON.stringify(data));
    setShowSuccess(true);
    reset(data);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleCancel = () => {
    const saved = localStorage.getItem('userProfile');
    reset(saved ? JSON.parse(saved) : DEFAULT_PROFILE);
  };

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-2">
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            aria-invalid={errors.name ? 'true' : 'false'}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>

        {/* Email Field (Read-only) */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            readOnly
            aria-invalid={errors.email ? 'true' : 'false'}
            className="w-full px-3 py-2 border rounded-md bg-gray-100 cursor-not-allowed"
          />
          <p className="mt-1 text-sm text-gray-600">
            Email cannot be changed
          </p>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Timezone Field */}
        <div>
          <label htmlFor="timezone" className="block text-sm font-medium mb-2">
            Timezone
          </label>
          <select
            id="timezone"
            {...register('timezone')}
            aria-invalid={errors.timezone ? 'true' : 'false'}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="UTC">UTC</option>
            <option value="America/New_York">America/New York</option>
            <option value="America/Los_Angeles">America/Los Angeles</option>
            <option value="Europe/London">Europe/London</option>
            <option value="Asia/Tokyo">Asia/Tokyo</option>
          </select>
          {errors.timezone && (
            <p className="mt-1 text-sm text-red-600">{errors.timezone.message}</p>
          )}
        </div>

        {/* Language Field */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium mb-2">
            Language
          </label>
          <select
            id="language"
            {...register('language')}
            aria-invalid={errors.language ? 'true' : 'false'}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
          {errors.language && (
            <p className="mt-1 text-sm text-red-600">{errors.language.message}</p>
          )}
        </div>

        {/* Bio Field */}
        <div>
          <label htmlFor="bio" className="block text-sm font-medium mb-2">
            Bio
          </label>
          <textarea
            id="bio"
            {...register('bio')}
            rows={4}
            aria-invalid={errors.bio ? 'true' : 'false'}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Tell us about yourself (optional)"
          />
          {errors.bio && (
            <p className="mt-1 text-sm text-red-600">{errors.bio.message}</p>
          )}
        </div>

        {/* Success Message */}
        {showSuccess && (
          <div className="p-4 bg-green-100 text-green-800 rounded-md">
            Profile updated successfully
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={!isDirty}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
