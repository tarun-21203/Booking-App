import React from 'react';
import "./searchItem.css";
import { Link } from "react-router-dom";

const SearchItem = ({item}) => {
  return (
    <div className='searchItem'>
        <img className='siImg' src="https://cf.bstatic.com/xdata/images/hotel/square600/92522815.webp?k=69d7052fd1ad5888d49eaf8c1c6b1f492bb619be6a4f72a5a966e9a1d36a6516&o=" alt=""/>
        <div className="siDesc">
            <h1 className="siTitle">{item.name}</h1>
            <span className="siDistance">{item.distance}m from center</span>
            <span className="siTaxiOp">Free airport taxi</span>
            <span className="siSubtitle">Studio Apartment with Air conditioning</span>
            <span className="siFeatures">{item.desc} </span>
            <span className="siCancelOp">Free cancellation</span>
            <span className="siCancelOpSubtitle">You can cancel later, so lock in this great  price today!</span>
        </div>
        <div className="siDetails">
            {item.rating && <div className="siRating">
                <span>Excellent</span>
                <button>{item.rating}</button>
            </div>}
            <div className="siDetailTexts">
                <span className="siPrice">${item.cheapestPrice}</span>
                <span className="siTaxOp">Include taxes and fees</span>
                <Link to={`/hotels/${item._id}`} >
                <button className='siCheckButton'>See availability</button>
                </Link>
            </div>
        </div>
    </div>
  )
}

export default SearchItem