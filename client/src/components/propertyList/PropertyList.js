import React from 'react';
import "./propertyList.css";

const PropertyList = () => {
  return (
    <div className='pList'>
        <div className="pListItem">
            <img className='pListImg' src="https://q-xx.bstatic.com/xdata/images/xphoto/263x210/57584488.jpeg?k=d8d4706fc72ee789d870eb6b05c0e546fd4ad85d72a3af3e30fb80ca72f0ba57&o=" alt="" />
            <div className="pListTitles">
                <h4>Hotels</h4>
                <h6>233 hotels</h6>
            </div>
        </div>
        <div className="pListItem">
            <img className='pListImg' src="https://q-xx.bstatic.com/xdata/images/hotel/263x210/119467716.jpeg?k=f3c2c6271ab71513e044e48dfde378fcd6bb80cb893e39b9b78b33a60c0131c9&o=" alt="" />
            <div className="pListTitles">
                <h4>Apartments</h4>
                <h6>233 Apartments</h6>
            </div>
        </div>
        <div className="pListItem">
            <img className='pListImg' src="https://r-xx.bstatic.com/xdata/images/xphoto/263x210/45450084.jpeg?k=f8c2954e867a1dd4b479909c49528531dcfb676d8fbc0d60f51d7b51bb32d1d9&o=" alt="" />
            <div className="pListTitles">
                <h4>Resorts</h4>
                <h6>233 Resorts</h6>
            </div>
        </div>
        <div className="pListItem">
            <img className='pListImg' src="https://r-xx.bstatic.com/xdata/images/hotel/263x210/100235855.jpeg?k=5b6e6cff16cfd290e953768d63ee15f633b56348238a705c45759aa3a81ba82b&o=" alt="" />
            <div className="pListTitles">
                <h4>Villas</h4>
                <h6>233 Villas</h6>
            </div>
        </div>
        <div className="pListItem">
            <img className='pListImg' src="https://r-xx.bstatic.com/xdata/images/hotel/263x210/52979454.jpeg?k=6ac6d0afd28e4ce00a8f817cc3045039e064469a3f9a88059706c0b45adf2e7d&o=" alt="" />
            <div className="pListTitles">
                <h4>Cabins</h4>
                <h6>233 Cabins</h6>
            </div>
        </div>
    </div>
  )
}

export default PropertyList