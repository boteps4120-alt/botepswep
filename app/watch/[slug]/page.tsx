"use client";

import Link from "next/link";
import { CheckCircle2, Pause, Play, SkipBack, SkipForward } from "lucide-react";
import { courses, getCourse } from "@/lib/data";
import { useMemo, useState } from "react";

export default function WatchPage({ params }: { params: { slug: string } }) {
  const foundCourse = getCourse(params.slug);
  const course = foundCourse ?? courses[0];
  const [activeChapter, setActiveChapter] = useState(course.chapters[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completed, setCompleted] = useState(course.progress === 100);

  const nextCourse = useMemo(() => {
    const index = courses.findIndex((item) => item.slug === course.slug);
    return courses[(index + 1) % courses.length];
  }, [course.slug]);

  if (!foundCourse) {
    return (
      <section className="page-shell">
        <div className="page-title">
          <p className="eyebrow">강의 없음</p>
          <h1>강의를 찾을 수 없습니다</h1>
          <p>강의 목록에서 다시 선택해주세요.</p>
        </div>
      </section>
    );
  }

  const displayProgress = completed ? 100 : Math.max(course.progress, Math.round((activeChapter.seconds / 2400) * 100));

  return (
    <section className="page-shell">
      <div className="page-title">
        <p className="eyebrow">동작별 챕터 학습</p>
        <h1>{course.title}</h1>
        <p>{course.poomsae} 품새의 특정 동작으로 바로 이동하고 지도 포인트를 함께 확인합니다.</p>
      </div>

      <div className="watch-layout">
        <div>
          <div className="video-shell">
            <div className="fake-video">
              <div>
                <Play size={54} />
                <h2>{activeChapter.title}</h2>
                <p>{activeChapter.cue}</p>
              </div>
            </div>
            <div className="video-controls">
              <button className="icon-button light compact" onClick={() => setIsPlaying((value) => !value)}>
                {isPlaying ? <Pause size={17} /> : <Play size={17} />}
                <span>{isPlaying ? "일시정지" : "재생"}</span>
              </button>
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
              <span className="stat-label">재생속도</span>
              <strong>1.0x</strong>
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
            <button className="icon-button primary large" onClick={() => setCompleted(true)}>
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
                onClick={() => setActiveChapter(chapter)}
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
