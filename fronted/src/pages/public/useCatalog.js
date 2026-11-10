import { useEffect, useState } from 'react';
import API from '../../api/axios';

// Featured titles, in display order. Copy comes from the design draft;
// prices, formats and availability always come from the API.
export const FEATURED = [
  {
    key: 'myvows',
    title: 'My Vows, My Will',
    label: 'eBook',
    theme: 'green',
    blurb: 'Njoki’s father has planned her future. When she falls for Okoth, she must decide how far she’ll go to choose a life of her own.',
    cover: '/images/my-vows.jpeg', // new cover always wins over the stored one
  },
  {
    key: 'justonetext',
    title: 'Just One Text',
    label: 'eBook & Audiobook',
    theme: 'rust',
    blurb: 'Joe thought he had found the woman he’d spend his life with. Then one text changed the future he’d imagined.',
    fallbackCover: '/images/book-cover.jpg',
  },
];

// Shown on the browse page until the title exists in the database.
export const UPCOMING = [
  {
    key: 'hernomatterthecost',
    title: 'Her, No Matter the Cost',
    subtitle: 'Contemporary romance · In development',
    description: 'A contemporary romance from Joseph Kaburu, currently in development. Check back soon.',
  },
];

export const titleKey = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]/g, '');

// Each format is its own Book record; merge them into one entry per title.
function groupByTitle(books) {
  const groups = new Map();
  for (const b of books) {
    const key = titleKey(b.title);
    if (!groups.has(key)) {
      groups.set(key, { key, title: b.title, author: b.author, description: b.description, coverUrl: null, ebook: null, audiobook: null });
    }
    const g = groups.get(key);
    if (!g[b.type]) g[b.type] = b;
    if (!g.coverUrl && b.coverImage?.url) g.coverUrl = b.coverImage.url;
    if ((b.description || '').length > (g.description || '').length) g.description = b.description;
  }
  return [...groups.values()].map(g => ({
    ...g,
    comingSoon: [g.ebook, g.audiobook].filter(Boolean).every(r => r.comingSoon),
  }));
}

export function findGroup(groups, key) {
  return groups.find(g => g.key === key || g.key.includes(key));
}

function describe(group, formatPrice) {
  const formats = [group.ebook && 'eBook', group.audiobook && 'Audiobook'].filter(Boolean).join(' & ');
  if (group.comingSoon) return `${formats} · In development`;
  const prices = [group.ebook, group.audiobook].filter(r => r && !r.comingSoon).map(r => formatPrice(r.price));
  return `${formats} · ${prices.join(' / ')}`;
}

// Non-featured titles as list rows, plus UPCOMING placeholders not yet in the database.
export function buildRows(others, loaded, formatPrice) {
  return [
    ...others.map(g => {
      const preset = UPCOMING.find(u => g.key.includes(u.key));
      return {
        key: g.key,
        title: g.title,
        comingSoon: g.comingSoon,
        subtitle: (g.comingSoon && preset?.subtitle) || describe(g, formatPrice),
        // Short placeholder blurbs like "In the pipeline" read worse than the preset copy.
        description: (g.description || '').length > 40 ? g.description : (preset?.description || g.description),
        cover: g.coverUrl,
      };
    }),
    ...(loaded ? UPCOMING.filter(u => !others.some(g => g.key.includes(u.key))).map(u => ({ ...u, comingSoon: true })) : []),
  ];
}

export function useCatalog() {
  const [books, setBooks] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    API.get('/books')
      .then(res => setBooks(res.data || []))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const groups = groupByTitle(books);
  const featuredKeys = FEATURED.map(f => f.key);
  const others = groups.filter(g => !featuredKeys.some(k => g.key.includes(k)));

  return { books, groups, others, loaded };
}
