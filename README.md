# InvoiceSnap ⚡ — a free invoice generator you can earn money from

Freelancers use InvoiceSnap to create professional invoices and save them as PDFs.
It's a static website (HTML/CSS/JS, no server, no database), so you can host it for free.
Invoice data stays in the user's browser.

## How it makes money

| Revenue stream | How | Set up in `config.js` |
|---|---|---|
| **Pro upgrade** (e.g. $9) | Adds a logo, removes the "Made with InvoiceSnap" footer, removes ads | `stripePaymentLink`, `proPrice`, `unlockCode` |
| **Ads** for free users | Google AdSense | `adsensePublisherId`, `adsenseSlotId` |
| **Tips** | Buy Me a Coffee / Ko-fi / PayPal.me button | `tipLink` |

Each feature stays hidden until you fill in its setting.

## Launch in 4 steps

1. **Run it locally:** open `index.html` in a browser, or run `python3 -m http.server` and visit http://localhost:8000.
2. **Set up payments:** create a [Stripe Payment Link](https://dashboard.stripe.com/payment-links) for your Pro price.
   Under *After payment → Redirect*, enter `https://YOUR-SITE/?pro=YOUR_UNLOCK_CODE`.
   Put the link and a new secret `unlockCode` in `config.js`.
3. **Deploy for free:** go to GitHub repo → *Settings → Pages* → deploy from your branch (root folder).
   Netlify, Vercel or Cloudflare Pages also work if you drag and drop this folder.
4. **Get users:** post it in freelancer communities (Reddit r/freelance, Indie Hackers, Product Hunt),
   write SEO pages such as "free invoice template for designers", and share it with local small businesses.
   AdSense requires an approved site with real traffic.

## Limitations

The Pro unlock happens entirely in the browser. That keeps hosting free, but anyone who reads
`config.js` can find the unlock code. That's fine for a low-priced product starting out. Once sales
grow, move the check to a server, for example a Stripe webhook plus a small serverless function
that issues license keys.

## Files

- `index.html`: page layout
- `style.css`: styles, including the print/PDF layout
- `app.js`: invoice logic, autosave, Pro, ads and tips
- `config.js`: **your monetization settings**
