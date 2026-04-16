import React, { useState, useEffect, useCallback } from 'react';
import * as pdfjs from 'pdfjs-dist';
import { Type, Minus, Plus, Sun, Moon, Coffee } from 'lucide-react';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js`;

const THEMES = {
  light: { bg: '#ffffff', text: '#1a1a1a', meta: '#666666' },
  sepia: { bg: '#f4ecd8', text: '#5b4636', meta: '#8c7e6d' },
  dark: { bg: '#1a1a1a', text: '#e0e0e0', meta: '#888888' }
};

export default function StoryReader({ url }) {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState('light');
  const [fontFamily, setFontFamily] = useState('serif');

  const extractText = useCallback(async () => {
    try {
      setLoading(true);
      const loadingTask = pdfjs.getDocument(url);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      const extractedPages = [];

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        // Simple heuristic to join text items
        let lastY;
        let pageText = "";
        for (const item of textContent.items) {
          if (lastY !== undefined && Math.abs(item.transform[5] - lastY) > 5) {
            pageText += "\n";
          }
          pageText += item.str + " ";
          lastY = item.transform[5];
        }
        extractedPages.push(pageText);
      }

      setPages(extractedPages);
    } catch (err) {
      console.error('Extraction error:', err);
      setError('Failed to extract text from PDF. Please use PDF view mode.');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    if (url) extractText();
  }, [url, extractText]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
        <span className="spinner spinner-lg"></span>
        <p style={{ color: 'var(--text-muted)' }}>Professionalizing your reading experience...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>
        <p>{error}</p>
      </div>
    );
  }

  const currentTheme = THEMES[theme];

  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      background: currentTheme.bg,
      color: currentTheme.text,
      transition: 'all 0.3s ease'
    }}>
      {/* Reader Toolbar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '1.5rem', 
        padding: '0.75rem', 
        borderBottom: `1px solid ${currentTheme.meta}44`,
        alignItems: 'center',
        background: `${currentTheme.bg}dd`,
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button onClick={() => setFontSize(s => Math.max(12, s - 2))} className="toolbar-btn"><Minus size={16} /></button>
          <Type size={16} />
          <button onClick={() => setFontSize(s => Math.min(32, s + 2))} className="toolbar-btn"><Plus size={16} /></button>
        </div>

        <div style={{ height: 20, width: 1, background: `${currentTheme.meta}44` }} />

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => setTheme('light')} className={`theme-btn ${theme === 'light' ? 'active' : ''}`} style={{ background: '#ffffff', border: '1px solid #ccc' }}><Sun size={14} color="#333" /></button>
          <button onClick={() => setTheme('sepia')} className={`theme-btn ${theme === 'sepia' ? 'active' : ''}`} style={{ background: '#f4ecd8', border: '1px solid #d4c4a8' }}><Coffee size={14} color="#5b4636" /></button>
          <button onClick={() => setTheme('dark')} className={`theme-btn ${theme === 'dark' ? 'active' : ''}`} style={{ background: '#1a1a1a', border: '1px solid #444' }}><Moon size={14} color="#eee" /></button>
        </div>

        <div style={{ height: 20, width: 1, background: `${currentTheme.meta}44` }} />

        <select 
          value={fontFamily} 
          onChange={(e) => setFontFamily(e.target.value)}
          style={{ 
            background: 'transparent', 
            color: currentTheme.text, 
            border: 'none', 
            fontSize: '0.85rem',
            cursor: 'pointer'
          }}
        >
          <option value="serif">Serif (Story)</option>
          <option value="sans-serif">Sans Serif (Modern)</option>
          <option value="'Courier New', Courier, monospace">Monospace</option>
        </select>
      </div>

      {/* Text Content */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '2rem 1rem',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <div style={{ 
          maxWidth: '800px', 
          width: '100%',
          fontSize: `${fontSize}px`,
          lineHeight: '1.7',
          fontFamily: fontFamily,
          textAlign: 'justify',
          whiteSpace: 'pre-wrap'
        }}>
          {pages.map((text, i) => (
            <div key={i} style={{ marginBottom: '4rem' }}>
              <div style={{ 
                fontSize: '0.75rem', 
                color: currentTheme.meta, 
                marginBottom: '1rem', 
                textAlign: 'center',
                borderBottom: `1px solid ${currentTheme.meta}22`,
                paddingBottom: '0.5rem'
              }}>
                PAGE {i + 1}
              </div>
              {text}
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .toolbar-btn {
          background: transparent;
          border: none;
          color: inherit;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 4px;
          border-radius: 4px;
        }
        .toolbar-btn:hover {
          background: rgba(128,128,128,0.1);
        }
        .theme-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s;
        }
        .theme-btn:hover {
          transform: scale(1.1);
        }
        .theme-btn.active {
          box-shadow: 0 0 0 2px var(--color-primary);
        }
      `}</style>
    </div>
  );
}
