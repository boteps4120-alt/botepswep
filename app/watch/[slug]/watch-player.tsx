"use client";

import Link from "next/link";
import { CheckCircle2, Maximize2, Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import type { Course } from "@/lib/data";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveWatchProgress } from "../actions";

type WatchPlayerProps = {
  course: Course;
  initialBookmarked?: boolean;
  nextCourse: Course;
};

export function WatchPlayer({ course, initialBookmarked = false, nextCourse }: WatchPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const activeChapter = course.chapters[0];
  const [, startTransition] = useTransition();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);
  const [videoError, setVideoError] = useState("");
  const isPortrait = course.videoOrientation === "portrait";
  const progressValue = duration > 0 ? (currentTime / duration) * 100 : 0;

  function formatTime(seconds: number) {
    if (!Number.isFinite(seconds)) return "0:00";
    const safeSeconds = Math.max(0, Math.floor(seconds));
    const minutes = Math.floor(safeSeconds / 60);
    const rest = String(safeSeconds % 60).padStart(2, "0");
    return `${minutes}:${rest}`;
  }

  function persistProgress(progressPercent: number, seconds = 0, isCompleted = false) {
    startTransition(() => {
      void saveWatchProgress(course.slug, progressPercent, seconds, isCompleted);
    });
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !course.videoUrl || useEmbedFallback) return;

    setVideoError("");

    if (!course.videoUrl.endsWith(".m3u8")) {
      video.src = course.videoUrl;
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = course.videoUrl;
      return;
    }

    let hls: import("hls.js").default | null = null;

    import("hls.js").then(({ default: Hls }) => {
      if (!videoRef.current || !Hls.isSupported()) return;
      hls = new Hls();
      hls.on(Hls.Events.ERROR, (_, data) => {
        if (!data.fatal) return;
        setVideoError("Gumlet HLS 원본에 접근할 수 없습니다. 영상의 HLS 공개/처리 상태를 확인해주세요.");
        if (course.embedUrl) setUseEmbedFallback(true);
      });
      hls.loadSource(course.videoUrl!);
      hls.attachMedia(videoRef.current);
    });

    return () => {
      hls?.destroy();
    };
  }, [course.embedUrl, course.videoUrl, useEmbedFallback]);

  useEffect(() => {
    persistProgress(Math.max(1, course.progress), activeChapter.seconds);
    // 시청 페이지 진입 시 이어보기 목록에 반영합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.slug]);

  function completeCourse() {
    persistProgress(100, activeChapter.seconds, true);
  }

  function togglePlayback() {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      return;
    }

    video.pause();
  }

  function skipSeconds(seconds: number) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || video.currentTime + seconds);
  }

  function seekToPercent(value: string) {
    const video = videoRef.current;
    if (!video || !duration) return;
    const nextTime = (Number(value) / 100) * duration;
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
  }

  function openFullscreen() {
    const video = videoRef.current;
    if (!video) return;
    void video.requestFullscreen?.();
  }

  function handleVideoError() {
    setVideoError("영상 원본을 불러오지 못했습니다. Gumlet HLS URL 또는 영상 처리 상태를 확인해주세요.");
    if (course.embedUrl) setUseEmbedFallback(true);
  }

  return (
    <section className="page-shell watch-page-shell">
      <div className="page-title">
        <p className="eyebrow">강의 시청</p>
        <h1>{course.title}</h1>
        <p>{course.poomsae} 품새 영상을 크게 보며 지도 포인트를 확인합니다.</p>
        <div className="form-actions">
          <BookmarkButton slug={course.slug} initialBookmarked={initialBookmarked} size="large" />
        </div>
      </div>

      <div className="watch-layout">
        <div>
          <div className={`video-shell ${isPortrait ? "portrait" : "landscape"}`}>
            {course.videoUrl && !useEmbedFallback ? (
              <div className={`boteps-video-player ${isPortrait ? "portrait" : "landscape"}`}>
                <video
                  className={`real-video ${isPortrait ? "portrait" : "landscape"}`}
                  ref={videoRef}
                  preload="metadata"
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
                  onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
                  onError={handleVideoError}
                />
                {videoError ? <p className="video-error">{videoError}</p> : null}
                <div className="boteps-video-controls" aria-label="영상 컨트롤">
                  <div className="video-time-row">
                    <span>{formatTime(currentTime)}</span>
                    <input
                      aria-label="영상 위치"
                      className="video-range"
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={progressValue}
                      onChange={(event) => seekToPercent(event.target.value)}
                    />
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="video-control-row">
                    <button className="video-control-button" type="button" onClick={() => skipSeconds(-5)}>
                      <RotateCcw size={20} />
                      <span>5초</span>
                    </button>
                    <button className="video-play-button" type="button" onClick={togglePlayback}>
                      {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                      <span>{isPlaying ? "일시정지" : "재생"}</span>
                    </button>
                    <button className="video-control-button" type="button" onClick={() => skipSeconds(5)}>
                      <RotateCw size={20} />
                      <span>5초</span>
                    </button>
                    <button className="video-control-button icon-only" type="button" onClick={openFullscreen} aria-label="전체 화면">
                      <Maximize2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ) : course.embedUrl ? (
              <div className={`boteps-video-player ${isPortrait ? "portrait" : "landscape"}`}>
                {videoError ? <p className="video-error">{videoError} 임시로 Gumlet 임베드 플레이어로 재생합니다.</p> : null}
                <iframe
                  className={`real-video ${isPortrait ? "portrait" : "landscape"}`}
                  src={course.embedUrl}
                  title={`${course.title} 영상`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="fake-video">
                <div>
                  <Play size={54} />
                  <h2>{activeChapter.title}</h2>
                  <p>{activeChapter.cue}</p>
                </div>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="icon-button subtle large">
              <SkipBack size={20} />
              <span>이전 강의</span>
            </button>
            <button className="icon-button primary large" onClick={completeCourse}>
              <CheckCircle2 size={20} />
              <span>강의 완료 처리</span>
            </button>
            <Link className="icon-button subtle large" href={`/watch/${nextCourse.slug}`}>
              <SkipForward size={20} />
              <span>다음 강의</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ marginTop: 24 }}>
        <section className="player-panel">
          <h2>핵심 포인트</h2>
          <ul className="bullet-list">
            {course.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </section>
        <section className="player-panel">
          <h2>자주 하는 실수</h2>
          <ul className="bullet-list">
            {course.mistakes.map((mistake) => (
              <li key={mistake}>{mistake}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="player-panel" style={{ marginTop: 24 }}>
        <h2>감점 요소</h2>
        <ul className="bullet-list">
          {course.deductions.map((deduction) => (
            <li key={deduction}>{deduction}</li>
          ))}
        </ul>
      </section>
    </section>
  );
}
