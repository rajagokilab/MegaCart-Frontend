// src/utils/renderStars.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

/**
 * Renders stars for display or as a clickable input.
 *
 * @param {number | string | null} rating - The average rating to display (e.g., 4.2).
 * @param {function | null} onRatingChange - (Optional) A callback function to call when a star is clicked.
 * @param {number} currentRating - (Optional) The currently selected rating value (for input mode).
 */
export const renderStars = (rating, onRatingChange = null, currentRating = 0) => {
    const stars = [];
    const totalStars = 5;

    // Check if the function is being used as a clickable input
    const isInput = typeof onRatingChange === 'function';
    
    // For display mode, round the static rating
    const displayRating = Math.round(parseFloat(rating) || 0);
    
    // For input mode, use the 'currentRating' state
    const activeStars = isInput ? currentRating : displayRating;

    // Use larger stars for the review input form
    const sizeClasses = isInput ? 'fs-5 me-1' : 'small me-1';

    for (let i = 1; i <= totalStars; i++) {
        stars.push(
            <FontAwesomeIcon
                key={i}
                icon={faStar}
                // Use Bootstrap's text colors for consistency
                className={`${sizeClasses} ${i <= activeStars ? 'text-warning' : 'text-muted'}`}
                style={{ cursor: isInput ? 'pointer' : 'default' }}
                // Only add the onClick event if 'onRatingChange' function was passed
                onClick={isInput ? () => onRatingChange(i) : null} 
            />
        );
    }
    return <>{stars}</>;
};