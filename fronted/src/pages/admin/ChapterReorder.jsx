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
import { GripVertical, Save, ArrowLeft, Headphones } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';

function SortableItem({ id, chapter }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '0.5rem',
    cursor: 'default'
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div {...attributes} {...listeners} style={{ cursor: 'grab', color: 'var(--text-muted)' }}>
        <GripVertical size={20} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600 }}>{chapter.title}</div>
        {chapter.isSample && <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>Sample</span>}
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
        setChapters(res.data.chapters || []);
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

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.post('/books/reorder', {
        bookId: id,
        chapters: chapters
      });
      toast.success('Chapter order saved successfully');
      navigate('/admin/books');
    } catch (err) {
      toast.error('Failed to save chapter order');
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
    <div className="fade-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/admin/books')} className="btn btn-outline btn-sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Headphones size={24} color="var(--color-primary)" />
              Reorder Chapters
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>{book?.title}</p>
          </div>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {saving ? <span className="spinner spinner-sm" /> : <Save size={18} />}
          {saving ? 'Saving...' : 'Save Order'}
        </button>
      </div>

      <div style={{ background: 'rgba(0,166,153,0.05)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', color: '#007A70', fontSize: '0.9rem' }}>
        💡 Drag the handles on the left to rearrange chapters.
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
          {chapters.map((chapter) => (
            <SortableItem key={chapter._id} id={chapter._id} chapter={chapter} />
          ))}
        </SortableContext>
      </DndContext>

      {chapters.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-lg)', color: 'var(--text-muted)' }}>
          No chapters found for this audiobook.
        </div>
      )}
    </div>
  );
}
