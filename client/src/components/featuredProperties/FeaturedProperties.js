import React from 'react';
import "./featuredProperties.css";
import useFetch from '../../hooks/useFetch';

const FeaturedProperties = () => {

    const { data, loading, error } = useFetch("/hotels/featured?featured=true&limit=4")

    return (
        <div className='fp'>

            {loading ? "Loading please wait" :
                <>
                    {data.map(item => (

                        <div className="fpItem" key={item._id}>
                            <img className='fpImg' src="https://cf.bstatic.com/xdata/images/hotel/square600/87428762.webp?k=de5db8fe94cbfe08d3bf16d3c86def035fd73b43ee497cffe27b03363764e0e2&o=" alt="" />
                            <span className='fpName'>{item.name}</span>
                            <span className='fpCity'>{item.city}</span>
                            <span className='fpPrice'>Starting from ${item.cheapestPrice}</span>
                            {item.rating && <div className='fpRating'>
                                <button>{item.rating}</button>
                                <span>Excellent</span>
                            </div>}
                        </div>
                    ))}
                </>
            }

        </div>
    )
}

export default FeaturedProperties