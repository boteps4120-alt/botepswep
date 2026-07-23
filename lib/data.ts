export type Difficulty = "입문" | "초급" | "중급" | "고급" | "지도자";

export type Chapter = {
  title: string;
  time: string;
  seconds: number;
  cue: string;
};

export type CourseCategory = {
  name: string;
  items: string[];
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
  embedUrl?: string;
  videoOrientation?: "landscape" | "portrait";
  isPremium: boolean;
  progress: number;
  curriculum: string[];
  chapters: Chapter[];
  points: string[];
  mistakes: string[];
  deductions: string[];
};

export const courseCategoryTree: CourseCategory[] = [
  {
    name: "유급자 품새",
    items: ["1장", "2장", "3장", "4장", "5장", "6장", "7장", "8장"]
  },
  {
    name: "유단자 품새",
    items: ["고려", "금강", "태백", "평원", "십진", "지태", "천권", "한수", "일여"]
  },
  {
    name: "기본동작",
    items: ["아래막기", "몸통막기", "얼굴막기"]
  },
  {
    name: "서기",
    items: ["나란히서기", "앞서기", "앞굽이"]
  },
  {
    name: "품새 이론",
    items: ["품새 이론 1", "품새 이론 2", "품새 이론 3"]
  },
  {
    name: "쇼츠",
    items: ["쇼츠"]
  }
];

export const categories = ["전체", ...courseCategoryTree.map((category) => category.name)];

