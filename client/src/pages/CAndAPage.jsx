import { useState } from 'react'

export default function CAndAPage() {
  const [productName, setProductName] = useState('')
  const [priceResult, setPriceResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setPriceResult(null) //reset previous result

    try {
        const params = new URLSearchParams({ selector: productName });
        const response = await fetch(`/api/prices/current-prices-canda?${params.toString()}`, { 
            method: 'GET',
        });
        const data = await response.json();
        //store the backend response in state
        setPriceResult(data);
    } catch (error) {
        console.error("Error fetching price", error);
    } finally {
        setLoading(false)
    }
  }

  return (
    <section id="center">
      <h2>C&A Price Scraper</h2>

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
        <button className='counter' onClick={() => setProductName("Shaorma medie Crispy")}>
            Sharoma Crispy Medie
        </button>

        <button className='counter' onClick={() => setProductName("Shaorma medie")}>
            Sharoma Pui Medie
        </button>

        <button className='counter' onClick={() => setProductName("Shaorma uriașă  1KG")}>
            Sharoma Pui La Kilogram
        </button>
        </div>

        {/* Display Results */}
        {priceResult && (
            <div style={{ marginTop: '20px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h3>Selected: {productName}</h3>
            <p><strong>Status:</strong> {priceResult.message}</p>
            
            {priceResult.data ? (
                <div>
                <p><strong>Price:</strong> {priceResult.data.stringPrice} RON</p>
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