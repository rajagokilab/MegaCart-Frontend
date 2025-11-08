// src/utils/renderStars.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

export function renderStars(rating = 0) {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <FontAwesomeIcon
                key={i}
                icon={faStar}
                color={i <= rating ? '#FFD700' : '#E0E0E0'}
            />
        );
    }
    return <>{stars}</>;
}
