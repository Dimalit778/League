# Paywall comparison background

## Goal

Use the existing Season Pass artwork as the background of the FREE/PRO comparison table without reducing text readability.

## Design

- Render `images.seasonPass` as an absolutely positioned image inside the comparison card.
- Fill the card with `contentFit="cover"`.
- Place a dark translucent gradient between the image and comparison rows.
- Keep the current borders, PRO column emphasis, RTL ordering, content, and interaction unchanged.
- Mark the decorative image as inaccessible so screen readers only announce the table content.

## Verification

- Confirm FREE/PRO labels and all values remain readable.
- Confirm the image fills the rounded card without escaping its clipped bounds.
- Confirm English and Hebrew layouts retain their current column order.
