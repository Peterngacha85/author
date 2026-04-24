import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, ArrowLeft, Book, Headphones } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

function SortableItem({ id, book }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: isDragging ? 'var(--bg-card)' : 'var(--bg-card)',
    border: isDragging ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '0.5rem',
    cursor: 'default',
    zIndex: isDragging ? 2 : 1,
    boxShadow: isDragging ? '0 10px 20px rgba(0,0,0,0.1)' : 'none',
    opacity: isDragging ? 0.8 : 1
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-muted)' }}>
        <GripVertical size={20} />
      </div>
      
      <img 
        src={book.coverImage?.url || book.coverImage || 'https://via.placeholder.com/40x60'} 
        alt={book.title} 
        style={{ width: 40, height: 60, objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)', flexShrink: 0 }}
      />

      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {book.type === 'ebook' ? <Book size={14} color="#FF385C" /> : <Headphones size={14} color="#008489" />}
          {book.title}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{book.author}</div>
      </div>

      <div className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
        {book.type}
      </div>
    </div>
  );
}

export default function BookReorder() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const res = await API.get('/books');
      setBooks(res.data);
    } catch (err) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setBooks((items) => {
        const oldIndex = items.findIndex(b => b._id === active.id);
        const newIndex = items.findIndex(b => b._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      // Map books to their new order
      const reorderData = books.map((book, index) => ({
        _id: book._id,
        order: index
      }));

      await API.post('/books/reorder-books', { books: reorderData });
      toast.success('Book order saved successfully');
      navigate('/admin/books');
    } catch (err) {
      toast.error('Failed to save book order');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
      <span className="spinner spinner-lg" />
    </div>
  );

  return (
    <div className="fade-in" style={{ maxWidth: 800, margin: '0 auto', padding: '0 1rem' }}>
      <div style={{ 
        marginBottom: '2.5rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '1rem 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/admin/books')} className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.75rem' }}>Reorder Books</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Arrange books in the order users will see them</p>
          </div>
        </div>

        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary" 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            boxShadow: 'var(--shadow-md)'
          }}
        >
          {saving ? <span className="spinner spinner-sm" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Order'}
        </button>
      </div>

      <div style={{ background: 'rgba(139,0,0,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', color: '#8B0000', fontSize: '0.9rem', border: '1px solid rgba(139,0,0,0.1)' }}>
        💡 Drag the handles on the left to rearrange books. The order here will be reflected on the landing page and catalog.
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={books.map(b => b._id)}
          strategy={verticalListSortingStrategy}
        >
          {books.map((book) => (
            <SortableItem 
              key={book._id} 
              id={book._id} 
              book={book} 
            />
          ))}
        </SortableContext>
      </DndContext>

      {books.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
          No books found in the library.
        </div>
      )}
    </div>
  );
}
