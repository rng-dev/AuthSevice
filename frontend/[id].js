// pages/products/[id].js
import React, { useState, useCallback } from 'react';
import styles from '@/styles/Checkout.module.css'; // Импортируем стили
import Head from 'next/head';
import Image from 'next/image'; // Импорт компонента для оптимизации изображений
import axios from 'axios'; // Для работы с API

// Функция для получения данных о товаре
export async function getStaticProps({ params }) {
  const { id } = params;

  // Получаем все товары
  const res = await fetch('https://66eded56380821644cde56c6.mockapi.io/Items');
  const products = await res.json();

  // Ищем товар по id
  const product = products.find((p) => p.id === Number(id));

  // Если товар не найден, возвращаем 404
  if (!product) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      product,
    },
  };
}

// Компонент страницы товара
const ProductPage = ({ product }) => {
  const [isCheckoutOpen, setCheckoutOpen] = useState(false);
  const [idUser, setIdUser] = useState('');
  const [statusCors, setStatusCors] = useState(false);
  const [paymentForm, setPaymentForm] = useState(null); // Храним форму Payeer

  const CheckTypeProduct = useCallback(() => {
    const firstWord = product.name.split(' ')[0];
    return Math.floor(firstWord) ? firstWord : false;
  }, [product.name]);

  useEffect(() => {
    if (CheckTypeProduct) {
      console.log(CheckTypeProduct());
    } else {
      console.log('Это не деньги, пиши другой функционал');
    }
  }, [CheckTypeProduct]);

  const handleCheckout = () => {
    setCheckoutOpen(true);
  };

  const UpdateId = (e) => {
    setIdUser(e.target.value);
  };

  const CheckCors = async () => {
    console.log(idUser.length);
    if (idUser.length > 4) {
      setStatusCors(true);

      // Отправляем данные на бэкенд для инициализации платежа
      try {
        const response = await axios.post('/api/init_payment', {
          amount: product.new_price,
          currency: product.currency,
          charidentifier: idUser,
        });

        // Получаем HTML-форму от бэкенда
        if (response.data && response.data.payment_url) {
          window.location.href = response.data.payment_url; // Редирект на Payeer
        } else if (response.data && response.data.form) {
          setPaymentForm(response.data.form); // Отображаем форму Payeer
        }
      } catch (error) {
        console.error('Ошибка при инициализации платежа:', error);
      }
    } else {
      setStatusCors(false);
    }
  };

  return (
    <div className={styles.productPage}>
      <Head>
        <title>Оплата</title>
        <meta
          name="description"
          content="Игровой сервер Red Dead Redemption Online - Присоединяйтесь к нам для уникального игрового опыта в мире RDR."
        />
      </Head>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <p>Цена: {product.new_price} {product.currency}</p>
      <p>В наличии: {product.in_stock ? 'Да' : 'Нет'}</p>
      <button className={styles.checkoutButton} onClick={handleCheckout}>
        Оформить заказ
      </button>

      {isCheckoutOpen && (
        <div className={styles.checkoutContainer}>
          <h2>Оформление заказа</h2>
          <div className={styles.productList}>
            <div className={styles.product}>
              <Image
                src={product.image_url}
                alt={product.name}
                width={500}
                height={500}
                className={styles.productImage}
              />
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <p className={styles.productPrice}>
                  {product.new_price} {product.currency}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.summary}>
            <p className={styles.totalLabel}>Итого:</p>
            <p className={styles.totalPrice}>{product.new_price} {product.currency}</p>
          </div>
          <input
            className={styles.inputs}
            type="text"
            value={idUser}
            onChange={UpdateId}
            placeholder="Введите ваш ID"
          />

          <button className={styles.confirmButton} onClick={CheckCors}>
            Подтвердить заказ
          </button>

          {/* Отображение формы Payeer */}
          {paymentForm && (
            <div dangerouslySetInnerHTML={{ __html: paymentForm }} />
          )}
        </div>
      )}
    </div>
  );
};

export default ProductPage;

// // pages/products/[id].js
// import React, { useState, useCallback } from 'react';
// import styles from '@/styles/Checkout.module.css'; // Импортируем стили
// import Head from 'next/head';
// import { useEffect } from 'react';
// import Image from 'next/image'; // Импорт компонента для оптимизации изображений

// // Функция для получения данных о товаре
// export async function getStaticProps({ params }) {
//   const { id } = params;

//   // Получаем все товары
//   const res = await fetch('https://66eded56380821644cde56c6.mockapi.io/Items');
//   const products = await res.json();

//   // Ищем товар по id
//   const product = products.find((p) => p.id === Number(id));

//   // Если товар не найден, возвращаем 404
//   if (!product) {
//     return {
//       notFound: true,
//     };
//   }

//   return {
//     props: {
//       product,
//     },
//   };
// }

