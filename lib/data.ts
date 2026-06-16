export type Difficulty = "입문" | "중급" | "상급" | "지도자";

export type Chapter = {
  title: string;
  time: string;
  seconds: number;
  cue: string;
};

export type Course = {
  slug: string;
  title: string;
  category: string;
  poomsae: string;
  instructor: string;
  duration: string;
  difficulty: Difficulty;
  popularity: number;
  publishedAt: string;
  description: string;
  audience: string;
  thumbnail: string;
  videoUrl?: string;
  isPremium: boolean;
  progress: number;
  curriculum: string[];
  chapters: Chapter[];
  points: string[];
  mistakes: string[];
  deductions: string[];
};

export const categories = [
  "전체",
  "태극 품새",
  "유단자 품새",
  "경기 품새",
  "품새 이론",
  "표현력",
  "실수 교정"
];

export const courses: Course[] = [
  {
    slug: "koryo-poomsae-master",
    title: "고려 품새 지도자 마스터 클래스",
    category: "유단자 품새",
    poomsae: "고려",
    instructor: "김도윤 사범",
    duration: "42분",
    difficulty: "지도자",
    popularity: 98,
    publishedAt: "2026-05-21",
    description:
      "유단자 수련생에게 고려 품새를 지도할 때 필요한 동작 분해, 박자, 시선, 감점 포인트를 한 번에 정리합니다.",
    audience: "승단 심사반과 대회반을 운영하는 관장/사범",
    thumbnail: "/images/taekwondo-hero.png",
    videoUrl: "https://video.gumlet.io/6a30a6e756ebf5bb1c25e2f3/6a319009b02ffb1d837a7069/main.m3u8",
    isPremium: false,
    progress: 65,
    curriculum: [
      "고려 품새의 지도 목표와 심사 기준",
      "1동작부터 10동작까지 방향 전환과 중심 이동",
      "11동작부터 20동작까지 손기술 연결",
      "지도자가 바로 쓸 수 있는 교정 멘트"
    ],
    chapters: [
      { title: "준비 자세와 첫 시선", time: "00:00", seconds: 0, cue: "시작 전 호흡과 긴장감 만들기" },
      { title: "1동작 손날막기", time: "02:18", seconds: 138, cue: "막기 높이와 앞굽이 간격 확인" },
      { title: "5동작 방향 전환", time: "08:44", seconds: 524, cue: "축발 위치와 골반 회전" },
      { title: "12동작 연결 박자", time: "18:12", seconds: 1092, cue: "급하게 끊기지 않는 리듬" },
      { title: "마무리 감점 체크", time: "35:30", seconds: 2130, cue: "시선, 손끝, 마지막 정지" }
    ],
    points: ["방향 전환 전 중심을 낮춘다", "손날막기는 어깨 힘을 빼고 끝을 세운다", "마지막 정지는 2초 이상 안정적으로 유지한다"],
    mistakes: ["앞굽이 폭이 좁아져 상체가 흔들림", "시선이 손보다 늦게 따라감", "연결 동작에서 박자가 균일하지 않음"],
    deductions: ["중심 이동 중 발 끌림", "손끝 높이 불일치", "마지막 자세 흔들림"]
  },
  {
    slug: "taegeuk-8-classroom",
    title: "태극 8장 수업 운영 플랜",
    category: "태극 품새",
    poomsae: "태극 8장",
    instructor: "박서연 관장",
    duration: "34분",
    difficulty: "중급",
    popularity: 91,
    publishedAt: "2026-04-18",
    description:
      "수업 시간 안에 태극 8장의 핵심 동작을 설명하고 반복시키는 지도 순서와 체크 포인트를 제공합니다.",
    audience: "유급자 심사반을 운영하는 지도자",
    thumbnail: "/images/taekwondo-hero.png",
    isPremium: true,
    progress: 20,
    curriculum: ["수업 도입", "동작별 반복 루틴", "짝 연습 피드백", "심사 전 점검"],
    chapters: [
      { title: "수업 목표 설정", time: "00:00", seconds: 0, cue: "오늘 고칠 한 가지를 정한다" },
      { title: "주춤서기 안정화", time: "05:10", seconds: 310, cue: "무릎 방향과 발 간격" },
      { title: "팔굽 표적 동작", time: "14:06", seconds: 846, cue: "상체 회전과 타점" },
      { title: "반복 지도 루틴", time: "27:40", seconds: 1660, cue: "3회 반복 후 즉시 피드백" }
    ],
    points: ["수업 목표를 한 문장으로 제시", "반복 전 시범 각도를 바꿔 보여주기", "마지막 5분은 개인별 교정"],
    mistakes: ["설명이 길어져 반복 시간이 부족함", "학생별 실수 기록이 남지 않음"],
    deductions: ["주춤서기 높이 불안정", "팔굽 동작 타점 오류"]
  },
  {
    slug: "taebaek-expression",
    title: "태백 품새 표현력과 강약 조절",
    category: "표현력",
    poomsae: "태백",
    instructor: "이현준 사범",
    duration: "28분",
    difficulty: "상급",
    popularity: 84,
    publishedAt: "2026-06-03",
    description:
      "태백 품새에서 점수 차이를 만드는 강약, 완급, 호흡, 시선 처리를 지도자 관점으로 정리합니다.",
    audience: "대회반 지도자와 선수반 사범",
    thumbnail: "/images/taekwondo-hero.png",
    videoUrl: "https://video.gumlet.io/6a30a6e756ebf5bb1c25e2f3/6a319026bf17ac22ca471941/main.m3u8",
    isPremium: true,
    progress: 0,
    curriculum: ["표현력 기준", "호흡과 시선", "강약 지도", "대회 전 체크리스트"],
    chapters: [
      { title: "표현력 기준", time: "00:00", seconds: 0, cue: "점수화되는 표현 요소" },
      { title: "호흡 설계", time: "07:25", seconds: 445, cue: "정지와 폭발을 구분" },
      { title: "시선 처리", time: "16:18", seconds: 978, cue: "다음 방향을 먼저 보여준다" }
    ],
    points: ["동작마다 에너지의 시작과 끝을 분리", "시선은 방향 전환보다 반 박자 빠르게"],
    mistakes: ["모든 동작을 같은 속도로 수행", "기합 전 호흡이 무너짐"],
    deductions: ["완급 부재", "시선 누락", "불필요한 어깨 힘"]
  },
  {
    slug: "front-stance-correction",
    title: "앞굽이 실수 교정 클리닉",
    category: "실수 교정",
    poomsae: "공통 동작",
    instructor: "정민호 관장",
    duration: "19분",
    difficulty: "입문",
    popularity: 77,
    publishedAt: "2026-03-12",
    description:
      "유급자부터 유단자까지 자주 무너지는 앞굽이 폭, 무릎 방향, 체중 배분을 빠르게 고치는 수업용 클리닉입니다.",
    audience: "기본기 수업을 강화하려는 지도자",
    thumbnail: "/images/taekwondo-hero.png",
    isPremium: false,
    progress: 100,
    curriculum: ["문제 진단", "발 위치 교정", "체중 배분", "수업 적용"],
    chapters: [
      { title: "대표 실수", time: "00:00", seconds: 0, cue: "무릎과 발끝 방향" },
      { title: "폭 잡기", time: "04:40", seconds: 280, cue: "발 한 개 반 기준" },
      { title: "수업 적용", time: "13:22", seconds: 802, cue: "전체반 교정 멘트" }
    ],
    points: ["무릎은 발끝 방향으로", "뒤꿈치가 들리지 않게", "상체는 세워서 이동"],
    mistakes: ["앞무릎이 안쪽으로 말림", "뒷발 각도가 과하게 열림"],
    deductions: ["중심 흔들림", "보폭 불균형"]
  }
];

export const currentUser = {
  name: "한빛태권도장",
  role: "관리자",
  email: "master@boteps.test",
  subscription: "구독 중",
  renewsAt: "2026.07.16",
  isSubscribed: true,
  isAdmin: true
};

export const payments = [
  { id: "BTP-202606", date: "2026.06.16", amount: "9,900원", status: "결제 완료", method: "Toss Payments" },
  { id: "BTP-202605", date: "2026.05.16", amount: "9,900원", status: "결제 완료", method: "Stripe" }
];

export function getCourse(slug: string) {
  return courses.find((course) => course.slug === slug);
}

export function relatedCourses(slug: string) {
  const active = getCourse(slug);
  return courses.filter((course) => course.slug !== slug && course.category === active?.category).slice(0, 2);
}
