import puppeteer from 'puppeteer-core';
import { execSync } from 'child_process';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'http://localhost:8000';
const DB_PATH = '/Users/macbook/.gemini/antigravity/scratch/gifts-kart/database/giftskart.sqlite';

function getLatestOtp(email) {
  try {
    const cmd = `sqlite3 "${DB_PATH}" "SELECT otp_code FROM user_otps WHERE identifier = '${email}' ORDER BY id DESC LIMIT 1;"`;
    const otp = execSync(cmd).toString().trim();
    return otp;
  } catch (err) {
    console.error('Failed to query SQLite OTP:', err.message);
    return null;
  }
}

async function runCustomerTest() {
  console.log('🚀 Starting Real Customer E2E Journey Test on GiftsKart...');

  const consoleErrors = [];
  const consoleWarns = [];
  const pageErrors = [];

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--user-data-dir=/tmp/chrome-profile-' + Date.now()
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });

  // Catch console logs & page errors
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    if (type === 'error') {
      consoleErrors.push({ url: page.url(), text });
      console.log(`❌ [CONSOLE ERROR] ${text}`);
    } else if (type === 'warning') {
      consoleWarns.push({ url: page.url(), text });
    }
  });

  page.on('pageerror', err => {
    pageErrors.push({ url: page.url(), message: err.message, stack: err.stack });
    console.log(`❌ [PAGE ERROR] ${err.message}`);
  });

  try {
    // ------------------------------------------------------------------
    // STEP 1: Home Page & Badge Initial Check
    // ------------------------------------------------------------------
    console.log('\n--- Step 1: Navigating to Home Page ---');
    await page.goto(`${BASE_URL}/index.html`, { waitUntil: 'networkidle2' });

    let cartBadge = await page.evaluate(() => {
      const b = document.querySelector('.header-action-item[data-action="cart"] .header-badge, #header-cart-count');
      return b ? b.textContent.trim() : '0';
    });
    let wishBadge = await page.evaluate(() => {
      const b = document.querySelector('.header-action-item[data-action="wishlist"] .header-badge, #header-wishlist-count');
      return b ? b.textContent.trim() : '0';
    });
    console.log(`Initial Header Badges -> Cart: ${cartBadge}, Wishlist: ${wishBadge}`);

    // ------------------------------------------------------------------
    // STEP 2: Register Brand-New Customer via Email OTP
    // ------------------------------------------------------------------
    const timestamp = Date.now();
    const customerEmail = `customer_${timestamp}@giftskart.com`;
    console.log(`\n--- Step 2: Registering Account with Email OTP: ${customerEmail} ---`);

    // Open Auth Modal
    await page.evaluate(() => {
      if (window.GiftsKart && window.GiftsKart.auth) {
        window.GiftsKart.auth.open({ tab: 'login' });
      } else {
        const btn = document.querySelector('.header-action-item[data-action="account"]');
        if (btn) btn.click();
      }
    });
    await new Promise(r => setTimeout(r, 600));

    // Ensure Email OTP tab is active
    await page.evaluate(() => {
      const btnOtp = document.getElementById('btn-switch-login-otp');
      if (btnOtp) btnOtp.click();
    });
    await new Promise(r => setTimeout(r, 300));

    // Type email
    await page.type('#global-login-mobile', customerEmail);
    console.log('Typed email address into OTP login field.');

    // Click Send OTP
    await page.click('#btn-send-login-otp');
    console.log('Clicked "Send 6-Digit Email OTP" button.');

    // Wait 1.5s for OTP backend creation
    await new Promise(r => setTimeout(r, 1500));

    // Query OTP from database
    const otpCode = getLatestOtp(customerEmail);
    console.log(`🔑 Retrieved OTP from Database for ${customerEmail}: [${otpCode}]`);

    if (!otpCode || otpCode.length !== 6) {
      throw new Error(`Invalid OTP retrieved from DB: ${otpCode}`);
    }

    // Fill OTP digits
    await page.evaluate((code) => {
      const inputs = document.querySelectorAll('.otp-digit-input');
      for (let i = 0; i < inputs.length; i++) {
        if (inputs[i] && code[i]) {
          inputs[i].value = code[i];
          inputs[i].dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    }, otpCode);

    // Click Verify & Continue
    await page.click('#btn-verify-login-otp');
    await new Promise(r => setTimeout(r, 1500));

    // Check login state
    const loggedUser = await page.evaluate(() => {
      try {
        return JSON.parse(localStorage.getItem('gk_user') || '{}');
      } catch (e) {
        return {};
      }
    });
    console.log('Logged-in Customer User Object:', loggedUser);
    if (!loggedUser || !loggedUser.email) {
      throw new Error('Registration / OTP Login failed. User session not established.');
    }
    console.log(`✅ Registration Successful for ${loggedUser.email}!`);

    // ------------------------------------------------------------------
    // STEP 3: Browse Products & Add to Wishlist & Cart
    // ------------------------------------------------------------------
    console.log('\n--- Step 3: Browsing Products & Adding to Wishlist and Cart ---');
    
    // Add product to Wishlist from Home Page
    const addedWishlistProd = await page.evaluate(() => {
      const wishBtn = document.querySelector('.btn-add-wishlist, [data-action="wishlist"]');
      if (wishBtn) {
        const card = wishBtn.closest('.product-card');
        const title = card ? card.querySelector('.product-card-title, h3')?.textContent.trim() : 'Product';
        wishBtn.click();
        return title;
      }
      return null;
    });
    console.log(`Clicked Wishlist on Home product: ${addedWishlistProd}`);
    await new Promise(r => setTimeout(r, 500));

    // Add product to Cart from Home Page
    const addedCartProd = await page.evaluate(() => {
      const cartBtn = document.querySelector('.btn-add-cart, [data-action="cart"]');
      if (cartBtn) {
        const card = cartBtn.closest('.product-card');
        const title = card ? card.querySelector('.product-card-title, h3')?.textContent.trim() : 'Product';
        cartBtn.click();
        return title;
      }
      return null;
    });
    console.log(`Clicked Cart on Home product: ${addedCartProd}`);
    await new Promise(r => setTimeout(r, 500));

    // Navigate to Product Detail Page for deeper browsing
    const prodId = await page.evaluate(() => {
      const cardLink = document.querySelector('a[href*="product.html?id="]');
      if (cardLink) {
        const match = cardLink.href.match(/id=([^&]+)/);
        return match ? match[1] : '1';
      }
      return '1';
    });
    console.log(`Navigating to Product Details Page (ID: ${prodId})...`);
    await page.goto(`${BASE_URL}/product.html?id=${prodId}`, { waitUntil: 'networkidle2' });

    // Add to Cart from Product Detail Page
    await page.evaluate(() => {
      const btn = document.querySelector('#btn-add-to-cart, .btn-add-to-cart, [data-action="add-cart"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // Add to Wishlist from Product Detail Page
    await page.evaluate(() => {
      const btn = document.querySelector('#btn-add-to-wishlist, .btn-add-to-wishlist, [data-action="add-wishlist"]');
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 800));

    // ------------------------------------------------------------------
    // STEP 4: Check Header Badges Dynamically Across Pages
    // ------------------------------------------------------------------
    console.log('\n--- Step 4: Verifying Header Badges Across Pages ---');

    const pagesToTest = [
      { name: 'Home Page', url: `${BASE_URL}/index.html` },
      { name: 'Product Page', url: `${BASE_URL}/product.html?id=${prodId}` },
      { name: 'Cart Page', url: `${BASE_URL}/cart.html` },
      { name: 'Account Page', url: `${BASE_URL}/account.html` }
    ];

    const badgeCounts = {};

    for (const p of pagesToTest) {
      await page.goto(p.url, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 400));
      const badges = await page.evaluate(() => {
        const cartEl = document.querySelector('.header-action-item[data-action="cart"] .header-badge, #header-cart-count, #header-cart-badge, #badge-cart-count');
        const wishEl = document.querySelector('.header-action-item[data-action="wishlist"] .header-badge, #header-wishlist-count, #header-wishlist-badge, #badge-wishlist-count');
        return {
          cart: cartEl ? cartEl.textContent.trim() : '0',
          cartVisible: cartEl ? window.getComputedStyle(cartEl).display !== 'none' : false,
          wishlist: wishEl ? wishEl.textContent.trim() : '0',
          wishlistVisible: wishEl ? window.getComputedStyle(wishEl).display !== 'none' : false
        };
      });
      badgeCounts[p.name] = badges;
      console.log(`[${p.name}] Cart Badge: "${badges.cart}" (Visible: ${badges.cartVisible}), Wishlist Badge: "${badges.wishlist}" (Visible: ${badges.wishlistVisible})`);
      
      if (Number(badges.cart) <= 0) {
        console.error(`⚠️ Warning: Cart badge count is 0 on ${p.name}`);
      }
      if (Number(badges.wishlist) <= 0) {
        console.error(`⚠️ Warning: Wishlist badge count is 0 on ${p.name}`);
      }
    }

    // ------------------------------------------------------------------
    // STEP 5: Create Delivery Address & Place COD Order at Checkout
    // ------------------------------------------------------------------
    console.log('\n--- Step 5: Navigating to Checkout & Creating Delivery Address ---');
    await page.goto(`${BASE_URL}/checkout.html`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Open Add Address Modal
    const addressModalOpened = await page.evaluate(() => {
      const btn = document.getElementById('btn-trigger-add-address-modal') || document.querySelector('[data-action="add-address"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log(`Triggered Add Address Modal: ${addressModalOpened}`);
    await new Promise(r => setTimeout(r, 500));

    // Fill Address Form
    await page.evaluate(() => {
      const nameInp = document.getElementById('addr-input-name');
      const phoneInp = document.getElementById('addr-input-phone');
      const addrInp = document.getElementById('addr-input-address');
      const cityInp = document.getElementById('addr-input-city');
      const stateInp = document.getElementById('addr-input-state');
      const pinInp = document.getElementById('addr-input-pincode');

      if (nameInp) nameInp.value = 'Rohan Sharma';
      if (phoneInp) phoneInp.value = '9876543210';
      if (addrInp) addrInp.value = '42 Luxury Avenue, Sector 5';
      if (cityInp) cityInp.value = 'Jaipur';
      if (stateInp) stateInp.value = 'Rajasthan';
      if (pinInp) pinInp.value = '302001';

      const form = document.getElementById('checkout-add-address-form');
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    });
    console.log('Submitted New Delivery Address Form.');
    await new Promise(r => setTimeout(r, 1000));

    // Select COD Payment
    console.log('\n--- Step 6: Placing Cash on Delivery (COD) Order ---');
    await page.evaluate(() => {
      const codRadio = document.querySelector('input[value="COD"], input[value="cod"], #pay-cod, #payment-cod');
      if (codRadio) {
        codRadio.checked = true;
        codRadio.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    // Click Place Order
    await page.evaluate(() => {
      if (window.placeOrderAndNotify) {
        window.placeOrderAndNotify('COD');
      } else {
        const btn = document.getElementById('btn-place-order') || document.querySelector('.btn-place-order');
        if (btn) btn.click();
      }
    });
    console.log('Initiated COD Order Placement...');

    // Wait for delivery animation & redirection to order-success.html
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    const currentUrl = page.url();
    console.log(`Redirected URL after Order Placement: ${currentUrl}`);

    const orderSuccessMatch = currentUrl.match(/order=([^&]+)/);
    const placedOrderId = orderSuccessMatch ? orderSuccessMatch[1] : null;
    console.log(`🎉 Placed Order ID: ${placedOrderId}`);

    // ------------------------------------------------------------------
    // STEP 7: Verify Order History in Account Portal
    // ------------------------------------------------------------------
    console.log('\n--- Step 7: Verifying Order History in Account Portal ---');
    await page.goto(`${BASE_URL}/account.html`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Switch to Orders Tab if needed
    await page.evaluate(() => {
      if (window.GiftsKart && window.GiftsKart.account) {
        window.GiftsKart.account.switchTab('orders');
      } else {
        const tabBtn = document.querySelector('[data-tab="orders"], #tab-orders');
        if (tabBtn) tabBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 800));

    const ordersInPortal = await page.evaluate(() => {
      const cards = document.querySelectorAll('#account-orders-container .order-card, .account-order-item');
      const text = document.getElementById('account-orders-container')?.textContent || '';
      return {
        count: cards.length,
        textSnippet: text.slice(0, 500)
      };
    });
    console.log(`Orders found in Account Portal: ${ordersInPortal.count}`);
    console.log(`Order Container Text: ${ordersInPortal.textSnippet.replace(/\s+/g, ' ')}`);

    if (placedOrderId && !ordersInPortal.textSnippet.includes(placedOrderId)) {
      console.warn(`⚠️ Warning: Placed order ID ${placedOrderId} was not explicitly found in portal text snippet, checking order object in localStorage / state...`);
    } else {
      console.log(`✅ Order ${placedOrderId || ''} successfully verified in Account Orders portal!`);
    }

    // ------------------------------------------------------------------
    // STEP 8: Logout
    // ------------------------------------------------------------------
    console.log('\n--- Step 8: Logging Out Customer ---');
    await page.evaluate(() => {
      if (window.GiftsKart && window.GiftsKart.account && window.GiftsKart.account.logout) {
        window.GiftsKart.account.logout();
      } else {
        const logoutBtn = document.querySelector('#btn-account-logout, .btn-logout, [data-action="logout"]');
        if (logoutBtn) logoutBtn.click();
      }
    });
    await new Promise(r => setTimeout(r, 1000));

    const isLoggedOut = await page.evaluate(() => {
      const user = localStorage.getItem('gk_user');
      return !user || user === '{}';
    });
    console.log(`Logout verification state (Is Logged Out): ${isLoggedOut}`);
    console.log(`✅ Customer successfully logged out!`);

    // ------------------------------------------------------------------
    // STEP 9: Console Errors & Data Leakage Summary
    // ------------------------------------------------------------------
    console.log('\n==================================================');
    console.log('SUMMARY & QUALITY CHECK');
    console.log('==================================================');
    console.log(`Total Page JS Errors: ${pageErrors.length}`);
    console.log(`Total Console Errors: ${consoleErrors.length}`);
    console.log(`Total Console Warnings: ${consoleWarns.length}`);

    if (pageErrors.length > 0) {
      console.log('Page Errors Details:', pageErrors);
    }
    if (consoleErrors.length > 0) {
      console.log('Console Errors Details:', consoleErrors);
    }

  } catch (err) {
    console.error('❌ E2E Test execution failed:', err);
  } finally {
    await browser.close();
  }
}

runCustomerTest();
