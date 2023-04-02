import './navbar.scss';
import{ Outlet, Link } from 'react-router-dom';

export const Navbar = () => {
    return (
        <div className="navbar">
        
            <div className="start">
                <img src="../src/assets/cheaper.svg" height={55} alt="" />
                <ul>
                    <li className='item'>
                        <a href="/marketplace">Marketplace</a>
                    </li>
                    <li className='item'>About</li>
                </ul>
            </div>

            <div className="end">
                <input 
                    type="text" 
                    placeholder="Search"
                />
                <button className="btn-register">Register</button>
                <button className="btn-connect-wallet">Connect wallet</button>
            </div>

        </div>
    )
};
