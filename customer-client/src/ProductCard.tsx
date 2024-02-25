import React from "react";
import ProductItem from "./ProductItem";

export type ProductCardProps = {
  product: ProductItem;
};

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="card mb-3" style={{ maxWidth: "540px" }}>
      <div className="row g-0">
        <div className="col-md-4">
          <img
            src={product.imageLink}
            className="img-fluid rounded-start"
            alt={product.title}
          />
        </div>
        <div className="col-md-8">
          <div className="card-body">
            <h5 className="card-title">{product.title}</h5>
            <p className="card-text">{product.description}</p>
            <p className="card-text">
              <small className="text-muted">
                Availability: {product.availability}
              </small>
            </p>
            <p className="card-text">
              <small className="text-muted">Price: {product.price}</small>
            </p>
            <p className="card-text">
              <small className="text-muted">
                Shipping Cost: {product.shipping.price}
              </small>
            </p>
            {/*<p className="card-text"><small className="text-muted">GTIN: {product.gtin}</small></p>*/}
            <p className="card-text">
              <small className="text-muted">Brand: {product.brand}</small>
            </p>
            <a href={product.link} className="btn btn-primary">
              View Product
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
