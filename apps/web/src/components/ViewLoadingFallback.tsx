import React from 'react';
import { Skeleton } from './ui/skeleton';

export const ViewLoadingFallback: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto p-6 sm:p-10 space-y-6 animate-in fade-in duration-200">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-28 rounded-xl" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
      </div>

      {/* Grid skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pt-4">
        {Array.from({ length: 8 }).map((_, idx) => (
          <div key={idx} className="p-4 rounded-2xl bg-card border border-border space-y-3">
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
