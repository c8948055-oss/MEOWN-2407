import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  ChevronDown,
  ListMusic,
  Music,
  Sparkles
} from 'lucide-react';
import { AudioTrack } from '../types';

interface MiniRadioProps {
  tracks: AudioTrack[];
  onOpenAdminUpload?: () => void;
  isAdmin?: boolean;
}

export const MiniRadio: React.FC<MiniRadioProps> = ({ tracks, onOpenAdminUpload, isAdmin }) => {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentTrackIndex] || tracks[0];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    // When track changes, if it was playing, play new track
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => {
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn('Playback prevented or file error:', err);
          setIsPlaying(false);
        });
    }
  };

  const nextTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
  };

  const prevTrack = () => {
    if (tracks.length === 0) return;
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const targetTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = targetTime;
      setCurrentTime(targetTime);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!tracks || tracks.length === 0) return null;

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleTimeUpdate}
        onEnded={nextTrack}
        onError={() => {
          setIsPlaying(false);
        }}
      />

      {/* Floating Widget Positioned Bottom-Left to not block text */}
      <div className="fixed bottom-4 left-4 z-40">
        
        {/* COLLAPSED STATE: Minimal capsule/button */}
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#090d16]/95 border border-cyan-500/40 text-cyan-300 hover:text-white shadow-xl hover:bg-slate-900 transition-all cursor-pointer backdrop-blur-md group"
            title="Mở đài phát thanh MEOWN Radio"
          >
            <div className="relative flex items-center justify-center">
              <Radio className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              {isPlaying && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[11px] font-semibold tracking-tight text-white flex items-center gap-1">
                MEOWN Radio
                {isPlaying && <span className="text-[9px] text-cyan-400 font-mono">Đang phát</span>}
              </span>
              <span className="text-[10px] text-slate-400 max-w-[120px] truncate">
                {currentTrack?.title || 'Không gian êm dịu'}
              </span>
            </div>

            <span className="text-[10px] text-cyan-400/80 font-mono pl-1">▲</span>
          </button>
        ) : (
          /* EXPANDED STATE: Sleek futuristic audio player */
          <div className="w-[300px] sm:w-[320px] rounded-xl bg-[#0a0e17]/95 border border-slate-800/90 shadow-2xl backdrop-blur-lg overflow-hidden text-slate-200 animate-in fade-in slide-in-from-bottom-2 duration-200">
            
            {/* Header bar */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0e1422] border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2 font-mono">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-semibold text-slate-200">MEOWN-2407 RADIO</span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowPlaylist(!showPlaylist)}
                  className={`p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer ${
                    showPlaylist ? 'text-cyan-400' : 'text-slate-400 hover:text-white'
                  }`}
                  title="Danh sách bài hát"
                  aria-label="Danh sách bài hát"
                >
                  <ListMusic className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setIsCollapsed(true);
                    setShowPlaylist(false);
                  }}
                  className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Thu nhỏ đài radio"
                  aria-label="Thu nhỏ"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Track Info */}
            <div className="p-3.5 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="overflow-hidden">
                  <h4 className="text-sm font-bold text-white truncate">
                    {currentTrack?.title || 'Chưa chọn bài'}
                  </h4>
                  <p className="text-xs text-cyan-400/90 truncate mt-0.5">
                    {currentTrack?.artist || 'Nghệ sĩ Ngân Hà'}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center shrink-0">
                  <Music className="w-4 h-4 text-cyan-400" />
                </div>
              </div>

              {/* Progress Scrubber */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={prevTrack}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Bài trước"
                    aria-label="Bài trước"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="p-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md transition-transform active:scale-95 cursor-pointer"
                    title={isPlaying ? 'Tạm dừng' : 'Phát nhạc'}
                    aria-label={isPlaying ? 'Tạm dừng' : 'Phát'}
                  >
                    {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                  </button>

                  <button
                    onClick={nextTrack}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Bài kế tiếp"
                    aria-label="Bài kế tiếp"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Volume slider */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title={isMuted ? 'Bật âm thanh' : 'Tắt tiếng'}
                    aria-label="Âm lượng"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => {
                      setVolume(parseFloat(e.target.value));
                      setIsMuted(false);
                    }}
                    className="w-16 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>

              {/* Playlist drawer */}
              {showPlaylist && (
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1 max-h-40 overflow-y-auto pr-1">
                  <div className="text-[11px] font-mono text-slate-400 mb-1.5 px-1 flex items-center justify-between">
                    <span>DANH SÁCH BÀI HÁT ({tracks.length})</span>
                    {isAdmin && onOpenAdminUpload && (
                      <button
                        onClick={onOpenAdminUpload}
                        className="text-cyan-400 hover:underline flex items-center gap-1 text-[10px] cursor-pointer"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Thêm bài</span>
                      </button>
                    )}
                  </div>
                  {tracks.map((t, idx) => {
                    const isSelected = idx === currentTrackIndex;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setCurrentTrackIndex(idx);
                          setIsPlaying(true);
                        }}
                        className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-950/60 text-cyan-300 font-medium border border-cyan-800/30'
                            : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                      >
                        <div className="truncate">
                          <div className="truncate font-normal">{t.title}</div>
                          <div className="text-[10px] text-slate-500 truncate">{t.artist}</div>
                        </div>
                        {isSelected && isPlaying && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Admin helper hint */}
              {!showPlaylist && (
                <div className="pt-2 text-[10px] text-slate-500 text-center border-t border-slate-800/60">
                  {isAdmin ? 'Quản trị viên có thể tải lên bài hát MP3 mới.' : 'Đài thư giãn không gian MEOWN-2407'}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </>
  );
};
