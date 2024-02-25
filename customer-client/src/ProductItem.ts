type ProductItem = {
  id: string;
  title: string;
  link: string;
  imageLink: string;
  price: string;
  description: string;
  availability: string;
  shipping: {
    country: string;
    price: string;
  };
  gtin: string;
  brand: string;
};

export default ProductItem;
