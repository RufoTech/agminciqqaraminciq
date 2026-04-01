import React from 'react';
import Product from '../components/Product';

const Computers = () => {
  return (
    <>
      {/* Yalnızca phones kateqoriyasına aid məhsulları göstər */}
      <Product category="Laptops" />
    </>
  );
};

export default Computers;