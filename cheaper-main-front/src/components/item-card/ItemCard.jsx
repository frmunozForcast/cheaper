import './itemcard.scss';

export const ItemCard = ({ item }) => {
    return (
        <div className='item-card' >

            <div className='img-header'>
                <span>2 available</span>
                <img src="../src/assets/heart.png" alt="heart" />
            </div>

            <img src="../src/assets/sneaker.png" alt="" />
            <p className='item-name'>Nike Shoe</p>
            <p className="description">Men flex comfortable</p>
            <div className='prices'>
                <span className="original-price">$16.48</span>
                <span className="current-price">$6.48</span>
                <span className='wholesale'>wholesale</span>
            </div>
            <button className='btn-enter'>Enter group</button>

        </div>
    )
};
