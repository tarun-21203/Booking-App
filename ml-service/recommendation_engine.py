import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.neighbors import NearestNeighbors
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import pymongo
import os
from datetime import datetime, timedelta
import logging
import joblib
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self):
        self.mongo_client = None
        self.db = None
        self.tfidf_vectorizer = None
        self.knn_model = None
        self.scaler = StandardScaler()
        self.hotel_features_matrix = None
        self.hotel_ids = None
        self.user_similarity_matrix = None
        
        self._connect_to_database()
        self._initialize_models()
    
    def _connect_to_database(self):
        """Connect to MongoDB database"""
        try:
            mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017/booking-app')
            self.mongo_client = pymongo.MongoClient(mongo_uri)
            self.db = self.mongo_client.get_default_database()
            logger.info("Connected to MongoDB successfully")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    def _initialize_models(self):
        """Initialize or load existing ML models"""
        try:
            # Try to load existing models
            if os.path.exists('models/tfidf_vectorizer.pkl'):
                self.tfidf_vectorizer = joblib.load('models/tfidf_vectorizer.pkl')
                logger.info("Loaded existing TF-IDF vectorizer")
            else:
                self.tfidf_vectorizer = TfidfVectorizer(
                    max_features=1000,
                    stop_words='english',
                    ngram_range=(1, 2)
                )
                logger.info("Created new TF-IDF vectorizer")
            
            if os.path.exists('models/knn_model.pkl'):
                self.knn_model = joblib.load('models/knn_model.pkl')
                logger.info("Loaded existing k-NN model")
            else:
                self.knn_model = NearestNeighbors(
                    n_neighbors=10,
                    metric='cosine',
                    algorithm='brute'
                )
                logger.info("Created new k-NN model")
                
            # Initialize models with current data
            self._train_content_based_model()
            self._train_collaborative_model()
            
        except Exception as e:
            logger.error(f"Failed to initialize models: {str(e)}")
    
    def _train_content_based_model(self):
        """Train TF-IDF content-based recommendation model"""
        try:
            # Get hotel data from database
            hotels = list(self.db.hotels.find({}))
            
            if not hotels:
                logger.warning("No hotels found in database")
                return
            
            # Create content features for each hotel
            hotel_contents = []
            self.hotel_ids = []
            
            for hotel in hotels:
                content = self._create_hotel_content_string(hotel)
                hotel_contents.append(content)
                self.hotel_ids.append(str(hotel['_id']))
            
            # Fit TF-IDF vectorizer and transform content
            self.hotel_features_matrix = self.tfidf_vectorizer.fit_transform(hotel_contents)
            
            # Save the model
            os.makedirs('models', exist_ok=True)
            joblib.dump(self.tfidf_vectorizer, 'models/tfidf_vectorizer.pkl')
            joblib.dump(self.hotel_features_matrix, 'models/hotel_features_matrix.pkl')
            
            logger.info(f"Trained content-based model with {len(hotels)} hotels")
            
        except Exception as e:
            logger.error(f"Failed to train content-based model: {str(e)}")
    
    def _train_collaborative_model(self):
        """Train k-NN collaborative filtering model"""
        try:
            # Get user interaction data
            interactions = list(self.db.userinteractions.find({
                'interactionType': {'$in': ['view', 'click', 'booking']}
            }))
            
            if not interactions:
                logger.warning("No user interactions found")
                return
            
            # Create user-hotel interaction matrix
            user_hotel_matrix = self._create_user_hotel_matrix(interactions)
            
            if user_hotel_matrix.empty:
                logger.warning("Empty user-hotel matrix")
                return
            
            # Normalize the matrix
            user_features = self.scaler.fit_transform(user_hotel_matrix.fillna(0))
            
            # Train k-NN model
            self.knn_model.fit(user_features)
            
            # Save the model
            joblib.dump(self.knn_model, 'models/knn_model.pkl')
            joblib.dump(self.scaler, 'models/scaler.pkl')
            joblib.dump(user_hotel_matrix, 'models/user_hotel_matrix.pkl')
            
            logger.info(f"Trained collaborative model with {len(user_hotel_matrix)} users")
            
        except Exception as e:
            logger.error(f"Failed to train collaborative model: {str(e)}")
    
    def _create_hotel_content_string(self, hotel: Dict) -> str:
        """Create content string for TF-IDF from hotel data"""
        content_parts = []
        
        # Add basic hotel information
        content_parts.append(hotel.get('name', ''))
        content_parts.append(hotel.get('type', ''))
        content_parts.append(hotel.get('city', ''))
        content_parts.append(hotel.get('desc', ''))
        content_parts.append(hotel.get('title', ''))
        
        # Add amenities
        amenities = hotel.get('amenities', [])
        content_parts.extend(amenities)
        
        # Add nearby attractions
        attractions = hotel.get('nearbyAttractions', [])
        for attraction in attractions:
            content_parts.append(attraction.get('name', ''))
            content_parts.append(attraction.get('category', ''))
        
        # Add rating category
        rating = hotel.get('rating', 0)
        if rating >= 4.5:
            content_parts.append('excellent luxury premium')
        elif rating >= 4.0:
            content_parts.append('very good quality')
        elif rating >= 3.5:
            content_parts.append('good standard')
        else:
            content_parts.append('budget economy')
        
        return ' '.join(filter(None, content_parts))
    
    def _create_user_hotel_matrix(self, interactions: List[Dict]) -> pd.DataFrame:
        """Create user-hotel interaction matrix for collaborative filtering"""
        # Convert interactions to DataFrame
        df = pd.DataFrame(interactions)
        
        if df.empty:
            return pd.DataFrame()
        
        # Create interaction scores
        interaction_weights = {
            'view': 1.0,
            'click': 2.0,
            'booking': 5.0
        }
        
        df['score'] = df['interactionType'].map(interaction_weights)
        
        # Group by user and hotel, sum scores
        user_hotel_scores = df.groupby(['userId', 'hotelId'])['score'].sum().reset_index()
        
        # Create pivot table
        user_hotel_matrix = user_hotel_scores.pivot(
            index='userId', 
            columns='hotelId', 
            values='score'
        )
        
        return user_hotel_matrix
    
    def get_personalized_recommendations(self, user_id: str, limit: int = 10, filters: Dict = None) -> List[Dict]:
        """Get personalized recommendations using hybrid approach"""
        try:
            # Get content-based recommendations
            content_recs = self._get_content_based_recommendations(user_id, limit * 2)
            
            # Get collaborative recommendations
            collab_recs = self._get_collaborative_recommendations(user_id, limit * 2)
            
            # Combine recommendations with hybrid scoring
            hybrid_recs = self._combine_recommendations(content_recs, collab_recs, user_id)
            
            # Apply filters
            if filters:
                hybrid_recs = self._apply_filters(hybrid_recs, filters)
            
            # Return top recommendations
            return hybrid_recs[:limit]
            
        except Exception as e:
            logger.error(f"Error getting personalized recommendations: {str(e)}")
            return []
    
    def _get_content_based_recommendations(self, user_id: str, limit: int) -> List[Dict]:
        """Get content-based recommendations using TF-IDF"""
        try:
            # Get user preferences and interaction history
            user_profile = self._build_user_content_profile(user_id)
            
            if not user_profile:
                # Return popular hotels if no user profile
                return self._get_popular_hotels(limit)
            
            # Calculate similarity with all hotels
            user_vector = self.tfidf_vectorizer.transform([user_profile])
            similarities = cosine_similarity(user_vector, self.hotel_features_matrix).flatten()
            
            # Get top similar hotels
            top_indices = similarities.argsort()[-limit:][::-1]
            
            recommendations = []
            for idx in top_indices:
                hotel_id = self.hotel_ids[idx]
                hotel = self.db.hotels.find_one({'_id': pymongo.ObjectId(hotel_id)})
                if hotel:
                    recommendations.append({
                        'hotel': hotel,
                        'score': float(similarities[idx]),
                        'reason': 'content_similarity'
                    })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Error in content-based recommendations: {str(e)}")
            return []

    def _get_collaborative_recommendations(self, user_id: str, limit: int) -> List[Dict]:
        """Get collaborative filtering recommendations using k-NN"""
        try:
            # Load user-hotel matrix
            if os.path.exists('models/user_hotel_matrix.pkl'):
                user_hotel_matrix = joblib.load('models/user_hotel_matrix.pkl')
            else:
                return []

            if user_id not in user_hotel_matrix.index:
                return self._get_popular_hotels(limit)

            # Get user's interaction vector
            user_vector = user_hotel_matrix.loc[user_id].fillna(0).values.reshape(1, -1)
            user_vector_scaled = self.scaler.transform(user_vector)

            # Find similar users
            distances, indices = self.knn_model.kneighbors(user_vector_scaled, n_neighbors=min(10, len(user_hotel_matrix)))

            # Get recommendations from similar users
            similar_users = user_hotel_matrix.iloc[indices[0]]
            user_interactions = user_hotel_matrix.loc[user_id]

            # Calculate weighted scores for hotels not interacted with by current user
            recommendations = []
            for hotel_id in user_hotel_matrix.columns:
                if pd.isna(user_interactions[hotel_id]) or user_interactions[hotel_id] == 0:
                    # Calculate weighted score from similar users
                    weighted_score = 0
                    total_weight = 0

                    for i, similar_user_idx in enumerate(indices[0]):
                        if i == 0:  # Skip the user themselves
                            continue

                        similar_user = user_hotel_matrix.iloc[similar_user_idx]
                        similarity = 1 / (1 + distances[0][i])  # Convert distance to similarity

                        if not pd.isna(similar_user[hotel_id]) and similar_user[hotel_id] > 0:
                            weighted_score += similarity * similar_user[hotel_id]
                            total_weight += similarity

                    if total_weight > 0:
                        final_score = weighted_score / total_weight
                        hotel = self.db.hotels.find_one({'_id': pymongo.ObjectId(hotel_id)})
                        if hotel:
                            recommendations.append({
                                'hotel': hotel,
                                'score': final_score,
                                'reason': 'collaborative_filtering'
                            })

            # Sort by score and return top recommendations
            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations[:limit]

        except Exception as e:
            logger.error(f"Error in collaborative recommendations: {str(e)}")
            return []

    def _build_user_content_profile(self, user_id: str) -> str:
        """Build user content profile from interactions and preferences"""
        try:
            profile_parts = []

            # Get user preferences
            preferences = self.db.userpreferences.find_one({'userId': pymongo.ObjectId(user_id)})
            if preferences:
                # Add preferred cities
                for city_pref in preferences.get('preferredCities', []):
                    weight = int(city_pref.get('weight', 1))
                    profile_parts.extend([city_pref['city']] * weight)

                # Add preferred hotel types
                for type_pref in preferences.get('preferredHotelTypes', []):
                    weight = int(type_pref.get('weight', 1))
                    profile_parts.extend([type_pref['type']] * weight)

                # Add preferred amenities
                for amenity_pref in preferences.get('preferredAmenities', []):
                    importance = int(amenity_pref.get('importance', 1))
                    profile_parts.extend([amenity_pref['amenity']] * importance)

                # Add travel style
                travel_style = preferences.get('travelStyle', '')
                if travel_style:
                    profile_parts.extend([travel_style] * 3)

            # Get recent interactions
            recent_interactions = list(self.db.userinteractions.find({
                'userId': pymongo.ObjectId(user_id),
                'createdAt': {'$gte': datetime.now() - timedelta(days=90)}
            }).limit(50))

            # Add content from interacted hotels
            for interaction in recent_interactions:
                hotel = self.db.hotels.find_one({'_id': interaction['hotelId']})
                if hotel:
                    weight = 3 if interaction['interactionType'] == 'booking' else 1
                    hotel_content = self._create_hotel_content_string(hotel)
                    profile_parts.extend([hotel_content] * weight)

            return ' '.join(profile_parts)

        except Exception as e:
            logger.error(f"Error building user content profile: {str(e)}")
            return ""

    def _combine_recommendations(self, content_recs: List[Dict], collab_recs: List[Dict], user_id: str) -> List[Dict]:
        """Combine content-based and collaborative recommendations"""
        try:
            # Create a dictionary to store combined scores
            combined_scores = {}

            # Add content-based recommendations (weight: 0.6)
            for rec in content_recs:
                hotel_id = str(rec['hotel']['_id'])
                combined_scores[hotel_id] = {
                    'hotel': rec['hotel'],
                    'content_score': rec['score'] * 0.6,
                    'collab_score': 0,
                    'total_score': rec['score'] * 0.6,
                    'reasons': ['content_similarity']
                }

            # Add collaborative recommendations (weight: 0.4)
            for rec in collab_recs:
                hotel_id = str(rec['hotel']['_id'])
                if hotel_id in combined_scores:
                    combined_scores[hotel_id]['collab_score'] = rec['score'] * 0.4
                    combined_scores[hotel_id]['total_score'] += rec['score'] * 0.4
                    combined_scores[hotel_id]['reasons'].append('collaborative_filtering')
                else:
                    combined_scores[hotel_id] = {
                        'hotel': rec['hotel'],
                        'content_score': 0,
                        'collab_score': rec['score'] * 0.4,
                        'total_score': rec['score'] * 0.4,
                        'reasons': ['collaborative_filtering']
                    }

            # Add popularity boost for trending hotels
            for hotel_id, data in combined_scores.items():
                popularity_score = self._get_hotel_popularity_score(hotel_id)
                data['total_score'] += popularity_score * 0.1
                if popularity_score > 0.5:
                    data['reasons'].append('trending')

            # Convert to list and sort by total score
            recommendations = []
            for hotel_id, data in combined_scores.items():
                recommendations.append({
                    'hotel': data['hotel'],
                    'score': data['total_score'],
                    'content_score': data['content_score'],
                    'collab_score': data['collab_score'],
                    'reasons': data['reasons']
                })

            recommendations.sort(key=lambda x: x['score'], reverse=True)
            return recommendations

        except Exception as e:
            logger.error(f"Error combining recommendations: {str(e)}")
            return content_recs + collab_recs

    def _get_hotel_popularity_score(self, hotel_id: str) -> float:
        """Calculate hotel popularity score based on recent interactions"""
        try:
            # Count recent interactions (last 30 days)
            recent_count = self.db.userinteractions.count_documents({
                'hotelId': pymongo.ObjectId(hotel_id),
                'createdAt': {'$gte': datetime.now() - timedelta(days=30)}
            })

            # Count total interactions
            total_count = self.db.userinteractions.count_documents({
                'hotelId': pymongo.ObjectId(hotel_id)
            })

            # Calculate popularity score (0-1)
            if total_count == 0:
                return 0

            recency_factor = recent_count / max(total_count, 1)
            popularity_score = min(1.0, (recent_count / 100) + recency_factor)

            return popularity_score

        except Exception as e:
            logger.error(f"Error calculating popularity score: {str(e)}")
            return 0

    def _get_popular_hotels(self, limit: int) -> List[Dict]:
        """Get popular hotels as fallback recommendations"""
        try:
            # Get hotels with highest ratings and most interactions
            pipeline = [
                {
                    '$lookup': {
                        'from': 'userinteractions',
                        'localField': '_id',
                        'foreignField': 'hotelId',
                        'as': 'interactions'
                    }
                },
                {
                    '$addFields': {
                        'interaction_count': {'$size': '$interactions'},
                        'popularity_score': {
                            '$add': [
                                {'$multiply': ['$rating', 0.7]},
                                {'$multiply': [{'$size': '$interactions'}, 0.001]}
                            ]
                        }
                    }
                },
                {'$sort': {'popularity_score': -1}},
                {'$limit': limit}
            ]

            popular_hotels = list(self.db.hotels.aggregate(pipeline))

            recommendations = []
            for hotel in popular_hotels:
                recommendations.append({
                    'hotel': hotel,
                    'score': hotel.get('popularity_score', 0),
                    'reason': 'popular'
                })

            return recommendations

        except Exception as e:
            logger.error(f"Error getting popular hotels: {str(e)}")
            return []

    def _apply_filters(self, recommendations: List[Dict], filters: Dict) -> List[Dict]:
        """Apply filters to recommendations"""
        try:
            filtered_recs = []

            for rec in recommendations:
                hotel = rec['hotel']

                # City filter
                if 'city' in filters and filters['city']:
                    if hotel.get('city', '').lower() != filters['city'].lower():
                        continue

                # Price range filter
                if 'priceRange' in filters:
                    price_range = filters['priceRange']
                    hotel_price = hotel.get('cheapestPrice', 0)
                    if 'min' in price_range and hotel_price < price_range['min']:
                        continue
                    if 'max' in price_range and hotel_price > price_range['max']:
                        continue

                # Rating filter
                if 'minRating' in filters:
                    if hotel.get('rating', 0) < filters['minRating']:
                        continue

                # Hotel type filter
                if 'type' in filters and filters['type']:
                    if hotel.get('type', '').lower() != filters['type'].lower():
                        continue

                # Amenities filter
                if 'amenities' in filters and filters['amenities']:
                    hotel_amenities = hotel.get('amenities', [])
                    required_amenities = filters['amenities']
                    if not all(amenity in hotel_amenities for amenity in required_amenities):
                        continue

                filtered_recs.append(rec)

            return filtered_recs

        except Exception as e:
            logger.error(f"Error applying filters: {str(e)}")
            return recommendations

    def get_similar_hotels(self, hotel_id: str, limit: int = 5) -> List[Dict]:
        """Get hotels similar to a given hotel using content-based similarity"""
        try:
            if not self.hotel_features_matrix or not self.hotel_ids:
                return []

            # Find the index of the given hotel
            if hotel_id not in self.hotel_ids:
                return []

            hotel_idx = self.hotel_ids.index(hotel_id)

            # Calculate similarity with all other hotels
            hotel_vector = self.hotel_features_matrix[hotel_idx]
            similarities = cosine_similarity(hotel_vector, self.hotel_features_matrix).flatten()

            # Get top similar hotels (excluding the hotel itself)
            similar_indices = similarities.argsort()[-limit-1:-1][::-1]

            similar_hotels = []
            for idx in similar_indices:
                if idx != hotel_idx:  # Exclude the hotel itself
                    similar_hotel_id = self.hotel_ids[idx]
                    hotel = self.db.hotels.find_one({'_id': pymongo.ObjectId(similar_hotel_id)})
                    if hotel:
                        similar_hotels.append({
                            'hotel': hotel,
                            'similarity_score': float(similarities[idx]),
                            'reason': 'content_similarity'
                        })

            return similar_hotels[:limit]

        except Exception as e:
            logger.error(f"Error getting similar hotels: {str(e)}")
            return []

    def get_trending_hotels(self, limit: int = 10, city: Optional[str] = None) -> List[Dict]:
        """Get trending hotels based on recent interactions"""
        try:
            # Build aggregation pipeline
            match_stage = {
                'createdAt': {'$gte': datetime.now() - timedelta(days=7)}
            }

            pipeline = [
                {'$match': match_stage},
                {
                    '$group': {
                        '_id': '$hotelId',
                        'interaction_count': {'$sum': 1},
                        'unique_users': {'$addToSet': '$userId'},
                        'avg_duration': {'$avg': '$duration'}
                    }
                },
                {
                    '$addFields': {
                        'unique_user_count': {'$size': '$unique_users'},
                        'trending_score': {
                            '$add': [
                                {'$multiply': ['$interaction_count', 0.6]},
                                {'$multiply': ['$unique_user_count', 0.4]}
                            ]
                        }
                    }
                },
                {'$sort': {'trending_score': -1}},
                {'$limit': limit * 2}  # Get more to filter by city if needed
            ]

            trending_data = list(self.db.userinteractions.aggregate(pipeline))

            # Get hotel details and apply city filter
            trending_hotels = []
            for data in trending_data:
                hotel = self.db.hotels.find_one({'_id': data['_id']})
                if hotel:
                    # Apply city filter if specified
                    if city and hotel.get('city', '').lower() != city.lower():
                        continue

                    trending_hotels.append({
                        'hotel': hotel,
                        'trending_score': data['trending_score'],
                        'interaction_count': data['interaction_count'],
                        'unique_users': data['unique_user_count'],
                        'reason': 'trending'
                    })

                    if len(trending_hotels) >= limit:
                        break

            return trending_hotels

        except Exception as e:
            logger.error(f"Error getting trending hotels: {str(e)}")
            return []

    def analyze_user_profile(self, user_id: str) -> Dict[str, Any]:
        """Analyze user profile for insights"""
        try:
            profile = {
                'user_id': user_id,
                'preferences': {},
                'behavior_patterns': {},
                'recommendations_insights': {}
            }

            # Get user preferences
            preferences = self.db.userpreferences.find_one({'userId': pymongo.ObjectId(user_id)})
            if preferences:
                profile['preferences'] = {
                    'preferred_cities': preferences.get('preferredCities', []),
                    'preferred_types': preferences.get('preferredHotelTypes', []),
                    'price_range': preferences.get('priceRange', {}),
                    'travel_style': preferences.get('travelStyle', 'leisure')
                }

            # Analyze interaction patterns
            interactions = list(self.db.userinteractions.find({
                'userId': pymongo.ObjectId(user_id)
            }).sort('createdAt', -1).limit(100))

            if interactions:
                # Most viewed cities
                city_counts = {}
                type_counts = {}
                interaction_type_counts = {}

                for interaction in interactions:
                    hotel = self.db.hotels.find_one({'_id': interaction['hotelId']})
                    if hotel:
                        city = hotel.get('city', 'Unknown')
                        hotel_type = hotel.get('type', 'Unknown')

                        city_counts[city] = city_counts.get(city, 0) + 1
                        type_counts[hotel_type] = type_counts.get(hotel_type, 0) + 1

                    int_type = interaction['interactionType']
                    interaction_type_counts[int_type] = interaction_type_counts.get(int_type, 0) + 1

                profile['behavior_patterns'] = {
                    'most_viewed_cities': sorted(city_counts.items(), key=lambda x: x[1], reverse=True)[:5],
                    'preferred_hotel_types': sorted(type_counts.items(), key=lambda x: x[1], reverse=True)[:3],
                    'interaction_distribution': interaction_type_counts,
                    'total_interactions': len(interactions)
                }

            # Get booking history
            bookings = list(self.db.bookings.find({
                'userId': pymongo.ObjectId(user_id)
            }).sort('createdAt', -1).limit(10))

            if bookings:
                total_spent = sum(booking.get('totalAmount', 0) for booking in bookings)
                avg_rating_given = sum(booking.get('rating', {}).get('overall', 0) for booking in bookings if booking.get('rating', {}).get('overall', 0) > 0)
                rated_bookings = len([b for b in bookings if b.get('rating', {}).get('overall', 0) > 0])

                profile['behavior_patterns']['booking_stats'] = {
                    'total_bookings': len(bookings),
                    'total_spent': total_spent,
                    'average_rating_given': avg_rating_given / max(rated_bookings, 1),
                    'recent_bookings': len([b for b in bookings if b['createdAt'] > datetime.now() - timedelta(days=90)])
                }

            return profile

        except Exception as e:
            logger.error(f"Error analyzing user profile: {str(e)}")
            return {'error': str(e)}

    def retrain_models(self, model_type: str = 'all') -> Dict[str, str]:
        """Retrain ML models with latest data"""
        try:
            results = {}

            if model_type in ['all', 'content']:
                self._train_content_based_model()
                results['content_model'] = 'retrained successfully'

            if model_type in ['all', 'collaborative']:
                self._train_collaborative_model()
                results['collaborative_model'] = 'retrained successfully'

            return results

        except Exception as e:
            logger.error(f"Error retraining models: {str(e)}")
            return {'error': str(e)}
