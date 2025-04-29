import React from 'react';
import { useForm } from 'react-hook-form';
import { Player, Platoon, PlatoonNames, SportType, SportNames } from '../../types';
import Button from '../ui/Button';

interface PlayerFormProps {
  onSubmit: (data: Omit<Player, 'id' | 'stats' | 'createdAt' | 'updatedAt'>) => void;
  initialData?: Player;
  isLoading?: boolean;
}

const PlayerForm: React.FC<PlayerFormProps> = ({
  onSubmit,
  initialData,
  isLoading = false
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: initialData
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-accent-700 mb-1">
            שם פרטי
          </label>
          <input
            type="text"
            {...register('firstName', { required: 'שדה חובה' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-error-500">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-accent-700 mb-1">
            שם משפחה
          </label>
          <input
            type="text"
            {...register('lastName', { required: 'שדה חובה' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-error-500">{errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-accent-700 mb-1">
          פלוגה
        </label>
        <select
          {...register('platoon', { required: 'שדה חובה' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">בחר פלוגה</option>
          {Object.entries(PlatoonNames).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.platoon && (
          <p className="mt-1 text-sm text-error-500">{errors.platoon.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-accent-700 mb-1">
          ענפי ספורט
        </label>
        <div className="space-y-2">
          {Object.entries(SportNames).map(([value, label]) => (
            <label key={value} className="flex items-center">
              <input
                type="checkbox"
                value={value}
                {...register('sportBranch', { required: 'יש לבחור לפחות ענף ספורט אחד' })}
                className="mr-2"
              />
              {label}
            </label>
          ))}
        </div>
        {errors.sportBranch && (
          <p className="mt-1 text-sm text-error-500">{errors.sportBranch.message}</p>
        )}
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            {...register('isRunner')}
            className="mr-2"
          />
          משתתף בריצת 100 מטר
        </label>
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full"
      >
        {initialData ? 'עדכן שחקן' : 'הוסף שחקן'}
      </Button>
    </form>
  );
};

export default PlayerForm;