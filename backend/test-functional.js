/**
 * Standalone functional test harness for CampusCart.
 * - Uses an ISOLATED test DB (campuscart_test) and a separate PORT (5099)
 *   so real data in the `campuscart` DB is never touched.
 * - Exercises the full API across THREE roles: buyer, seller, admin.
 * Run: node test-functional.js
 */
process.env.NODE_ENV = 'test';
process.env.PORT = '5099';
require('dotenv').config();

// Force isolated test database regardless of .env value.
const baseUri = process.env.MONGODB_URI.replace(/\/campuscart(\?|$)/, '/campuscart_test$1');
process.env.MONGODB_URI = /campuscart_test/.test(baseUri) ? baseUri : 'mongodb://127.0.0.1:27017/campuscart_test';

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const BASE = 'http://127.0.0.1:5099/api';
let pass = 0, fail = 0;
const results = [];

function check(name, cond, detail = '') {
  if (cond) { pass++; results.push(`  PASS  ${name}`); }
  else { fail++; results.push(`  FAIL  ${name}${detail ? ' :: ' + detail : ''}`); }
}

async function req(method, path, { token, body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch { data = null; }
  return { status: res.status, data };
}

async function main() {
  // Start server (requires after env override so connectDB uses test DB).
  const { server } = require('./server');
  await new Promise((r) => setTimeout(r, 1500)); // let mongo connect + server bind

  const User = require('./models/User');
  const Listing = require('./models/Listing');
  const Request = require('./models/Request');
  const Favorite = require('./models/Favorite');
  const Message = require('./models/Message');
  const Notification = require('./models/Notification');
  const Transaction = require('./models/Transaction');

  // Clean slate in test DB.
  await Promise.all([
    User.deleteMany({}), Listing.deleteMany({}), Request.deleteMany({}),
    Favorite.deleteMany({}), Message.deleteMany({}), Notification.deleteMany({}),
    Transaction.deleteMany({}),
  ]);

  // Seed an admin directly (role can't be set to admin via public register).
  // NOTE: pass a PLAIN password — the User model's pre('save') hook hashes it.
  await User.create({
    fullName: 'Admin User', email: 'admin@campus.edu', collegeId: 'ADMIN001',
    department: 'Computer Science', year: '4th Year', campus: 'Main Campus',
    studentType: 'hosteller', hostel: 'Hostel A', phone: '9990001111',
    password: 'admin123', role: 'admin',
  });

  console.log('\n=== AUTH: registration (multiple users, both roles) ===');
  // Register a seller
  let r = await req('POST', '/auth/register', { body: {
    fullName: 'Sam Seller', email: 'sam.seller@campus.edu', collegeId: 'SELL001',
    department: 'Mechanical', year: '3rd Year', campus: 'Main Campus',
    studentType: 'hosteller', hostel: 'Hostel B', phone: '9111111111',
    password: 'seller123', confirmPassword: 'seller123', role: 'seller',
  }});
  check('register seller -> 201', r.status === 201, `status=${r.status} ${JSON.stringify(r.data)}`);
  check('seller role persisted', r.data?.user?.role === 'seller', JSON.stringify(r.data?.user));
  const sellerToken = r.data?.token;
  const sellerId = r.data?.user?._id;

  // Register a second seller (for cross-user auth checks)
  r = await req('POST', '/auth/register', { body: {
    fullName: 'Sara Seller', email: 'sara.seller@campus.edu', collegeId: 'SELL002',
    department: 'Civil', year: '2nd Year', campus: 'North Campus',
    studentType: 'dayScholar', phone: '9222222222',
    password: 'seller123', confirmPassword: 'seller123', role: 'seller',
  }});
  check('register 2nd seller (dayScholar, no hostel) -> 201', r.status === 201, `status=${r.status} ${JSON.stringify(r.data)}`);
  const seller2Token = r.data?.token;
  const seller2Id = r.data?.user?._id;

  // Register a buyer
  r = await req('POST', '/auth/register', { body: {
    fullName: 'Bob Buyer', email: 'bob.buyer@campus.edu', collegeId: 'BUY001',
    department: 'Electronics', year: '1st Year', campus: 'Main Campus',
    studentType: 'hosteller', hostel: 'Hostel B', phone: '9333333333',
    password: 'buyer123', confirmPassword: 'buyer123', role: 'buyer',
  }});
  check('register buyer -> 201', r.status === 201, `status=${r.status} ${JSON.stringify(r.data)}`);
  check('buyer role persisted', r.data?.user?.role === 'buyer', JSON.stringify(r.data?.user));
  const buyerToken = r.data?.token;
  const buyerId = r.data?.user?._id;

  // Duplicate email rejected
  r = await req('POST', '/auth/register', { body: {
    fullName: 'Dup', email: 'bob.buyer@campus.edu', collegeId: 'BUY999',
    department: 'Electronics', year: '1st Year', campus: 'Main Campus',
    studentType: 'dayScholar', phone: '9333333334',
    password: 'buyer123', confirmPassword: 'buyer123', role: 'buyer',
  }});
  check('duplicate email -> 400', r.status === 400, `status=${r.status}`);

  // hosteller without hostel rejected
  r = await req('POST', '/auth/register', { body: {
    fullName: 'No Hostel', email: 'nohostel@campus.edu', collegeId: 'NH001',
    department: 'Electronics', year: '1st Year', campus: 'Main Campus',
    studentType: 'hosteller', phone: '9333333777',
    password: 'buyer123', confirmPassword: 'buyer123', role: 'buyer',
  }});
  check('hosteller without hostel -> 400', r.status === 400, `status=${r.status}`);

  // password mismatch rejected
  r = await req('POST', '/auth/register', { body: {
    fullName: 'Mismatch', email: 'mm@campus.edu', collegeId: 'MM001',
    department: 'Electronics', year: '1st Year', campus: 'Main Campus',
    studentType: 'dayScholar', phone: '9333333778',
    password: 'buyer123', confirmPassword: 'nope123', role: 'buyer',
  }});
  check('password mismatch -> 400', r.status === 400, `status=${r.status}`);

  console.log('\n=== AUTH: login (all three roles) ===');
  r = await req('POST', '/auth/login', { body: { email: 'admin@campus.edu', password: 'admin123' } });
  check('admin login -> 200', r.status === 200, `status=${r.status}`);
  check('admin role in login response', r.data?.user?.role === 'admin', JSON.stringify(r.data?.user));
  const adminToken = r.data?.token;

  r = await req('POST', '/auth/login', { body: { email: 'sam.seller@campus.edu', password: 'seller123' } });
  check('seller login -> 200', r.status === 200, `status=${r.status}`);

  r = await req('POST', '/auth/login', { body: { email: 'bob.buyer@campus.edu', password: 'buyer123' } });
  check('buyer login -> 200', r.status === 200, `status=${r.status}`);

  r = await req('POST', '/auth/login', { body: { email: 'bob.buyer@campus.edu', password: 'WRONG' } });
  check('wrong password -> 401', r.status === 401, `status=${r.status}`);

  r = await req('POST', '/auth/login', { body: { email: 'ghost@campus.edu', password: 'x' } });
  check('unknown email -> 401', r.status === 401, `status=${r.status}`);

  console.log('\n=== AUTH: /me and profile ===');
  r = await req('GET', '/auth/me', { token: buyerToken });
  check('GET /me with token -> 200', r.status === 200 && r.data?.user?.email === 'bob.buyer@campus.edu', `status=${r.status}`);
  r = await req('GET', '/auth/me', {});
  check('GET /me without token -> 401', r.status === 401, `status=${r.status}`);
  r = await req('PUT', '/auth/profile', { token: buyerToken, body: { phone: '9000000000', department: 'IT' } });
  check('update profile -> 200', r.status === 200 && r.data?.user?.phone === '9000000000', `status=${r.status}`);

  console.log('\n=== LISTINGS: role-gated creation ===');
  // Buyer cannot create listing
  r = await req('POST', '/listings', { token: buyerToken, body: {
    title: 'X', description: 'Y', category: 'Books', condition: 'Good',
    transactionType: 'Sell', price: 100, campus: 'Main Campus', hostel: 'Hostel B',
  }});
  check('buyer create listing -> 403', r.status === 403, `status=${r.status}`);

  // Seller can create listing (Sell)
  r = await req('POST', '/listings', { token: sellerToken, body: {
    title: 'Calculus Textbook', description: 'Barely used', category: 'Books', condition: 'Good',
    transactionType: 'Sell', price: 250, campus: 'Main Campus', hostel: 'Hostel B',
  }});
  check('seller create Sell listing -> 201', r.status === 201, `status=${r.status} ${JSON.stringify(r.data)}`);
  const listingId = r.data?.listing?._id;
  check('Sell listing has price', r.data?.listing?.price === 250, JSON.stringify(r.data?.listing));

  // Seller creates a Lend listing
  r = await req('POST', '/listings', { token: sellerToken, body: {
    title: 'Scientific Calculator', description: 'FX-991', category: 'Calculator', condition: 'Good',
    transactionType: 'Lend', lendingDuration: '2 weeks', depositAmount: 300, price: 50,
    campus: 'Main Campus', hostel: 'Hostel B',
  }});
  check('seller create Lend listing -> 201', r.status === 201, `status=${r.status}`);
  check('Lend listing price forced 0', r.data?.listing?.price === 0, JSON.stringify(r.data?.listing));
  check('Lend listing keeps deposit', r.data?.listing?.depositAmount === 300, JSON.stringify(r.data?.listing));

  // Seller2 creates a Free listing
  r = await req('POST', '/listings', { token: seller2Token, body: {
    title: 'Old Lab Coat', description: 'Free to take', category: 'Lab Coat', condition: 'Fair',
    transactionType: 'Free', campus: 'North Campus', hostel: 'Block 1',
  }});
  check('seller2 create Free listing -> 201', r.status === 201, `status=${r.status}`);
  const freeListingId = r.data?.listing?._id;

  // Admin can also create
  r = await req('POST', '/listings', { token: adminToken, body: {
    title: 'Admin Cycle', description: 'Campus cycle', category: 'Cycle', condition: 'Good',
    transactionType: 'Sell', price: 1500, campus: 'Main Campus', hostel: 'Hostel A',
  }});
  check('admin create listing -> 201', r.status === 201, `status=${r.status}`);

  console.log('\n=== LISTINGS: public reads, filters, pagination ===');
  r = await req('GET', '/listings');
  check('list all (public) -> 200', r.status === 200 && r.data?.total >= 4, `total=${r.data?.total}`);
  r = await req('GET', '/listings?category=Books');
  check('filter by category=Books', r.status === 200 && r.data?.listings?.every(l => l.category === 'Books'), JSON.stringify(r.data?.count));
  r = await req('GET', '/listings?transactionType=Free');
  check('filter by transactionType=Free', r.status === 200 && r.data?.listings?.every(l => l.transactionType === 'Free'), '');
  r = await req('GET', '/listings?search=Calculator');
  check('search=Calculator returns results', r.status === 200 && r.data?.total >= 1, `total=${r.data?.total}`);
  r = await req('GET', '/listings?limit=2&page=1');
  check('pagination limit=2', r.status === 200 && r.data?.listings?.length <= 2, `len=${r.data?.listings?.length}`);
  r = await req('GET', '/listings?sort=priceHigh');
  const prices = r.data?.listings?.map(l => l.price) || [];
  const sortedDesc = prices.every((p, i) => i === 0 || prices[i - 1] >= p);
  check('sort=priceHigh descending', r.status === 200 && sortedDesc, JSON.stringify(prices));

  r = await req('GET', `/listings/${listingId}`);
  check('get listing by id -> 200', r.status === 200 && r.data?.listing?._id === listingId, `status=${r.status}`);
  check('view count increments', r.data?.listing?.views >= 1, `views=${r.data?.listing?.views}`);

  r = await req('GET', '/listings/featured');
  check('featured (public) -> 200', r.status === 200 && Array.isArray(r.data?.listings), `status=${r.status}`);
  r = await req('GET', '/listings/stats');
  check('stats (public) -> 200', r.status === 200 && typeof r.data?.stats?.totalListings === 'number', `status=${r.status}`);
  r = await req('GET', '/listings/my-listings', { token: sellerToken });
  check('seller my-listings -> 200', r.status === 200 && r.data?.count === 2, `count=${r.data?.count}`);
  r = await req('GET', '/listings/nearby', { token: buyerToken });
  check('nearby (auth) -> 200', r.status === 200 && r.data?.sameHostel !== undefined, `status=${r.status}`);

  console.log('\n=== LISTINGS: ownership on update/delete ===');
  // seller2 cannot update seller1's listing
  r = await req('PUT', `/listings/${listingId}`, { token: seller2Token, body: { price: 1 } });
  check('other seller update -> 403', r.status === 403, `status=${r.status}`);
  // owner can update
  r = await req('PUT', `/listings/${listingId}`, { token: sellerToken, body: { price: 275 } });
  check('owner update -> 200', r.status === 200 && r.data?.listing?.price === 275, `status=${r.status}`);

  console.log('\n=== FAVORITES ===');
  r = await req('POST', '/favorites', { token: buyerToken, body: { listingId } });
  check('add favorite -> 200', r.status === 200, `status=${r.status}`);
  r = await req('POST', '/favorites', { token: buyerToken, body: { listingId } });
  check('duplicate favorite -> 400', r.status === 400, `status=${r.status}`);
  r = await req('GET', '/favorites', { token: buyerToken });
  check('get favorites -> 200 count=1', r.status === 200 && r.data?.count === 1, `count=${r.data?.count}`);
  r = await req('DELETE', `/favorites/${listingId}`, { token: buyerToken });
  check('remove favorite -> 200', r.status === 200, `status=${r.status}`);
  r = await req('GET', '/favorites', { token: buyerToken });
  check('favorites empty after remove', r.data?.count === 0, `count=${r.data?.count}`);

  console.log('\n=== REQUESTS: full lifecycle ===');
  // buyer requests seller's Sell listing
  r = await req('POST', '/requests', { token: buyerToken, body: { listingId, message: 'Is this available?' } });
  check('buyer send request -> 201', r.status === 201, `status=${r.status} ${JSON.stringify(r.data)}`);
  const requestId = r.data?.request?._id;
  // duplicate request blocked
  r = await req('POST', '/requests', { token: buyerToken, body: { listingId } });
  check('duplicate request -> 400', r.status === 400, `status=${r.status}`);
  // seller cannot request own listing
  r = await req('POST', '/requests', { token: sellerToken, body: { listingId } });
  check('request own listing -> 400', r.status === 400, `status=${r.status}`);
  // buyer sees sent request
  r = await req('GET', '/requests/my-requests', { token: buyerToken });
  check('buyer my-requests count=1', r.status === 200 && r.data?.count === 1, `count=${r.data?.count}`);
  // seller sees incoming request
  r = await req('GET', '/requests/seller-requests', { token: sellerToken });
  check('seller-requests count=1', r.status === 200 && r.data?.count === 1, `count=${r.data?.count}`);
  // buyer cannot access seller-requests (role gate)
  r = await req('GET', '/requests/seller-requests', { token: buyerToken });
  check('buyer access seller-requests -> 403', r.status === 403, `status=${r.status}`);
  // seller2 cannot accept seller1's request
  r = await req('PUT', `/requests/${requestId}/accept`, { token: seller2Token });
  check('other seller accept -> 403', r.status === 403, `status=${r.status}`);
  // seller accepts
  r = await req('PUT', `/requests/${requestId}/accept`, { token: sellerToken });
  check('seller accept request -> 200', r.status === 200 && r.data?.request?.status === 'Accepted', `status=${r.status}`);
  // listing now Reserved
  r = await req('GET', `/listings/${listingId}`);
  check('listing Reserved after accept', r.data?.listing?.availability === 'Reserved', `avail=${r.data?.listing?.availability}`);
  // complete the request
  r = await req('PUT', `/requests/${requestId}/complete`, { token: sellerToken });
  check('complete request -> 200', r.status === 200 && r.data?.request?.status === 'Completed', `status=${r.status}`);
  r = await req('GET', `/listings/${listingId}`);
  check('listing Completed after complete', r.data?.listing?.availability === 'Completed', `avail=${r.data?.listing?.availability}`);

  console.log('\n=== MESSAGES ===');
  r = await req('POST', '/messages', { token: buyerToken, body: { receiverId: sellerId, content: 'Hi, still available?' } });
  check('buyer send message -> 201', r.status === 201, `status=${r.status}`);
  r = await req('POST', '/messages', { token: sellerToken, body: { receiverId: buyerId, content: 'Yes it is!' } });
  check('seller reply -> 201', r.status === 201, `status=${r.status}`);
  r = await req('POST', '/messages', { token: buyerToken, body: { content: 'no receiver' } });
  check('message missing receiver -> 400', r.status === 400, `status=${r.status}`);
  r = await req('GET', `/messages/${sellerId}`, { token: buyerToken });
  check('get conversation thread -> 200 (2 msgs)', r.status === 200 && r.data?.messages?.length === 2, `len=${r.data?.messages?.length}`);
  r = await req('GET', '/messages/conversations', { token: buyerToken });
  check('get conversations list -> 200', r.status === 200 && r.data?.conversations?.length >= 1, `len=${r.data?.conversations?.length}`);

  console.log('\n=== NOTIFICATIONS ===');
  // seller should have notifications (new request, message)
  r = await req('GET', '/notifications', { token: sellerToken });
  check('seller notifications -> 200', r.status === 200 && r.data?.count >= 1, `count=${r.data?.count}`);
  const notifId = r.data?.notifications?.[0]?._id;
  const unreadBefore = r.data?.unreadCount;
  check('seller has unread notifications', unreadBefore >= 1, `unread=${unreadBefore}`);
  r = await req('PUT', `/notifications/${notifId}/read`, { token: sellerToken });
  check('mark notification read -> 200', r.status === 200, `status=${r.status}`);
  r = await req('PUT', '/notifications/read-all', { token: sellerToken });
  check('mark all read -> 200', r.status === 200, `status=${r.status}`);
  r = await req('GET', '/notifications', { token: sellerToken });
  check('unread=0 after read-all', r.data?.unreadCount === 0, `unread=${r.data?.unreadCount}`);
  r = await req('DELETE', `/notifications/${notifId}`, { token: sellerToken });
  check('delete notification -> 200', r.status === 200, `status=${r.status}`);

  console.log('\n=== DASHBOARDS ===');
  r = await req('GET', '/dashboard/buyer', { token: buyerToken });
  check('buyer dashboard -> 200', r.status === 200 && r.data?.dashboard?.requestsSent >= 1, `status=${r.status} ${JSON.stringify(r.data?.dashboard)}`);
  r = await req('GET', '/dashboard/seller', { token: sellerToken });
  check('seller dashboard -> 200', r.status === 200 && r.data?.dashboard?.soldItems >= 1, `status=${r.status} ${JSON.stringify(r.data?.dashboard)}`);
  r = await req('GET', '/dashboard/sustainability', { token: buyerToken });
  check('sustainability dashboard -> 200', r.status === 200 && r.data?.sustainability?.personal !== undefined, `status=${r.status}`);
  r = await req('GET', '/dashboard/transactions', { token: buyerToken });
  check('transaction history -> 200 (1 tx)', r.status === 200 && r.data?.count === 1, `count=${r.data?.count}`);

  console.log('\n=== ADMIN endpoints (role-gated) ===');
  r = await req('GET', '/auth/users', { token: adminToken });
  check('admin list users -> 200', r.status === 200 && r.data?.count >= 4, `count=${r.data?.count}`);
  r = await req('GET', '/auth/users', { token: sellerToken });
  check('seller list users -> 403', r.status === 403, `status=${r.status}`);
  r = await req('GET', '/auth/users', { token: buyerToken });
  check('buyer list users -> 403', r.status === 403, `status=${r.status}`);
  // suspend the buyer, then verify login blocked
  r = await req('PUT', `/auth/users/${buyerId}/suspend`, { token: adminToken });
  check('admin suspend buyer -> 200', r.status === 200 && r.data?.user?.isActive === false, `status=${r.status}`);
  r = await req('POST', '/auth/login', { body: { email: 'bob.buyer@campus.edu', password: 'buyer123' } });
  check('suspended user login -> 403', r.status === 403, `status=${r.status}`);
  // reactivate
  r = await req('PUT', `/auth/users/${buyerId}/suspend`, { token: adminToken });
  check('admin reactivate buyer -> 200', r.status === 200 && r.data?.user?.isActive === true, `status=${r.status}`);
  // admin delete seller2
  r = await req('DELETE', `/auth/users/${seller2Id}`, { token: adminToken });
  check('admin delete user -> 200', r.status === 200, `status=${r.status}`);
  r = await req('DELETE', `/auth/users/${seller2Id}`, { token: sellerToken });
  check('non-admin delete user -> 403', r.status === 403, `status=${r.status}`);

  console.log('\n=== LISTINGS: report + admin delete-any ===');
  r = await req('POST', `/listings/${freeListingId}/report`, { token: buyerToken, body: { reason: 'spam' } });
  // freeListingId belonged to deleted seller2 but listing still exists
  check('report listing -> 200', r.status === 200, `status=${r.status}`);
  // admin can delete any listing
  r = await req('DELETE', `/listings/${freeListingId}`, { token: adminToken });
  check('admin delete any listing -> 200', r.status === 200, `status=${r.status}`);

  console.log('\n=== LOGOUT ===');
  r = await req('POST', '/auth/logout', { token: buyerToken });
  check('logout -> 200', r.status === 200, `status=${r.status}`);

  // ---- Report ----
  console.log('\n' + '='.repeat(55));
  console.log('FUNCTIONAL TEST RESULTS');
  console.log('='.repeat(55));
  console.log(results.join('\n'));
  console.log('='.repeat(55));
  console.log(`TOTAL: ${pass + fail}   PASS: ${pass}   FAIL: ${fail}`);
  console.log('='.repeat(55));

  // Cleanup test DB and shut down.
  await Promise.all([
    User.deleteMany({}), Listing.deleteMany({}), Request.deleteMany({}),
    Favorite.deleteMany({}), Message.deleteMany({}), Notification.deleteMany({}),
    Transaction.deleteMany({}),
  ]);
  await mongoose.connection.close();
  server.close();
  process.exit(fail === 0 ? 0 : 1);
}

main().catch((e) => { console.error('HARNESS ERROR:', e); process.exit(2); });
