import React from 'react';

export function renderStars(rating: number) {
    const fullStars = Math.round(rating);
    return (
      <span>
        {[...Array(5)].map((_, i) =>
          i < fullStars ? (
            <span key={i} className="text-yellow-500">
              ★
            </span>
          ) : (
            <span key={i} className="text-gray-300">
              ★
            </span>
          )
        )}
      </span>
    );
  }