// // Функция для определения всех возможных путей
// export async function getStaticPaths() {
//   // Получаем все товары
//   const res = await fetch('https://66eded56380821644cde56c6.mockapi.io/Items');
//   const products = await res.json();

//   // Генерируем пути для каждого товара
//   const paths = products.map((product) => ({
//     params: { id: product.id.toString() },
//   }));

//   return {
//     paths,
//     fallback: false, // Страницы без подходящего id будут возвращать 404
//   };
// }

// // Компонент страницы товара
// const ProductPage = ({ product }) => {
//   const [isCheckoutOpen, setCheckoutOpen] = useState(false);
//   const [idUser, setIdUser] = useState('');
//   const [statusCors, setStatusCors] = useState(false);

//   const CheckTypeProduct = useCallback(() => {
//     const firstWord = product.name.split(' ')[0];
//     return Math.floor(firstWord) ? firstWord : false;
//   }, [product.name]);

//   useEffect(() => {
//     if (CheckTypeProduct) {
//       console.log(CheckTypeProduct());
//     } else {
//       console.log('Это не деньги, пиши другой функционал');
//     }
//   }, [CheckTypeProduct]);

//   const handleCheckout = () => {
//     setCheckoutOpen(true);
//   };

//   const UpdateId = (e) => {
//     setIdUser(e.target.value);
//   };

//   const CheckCors = () => {
//     console.log(idUser.length);
//     if (idUser.length > 4) {
//       setStatusCors(true);
//     } else {
//       setStatusCors(false);
//     }
//   };

//   if (statusCors) {
//     console.log('Добро на оплату');
//     // Здесь можно переадресацию на страницу оплаты
//   }

//   return (
//     <div className={styles.productPage}>
//       <Head>
//         <title>Оплата</title>
//         <meta
//           name="description"
//           content="Игровой сервер Red Dead Redemption Online - Присоединяйтесь к нам для уникального игрового опыта в мире RDR. Узнайте о сервере, присоединяйтесь к нам и получите доступ к эксклюзивным функциям!"
//         />
//         <meta name="keywords" content="Red Dead Redemption, RDR Online, игровой сервер, RDR механики, Red Dead Redemption онлайн, RDR взаимодействия, RDR гайды" />
//         <meta property="og:title" content="Red Dead Redemption Online Server" />
//         <meta
//           property="og:description"
//           content="Игровой сервер Red Dead Redemption Online - Присоединяйтесь к нам для уникального игрового опыта в мире RDR. Узнайте о сервере, присоединяйтесь к нам и получите доступ к эксклюзивным функциям!"
//         />
//         <meta property="og:image" content="/img/logo/logo.png" />
//         <meta property="og:url" content="" />
//         <meta name="twitter:card" content="summary_large_image" />
//         <meta name="twitter:title" content="Red Dead Redemption Online Server" />
//         <meta
//           name="twitter:description"
//           content="Игровой сервер Red Dead Redemption Online - Присоединяйтесь к нам для уникального игрового опыта в мире RDR. Узнайте о сервере, присоединяйтесь к нам и получите доступ к эксклюзивным функциям!"
//         />
//         <meta name="twitter:image" content="/img/logo/logo.png" />
//         <link rel="icon" href="/img/logo/logo.png" />
//         <link rel="apple-touch-icon" href="/img/logo/logo.png" />
//         <link rel="manifest" href="/img/logo/logo.png" />
//       </Head>
//       <h1>{product.name}</h1> 
//       <p>{product.description}</p>
//       <p>Цена: {product.new_price} {product.currency}</p>
//       <p>В наличии: {product.in_stock ? 'Да' : 'Нет'}</p>
//       <button className={styles.checkoutButton} onClick={handleCheckout}>
//         Оформить заказ
//       </button>

//       {isCheckoutOpen && (
//         <div className={styles.checkoutContainer}>
//           <h2>Оформление заказа</h2>
//           <div className={styles.productList}>
//             <div className={styles.product}>
//               <Image
//                 src={product.image_url}
//                 alt={product.name}
//                 width={500}
//                 height={500}
//                 className={styles.productImage}
//               />
//               <div className={styles.productInfo}>
//                 <h3 className={styles.productName}>{product.name}</h3>
//                 <p className={styles.productDescription}>{product.description}</p>
//                 <p className={styles.productPrice}>
//                   {product.new_price} {product.currency}
//                 </p>
//               </div>
//             </div>
//           </div>

//           <div className={styles.summary}>
//             <p className={styles.totalLabel}>Итого:</p>
//             <p className={styles.totalPrice}>{product.new_price} {product.currency}</p>
//           </div>
//           <input
//             className={styles.inputs}
//             type="text"
//             value={idUser}
//             onChange={UpdateId}
//             placeholder="Введите ваш ID"
//           />

//           <button className={styles.confirmButton} onClick={CheckCors}>Подтвердить заказ</button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ProductPage;
