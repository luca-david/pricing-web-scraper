import { useState } from "react";

export function RollMaster() {
    const [productName, setProductName] = useState('')
    const [loading, setLoading] = useState(false)
    const [priceResult, setPriceResult] = useState(null)

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setLoading(true);
        setPriceResult(null);
        try {
            const params = new URLSearchParams({ selector: productName });
            const response = await fetch('/api/prices/current-prices-roll-master?'+params);
            const { data: priceData, message: priceMessage } = await response.json();
            console.log(priceMessage)
            setPriceResult(priceData);
        } catch (error) {
            console.error('Error while fetching the price', error);
        } finally {
            setLoading(false)
        }
    }

    return (
        <section id="center">
            <div>
                <h2>Roll Master Price Scraper</h2>
            </div>

            <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>

                <div className="form-group">
                    <label htmlFor="roll-master-product-name">Product Name</label>
                    <input
                        id="roll-master-product-name" 
                        type="input"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        required
                        />
                </div>

                <div>
                    <button className="counter">
                        { loading ? 'Fetching...' : 'Get Price'}
                    </button>
                </div>

                <div>
                    Presets
                </div>

                <div className='button-group'>
                    <button type="button" className='counter' onClick={() => setProductName("Wok udon cu pui in sos Teriyaki")}>
                        Udon Noodles in Sossy Teriyaki
                    </button>

                    <button type="button" className='counter' onClick={() => setProductName("Philadelphia Tempura")}>
                        Philadelphia Tempura
                    </button>

                    <button type="button" className='counter' onClick={() => setProductName("Somon Mango Blue Cheese")}>
                        Somon Mango Blue Cheese
                    </button>
                </div>

                {/* Display Results */}
                {priceResult && (
                <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                    <h3>Selected: {productName}</h3>
                    <p><strong>Status:</strong> {priceResult.message}</p>
                    
                    {priceResult ? (
                        <div>
                        <p><strong>Price:</strong> {priceResult.stringPrice}</p>
                        </div>
                    ) : (
                        <p>No price data found for this product.</p>
                    )}
                </div>
            )}
            </form>
        </section>
    )
}

export default RollMaster;