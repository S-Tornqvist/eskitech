import React, { useEffect } from "react";
import ProductItem from "./ProductItem";
import ProductCard from "./ProductCard";

// Tricky with subroutes for later when using react-dom. Will include
// react route path, which is not ideal
const ORIGIN = window.location.origin;

function App() {
  const [products, setProducts] = React.useState<ProductItem[]>([]);

  useEffect(() => {
    fetch(`${ORIGIN}/api/rss`)
      .then((response) => response.text())
      .then(parseProducts)
      .then(setProducts)
      .catch((error) => console.error("Error fetching or parsing XML:", error));
  }, []);

  return (
    <div>
      <h1> Eskitech Products: </h1>
      {products.map((item) => (
        <ProductCard key={item.id} product={item} />
      ))}
    </div>
  );
}

function parseProducts(xmlString: string): ProductItem[] {
  const xmlDom = new window.DOMParser().parseFromString(xmlString, "text/xml");

  const products: ProductItem[] = Array.from(
    xmlDom.querySelectorAll("item")
  ).map((item) => {
    const extract = (query: string) =>
      item.querySelector(query)?.textContent ?? "undefined";
    return {
      id: extract("id"),
      title: extract("title"),
      description: extract("description"),
      link: extract("link"),
      imageLink: extract("image_link"),
      availability: extract("availability"),
      price: extract("price"),
      shipping: {
        country: extract("shipping > country"),
        price: extract("shipping > price"),
      },
      gtin: extract("gtin"),
      brand: extract("brand"),
    };
  });

  return products;
}

export default App;
