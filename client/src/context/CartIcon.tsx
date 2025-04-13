// import React from 'react';
// import { Link } from 'react-router-dom';
// import { useCart } from '../context/CartContext';

// const CartIcon: React.FC = () => {
//   const { cartCount } = useCart();

//   return (
//     <Link to="/cart" className="relative p-2 text-gray-500 hover:text-blue-600 transition-colors">
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
//       </svg>
//       {cartCount > 0 && (
//         <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-blue-600 rounded-full">
//           {cartCount}
//         </span>
//       )}
//     </Link>
//   );
// };

// export default CartIcon;