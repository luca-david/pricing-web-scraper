import { useState } from "react";

export function ProductModal({ product, onClose }) {
  if (!product) return null;

  return (
    <div>
      <div style={modalStyle}>
        <h2>{product.name}</h2>
        <p><strong>Price:</strong> {product.stringPrice}</p>
        {product.description && <p>{product.description}</p>}
        {product.imageUrl && <img src={product.imageUrl} alt={product.name} width="200" />}
        <br />
        <button onClick={onClose} style={{ marginTop: "10px" }}>Close</button>
      </div>
    </div>
  );
}

// Inline styles for quick testing
const overlayStyle = {
  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
};

const modalStyle = {
  background: "#fff", padding: "20px", borderRadius: "8px", maxWidth: "400px", width: "100%"
};