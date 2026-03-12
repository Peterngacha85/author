import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Howl } from 'howler';
import { Play, Pause, SkipBack, SkipForward, ArrowLeft, Volume2, VolumeX } from 'lucide-react';
import API from '../../api/axios';

export default function AudioPlayer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);

  const soundRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    API.get(`/books/${id}`)
      .then(res => {
        setBook(res.data);
        // Initialize Howler instance
        soundRef.current = new Howl({
          src: [res.data.fileUrl?.url || res.data.fileUrl],
          html5: true, // Force HTML5 Audio to allow streaming large files seamlessly
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

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-base)' }}>
      {/* Header */}
      <header style={{ display: 'flex', alignItems: 'center', padding: '1rem', background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-color)', gap: '1rem' }}>
        <button onClick={() => navigate('/dashboard/audio')} className="btn btn-outline" style={{ padding: '0.5rem', border: 'none', background: 'transparent' }}>
          <ArrowLeft size={20} />
        </button>
        <div style={{ fontWeight: 600 }}>Audio Player</div>
      </header>

      {/* Main Player Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        {/* Cover Art Box */}
        <div style={{ 
          width: 250, height: 250, 
          background: 'var(--bg-card)', 
          borderRadius: 'var(--radius-lg)', 
          boxShadow: 'var(--shadow-lg)',
          marginBottom: '2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid var(--border-color)',
          overflow: 'hidden'
        }}>
          {book?.coverImage 
            ? <img src={book.coverImage} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: '4rem' }}>🎧</span>
          }
        </div>

        {/* Track Info */}
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', textAlign: 'center', color: 'var(--text-primary)' }}>{book?.title}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '3rem' }}>{book?.author}</p>

        {/* Player Controls Card */}
        <div className="glass-card" style={{ width: '100%', maxWidth: 500, padding: '2rem' }}>
          
          {/* Progress Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2rem' }}>
            <button onClick={toggleMute} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
              {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            
            <button onClick={() => skip(-15)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <SkipBack size={32} />
            </button>
            
            <button 
              onClick={togglePlay} 
              style={{ 
                width: 64, height: 64, 
                borderRadius: '50%', background: 'var(--color-primary)', color: 'white',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              {playing ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 4 }} />}
            </button>
            
            <button onClick={() => skip(15)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}>
              <SkipForward size={32} />
            </button>
            
            <div style={{ width: 24 }} /> {/* Balance space */}
          </div>
        </div>
      </div>
    </div>
  );
}
