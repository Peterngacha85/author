import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { GripVertical, Save, ArrowLeft, Headphones, Book, Edit2, Check, Plus, Trash2, AlertTriangle } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

function SortableItem({ id, chapter, onUpdate, onDelete, isDefault }) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState(chapter.title);

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

  const handleToggleEdit = () => {
    if (isEditing) {
      onUpdate(id, { title: tempTitle });
    }
    setIsEditing(!isEditing);
  };

  const toggleSample = () => {
    onUpdate(id, { isSample: !chapter.isSample });
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-muted)' }}>
        <GripVertical size={20} />
      </div>
      <div style={{ flex: 1 }}>
        {isEditing ? (
          <input
            className="form-input"
            value={tempTitle}
            onChange={(e) => setTempTitle(e.target.value)}
            style={{ padding: '0.25rem 0.5rem', fontSize: '0.95rem', height: 'auto', width: '100%' }}
            autoFocus
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
            {chapter.title}
            {isDefault && (
              <span style={{ fontSize: '0.68rem', background: 'var(--color-primary)', color: 'white', borderRadius: '10px', padding: '0.1rem 0.45rem', fontWeight: 700, flexShrink: 0 }}>
                Default
              </span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button 
          onClick={toggleSample}
          className={`btn btn-sm ${chapter.isSample ? 'btn-primary' : 'btn-outline'}`}
          style={{ 
            fontSize: '0.7rem', 
            padding: '0.2rem 0.6rem', 
            height: 'auto',
            borderRadius: '12px',
            borderColor: chapter.isSample ? 'var(--color-primary)' : 'var(--border-color)',
            color: chapter.isSample ? 'white' : 'var(--text-muted)'
          }}
        >
          {chapter.isSample ? 'Free Sample' : 'Mark as Free Sample'}
        </button>
        <button
          onClick={handleToggleEdit}
          className="btn btn-sm btn-outline"
          style={{ padding: '0.4rem', border: 'none', background: 'transparent' }}
        >
          {isEditing ? <Check size={18} color="var(--success)" /> : <Edit2 size={16} color="var(--text-muted)" />}
        </button>
        <button
          onClick={() => onDelete(id)}
          className="btn btn-sm"
          disabled={isDefault}
          title={isDefault ? 'Cannot delete the default file — use Replace instead' : 'Delete'}
          style={{ padding: '0.4rem', border: 'none', background: 'transparent', color: isDefault ? 'var(--text-muted)' : 'var(--danger)', opacity: isDefault ? 0.35 : 1, cursor: isDefault ? 'not-allowed' : 'pointer' }}
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}

export default function ChapterReorder() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    API.get(`/books/${id}`)
      .then(res => {
        setBook(res.data);

        if (res.data.type === 'ebook') {
          const ebookFiles = res.data.ebookFiles || [];
          if (ebookFiles.length > 0) {
            setChapters(ebookFiles);
          } else if (res.data.fileUrl) {
            setChapters([{
              _id: res.data.fileUrl.public_id || 'legacy-file-url',
              title: res.data.fileUrl.format?.toUpperCase() || 'eBook File',
              url: res.data.fileUrl.url || res.data.fileUrl,
              public_id: res.data.fileUrl.public_id,
              format: res.data.fileUrl.format,
              isSample: false,
              order: 0
            }]);
          } else {
            setChapters([]);
          }
        } else {
          setChapters(res.data.chapters || []);
        }
      })
      .catch(() => toast.error('Failed to load book chapters'))
      .finally(() => setLoading(false));
  }, [id]);

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      setChapters((items) => {
        const oldIndex = items.findIndex(ch => ch._id === active.id);
        const newIndex = items.findIndex(ch => ch._id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  const handleDelete = (itemId) => {
    setConfirmDeleteId(itemId);
  };

  const confirmDelete = async () => {
    const itemId = confirmDeleteId;
    setConfirmDeleteId(null);
    try {
      if (book?.type === 'ebook') {
        await API.delete(`/books/ebook-file/${id}/${itemId}`);
      } else {
        await API.delete(`/books/chapter/${id}/${itemId}`);
      }
      setChapters(prev => prev.filter(ch => ch._id !== itemId));
      toast.success('Deleted successfully');
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Failed to delete');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { bookId: id };
      if (book?.type === 'ebook') {
        payload.ebookFiles = chapters;
      } else {
        payload.chapters = chapters;
      }
      await API.post('/books/reorder', payload);
      toast.success('Order saved successfully');
      navigate('/admin/books');
    } catch (err) {
      toast.error('Failed to save chapter/file order');
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
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        gap: '1.5rem',
        padding: '1rem 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: '1 1 300px' }}>
          <button onClick={() => navigate('/admin/books')} className="btn btn-outline btn-sm" style={{ marginTop: '0.5rem' }}>
            <ArrowLeft size={16} />
          </button>
          <div style={{ overflow: 'hidden' }}>
            <h2 style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              margin: 0, 
              fontSize: '1.75rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {book?.type === 'ebook' ? (
                <Book size={28} color="var(--color-primary)" />
              ) : (
                <Headphones size={28} color="var(--color-primary)" />
              )}
              Reorder {book?.type === 'ebook' ? 'Files' : 'Chapters'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>{book?.title}</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button 
            onClick={() => navigate(`/admin/upload-${book?.type === 'ebook' ? 'ebook' : 'audiobook'}/${id}`)} 
            className="btn btn-outline" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              whiteSpace: 'nowrap'
            }}
          >
            <Plus size={18} />
            {book?.type === 'ebook' ? 'Add File' : 'Add Chapter'}
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="btn btn-primary" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              boxShadow: 'var(--shadow-md)',
              whiteSpace: 'nowrap'
            }}
          >
            {saving ? <span className="spinner spinner-sm" /> : <Save size={18} />}
            {saving ? 'Saving...' : 'Save Order'}
          </button>
        </div>
      </div>

      <div style={{ background: 'rgba(0,166,153,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', color: '#007A70', fontSize: '0.9rem' }}>
        💡 Drag the handles on the left to rearrange {book?.type === 'ebook' ? 'files' : 'chapters'}.
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={chapters.map(ch => ch._id)}
          strategy={verticalListSortingStrategy}
        >
          {(() => {
            const defaultFileId = book?.type === 'ebook'
              ? chapters.find(ch => !ch.isSample)?._id
              : null; // audiobook chapters can all be deleted
            return chapters.map((chapter) => (
              <SortableItem
                key={chapter._id}
                id={chapter._id}
                chapter={chapter}
                isDefault={chapter._id === defaultFileId}
                onUpdate={(id, updates) => {
                  setChapters(prev => prev.map(ch => ch._id === id ? { ...ch, ...updates } : ch));
                }}
                onDelete={handleDelete}
              />
            ));
          })()}
        </SortableContext>
      </DndContext>

      {chapters.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
          {book?.type === 'ebook' ? 'No files found for this eBook.' : 'No chapters found for this audiobook.'}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem'
        }}>
          <div className="glass-card fade-in" style={{ maxWidth: 400, width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(220,38,38,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem'
            }}>
              <AlertTriangle size={26} color="var(--danger)" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Delete {book?.type === 'ebook' ? 'File' : 'Chapter'}?
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
              This action cannot be undone. The {book?.type === 'ebook' ? 'file' : 'chapter'} will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="btn btn-outline"
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="btn btn-danger"
                style={{ flex: 1 }}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
