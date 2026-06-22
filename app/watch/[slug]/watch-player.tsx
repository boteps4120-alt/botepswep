"use client";

import Link from "next/link";
import { CheckCircle2, Maximize2, Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from "lucide-react";
import { BookmarkButton } from "@/components/bookmark-button";
import type { Chapter, Course } from "@/lib/data";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveWatchProgress, trackCourseEvent } from "../actions";
import { EngagementPanel, type CourseComment } from "./engagement-panel";

type WatchPlayerProps = {
  course: Course;
  initialBookmarked?: boolean;
  initialComments?: CourseComment[];
  initialLiked?: boolean;
  initialLikeCount?: number;
  nextCourse: Course;
};

export function WatchPlayer({
  course,
  initialBookmarked = false,
  initialComments = [],
  initialLiked = false,
  initialLikeCount = 0,
  nextCourse
}: WatchPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const firstChapter = course.chapters[0] ?? { title: "강의 시작", time: "00:00", seconds: 0, cue: "영상을 재생해 학습을 시작하세요." };
  const [, startTransition] = useTransition();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [useEmbedFallback, setUseEmbedFallback] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [trackedPlayStart, setTrackedPlayStart] = useState(false);
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
        setVideoError("영상 원본을 직접 불러오지 못해 Gumlet 플레이어로 전환합니다.");
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
    persistProgress(Math.max(1, course.progress), firstChapter.seconds);
    // 시청 페이지 진입 시 이어보기 목록에 반영합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.slug]);

  function completeCourse() {
    persistProgress(100, Math.floor(currentTime || firstChapter.seconds), true);
  }

  function handlePlayStart() {
    setIsPlaying(true);

    if (trackedPlayStart) return;
    setTrackedPlayStart(true);
    startTransition(() => {
      void trackCourseEvent(course.slug, "play_start");
    });
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

  function seekToChapter(chapter: Chapter) {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = chapter.seconds;
    setCurrentTime(chapter.seconds);
  }

  function openFullscreen() {
    const video = videoRef.current;
    if (!video) return;
    void video.requestFullscreen?.();
  }

  function handleVideoError() {
    setVideoError("영상 원본을 직접 불러오지 못해 Gumlet 플레이어로 전환합니다.");
    if (course.embedUrl) setUseEmbedFallback(true);
  }

  return (
    <section className="page-shell watch-page-shell">
      <div className="watch-title-row">
        <div>
          <p className="eyebrow">강의 시청</p>
          <h1>{course.title}</h1>
          <p>{course.poomsae} 강의를 보면서 지도 포인트와 동작별 흐름을 확인합니다.</p>
        </div>
        <BookmarkButton slug={course.slug} initialBookmarked={initialBookmarked} size="large" />
      </div>

      <div className={`video-shell ${isPortrait ? "portrait" : "landscape"}`}>
        {course.videoUrl && !useEmbedFallback ? (
          <div className={`boteps-video-player ${isPortrait ? "portrait" : "landscape"}`}>
            <video
              className={`real-video ${isPortrait ? "portrait" : "landscape"}`}
              ref={videoRef}
              preload="metadata"
              playsInline
              onPlay={handlePlayStart}
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
              <h2>{firstChapter.title}</h2>
              <p>{firstChapter.cue}</p>
            </div>
          </div>
        )}
      </div>

      <div className="watch-action-row">
        <button className="icon-button subtle large" type="button">
          <SkipBack size={20} />
          <span>이전 강의</span>
        </button>
        <button className="icon-button primary large" type="button" onClick={completeCourse}>
          <CheckCircle2 size={20} />
          <span>강의 완료 처리</span>
        </button>
        <Link className="icon-button subtle large" href={`/watch/${nextCourse.slug}`}>
          <SkipForward size={20} />
          <span>다음 강의</span>
        </Link>
      </div>

      <EngagementPanel
        slug={course.slug}
        initialComments={initialComments}
        initialLiked={initialLiked}
        initialLikeCount={initialLikeCount}
      />

      {course.chapters.length > 0 ? (
        <section className="player-panel watch-chapter-panel">
          <div className="panel-heading-row">
            <h2>동작별 챕터</h2>
            <span>{course.chapters.length}개</span>
          </div>
          <div className="chapter-strip">
            {course.chapters.map((chapter) => (
              <button className="chapter-pill" key={`${chapter.time}-${chapter.title}`} type="button" onClick={() => seekToChapter(chapter)}>
                <strong>{chapter.time}</strong>
                <span>{chapter.title}</span>
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <div className="dashboard-grid watch-learning-grid">
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

      <section className="player-panel watch-deduction-panel">
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
