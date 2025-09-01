import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import useFetch from '../../hooks/useFetch';
import './recommendations.css';

const PersonalizedRecommendations = ({ limit = 8, showTitle = true }) => {
    const { user } = useContext(AuthContext);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchPersonalizedRecommendations();
        }
    }, [user]);

    const fetchPersonalizedRecommendations = async () => {
        if (!user) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(`/api/recommendations/personalized/${user._id}?limit=${limit}`);
            const data = await response.json();
            
            if (response.ok) {
                setRecommendations(data.recommendations);
            } else {
                setError(data.error || 'Failed to fetch recommendations');
            }
        } catch (err) {
            setError('Network error occurred');
            console.error('Error fetching recommendations:', err);
        } finally {
            setLoading(false);
        }
    };

    const trackInteraction = async (hotelId, interactionType) => {
        if (!user) return;
        
        try {
            await fetch('/api/interactions/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: user._id,
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
        // Navigate to hotel details page
        window.location.href = `/hotel/${hotel._id}`;
    };

    const handleHotelView = (hotel) => {
        trackInteraction(hotel._id, 'view');
    };

    if (!user) {
        return null; // Don't show recommendations for non-logged-in users
    }

    if (loading) {
        return (
            <div className="recommendations-container">
                {showTitle && <h2>Recommended for You</h2>}
                <div className="recommendations-loading">
                    <div className="loading-spinner"></div>
                    <p>Finding perfect hotels for you...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recommendations-container">
                {showTitle && <h2>Recommended for You</h2>}
                <div className="recommendations-error">
                    <p>Unable to load personalized recommendations</p>
                    <button onClick={fetchPersonalizedRecommendations} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return (
            <div className="recommendations-container">
                {showTitle && <h2>Recommended for You</h2>}
                <div className="recommendations-empty">
                    <p>Start exploring hotels to get personalized recommendations!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="recommendations-container">
            {showTitle && <h2>Recommended for You</h2>}
            <div className="recommendations-grid">
                {recommendations.map((rec, index) => (
                    <div 
                        key={rec.hotel._id} 
                        className="recommendation-card"
                        onClick={() => handleHotelClick(rec.hotel)}
                        onMouseEnter={() => handleHotelView(rec.hotel)}
                    >
                        <div className="recommendation-image">
                            <img 
                                src={rec.hotel.photos && rec.hotel.photos[0] 
                                    ? rec.hotel.photos[0] 
                                    : "https://cf.bstatic.com/xdata/images/hotel/square600/87428762.webp?k=de5db8fe94cbfe08d3bf16d3c86def035fd73b43ee497cffe27b03363764e0e2&o="
                                } 
                                alt={rec.hotel.name}
                                loading="lazy"
                            />
                            <div className="recommendation-badge">
                                <span className="recommendation-score">
                                    {Math.round(rec.score * 100)}% match
                                </span>
                            </div>
                        </div>
                        
                        <div className="recommendation-content">
                            <h3 className="hotel-name">{rec.hotel.name}</h3>
                            <p className="hotel-location">{rec.hotel.city}</p>
                            <p className="hotel-type">{rec.hotel.type}</p>
                            
                            <div className="hotel-rating">
                                {rec.hotel.rating && (
                                    <>
                                        <span className="rating-score">{rec.hotel.rating}</span>
                                        <div className="rating-stars">
                                            {[...Array(5)].map((_, i) => (
                                                <span 
                                                    key={i} 
                                                    className={`star ${i < Math.floor(rec.hotel.rating) ? 'filled' : ''}`}
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
                                <span className="price-amount">${rec.hotel.cheapestPrice}</span>
                            </div>
                            
                            <div className="recommendation-reason">
                                <small>{rec.explanation}</small>
                            </div>
                            
                            {rec.hotel.amenities && rec.hotel.amenities.length > 0 && (
                                <div className="hotel-amenities">
                                    {rec.hotel.amenities.slice(0, 3).map((amenity, idx) => (
                                        <span key={idx} className="amenity-tag">
                                            {amenity.replace('_', ' ')}
                                        </span>
                                    ))}
                                    {rec.hotel.amenities.length > 3 && (
                                        <span className="amenity-more">
                                            +{rec.hotel.amenities.length - 3} more
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

export default PersonalizedRecommendations;
