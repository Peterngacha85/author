import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X, Plus } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminUpload({ type = 'ebook' }) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', author: '', price: '', type });
  const [comingSoon, setComingSoon] = useState(false);
  const [coverFile, setCoverFile] = useState(null);
  const [bookFile, setBookFile] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [books, setBooks] = useState([]);
  const [fetchingBooks, setFetchingBooks] = useState(false);
  const [bookDetails, setBookDetails] = useState(null);
  const [ebookFiles, setEbookFiles] = useState([]);
  const [selectedReplaceFileId, setSelectedReplaceFileId] = useState(null);

  // Audio / eBook file state
  const [bookId, setBookId] = useState('');
  const [chapterTitle, setChapterTitle] = useState('');
  const [chapterFile, setChapterFile] = useState(null);
  const [isSample, setIsSample] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const chapterSectionRef = useRef(null);

  const fetchBookDetails = async (bookId) => {
    try {
      const res = await API.get(`/books/${bookId}`);
      setBookDetails(res.data);
      setEbookFiles(res.data.ebookFiles || []);
    } catch (err) {
      console.error('Failed to load book details', err);
      toast.error('Failed to load book details');
      setBookDetails(null);
      setEbookFiles([]);
    }
  };

  useEffect(() => {
    setFetchingBooks(true);
    API.get('/books')
      .then(res => {
        setBooks(res.data);
        // If an ID was passed in, pre-select it after books are loaded
        if (id) {
          setBookId(id);
          fetchBookDetails(id);
          // Scroll to the chapter section
          setTimeout(() => {
            chapterSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
          }, 500);
        }
      })
      .catch(() => toast.error('Failed to load books for dropdown'))
      .finally(() => setFetchingBooks(false));
  }, [id]);

  useEffect(() => {
    if (bookId) {
      fetchBookDetails(bookId);
    }
  }, [bookId]);

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleCover = e => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const handleCreateBook = async (e) => {
    e.preventDefault();
    if (!form.title || !form.price) return toast.error('Title and price are required');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries({ ...form, type, comingSoon }).forEach(([k, v]) => fd.append(k, v));
      if (coverFile) fd.append('coverImage', coverFile);
      if (bookFile && type === 'ebook' && !comingSoon) fd.append('bookFile', bookFile);

      const res = await API.post('/books', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Book created!');
      setBookId(res.data._id);
      setBookDetails(res.data);
      setEbookFiles(res.data.ebookFiles || []);
      setForm({ title: '', description: '', author: '', price: '', type });
      setCoverFile(null); setCoverPreview(null); setBookFile(null); setComingSoon(false);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = async (e) => {
    e.preventDefault();
    if (!bookId || !chapterFile) return toast.error('Book ID and file are required');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('bookId', bookId);
      fd.append('title', chapterTitle);
      fd.append('isSample', isSample);

      if (type === 'ebook') {
        fd.append('ebookFile', chapterFile);
        await API.post('/books/ebook-file', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('eBook file added!');
        fetchBookDetails(bookId);
      } else {
        fd.append('audioFile', chapterFile);
        await API.post('/books/chapter', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        toast.success('Chapter added!');
      }

      setChapterTitle(''); setChapterFile(null); setIsSample(false);
      e.target.reset();
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReplaceEbookFile = async (e) => {
    const file = e.target.files[0];
    if (!bookId || !selectedReplaceFileId || !file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('ebookFile', file);
      await API.put(`/books/ebook-file/${bookId}/${selectedReplaceFileId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('eBook file replaced successfully!');
      setSelectedReplaceFileId(null);
      fetchBookDetails(bookId);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Replacement failed');
    } finally {
      setLoading(false);
      e.target.value = null;
    }
  };

  const handleFileDelete = async (fileId) => {
    if (!bookId) return;
    setLoading(true);
    try {
      await API.delete(`/books/ebook-file/${bookId}/${fileId}`);
      toast.success('eBook file deleted successfully!');
      fetchBookDetails(bookId);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2>{type === 'ebook' ? '📤 Upload Ebook' : '📤 Upload Audiobook'}</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '0.25rem' }}>Add new {type}s to the library</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Create Book */}
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>
            {type === 'ebook' ? '📚 Create eBook' : '🎧 Create Audiobook'}
          </h3>
          <form onSubmit={handleCreateBook} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Cover Upload */}
            <div>
              <label className="form-label">Cover Image</label>
              <label style={{ display: 'block', cursor: 'pointer', marginTop: '0.4rem', width: 'fit-content' }}>
                <div style={{ border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                  {coverPreview
                    ? <img src={coverPreview} alt="cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : <div style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                        <Upload size={28} style={{ marginBottom: '0.5rem' }} />
                        <div style={{ fontSize: '0.8rem' }}>Upload cover</div>
                      </div>
                  }
                </div>
                <input type="file" accept="image/*" hidden onChange={handleCover} />
              </label>
            </div>

            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" name="title" value={form.title} onChange={handleChange} placeholder="Book title" required />
            </div>
            <div className="form-group">
              <label className="form-label">Author</label>
              <input className="form-input" name="author" value={form.author} onChange={handleChange} placeholder="Author name" />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input" name="description" value={form.description} onChange={handleChange} rows={3} style={{ resize: 'vertical' }} placeholder="Short description..." />
            </div>
            <div className="form-group">
              <label className="form-label">Price (KES) *</label>
              <input className="form-input" name="price" type="number" value={form.price} onChange={handleChange} placeholder="600" required />
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
              <input type="checkbox" checked={comingSoon} onChange={e => setComingSoon(e.target.checked)} style={{ accentColor: 'var(--color-primary-light)', width: 16, height: 16 }} />
              Mark as "Coming Soon" (No file required)
            </label>

            {type === 'ebook' && !comingSoon && (
              <div className="form-group">
                <label className="form-label">Ebook File (EPUB Recommended or PDF)</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', background: 'var(--bg-input)' }}>
                  <Upload size={18} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.85rem', color: bookFile ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {bookFile ? bookFile.name : 'Click to upload EPUB (Best Experience) or PDF'}
                  </span>
                  <input type="file" accept=".pdf,.epub" hidden onChange={e => setBookFile(e.target.files[0])} />
                </label>
              </div>
            )}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <><Plus size={16} /> Create Book</>}
            </button>
          </form>
        </div>

        {/* Add file or chapter section for audiobooks and ebooks */}
        <div ref={chapterSectionRef} className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>
            {type === 'ebook' ? '📄 Upload & Save File' : '🎵 Add Chapter'}
          </h3>
          <form onSubmit={handleAddChapter} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Select Book *</label>
                <select 
                  className="form-input" 
                  value={bookId} 
                  onChange={e => setBookId(e.target.value)} 
                  required
                >
                  <option value="">-- Choose a book --</option>
                  {books.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.title} ({b._id.slice(-6)})
                    </option>
                  ))}
                </select>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.25rem' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {fetchingBooks ? 'Loading books...' : type === 'ebook' ? 'Select the book you want to add files to' : 'Select the book you want to add chapters to'}
                  </span>
                  {bookId && (
                    <button 
                      type="button"
                      onClick={() => navigate(`/admin/books/reorder/${bookId}`)}
                      style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                    >
                      🔄 Reorder existing {type === 'ebook' ? 'files' : 'chapters'}
                    </button>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Chapter Title</label>
                <input className="form-input" value={chapterTitle} onChange={e => setChapterTitle(e.target.value)} placeholder="e.g. Chapter 1 - Introduction" />
              </div>
              <div className="form-group">
                <label className="form-label">{type === 'ebook' ? 'eBook File' : 'Chapter File'}</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', border: '1.5px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', background: 'var(--bg-input)' }}>
                  <Upload size={18} color="var(--text-muted)" />
                  <span style={{ fontSize: '0.85rem', color: chapterFile ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {chapterFile ? chapterFile.name : type === 'ebook' ? 'Click to upload EPUB or PDF' : 'Click to upload audio file'}
                  </span>
                  <input type="file" accept={type === 'ebook' ? '.pdf,.epub' : 'audio/*'} hidden onChange={e => setChapterFile(e.target.files[0])} />
                </label>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                <input type="checkbox" checked={isSample} onChange={e => setIsSample(e.target.checked)} style={{ accentColor: 'var(--color-primary-light)', width: 16, height: 16 }} />
                Mark as Free Sample
              </label>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="spinner" /> : <><Plus size={16} /> {type === 'ebook' ? 'Save & Upload File' : 'Add Chapter'}</>}
              </button>
            </form>
          </div>

          {type === 'ebook' && bookDetails && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>📄 Manage eBook Files</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                Existing files for this eBook can be replaced or removed without deleting the book record. This keeps purchases intact.
              </p>
              {ebookFiles.length === 0 ? (
                <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  {bookDetails.fileUrl ? (
                    <div>
                      <strong>Legacy eBook file:</strong> {bookDetails.fileUrl.format?.toUpperCase() || 'ebook'}
                      <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate(`/admin/upload-ebook/${bookDetails._id}`)} className="btn btn-outline btn-sm">
                          Add new file version
                        </button>
                      </div>
                    </div>
                  ) : (
                    'No eBook files have been uploaded yet for this book.'
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {ebookFiles.map(file => (
                    <div key={file._id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>{file.title || `File ${file.order + 1}`}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                          {file.format?.toUpperCase() || 'file'} • {file.isSample ? 'Free sample' : 'Paid'}
                        </div>
                        <a href={file.url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                          View file
                        </a>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'flex-start' }}>
                        <button onClick={() => {
                          setSelectedReplaceFileId(file._id);
                          document.getElementById('replace-ebook-file-input')?.click();
                        }} className="btn btn-sm btn-outline">
                          Replace
                        </button>
                        <button onClick={() => handleFileDelete(file._id)} className="btn btn-sm btn-danger">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <input id="replace-ebook-file-input" type="file" accept=".pdf,.epub" hidden onChange={handleReplaceEbookFile} />
            </div>
          )}
        </div>
      </div>
  );
}
