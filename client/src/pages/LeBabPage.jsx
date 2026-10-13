import { useState } from 'react'
import { createDirectLink } from '../utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://price-scraper-backend-6hlu.onrender.com';

export default function LeBab() {
  const [productName, setProductName] = useState('')
  const [priceResult, setPriceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productUrl, setProductUrl] = useState('');

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setPriceResult(null) //reset previous result
    setProductUrl(null)

    try {
        const params = new URLSearchParams({ selector: productName });
        const response = await fetch(`${API_BASE_URL}/api/prices/current-prices-le-bab?${params.toString()}`, { 
            method: 'GET',
        });
        const {data: data, message: message, url: url} = await response.json();
        //store the backend response in state if data is valid
        if (data) {
            setPriceResult(data);
            setProductUrl(url);
        } else {
            setPriceResult(null);
            setProductUrl(null);
        }
    } catch (error) {
        console.error("Error fetching price", error);
    } finally {
        setLoading(false)
    }
  }

  return (
    <section id="center">
      <h2>LeBab Price Scraper</h2>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {/* Label & Input Group */}
        <div className="form-group">
          <label htmlFor="canda-product-name">Product Name</label>
          <input id="canda-product-name"
            type="input"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        {/* Fetch Button */}
        <button className='counter' onClick={handleSubmit} disabled={!productName || loading}>
            {loading ? 'Fetching...' : 'Get Price'}
        </button>

        <div>
            Presets
        </div>

        <div className='button-group'>
        <button type='button' className='counter' onClick={() => setProductName("Honey Mustard Burger")}>
            Honey Mustard Burger
        </button>

        <button type='button' className='counter' onClick={() => setProductName("Spicy Korean Burger")}>
            Spicy Korean Burger
        </button>

        <button type='button' className='counter' onClick={() => setProductName("Chipotle Burger")}>
            Chipotle Burger
        </button>
        </div>

        {/* Display Results */}
        {priceResult && (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>
                { 'Selected: ' } 
                <a
                    href={createDirectLink(productUrl, productName)} target="_blank" rel="noopener noreferrer">
                    { productName }
                </a>
            </h3>
            
            {priceResult ? (
                <div>
                <p><strong>Price:</strong> { priceResult.stringPrice } </p>
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