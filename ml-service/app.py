from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging
from recommendation_engine import RecommendationEngine

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize recommendation engine
rec_engine = RecommendationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "ML Recommendation Service"})

@app.route('/recommendations/personalized', methods=['POST'])
def get_personalized_recommendations():
    """Get personalized hotel recommendations for a user"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        limit = data.get('limit', 10)
        filters = data.get('filters', {})
        
        if not user_id:
            return jsonify({"error": "userId is required"}), 400
        
        recommendations = rec_engine.get_personalized_recommendations(
            user_id=user_id,
            limit=limit,
            filters=filters
        )
        
        return jsonify({
            "recommendations": recommendations,
            "total": len(recommendations),
            "userId": user_id
        })
        
    except Exception as e:
        logger.error(f"Error getting personalized recommendations: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/recommendations/similar', methods=['POST'])
def get_similar_hotels():
    """Get hotels similar to a given hotel"""
    try:
        data = request.get_json()
        hotel_id = data.get('hotelId')
        limit = data.get('limit', 5)
        
        if not hotel_id:
            return jsonify({"error": "hotelId is required"}), 400
        
        similar_hotels = rec_engine.get_similar_hotels(
            hotel_id=hotel_id,
            limit=limit
        )
        
        return jsonify({
            "similar_hotels": similar_hotels,
            "total": len(similar_hotels),
            "hotelId": hotel_id
        })
        
    except Exception as e:
        logger.error(f"Error getting similar hotels: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/recommendations/trending', methods=['GET'])
def get_trending_hotels():
    """Get trending hotels based on recent interactions"""
    try:
        limit = request.args.get('limit', 10, type=int)
        city = request.args.get('city')
        
        trending_hotels = rec_engine.get_trending_hotels(
            limit=limit,
            city=city
        )
        
        return jsonify({
            "trending_hotels": trending_hotels,
            "total": len(trending_hotels)
        })
        
    except Exception as e:
        logger.error(f"Error getting trending hotels: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/models/retrain', methods=['POST'])
def retrain_models():
    """Retrain ML models with latest data"""
    try:
        model_type = request.get_json().get('model_type', 'all')
        
        result = rec_engine.retrain_models(model_type)
        
        return jsonify({
            "message": "Models retrained successfully",
            "result": result
        })
        
    except Exception as e:
        logger.error(f"Error retraining models: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/analytics/user-profile', methods=['POST'])
def get_user_profile():
    """Get user profile analysis for recommendations"""
    try:
        data = request.get_json()
        user_id = data.get('userId')
        
        if not user_id:
            return jsonify({"error": "userId is required"}), 400
        
        profile = rec_engine.analyze_user_profile(user_id)
        
        return jsonify({
            "user_profile": profile,
            "userId": user_id
        })
        
    except Exception as e:
        logger.error(f"Error analyzing user profile: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.getenv('ML_SERVICE_PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    
    logger.info(f"Starting ML Recommendation Service on port {port}")
    app.run(host='0.0.0.0', port=port, debug=debug)
