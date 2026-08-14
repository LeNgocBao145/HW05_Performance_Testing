import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';

const users = new SharedArray('users', function() {
    return open('./users.csv').split('\n').slice(1).map(line => {
        let cols = line.split(',');
        return { email: cols[0], password: cols[1] };
    }).filter(u => u.email);
});

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '5m', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'],
    http_req_failed: ['rate<0.05'],
  },
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

  let product_id = 1;
  if (productsRes.status === 200) {
      try {
          let body = productsRes.json();
          if (body && body.length > 0) {
              product_id = body[Math.floor(Math.random() * body.length)].id;
          }
      } catch (e) {}
  }

  sleep(1);

  if (token) {
    const cartRes = http.post(`${BASE_URL}/cart`, JSON.stringify({
      id: parseInt(product_id),
      name: `Product ${product_id}`,
      price: 100000,
      quantity: 1
    }), { headers: authHeaders });
    check(cartRes, { 'added to cart': (r) => r.status === 200 || r.status === 201 });

    sleep(1);

    const checkoutRes = http.post(`${BASE_URL}/checkout`, JSON.stringify({
      total_amount: 100000,
      shipping_address: "123 Test St"
    }), { headers: authHeaders });
    check(checkoutRes, { 'checkout successful': (r) => r.status === 200 || r.status === 201 });
  }
}

export function handleSummary(data) {
  return {
    '23127155_Stress_20260814_summary.html': htmlReport(data),
  };
}
