import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export function HomePage() {
  const [count, setCount] = useState(0)
  const navigate = useNavigate()

  return (
    <>
      <section id="center">
        <div className="hero">
          Eu cand vreau sa iau chestii la reducere
        </div>

        <div>
          <h1> Price Web Scraper </h1>
          <p>
            Apasa pe <code>buton</code> ca sa vezi care sunt <code>preturile</code>
          </p>
        </div>

        <div className='button-group'>
          <button
          type="button"
          className="counter"
          onClick={() => navigate('/canda')}          
          >
            Vreau shaorma
          </button>

          <button
            type="button"
            className="counter"
            onClick={() => navigate('/roll-master')}          
          >
            Vreau sushi
        </button>

        </div>
        

      </section>
    </>
  )
}

export default HomePage