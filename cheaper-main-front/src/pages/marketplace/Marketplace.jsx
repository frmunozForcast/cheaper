import React from 'react'
import { CategorySelector, ItemCard } from '../../components';
import './marketplace.scss';

const items = [
    {
        id: new Date().getTime*3,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*4,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*5,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*6,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*7,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*8,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*9,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*1,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*56,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*11,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*12,
        name: 'Cereal',
    },
    {
        id: new Date().getTime*13,
        name: 'Cereal',
    },
];

export const Marketplace = () => {
    return (
        <div className='content-container'>
            
            <div className="top-banner">
                {/* Text and vendor store list button */}
                <div className="left">
                    <div className="text">
                        <h1>TOGETHER WE GROW,</h1>
                        <h1>TOGETHER WE THRIVE</h1>
                    </div>
                    <button className='btn-vendor'>VENDOR STORE LIST</button>
                    <div className='powered-by'>
                        <p>Powered by</p>
                        <img src="../src/assets/c.svg" alt="" />
                        <img src="../src/assets/e.svg" alt="" />
                        <img src="../src/assets/l.svg" alt="" />
                        <img src="../src/assets/o.svg" alt="" />
                    </div>

                </div>

                {/* Banner */}
                <div className="banner">
                    <img src="../src/assets/marketplace-banner.svg" alt="" />
                </div>
            </div>

            <div className="items">
                <CategorySelector/>
                {items.map( item => (
                    <ItemCard
                        key={item.id}
                    />
                ))}
            </div>

        </div>
    )
};
