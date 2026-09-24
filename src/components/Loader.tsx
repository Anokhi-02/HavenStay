import React from 'react';

export const Loader: React.FC<{ size?: 'sm' | 'md' | 'lg'; message?: string }> = ({
  size = 'md',
  message,
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size];

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div
        className={`${sizeClasses} rounded-full border-rose-500 border-t-transparent animate-spin`}
      />
      {message && (
        <p className="mt-3 text-sm text-slate-600 font-medium">
          {message}
        </p>
      )}
    </div>
  );
};

export const PGSkeletonCard: React.FC = () => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs animate-pulse">
      <div className="aspect-[4/3] bg-slate-200 w-full" />
      <div className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <div className="h-5 bg-slate-200 rounded w-2/3" />
          <div className="h-5 bg-slate-200 rounded w-12" />
        </div>
        <div className="h-4 bg-slate-200 rounded w-1/2" />
        <div className="flex gap-2 pt-2">
          <div className="h-6 bg-slate-200 rounded-full w-16" />
          <div className="h-6 bg-slate-200 rounded-full w-20" />
        </div>
        <div className="pt-3 border-t border-slate-100 flex justify-between items-center">
          <div className="h-6 bg-slate-200 rounded w-24" />
          <div className="h-8 bg-slate-200 rounded-lg w-24" />
        </div>
      </div>
    </div>
  );
};
