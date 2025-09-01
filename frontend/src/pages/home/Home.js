import React from 'react'
import Navbar from '../../components/navbar/Navbar'
import Header from '../../components/header/Header'
import Featured from '../../components/featured/Featured'
import PropertyList from '../../components/propertyList/PropertyList'
import FeaturedProperties from '../../components/featuredProperties/FeaturedProperties'
import PersonalizedRecommendations from '../../components/recommendations/PersonalizedRecommendations'
import TrendingHotels from '../../components/recommendations/TrendingHotels'
import MailList from '../../components/mailList/MailList'
import Footer from '../../components/footer/Footer'

const Home = () => {
  return (
    <div>
      <Navbar />
      <Header />
      <div className='d-flex flex-column align-items-center mt-5'>
        <Featured />

        {/* Personalized Recommendations Section */}
        <div style={{ "width": "68%", "margin": "2rem 0" }}>
          <PersonalizedRecommendations limit={8} />
        </div>

        {/* Trending Hotels Section */}
        <div style={{ "width": "68%", "margin": "2rem 0" }}>
          <TrendingHotels limit={8} />
        </div>

        <h1 className='mt-5 fw-bold' style={{ "width": "68%", "fontSize": "25px" }}>Browse by property type</h1>
        <PropertyList />
        <h1 className='mt-5 fw-bold' style={{ "width": "68%", "fontSize": "25px" }}>Homes guests love</h1>
        <FeaturedProperties />
      </div>
      <div className='my-5'>
        <MailList />
        <Footer />
      </div>
    </div>
  )
}

export default Home