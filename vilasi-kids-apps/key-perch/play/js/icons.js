// Hand-drawn icons, so the app looks the same on every device.
const I = {
  voice: '<circle cx="9" cy="8" r="4" fill="#5D6B64"/><path d="M2 21c0-5 3-8 7-8s7 3 7 8z" fill="#5D6B64"/><path d="M17 5c2 2 2 5 0 7M20 3c3 3 3 8 0 11" fill="none" stroke="#2B6A4D" stroke-width="2" stroke-linecap="round"/>',
  sound: '<path d="M3 9v6h4l6 5V4L7 9z" fill="#5D6B64"/><path d="M16 8c2 2 2 6 0 8M19 5c4 4 4 10 0 14" fill="none" stroke="#2B6A4D" stroke-width="2" stroke-linecap="round"/>',
  seed: '<path d="M12 9c5 0 7 3 7 6s-3 7-7 8c-4-1-7-5-7-8s2-6 7-6z" fill="#B4763E"/><path d="M4 10c0-4 4-6 8-6s8 2 8 6c-3 1-13 1-16 0z" fill="#6F4522"/><path d="M12 4V1" stroke="#6F4522" stroke-width="2" stroke-linecap="round"/>',
  ghost: '<path d="M4 22V11a8 8 0 0 1 16 0v11l-3-2-2.5 2-2.5-2-2.5 2L7 20z" fill="#DDE4EE" stroke="#8896A6" stroke-width="1.5"/><circle cx="9" cy="11" r="1.8" fill="#26324A"/><circle cx="15" cy="11" r="1.8" fill="#26324A"/>',
  drum: '<ellipse cx="12" cy="9" rx="9" ry="4" fill="#F7EBCF" stroke="#8B5E3C" stroke-width="1.5"/><path d="M3 9v8c0 2 4 4 9 4s9-2 9-4V9c0 2-4 4-9 4s-9-2-9-4z" fill="#C5283D"/><path d="M15 6l6-5M9 6L3 1" stroke="#8B5E3C" stroke-width="2" stroke-linecap="round"/>',
  firefly: '<circle cx="12" cy="15" r="7" fill="#F2C14E" opacity=".35"/><ellipse cx="12" cy="15" rx="3.5" ry="4.5" fill="#F2C14E"/><ellipse cx="12" cy="8" rx="3" ry="3.5" fill="#26324A"/><path d="M9 8C5 5 3 7 3 10s3 3 6 1M15 8c4-3 6-1 6 2s-3 3-6 1" fill="#B7C7DA"/>',
  flag: '<path d="M5 2v21" stroke="#26324A" stroke-width="2" stroke-linecap="round"/><path d="M6 3h15v11H6z" fill="#fff" stroke="#26324A"/><path d="M6 3h5v3.7H6zM16 3h5v3.7h-5zM11 6.7h5v3.7h-5zM6 10.3h5V14H6zM16 10.3h5V14h-5z" fill="#26324A"/>',
  jar: '<rect x="7" y="2" width="10" height="4" rx="1" fill="#8896A6"/><rect x="5" y="6" width="14" height="16" rx="3" fill="#DDE9EE" stroke="#8896A6" stroke-width="1.5"/><circle cx="10" cy="15" r="2" fill="#F2C14E"/><circle cx="15" cy="11" r="1.5" fill="#F2C14E"/>',
  chair: '<path d="M7 2v12h11v8M7 14v8" fill="none" stroke="#8B5E3C" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  elbow: '<path d="M6 3v10a3 3 0 0 0 3 3h11" fill="none" stroke="#C9A27E" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>',
  hand: '<g fill="#F6D9BB" stroke="#B48F6C"><rect x="3" y="8" width="4" height="10" rx="2"/><rect x="7.5" y="4" width="4" height="13" rx="2"/><rect x="12" y="3" width="4" height="14" rx="2"/><rect x="16.5" y="6" width="4" height="11" rx="2"/><path d="M3 14h17.5v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5z"/></g>',
  eyes: '<ellipse cx="7" cy="12" rx="6" ry="7" fill="#fff" stroke="#26324A" stroke-width="1.5"/><ellipse cx="17" cy="12" rx="6" ry="7" fill="#fff" stroke="#26324A" stroke-width="1.5"/><circle cx="8" cy="10" r="2.5" fill="#26324A"/><circle cx="18" cy="10" r="2.5" fill="#26324A"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2.5" fill="#A8A296"/><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="#A8A296" stroke-width="2.5"/>',
  leaf: '<path d="M4 20C3 9 11 3 21 3c0 10-6 18-17 17z" fill="#5FA777"/><path d="M4 20L15 9" stroke="#2F6B45" stroke-width="1.5"/>',
  flower: '<g fill="#F7D34A"><circle cx="12" cy="5" r="4"/><circle cx="19" cy="10" r="4"/><circle cx="16" cy="18" r="4"/><circle cx="8" cy="18" r="4"/><circle cx="5" cy="10" r="4"/></g><circle cx="12" cy="12" r="3.5" fill="#B5651D"/>',
  mushroom: '<path d="M2 12C2 6 7 2 12 2s10 4 10 10z" fill="#D5392E"/><circle cx="8" cy="7" r="2" fill="#fff"/><circle cx="15" cy="8" r="2.2" fill="#fff"/><path d="M8 12h8l1 8a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" fill="#F4E7D3"/>',
  butterfly: '<path d="M12 11C8 3 2 3 2 8s4 6 10 4zM12 11c4-8 10-8 10-3s-4 6-10 4zM12 13c-5 0-8 2-7 5s5 3 7-3zM12 13c5 0 8 2 7 5s-5 3-7-3z" fill="#3D8BD4"/><rect x="11" y="6" width="2" height="14" rx="1" fill="#26324A"/>',
  apple: '<path d="M12 7c-3-3-9-1-9 6 0 5 4 9 6 9 1 0 2-1 3-1s2 1 3 1c2 0 6-4 6-9 0-7-6-9-9-6z" fill="#D5392E"/><path d="M12 7c0-2 1-4 4-5" fill="none" stroke="#5B3A21" stroke-width="2" stroke-linecap="round"/>',
  lantern: '<path d="M12 1v3" stroke="#26324A" stroke-width="2"/><rect x="8" y="4" width="8" height="2" fill="#26324A"/><rect x="5" y="6" width="14" height="13" rx="6" fill="#E4572E"/><path d="M12 8c3 2 2 5 0 8-2-3-3-6 0-8z" fill="#F7D34A"/><rect x="8" y="19" width="8" height="2" fill="#26324A"/>',
  moon: '<path d="M16 2A10 10 0 1 0 22 15 8 8 0 0 1 16 2z" fill="#F2C14E"/>',
  rainbow: '<g fill="none" stroke-width="2.5"><path d="M2 20a10 10 0 0 1 20 0" stroke="#D5392E"/><path d="M5 20a7 7 0 0 1 14 0" stroke="#F2C14E"/><path d="M8 20a4 4 0 0 1 8 0" stroke="#3D8BD4"/></g>',
  party: '<path d="M12 2L5 21h14z" fill="#E4572E"/><circle cx="12" cy="3" r="2.5" fill="#F2C14E"/><path d="M9.5 10h5M7.5 15h9" stroke="#fff" stroke-width="2"/>',
  scarf: '<path d="M3 5c6 3 12 3 18 0v5c-6 3-12 3-18 0z" fill="#E4572E"/><rect x="14" y="10" width="5" height="12" rx="1" fill="#C5283D"/>',
  beanie: '<path d="M3 17C3 8 8 5 12 5s9 3 9 12z" fill="#2B8A6B"/><rect x="2" y="15" width="20" height="5" rx="2" fill="#F2C14E"/><circle cx="12" cy="4" r="3" fill="#E4572E"/>',
  bow: '<path d="M12 12L2 5v14zM12 12l10-7v14z" fill="#C5283D"/><circle cx="12" cy="12" r="2.5" fill="#8F1D2C"/>',
  glasses: '<g fill="#fff" stroke="#26324A" stroke-width="2"><circle cx="7" cy="13" r="5"/><circle cx="17" cy="13" r="5"/></g><path d="M12 12v1" stroke="#26324A" stroke-width="2"/>',
  cap: '<path d="M12 4L1 9l11 5 11-5z" fill="#26324A"/><path d="M6 12v5c3 3 9 3 12 0v-5l-6 3z" fill="#3D4B66"/><path d="M21 10v7" stroke="#F2C14E" stroke-width="2"/><circle cx="21" cy="18" r="1.5" fill="#F2C14E"/>',
  crown: '<path d="M3 19L1 7l6 4 5-8 5 8 6-4-2 12z" fill="#F2C14E" stroke="#B5851B"/><circle cx="12" cy="13" r="2" fill="#C5283D"/>',
};
export function icon(name, size = 28) {
  const span = document.createElement('span');
  span.className = 'ic';
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg width="${size}" height="${size}" viewBox="0 0 24 24">${I[name] || ''}</svg>`;
  return span;
}
