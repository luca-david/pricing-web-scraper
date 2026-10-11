import { useState } from 'react'

export default function CAndAPage() {
  const [productName, setProductName] = useState('')


  const handleSubmit = async (e) => {
    e.preventDefault()

    const params = new URLSearchParams({ selector: productName });
    const response = await fetch(`/api/prices/current-prices-canda?${params.toString()}`, { 
        method: 'GET',
    });

    const data = await response.json();

    console.log(data)
  }

  return (
    <section id="center">
      <h2>C&A Price Scraper</h2>

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        {/* Label & Input Group */}
        <div className="form-group">
          <label htmlFor="canda-product-name">Product Name</label>
          <input
            type="input"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            required
          />
        </div>

        {/* Action Button using your existing .counter class */}
        <button type="submit" className="counter">
          Search 
        </button>
      </form>
    </section>
  )
}