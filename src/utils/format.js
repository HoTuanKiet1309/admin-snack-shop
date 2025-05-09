export const formatPrice = (price) => {
  if (!price && price !== 0) return '0đ';
  return `${price.toLocaleString('vi-VN')}đ`;
}; 