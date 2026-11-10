import { Link } from 'react-router-dom';
import { useCurrency } from '../../context/CurrencyContext';
import { FEATURED, buildRows, findGroup, useCatalog } from './useCatalog';
import { SiteNav, SiteFooter, BookFeatureCard, BookRow } from './SiteChrome';
import './LandingPage.css';

export default function BrowseBooks() {
  const { groups, others, loaded } = useCatalog();
  const { formatPrice } = useCurrency();
  const rows = buildRows(others, loaded, formatPrice);

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
            {rows.map(r => <BookRow key={r.key} item={r} />)}
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