export function getSubcategories(category: string) {
  return courseCategoryTree.find((item) => item.name === category)?.items ?? [];
}

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
      "고려 품새를 특정 동작으로 바로 이동하며 지도 포인트, 박자, 시선, 감점 요소를 한 번에 정리합니다.",
    audience: "유단자반과 대회반을 운영하는 관장 및 사범",
    thumbnail: "/images/taekwondo-hero.png",
    videoUrl: "https://video.gumlet.io/6a30a6e756ebf5bb1c25e2f3/6a319009b02ffb1d837a7069/main.m3u8",
    embedUrl: "https://play.gumlet.io/embed/6a319009b02ffb1d837a7069",
    isPremium: false,
    progress: 65,
    curriculum: [
      "고려 품새의 지도 목표와 평가 기준",
      "1동작부터 10동작까지 방향 전환과 중심 이동",
      "11동작부터 20동작까지 박자와 연결",
      "지도자가 바로 쓸 수 있는 교정 멘트"
    ],
    chapters: [
      { title: "준비 자세와 첫 시선", time: "00:00", seconds: 0, cue: "시작 전 호흡과 긴장감 만들기" },
      { title: "1동작 손날막기", time: "02:18", seconds: 138, cue: "손날 높이와 앞굽이 간격 확인" },
      { title: "5동작 방향 전환", time: "08:44", seconds: 524, cue: "출발 위치와 골반 회전" },
      { title: "12동작 연결 박자", time: "18:12", seconds: 1092, cue: "급하게 끊기지 않는 리듬" },
      { title: "마무리 감점 체크", time: "35:30", seconds: 2130, cue: "시선, 손끝, 마지막 정지" }
    ],
    points: [
      "방향 전환 때 중심축을 먼저 세웁니다.",
      "손날막기는 팔꿈치 선을 살리고 어깨 힘을 뺍니다.",
      "마지막 정지는 2초 이상 안정적으로 유지합니다."
    ],
    mistakes: [
      "앞굽이 폭이 좁아 상체가 흔들립니다.",
      "시선이 손보다 늦게 따라갑니다.",
      "연결 동작에서 박자가 균일하지 않습니다."
    ],
    deductions: ["중심 이동 중 발 흔들림", "손끝 높이 불일치", "마지막 자세 흔들림"]
  },
  {
    slug: "taegeuk-8-classroom",
    title: "태극 8장 수업 운영 플랜",
    category: "유급자 품새",
    poomsae: "8장",
    instructor: "박서준 관장",
    duration: "34분",
    difficulty: "중급",
    popularity: 91,
    publishedAt: "2026-04-18",
    description:
      "수업 시간 안에 태극 8장의 핵심 동작을 설명하고 반복시키는 지도 순서와 체크 포인트를 제공합니다.",
    audience: "유급자 사범반을 운영하는 지도자",
    thumbnail: "/images/taekwondo-hero.png",
    isPremium: true,
    progress: 20,
    curriculum: ["수업 도입", "동작별 반복 루틴", "지도 피드백", "사범용 평가"],
    chapters: [
      { title: "수업 목표 설정", time: "00:00", seconds: 0, cue: "오늘 고칠 세 가지를 정합니다." },
      { title: "주춤서기 안정화", time: "05:10", seconds: 310, cue: "무릎 방향과 발 간격" },
      { title: "돌려차기 연결", time: "14:06", seconds: 846, cue: "상체 회전과 균형" },
      { title: "반복 지도 루틴", time: "27:40", seconds: 1660, cue: "3회 반복 후 즉시 피드백" }
    ],
    points: ["수업 목표를 한 문장으로 제시합니다.", "반복 때 매번 각도를 바꿔 보여줍니다.", "마지막 5분은 개인별 교정에 씁니다."],
    mistakes: ["설명이 길어져 반복 시간이 부족합니다.", "학생별 실수 기록이 남지 않습니다."],
    deductions: ["주춤서기 높이 불안정", "차기 연결 리듬 오류"]
  },
  {
    slug: "taebaek-expression",
    title: "태백 품새 표현력과 강약 조절",
    category: "유단자 품새",
    poomsae: "태백",
    instructor: "이현준 사범",
    duration: "28분",
    difficulty: "고급",
    popularity: 84,
    publishedAt: "2026-06-03",
    description:
      "태백 품새에서 점수 차이를 만드는 강약, 완급, 호흡, 시선 처리를 지도자 관점으로 정리합니다.",
    audience: "대회반 지도자와 선수반 사범",
    thumbnail: "/images/taekwondo-hero.png",
    videoUrl: "https://video.gumlet.io/6a30a6e756ebf5bb1c25e2f3/6a319026bf17ac22ca471941/main.m3u8",
    embedUrl: "https://play.gumlet.io/embed/6a319026bf17ac22ca471941",
    isPremium: true,
    progress: 0,
    curriculum: ["표현력 기준", "호흡과 시선", "강약 지도", "대회용 체크리스트"],
    chapters: [
      { title: "표현력 기준", time: "00:00", seconds: 0, cue: "점수화되는 표현 요소" },
      { title: "호흡 설계", time: "07:25", seconds: 445, cue: "정지와 폭발 구분" },
      { title: "시선 처리", time: "16:18", seconds: 978, cue: "다음 방향을 먼저 보여줍니다." }
    ],
    points: ["동작마다 에너지의 시작과 끝을 분리합니다.", "시선은 방향 전환보다 반 박자 빠르게 둡니다."],
    mistakes: ["모든 동작을 같은 속도로 수행합니다.", "기합 후 호흡이 무너집니다."],
    deductions: ["완급 부족", "시선 누락", "불안정한 손끝"]
  },
  {
    slug: "front-stance-correction",
    title: "앞굽이 실수 교정 클리닉",
    category: "서기",
    poomsae: "앞굽이",
    instructor: "정민호 관장",
    duration: "19분",
    difficulty: "입문",
    popularity: 77,
    publishedAt: "2026-03-12",
    description:
      "유급자부터 유단자까지 자주 무너지는 앞굽이의 무릎 방향, 체중 배분을 빠르게 고치는 수업 루틴입니다.",
    audience: "기본기 수업을 강화하려는 지도자",
    thumbnail: "/images/taekwondo-hero.png",
    isPremium: false,
    progress: 100,
    curriculum: ["문제 진단", "발 위치 교정", "체중 배분", "수업 적용"],
    chapters: [
      { title: "대표 실수", time: "00:00", seconds: 0, cue: "무릎과 발끝 방향" },
      { title: "폭 잡기", time: "04:40", seconds: 280, cue: "발 폭과 발 길이 기준" },
      { title: "수업 적용", time: "13:22", seconds: 802, cue: "전체반 교정 멘트" }
    ],
    points: ["무릎은 발끝 방향으로 둡니다.", "어깨 위치가 앞으로 쏠리지 않게 합니다.", "상체를 세운 뒤 이동합니다."],
    mistakes: ["앞무릎이 안쪽으로 말립니다.", "두 발의 각도가 과하게 벌어집니다."],
    deductions: ["중심 흔들림", "보폭 불균형"]
  },
  {
    slug: "low-block-basic",
    title: "아래막기 기본동작 지도법",
    category: "기본동작",
    poomsae: "아래막기",
    instructor: "김도윤 사범",
    duration: "16분",
    difficulty: "초급",
    popularity: 72,
    publishedAt: "2026-02-08",
    description:
      "유급자 수업에서 가장 많이 반복하는 아래막기의 준비 위치, 막는 선, 마무리 자세를 정리합니다.",
    audience: "초급반과 유급자반을 지도하는 사범",
    thumbnail: "/images/taekwondo-hero.png",
    isPremium: false,
    progress: 35,
    curriculum: ["준비 손 위치", "막는 선 만들기", "허리 회전", "반복 교정"],
    chapters: [
      { title: "준비 손 위치", time: "00:00", seconds: 0, cue: "반대 손이 먼저 올라갑니다." },
      { title: "막는 선", time: "03:05", seconds: 185, cue: "허벅지 바깥쪽으로 정리" },
      { title: "교정 루틴", time: "11:30", seconds: 690, cue: "2인 1조 피드백" }
    ],
    points: ["팔만 쓰지 않고 허리 회전을 같이 씁니다.", "마무리 손목 높이를 일정하게 맞춥니다."],
    mistakes: ["손이 몸 중앙을 벗어납니다.", "어깨에 힘이 과하게 들어갑니다."],
    deductions: ["막는 선 불명확", "마무리 손목 높이 불일치"]
  },
  {
    slug: "poomsae-theory-1",
    title: "품새 이론 1: 수업 목표 세우기",
    category: "품새 이론",
    poomsae: "품새 이론 1",
    instructor: "박서준 관장",
    duration: "22분",
    difficulty: "입문",
    popularity: 68,
    publishedAt: "2026-01-22",
    description:
      "품새 수업을 단순 반복이 아니라 목표와 피드백이 있는 수업으로 구성하는 기본 이론입니다.",
    audience: "품새 수업 구조를 만들고 싶은 관장 및 사범",
    thumbnail: "/images/taekwondo-hero.png",
    isPremium: true,
    progress: 0,
    curriculum: ["수업 목표", "관찰 기준", "피드백 문장", "기록 방법"],
    chapters: [
      { title: "목표 설정", time: "00:00", seconds: 0, cue: "오늘의 품새 수업 기준" },
      { title: "관찰 기준", time: "06:20", seconds: 380, cue: "발, 손, 시선 순서로 봅니다." },
      { title: "피드백 기록", time: "15:10", seconds: 910, cue: "다음 수업으로 이어지는 기록" }
    ],
    points: ["한 수업에 고칠 기준을 2개 이하로 줄입니다.", "칭찬과 교정을 같은 기준으로 연결합니다."],
    mistakes: ["지도 기준이 매번 달라집니다.", "학생이 무엇을 고쳐야 하는지 모릅니다."],
    deductions: ["평가 기준 부재", "반복 목적 불명확"]
  }
];

export const currentUser = {
  name: "보텝스 관장",
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
