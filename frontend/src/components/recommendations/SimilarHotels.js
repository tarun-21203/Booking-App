import React, { useState, useEffect } from 'react';
import './recommendations.css';

const SimilarHotels = ({ hotelId, limit = 5, showTitle = true }) => {
    const [similarHotels, setSimilarHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (hotelId) {
            fetchSimilarHotels();
        }
    }, [hotelId, limit]);

    const fetchSimilarHotels = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/recommendations/similar/${hotelId}?limit=${limit}`);
            const data = await response.json();
            
            if (response.ok) {
                setSimilarHotels(data.similar_hotels);
            } else {
                setError(data.error || 'Failed to fetch similar hotels');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Error fetching similar hotels:', err);
        } finally {
            setLoading(false);
        }
    };

    const trackInteraction = async (targetHotelId, interactionType) => {
        try {
            await fetch('/api/interactions/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId') || null,
                    hotelId: targetHotelId,
                    interactionType,
                    sessionId: sessionStorage.getItem('sessionId') || `session_${Date.now()}`
                })
            });
        } catch (err) {
            console.error('Error tracking interaction:', err);
        }
    };

    const handleHotelClick = (hotel) => {
        trackInteraction(hotel._id, 'click');
        window.location.href = `/hotel/${hotel._id}`;
    };

    if (!hotelId) {
        return null;
    }

    if (loading) {
        return (
            <div className="similar-hotels-container">
                {showTitle && <h3>Similar Hotels</h3>}
                <div className="recommendations-loading">
                    <div className="loading-spinner"></div>
                    <p>Finding similar hotels...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="similar-hotels-container">
                {showTitle && <h3>Similar Hotels</h3>}
                <div className="recommendations-error">
                    <p>Unable to load similar hotels</p>
                    <button onClick={fetchSimilarHotels} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (similarHotels.length === 0) {
        return (
            <div className="similar-hotels-container">
                {showTitle && <h3>Similar Hotels</h3>}
                <div className="recommendations-empty">
                    <p>No similar hotels found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="similar-hotels-container">
            {showTitle && <h3>Similar Hotels You Might Like</h3>}
            <div className="similar-hotels-grid">
                {similarHotels.map((item, index) => (
                    <div 
                        key={item.hotel._id} 
                        className="similar-hotel-card"
                        onClick={() => handleHotelClick(item.hotel)}
                    >
                        <div className="recommendation-image" style={{ height: '150px' }}>
                            <img 
                                src={item.hotel.photos && item.hotel.photos[0] 
                                    ? item.hotel.photos[0] 
                                    : "https://cf.bstatic.com/xdata/images/hotel/square600/87428762.webp?k=de5db8fe94cbfe08d3bf16d3c86def035fd73b43ee497cffe27b03363764e0e2&o="
                                } 
                                alt={item.hotel.name}
                                loading="lazy"
                            />
                            <div className="recommendation-badge">
                                <span className="recommendation-score">
                                    {Math.round(item.similarity_score * 100)}% similar
                                </span>
                            </div>
                        </div>
                        
                        <div className="recommendation-content" style={{ padding: '0.75rem' }}>
                            <h4 className="hotel-name" style={{ fontSize: '1rem', margin: '0 0 0.5rem 0' }}>
                                {item.hotel.name}
                            </h4>
                            <p className="hotel-location" style={{ margin: '0 0 0.25rem 0' }}>
                                {item.hotel.city}
                            </p>
                            
                            <div className="hotel-rating" style={{ marginBottom: '0.5rem' }}>
                                {item.hotel.rating && (
                                    <>
                                        <span className="rating-score">{item.hotel.rating}</span>
                                        <div className="rating-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <span 
                                                    key={i} 
                                                    className={`star ${i < Math.floor(item.hotel.rating) ? 'filled' : ''}`}
                                                >
                                                    ★
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                            
                            <div className="hotel-price" style={{ marginBottom: '0.5rem' }}>
                                <span className="price-amount" style={{ fontSize: '1rem' }}>
                                    ${item.hotel.cheapestPrice}
                                </span>
                                <span className="price-label" style={{ fontSize: '0.75rem' }}>
                                    /night
                                </span>
                            </div>
                            
                            {item.hotel.amenities && item.hotel.amenities.length > 0 && (
                                <div className="hotel-amenities">
                                    {item.hotel.amenities.slice(0, 2).map((amenity, idx) => (
                                        <span key={idx} className="amenity-tag" style={{ fontSize: '0.65rem' }}>
                                            {amenity.replace('_', ' ')}
                                        </span>
                                    ))}
                                    {item.hotel.amenities.length > 2 && (
                                        <span className="amenity-more" style={{ fontSize: '0.65rem' }}>
                                            +{item.hotel.amenities.length - 2}
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SimilarHotels;
