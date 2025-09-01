import React, { useState, useEffect } from 'react';
import './recommendations.css';

const TrendingHotels = ({ limit = 8, city = null, showTitle = true }) => {
    const [trendingHotels, setTrendingHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTrendingHotels();
    }, [limit, city]);

    const fetchTrendingHotels = async () => {
        setLoading(true);
        setError(null);
        
        try {
            const params = new URLSearchParams({ limit: limit.toString() });
            if (city) params.append('city', city);
            
            const response = await fetch(`/api/recommendations/trending?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                setTrendingHotels(data.trending_hotels);
            } else {
                setError(data.error || 'Failed to fetch trending hotels');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Error fetching trending hotels:', err);
        } finally {
            setLoading(false);
        }
    };

    const trackInteraction = async (hotelId, interactionType) => {
        try {
            await fetch('/api/interactions/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: localStorage.getItem('userId') || null,
                    hotelId,
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

    if (loading) {
        return (
            <div className="trending-container">
                {showTitle && <h2>Trending Hotels {city && `in ${city}`}</h2>}
                <div className="recommendations-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading trending hotels...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="trending-container">
                {showTitle && <h2>Trending Hotels {city && `in ${city}`}</h2>}
                <div className="recommendations-error">
                    <p>Unable to load trending hotels</p>
                    <button onClick={fetchTrendingHotels} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (trendingHotels.length === 0) {
        return (
            <div className="trending-container">
                {showTitle && <h2>Trending Hotels {city && `in ${city}`}</h2>}
                <div className="recommendations-empty">
                    <p>No trending hotels found at the moment.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="trending-container">
            {showTitle && <h2>Trending Hotels {city && `in ${city}`}</h2>}
            <div className="trending-grid">
                {trendingHotels.map((item, index) => (
                    <div 
                        key={item.hotel._id} 
                        className="trending-card recommendation-card"
                        onClick={() => handleHotelClick(item.hotel)}
                    >
                        <div className="recommendation-image">
                            <img 
                                src={item.hotel.photos && item.hotel.photos[0] 
                                    ? item.hotel.photos[0] 
                                    : "https://cf.bstatic.com/xdata/images/hotel/square600/87428762.webp?k=de5db8fe94cbfe08d3bf16d3c86def035fd73b43ee497cffe27b03363764e0e2&o="
                                } 
                                alt={item.hotel.name}
                                loading="lazy"
                            />
                            <div className="trending-badge">
                                🔥 Trending
                            </div>
                        </div>
                        
                        <div className="recommendation-content">
                            <h3 className="hotel-name">{item.hotel.name}</h3>
                            <p className="hotel-location">{item.hotel.city}</p>
                            <p className="hotel-type">{item.hotel.type}</p>
                            
                            <div className="hotel-rating">
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
                            
                            <div className="hotel-price">
                                <span className="price-label">Starting from</span>
                                <span className="price-amount">${item.hotel.cheapestPrice}</span>
                            </div>
                            
                            {item.interaction_count && (
                                <div className="trending-stats">
                                    <small>
                                        {item.interaction_count} recent views • {item.unique_users} users interested
                                    </small>
                                </div>
                            )}
                            
                            {item.hotel.amenities && item.hotel.amenities.length > 0 && (
                                <div className="hotel-amenities">
                                    {item.hotel.amenities.slice(0, 3).map((amenity, idx) => (
                                        <span key={idx} className="amenity-tag">
                                            {amenity.replace('_', ' ')}
                                        </span>
                                    ))}
                                    {item.hotel.amenities.length > 3 && (
                                        <span className="amenity-more">
                                            +{item.hotel.amenities.length - 3} more
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

export default TrendingHotels;
