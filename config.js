// ===== Monetization settings — edit these to start earning =====
window.APP_CONFIG = {
  appName: "InvoiceSnap",

  // 1) Pro upgrade: create a Stripe Payment Link (https://dashboard.stripe.com/payment-links)
  //    and set its "after payment" redirect to: https://YOUR-SITE/?pro=YOUR_UNLOCK_CODE
  stripePaymentLink: "",          // e.g. "https://buy.stripe.com/xxxxxxxx"
  proPrice: "$9 one-time",
  unlockCode: "CHANGE-ME-123",    // change this before launch

  // 2) Tips / donations (Buy Me a Coffee, Ko-fi, PayPal.me ...)
  tipLink: "",                    // e.g. "https://buymeacoffee.com/yourname"

  // 3) Ads: paste your Google AdSense publisher id to show ads to free users
  adsensePublisherId: "",         // e.g. "ca-pub-1234567890123456"
  adsenseSlotId: ""
};
