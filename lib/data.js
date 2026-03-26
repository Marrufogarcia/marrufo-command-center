export const PACKAGES = {
  interior: [
    { id: 'int-detail', name: 'Interior Detail', price: 199, xlAddon: 50 },
    { id: 'deep-int', name: 'Deep Interior Detail', price: 249, xlAddon: 50 },
  ],
  combo: [
    { id: 'sig-refresh', name: 'Signature Refresh', price: 179, xlAddon: 30 },
    { id: 'standard', name: 'The Standard Detail', price: 289, xlAddon: 50 },
    { id: 'deep-combo', name: 'Deep Interior & Exterior', price: 329, xlAddon: 50 },
  ],
  exterior: [
    { id: 'paint-enhance', name: 'Paint Enhancement (1-Step)', price: 329, xlAddon: 50 },
    { id: 'paint-correct', name: 'Paint Correction (2-Step)', price: 479, xlAddon: 50 },
  ],
};

export const ALL_PACKAGES = [
  ...PACKAGES.interior,
  ...PACKAGES.combo,
  ...PACKAGES.exterior,
];

export const ALL_ADDONS = [
  { id: 'pet-hair', name: 'Pet Hair Removal', price: 29 },
  { id: 'heavy-pet', name: 'Heavy Pet Hair Removal', price: 49 },
  { id: 'kids-seat', name: 'Kids Car Seat Cleaning', price: 29 },
  { id: 'odor', name: 'Odor Removal Treatment', price: 49 },
  { id: 'engine-bay', name: 'Engine Bay Detail', price: 49 },
  { id: 'headlight', name: 'Headlight Restoration (2x)', price: 99 },
  { id: 'polish-addon', name: '1-Step Paint Enhancement', price: 199 },
];

export const TEMPLATES = [
  { id: 'quote', label: 'Send Quote', icon: '💰', text: "Hey [NAME]! Thanks for reaching out to Marrufo Mobile Detailing! Based on your [VEHICLE], I'd recommend our [SERVICE] package at $[PRICE]. This includes [DETAILS]. Would you like to book? We have availability this week!" },
  { id: 'confirm', label: 'Booking Confirmed', icon: '✅', text: "Hey [NAME]! You're all set for your [SERVICE] on [DATE]. Our detailer will arrive between [TIME]. Please make sure the vehicle is accessible and we'll take care of the rest! See you soon." },
  { id: 'eta', label: 'Day-of ETA', icon: '🚗', text: "Good morning [NAME]! Your detailer is on the way and should arrive around [TIME]. Please have the vehicle ready and accessible. We'll text you when we're there!" },
  { id: 'complete', label: 'Job Complete', icon: '✨', text: "Hey [NAME]! Your [VEHICLE] is looking amazing! Thank you for choosing Marrufo Mobile Detailing. If you're happy with the results, we'd really appreciate a Google review - it helps us a ton! [REVIEW_LINK]" },
  { id: 'followup', label: 'Follow Up', icon: '📲', text: "Hey [NAME]! Just checking in - are you still interested in getting your [VEHICLE] detailed? We have some openings this week and I'd love to get you scheduled. Let me know!" },
  { id: 'sub-dispatch', label: 'Dispatch to Sub', icon: '📋', text: "Hey [SUB_NAME]! Got a job for you:\n📍 [ADDRESS]\n🚗 [VEHICLE]\n📦 [SERVICE] - $[PRICE]\n📅 [DATE] at [TIME]\nYour cut: $[SUB_CUT]\nAre you available?" },
];

export const STATUS_COLORS = {
  new: { bg: '#FFA726', text: '#000' },
  quoted: { bg: '#42A5F5', text: '#fff' },
  booked: { bg: '#66BB6A', text: '#fff' },
  'in-progress': { bg: '#AB47BC', text: '#fff' },
  completed: { bg: '#26A69A', text: '#fff' },
  paid: { bg: '#78909C', text: '#fff' },
};

export const SUB_STATUS_COLORS = {
  available: '#66BB6A',
  'on-job': '#FFA726',
  'off-today': '#78909C',
};
