import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
// We do not use handleSummary here. 
// For Endurance testing, we will run this script via CLI using:
// k6 run --out csv=endurance_raw.csv 23127155_Endurance_20260814.js
// This produces the raw log equivalent to JMeter's .jtl file as required.

const users = new SharedArray('users', function() {
    return open('./users.csv').split('\n').slice(1).map(line => {
        let cols = line.split(',');
        return { email: cols[0], password: cols[1] };
    }).filter(u => u.email);
});

export const options = {
  stages: [
    { duration: '1m', target: 30 }, // Ramp up to moderate load
    { duration: '10m', target: 30 }, // Sustained soak test for 10 minutes
    { duration: '1m', target: 0 },  // Ramp down
  ],
};

const BASE_URL = 'http://localhost:3000/api';

export default function () {
  const user = users[Math.floor(Math.random() * users.length)];

  const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify({
    email: user.email,
    password: user.password
  }), { headers: { 'Content-Type': 'application/json' } });
  
  check(loginRes, { 'login successful': (r) => r.status === 200 });
  
  let token = null;
  if (loginRes.status === 200) {
    token = loginRes.json('token');
  }
  const authHeaders = { 
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}` 
  };

  sleep(1);

  const productsRes = http.get(`${BASE_URL}/products`);
  check(productsRes, { 'viewed products': (r) => r.status === 200 });

  let selectedProduct = null;
  if (productsRes.status === 200) {
      try {
          let body = productsRes.json();
          if (body && body.length > 0) {
              selectedProduct = body[Math.floor(Math.random() * body.length)];
          }
      } catch (e) {}
  }

  check(selectedProduct, { 'product available for cart': (p) => p !== null });

  sleep(1);

  if (token && selectedProduct) {
    const cartRes = http.post(`${BASE_URL}/cart`, JSON.stringify({
      id: selectedProduct.id,
      name: selectedProduct.name,
      price: selectedProduct.price,
      quantity: 1
    }), { headers: authHeaders });
    check(cartRes, { 'added to cart': (r) => r.status === 200 || r.status === 201 });

    sleep(1);

    const checkoutRes = http.post(`${BASE_URL}/checkout`, JSON.stringify({
      total_amount: selectedProduct.price,
      shipping_address: "123 Performance Test St"
    }), { headers: authHeaders });
    check(checkoutRes, { 'checkout successful': (r) => r.status === 200 || r.status === 201 });
  }
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    '23127155_Endurance_20260814_report.html': htmlReport(data),
  };
}
