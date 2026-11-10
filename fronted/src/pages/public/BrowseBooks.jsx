import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { FEATURED, UPCOMING, findGroup, titleKey, useCatalog } from './useCatalog';
import { SiteNav, SiteFooter, BookFeatureCard, Modal } from './SiteChrome';
import './LandingPage.css';

function describe(group, formatPrice) {
  const formats = [group.ebook && 'eBook', group.audiobook && 'Audiobook'].filter(Boolean).join(' & ');
  if (group.comingSoon) return `${formats} · Coming soon`;
  const prices = [group.ebook, group.audiobook].filter(r => r && !r.comingSoon).map(r => formatPrice(r.price));
  return `${formats} · ${prices.join(' / ')}`;
}

export default function BrowseBooks() {
  const { groups, others, loaded } = useCatalog();
  const { formatPrice } = useCurrency();
  const [about, setAbout] = useState(null);

  const rows = [
    ...others.map(g => ({
      key: g.key,
      title: g.title,
      subtitle: (g.comingSoon && UPCOMING.find(u => g.key.includes(u.key))?.subtitle) || describe(g, formatPrice),
      description: g.description,
      cover: g.coverUrl,
    })),
    // Placeholder entries until the admin uploads them.
    ...(loaded ? UPCOMING.filter(u => !others.some(g => titleKey(g.title).includes(u.key))) : []),
  ];

  return (
    <div className="jb">
      <SiteNav />

      <main>
        <section className="jb-container jb-hero">
          <h1 className="jb-display">Browse books</h1>
          <p className="jb-lede">Explore eBooks, audiobooks and works in progress from Joseph Kaburu.</p>
          <Link to="/" className="jb-btn jb-btn-outline jb-mt">Back to home</Link>
        </section>

        <section className="jb-container jb-grid" aria-label="Featured books">
          {FEATURED.map(f => (
            <BookFeatureCard key={f.key} config={f} group={findGroup(groups, f.key)} loaded={loaded} />
          ))}
        </section>

        {rows.length > 0 && (
          <section className="jb-container jb-rows">
            {rows.map(r => (
              <div key={r.key} className="jb-strip">
                <div>
                  <h3 className="jb-strip-title">{r.title}</h3>
                  <p className="jb-muted">{r.subtitle}</p>
                </div>
                <button type="button" className="jb-btn jb-btn-outline" onClick={() => setAbout(r)}>About the story</button>
              </div>
            ))}
          </section>
        )}
      </main>

      <SiteFooter />

      {about && (
        <Modal title={about.title} onClose={() => setAbout(null)}>
          <div className="jb-about">
            {about.cover && <img src={about.cover} alt="" />}
            <p>{about.description}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}
