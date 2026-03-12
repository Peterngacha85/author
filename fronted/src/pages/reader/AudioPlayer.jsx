import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Howl } from 'howler';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Volume2, VolumeX, Download } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';

export default function AudioPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [muted, setMuted] = useState(false);

  const soundRef = useRef(null);
  const rafRef = useRef(null);

  const playChapter = (index, chapters) => {
    if (!chapters || chapters.length === 0) return;
    
    // Stop and unload existing sound
    if (soundRef.current) {
      soundRef.current.unload();
    }
    cancelAnimationFrame(rafRef.current);
    
    const chapter = chapters[index];
    const audioSrc = chapter.url;

    if (!audioSrc) {
      setError('Chapter audio not found');
      return;
    }

    setCurrentChapterIndex(index);
    setProgress(0);
    setPlaying(false);

    soundRef.current = new Howl({
      src: [audioSrc],
      html5: true,
      onload: function() {
        setDuration(this.duration());
      },
      onplay: () => {
        setPlaying(true);
        updateProgress();
      },
      onpause: () => {
        setPlaying(false);
        cancelAnimationFrame(rafRef.current);
      },
      onend: () => {
        setPlaying(false);
        setProgress(0);
        // Autoplay next chapter if available
        if (index < chapters.length - 1) {
          playChapter(index + 1, chapters);
        }
      }
    });

    soundRef.current.play();
  };

  useEffect(() => {
    API.get(`/books/${id}`)
      .then(res => {
        const bookData = res.data;
        setBook(bookData);
        
        // Define chapters: either main fileUrl (as a single chapter) or the chapters array
        let chaptersList = [];
        if (bookData.chapters && bookData.chapters.length > 0) {
          chaptersList = bookData.chapters;
        } else if (bookData.fileUrl?.url || bookData.fileUrl) {
          chaptersList = [{
            title: 'Main Content',
            url: bookData.fileUrl?.url || bookData.fileUrl,
            isSample: false
          }];
        }

        if (chaptersList.length === 0) {
          setError('No audio source found for this book');
          return;
        }

        // Initialize with first chapter (but don't autoplay on initial load unless user clicks play)
        // Actually, Howler requires initialization. Let's just set the source.
        const audioSrc = chaptersList[0].url;
        soundRef.current = new Howl({
          src: [audioSrc],
          html5: true,
          onload: function() {
            setDuration(this.duration());
          },
          onplay: () => {
            setPlaying(true);
            updateProgress();
          },
          onpause: () => {
            setPlaying(false);
            cancelAnimationFrame(rafRef.current);
          },
          onend: () => {
            setPlaying(false);
            setProgress(0);
            if (currentChapterIndex < chaptersList.length - 1) {
              playChapter(currentChapterIndex + 1, chaptersList);
            }
          }
        });
      })
      .catch((err) => setError(err.response?.data?.msg || 'Could not load audiobook'))
      .finally(() => setLoading(false));

    return () => {
      if (soundRef.current) {
        soundRef.current.unload();
      }
      cancelAnimationFrame(rafRef.current);
    };
  }, [id]);

  const updateProgress = () => {
    if (soundRef.current && soundRef.current.playing()) {
      setProgress(soundRef.current.seek());
      rafRef.current = requestAnimationFrame(updateProgress);
    }
  };

  const togglePlay = () => {
    if (!soundRef.current) return;
    if (playing) soundRef.current.pause();
    else soundRef.current.play();
  };

  const skip = (seconds) => {
    if (!soundRef.current) return;
    const current = soundRef.current.seek();
    soundRef.current.seek(Math.max(0, current + seconds));
    setProgress(soundRef.current.seek());
  };

  const toggleMute = () => {
    if (!soundRef.current) return;
    const isMuted = !muted;
    soundRef.current.mute(isMuted);
    setMuted(isMuted);
  };

  const handleSeek = (e) => {
    if (!soundRef.current) return;
    const val = parseFloat(e.target.value);
    soundRef.current.seek(val);
    setProgress(val);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60) || 0;
    const s = Math.floor(secs % 60) || 0;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'var(--bg-base)' }}><span className="spinner spinner-lg"></span></div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger)' }}>{error}</div>;

  const chapters = book?.chapters?.length > 0 
    ? book.chapters 
    : (book?.fileUrl ? [{ title: 'Full Audio', url: book.fileUrl?.url || book.fileUrl }] : []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
        <button onClick={() => navigate('/dashboard/audio')} className="btn btn-outline" style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ fontWeight: 600 }}>Audio Player</div>
      </header>

      {/* Main Content Area - Scrollable */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem' }}>
        
        {/* Top Info Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', maxWidth: 600, width: '100%' }}>
          {/* Cover Art Box */}
          <div style={{ 
            width: 200, height: 200, 
            background: 'var(--bg-card)', 
            borderRadius: 'var(--radius-lg)', 
            boxShadow: 'var(--shadow-lg)',
            marginBottom: '1.5rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border-color)',
            overflow: 'hidden'
          }}>
            {book?.coverImage 
              ? <img src={book.coverImage?.url || book.coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: '3rem' }}>🎧</span>
            }
          </div>

          <h1 style={{ fontSize: '1.4rem', marginBottom: '0.25rem', textAlign: 'center', color: 'var(--text-primary)' }}>{book?.title}</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '2rem' }}>{book?.author}</p>

          {/* Player Controls Card */}
          <div className="glass-card" style={{ width: '100%', padding: '1.5rem', marginBottom: '2rem' }}>
            
            {/* Progress Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 40, textAlign: 'right' }}>{formatTime(progress)}</span>
              <input 
                type="range" 
                min="0" 
                max={duration || 100} 
                value={progress} 
                onChange={handleSeek}
                style={{ flex: 1, cursor: 'pointer', accentColor: 'var(--color-primary)' }} 
              />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', width: 40 }}>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
              <button onClick={toggleMute} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <button onClick={() => skip(-15)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <SkipBack size={28} />
              </button>
              
              <button 
                onClick={togglePlay} 
                style={{ 
                  width: 56, height: 56, 
                  borderRadius: '50%', background: 'var(--color-primary)', color: 'white',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                {playing ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 4 }} />}
              </button>
              
              <button onClick={() => skip(15)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
                <SkipForward size={28} />
              </button>
              
              <div style={{ width: 20 }} />
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div style={{ width: '100%', maxWidth: 600 }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            📜 Chapters
            <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>({chapters.length})</span>
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {chapters.map((ch, idx) => {
              const isActive = idx === currentChapterIndex;
              return (
                <button
                  key={idx}
                  onClick={() => playChapter(idx, chapters)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'rgba(255,56,92,0.08)' : 'var(--bg-card)',
                    border: isActive ? '1px solid var(--color-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  className="chapter-item"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: 24, height: 24, 
                      borderRadius: '50%', 
                      background: isActive ? 'var(--color-primary)' : 'var(--bg-surface)', 
                      color: isActive ? 'white' : 'var(--text-muted)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.75rem', fontWeight: 600
                    }}>
                      {isActive && playing ? <span style={{ display: 'flex', gap: 2 }}><span className="bar" /></span> : idx + 1}
                    </div>
                    <div style={{ fontWeight: isActive ? 600 : 500, color: isActive ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                      {ch.title}
                      {ch.isSample && <span className="badge badge-purple" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>Sample</span>}
                    </div>
                  </div>
                  {isActive && <div style={{ fontSize: '0.7rem', color: 'var(--color-primary)', fontWeight: 600 }}>Playing</div>}
                  {isAdmin && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(ch.url, '_blank');
                      }}
                      className="btn btn-sm btn-outline"
                      style={{ padding: '0.25rem', border: 'none', background: 'transparent' }}
                      title="Download Chapter"
                    >
                      <Download size={16} />
                    </button>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
