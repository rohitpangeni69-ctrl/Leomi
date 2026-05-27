# Leomi Fashion - Deployment & Scaling Guide

## 1. Local Development
Since this project uses Vite, React, and Tailwind CSS, you can run the app locally using:
```bash
npm install
npm run dev
```

## 2. Zero-Cost Deployment (Vercel)
Vercel provides an excellent free tier for frontend hosting.

### One-Click Deploy on Vercel
1. Push this codebase to a GitHub repository.
2. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your GitHub repository.
4. Leave the Framework Preset as **Vite**.
5. Click **Deploy**.

## 3. Backend & Database (Firebase Free Tier)
This application uses Firebase for Authentication, Firestore (Database), and Cloud Functions (if upgrading).
The **Spark Plan (Free Tier)** includes:
- 50,000 document reads/day
- 20,000 document writes/day
- 1GiB total storage
- Phone Auth (10K/mo) & Password Auth.

To deploy Firebase rules manually if needed:
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Init: `firebase init` (Select Firestore, Hosting)
4. Deploy rules: `firebase deploy --only firestore:rules`

## 4. eSewa/Khalti Sandbox Setup
The checkout form currently handles mocked synchronous validation. To swap this to the real API:

**eSewa (ePay):**
Update the `/src/pages/Checkout.tsx` to handle the eSewa form submission according to the eSewa Sandbox guide.
Endpoint: `https://uat.esewa.com.np/epay/main`

```html
<!-- Example eSewa Form -->
<form action="https://uat.esewa.com.np/epay/main" method="POST">
    <input value="100" name="tAmt" type="hidden">
    <input value="90" name="amt" type="hidden">
    <input value="5" name="txAmt" type="hidden">
    <input value="2" name="psc" type="hidden">
    <input value="3" name="pdc" type="hidden">
    <input value="EPAYTEST" name="scd" type="hidden">
    <input value="ee2c3ca1-696b-4cc5-a6be-2c40d929d453" name="pid" type="hidden">
    <input value="http://merchant.com.np/page/esewa_payment_success?q=su" type="hidden" name="su">
    <input value="http://merchant.com.np/page/esewa_payment_failed?q=fu" type="hidden" name="fu">
    <button type="submit">Pay with eSewa</button>
</form>
```

## 5. Scaling to Paid Tiers (When Needed)
When traffic exceeds the free tier limits (typically >5,000 daily active users):
1. **Firebase Blaze Plan:** Upgrade Firebase to the "Blaze" plan (Pay as you go). It provides scalable limits. You typically only pay fractions of a cent per 100k reads past the free tier.
2. **Custom Domain:** Free on Vercel, but requires a registered `.com.np` or `.com` domain.
3. **Cloud Functions for server logic:** Once on the Blaze plan, you can write admin order fulfillment APIs that trigger webhooks.
