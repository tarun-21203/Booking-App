import React from 'react'

const Navbar = () => {
  return (
    <>
      <div class="d-flex bd-highlight p-3 bg-primary text-white">
        <div class="me-auto p-1 bd-highlight ms-4 fw-bolder fs-4">Booking</div>
        <div class="p-1 bd-highlight"><button type="button" class="btn btn-light fw-bold">Register</button></div>
        <div class="p-1 bd-highlight"><button type="button" class="btn btn-light fw-bold">Login</button></div>
      </div>
    </>
  )
}

export default Navbar