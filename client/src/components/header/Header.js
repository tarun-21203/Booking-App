import { faBed, faCalendarDays, faCar, faPerson, faPlane, faTaxi } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { DateRange } from 'react-date-range';
import 'react-date-range/dist/styles.css'; // main css file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { format } from "date-fns";
import { useNavigate } from 'react-router-dom';

const Header = ({ type }) => {
    const [destination, setDestination] = useState("");
    const [openDate, setOpenDate] = useState(false);
    const [date, setDate] = useState([
        {
            startDate: new Date(),
            endDate: new Date(),
            key: 'selection'
        }
    ]);
    const [openOptions, setOpenOptions] = useState(false);
    const [options, setOptions] = useState({
        adult: 1,
        children: 0,
        room: 1,
    });

    const handleOption = (name, operation) => {
        setOptions((prev) => {
            return {
                ...prev, [name]: operation === "i" ? options[name] + 1 : options[name] - 1
            }
        })
    }

    const navigate = useNavigate();
    const handleSearch = () => {
        navigate("/hotels", { state: { destination, date, options } });
    }

    return (
        <>
            <div className='bg-primary'>
                <nav class="navbar navbar-expand-lg navbar-dark">
                    <div class="container-fluid">
                        <a class="navbar-brand" href="#"></a>
                        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span class="navbar-toggler-icon"></span>
                        </button>
                        <div class="collapse navbar-collapse" id="navbarSupportedContent">
                            <ul class="navbar-nav me-auto mb-2 mb-lg-0 text-white pb-4">
                                <li class="nav-item d-flex ms-4 align-items-center ps-2 border border-white border-3">
                                    <FontAwesomeIcon icon={faBed} />
                                    <a class="nav-link fw-bolder text-white ms-1 " href="#">Stays</a>
                                </li>
                                <li class="nav-item d-flex ms-4 align-items-center">
                                    <FontAwesomeIcon icon={faPlane} />
                                    <a class="nav-link fw-bolder text-white ms-1" href="#">Flights</a>
                                </li>
                                <li class="nav-item d-flex ms-4 align-items-center">
                                    <FontAwesomeIcon icon={faCar} />
                                    <a class="nav-link fw-bolder text-white ms-1" href="#">Car Rentals</a>
                                </li>
                                <li class="nav-item d-flex ms-4 align-items-center">
                                    <FontAwesomeIcon icon={faBed} />
                                    <a class="nav-link fw-bolder text-white ms-1" href="#">Attractions</a>
                                </li>
                                <li class="nav-item d-flex ms-4 align-items-center">
                                    <FontAwesomeIcon icon={faTaxi} />
                                    <a class="nav-link fw-bolder text-white ms-1" href="#">Airport Taxis</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </nav>


                {type !== "list" && <>
                    <div className='h1 pt-3 pb-2 text-white container'>
                        A lifetime of discounts? It's Genius.
                    </div>

                    <div className='h5 pb-3 text-white container'>
                        Get rewarded for your travels - unlock instant savings of 10% or more with a free booking account.
                    </div>

                    <div className='container pb-5'>
                        <button type="button" class="btn btn-light fw-bold">Sign in / Register</button>
                    </div>

                    <div className='container'>
                        <div class="row bg-light border border-warning border-4 p-2">
                            <div class="col d-flex align-items-center">
                                <FontAwesomeIcon icon={faBed} />
                                <input class="form-control ms-2" type="search" onChange={e => setDestination(e.target.value)} placeholder="Search" aria-label="Search" />
                            </div>
                            <div class="col d-flex align-items-center text-muted ">
                                <FontAwesomeIcon icon={faCalendarDays} />
                                <span onClick={() => setOpenDate(!openDate)} class="navbar-brand ms-2">{`${format(date[0].startDate, "dd/MM/yyyy")} to ${format(date[0].endDate, "dd/MM/yyyy")}`}</span>
                                <div className='position-absolute mt-5'>
                                    {openDate && <DateRange
                                        editableDateInputs={true}
                                        onChange={item => setDate([item.selection])}
                                        moveRangeOnFirstSelection={false}
                                        ranges={date}
                                        minDate={new Date()}
                                        className='position-absolute border border-dark z-2'
                                    />}
                                </div>
                            </div>
                            <div class="col d-flex align-items-center text-muted">
                                <FontAwesomeIcon icon={faPerson} />
                                <span onClick={() => setOpenOptions(!openOptions)} class="navbar-brand ms-2">{`${options.adult} adult • ${options.children} children • ${options.room} room`}</span>
                                {openOptions && <div className='mt-5 position-absolute z-2'>
                                    <div className='position-absolute border border-dark bg-light ms-5'>
                                        <div className='pt-3 d-flex'>
                                            <span className='me-4 ms-2'>Adult</span>
                                            <button className='border border-primary border-2 pe-auto' disabled={options.adult <= 1} onClick={() => handleOption("adult", "d")}>-</button>
                                            <span className='mx-2'>{options.adult}</span>
                                            <button className='me-3 border border-primary border-2 pe-auto' onClick={() => handleOption("adult", "i")}>+</button>
                                        </div>
                                        <div className='pt-3 d-flex'>
                                            <span className='me-1 ms-2'>Children</span>
                                            <button className='border border-primary border-2 pe-auto' disabled={options.children <= 0} onClick={() => handleOption("children", "d")}>-</button>
                                            <span className='mx-2'>{options.children}</span>
                                            <button className='me-3 border border-primary border-2 pe-auto' onClick={() => handleOption("children", "i")}>+</button>
                                        </div>
                                        <div className='pt-3 pb-3 d-flex'>
                                            <span className='me-4 ms-2'>Room</span>
                                            <button className='border border-primary border-2 pe-auto' disabled={options.room <= 1} onClick={() => handleOption("room", "d")}>-</button>
                                            <span className='mx-2'>{options.room}</span>
                                            <button className='me-3 border border-primary border-2 pe-auto' onClick={() => handleOption("room", "i")}>+</button>
                                        </div>
                                    </div>
                                </div>}
                            </div>
                            <div class="col">
                                <button type="button" class="btn btn-primary text-white fw-bolder" onClick={handleSearch}>Search</button>
                            </div>
                        </div>
                    </div>
                </>}
            </div>
        </>
    )
}

export default Header