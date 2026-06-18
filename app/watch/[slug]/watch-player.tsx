"use client";

import Link from "next/link";
import { CheckCircle2, Play, SkipBack, SkipForward } from "lucide-react";
import type { Course } from "@/lib/data";
import { useEffect, useRef, useState, useTransition } from "react";
import { saveWatchProgress } from "../actions";

type WatchPlayerProps = {
  course: Course;
  nextCourse: Course;
};

export function WatchPlayer({ course, nextCourse }: WatchPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [activeChapter, setActiveChapter] = useState(course.chapters[0]);
  const [completed, setCompleted] = useState(course.progress === 100);
  const [, startTransition] = useTransition();
  const displayProgress = completed ? 100 : Math.max(course.progress, Math.round((activeChapter.seconds / 2400) * 100));

  function persistProgress(progressPercent: number, seconds = 0, isCompleted = false) {
    startTransition(() => {
      void saveWatchProgress(course.slug, progressPercent, seconds, isCompleted);
    });
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !course.videoUrl) return;

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
      hls.loadSource(course.videoUrl!);
      hls.attachMedia(videoRef.current);
    });

    return () => {
      hls?.destroy();
    };
  }, [course.videoUrl]);

  useEffect(() => {
    persistProgress(Math.max(1, course.progress), activeChapter.seconds);
    // 시청 페이지 진입 시 이어보기 목록에 반영합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course.slug]);

  function selectChapter(chapter: Course["chapters"][number]) {
    setActiveChapter(chapter);
    const nextProgress = Math.max(1, Math.round((chapter.seconds / 2400) * 100));
    persistProgress(nextProgress, chapter.seconds);
  }

  function completeCourse() {
    setCompleted(true);
    persistProgress(100, activeChapter.seconds, true);
  }

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">동작별 챕터 학습</p>
        <h1>{course.title}</h1>
        <p>{course.poomsae} 품새를 특정 동작으로 바로 이동하며 지도 포인트를 확인합니다.</p>
      </div>

      <div className="watch-layout">
        <div>
          <div className="video-shell">
            {course.embedUrl ? (
              <iframe
                className="real-video"
                src={course.embedUrl}
                title={`${course.title} 영상`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
              />
            ) : course.videoUrl ? (
              <video className="real-video" ref={videoRef} controls preload="metadata" playsInline />
            ) : (
              <div className="fake-video">
                <div>
                  <Play size={54} />
                  <h2>{activeChapter.title}</h2>
                  <p>{activeChapter.cue}</p>
                </div>
              </div>
            )}
            <div className="video-controls">
              <span className="chapter-time">{activeChapter.time}</span>
              <div className="progress-track" aria-label={`진도율 ${displayProgress}%`}>
                <div className="progress-bar" style={{ width: `${displayProgress}%` }} />
              </div>
              <strong>{displayProgress}%</strong>
            </div>
          </div>

          <div className="metric-grid" style={{ marginTop: 20 }}>
            <div className="metric-card">
              <span className="stat-label">이어보기</span>
              <strong>{activeChapter.time}</strong>
            </div>
            <div className="metric-card">
              <span className="stat-label">영상 소스</span>
              <strong>{course.videoUrl ? "업로드 영상" : "더미 플레이어"}</strong>
            </div>
            <div className="metric-card">
              <span className="stat-label">완료 상태</span>
              <strong>{completed ? "완료" : "진행 중"}</strong>
            </div>
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

        <aside className="player-panel">
          <h2>챕터</h2>
          <div className="chapter-list">
            {course.chapters.map((chapter) => (
              <button
                key={chapter.title}
                className={`chapter-button ${chapter.title === activeChapter.title ? "active" : ""}`}
                onClick={() => selectChapter(chapter)}
              >
                <span className="chapter-time">{chapter.time}</span>
                <span>
                  <strong>{chapter.title}</strong>
                  <small className="small-muted">{chapter.cue}</small>
                </span>
              </button>
            ))}
          </div>
        </aside>
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
