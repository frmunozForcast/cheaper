import './item.scss';

export const Item = () => {
    return (
        <div className='content-container'>
    
            <div className="top">
                
                <div className="left">
                    <img src="../src/assets/big-sneaker.png" alt="" />
                </div>

                <div className="right">
                    <h1>Product name for maximum two text lines title could be very long</h1>
                    <h2>Product name for maximum two text lines title could be very long</h2>
                    <p className='price'>$ 30.00</p>
                    <div className="discounts">

                        <div className="square">
                            <p className='size'>0 - 12</p>
                            <p className='items-text'>items</p>
                            <p className="price">$29</p>
                            <p className="discount">23% discount</p>
                        </div>
                        
                        <div className="square">
                            <p className='size'>0 - 12</p>
                            <p className='items-text'>items</p>
                            <p className="price">$29</p>
                            <p className="discount">23% discount</p>
                        </div>

                        <div className="square">
                            <p className='size'>0 - 12</p>
                            <p className='items-text'>items</p>
                            <p className="price">$29</p>
                            <p className="discount">23% discount</p>
                        </div>
                    </div>
                
                    <div className="buttons">
                        <button className='btn-enter'>Enter group</button>
                        <button className='other'>A</button>
                    </div>
                </div>
            </div>
    

        </div>
    )
};
