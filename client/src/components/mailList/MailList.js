import React from 'react'

const MailList = () => {
    return (
        <>
            <div className='bg-primary py-5'>
                <div className='text-center text-white'>
                    <div className='h2 fw-bold'>
                        Save time, save money!
                    </div>
                    <div className='h4'>
                        Sign up and we'll send the best deal to you.
                    </div>
                </div>
                <div className='d-flex justify-content-center'>
                    <nav class="navbar navbar-dark ">
                        <div class="container-fluid">
                            <form class="d-flex">
                                <input class="form-control me-2" type="search" placeholder="Your email" aria-label="Search" />
                                <div class="p-1 bd-highlight"><button type="submit" class="btn btn-light fw-bold">Subscribe</button></div>
                            </form>
                        </div>
                    </nav>
                </div>
            </div>
        </>
    )
}

export default MailList