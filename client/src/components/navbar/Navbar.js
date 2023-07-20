import React, { useContext } from 'react'
import { Link } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';

const Navbar = () => {

  const { user } = useContext(AuthContext);

  return (
    <>
      <div className="d-flex bd-highlight p-3 bg-primary text-white">
        <div className="me-auto p-1 bd-highlight ms-4 fw-bolder fs-4">Booking</div>
        {user ? user.username :
          <>
            <div className="p-1 bd-highlight"><button type="button" className="btn btn-light fw-bold">Register</button></div>
            <div className="p-1 bd-highlight"><button type="button" className="btn btn-light fw-bold">Login</button></div>
          </>
        }
      </div>
    </>
  )
}

export default Navbar