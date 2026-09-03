"use client";

import { useId, useState } from "react";
import { courseCategoryTree, curriculumPrograms, getCurriculumProgramCode } from "@/lib/data";

function normalizeCategory(category: string) {
  if (courseCategoryTree.some((item) => item.name === category)) return category;
  return getCurriculumProgramCode({ category, poomsae: "", title: "" });
}

function categoryLabel(category: string) {
  const program = curriculumPrograms.find((item) => item.code === category);
  return program ? `${program.code} ${program.title}` : category;
}

export function AdminCourseClassificationFields({
  initialCategory = "COURSE 01",
  initialPoomsae = "",
  initialOrientation = "landscape"
}: {
  initialCategory?: string;
  initialPoomsae?: string;
  initialOrientation?: "landscape" | "portrait";
}) {
  const listId = useId();
  const [category, setCategory] = useState(() => normalizeCategory(initialCategory));
  const [poomsae, setPoomsae] = useState(initialPoomsae);
  const [orientation, setOrientation] = useState(initialOrientation);

  function changeCategory(nextCategory: string) {
    setCategory(nextCategory);
    if (nextCategory === "쇼츠") {
      setPoomsae("쇼츠");
      setOrientation("portrait");
    } else if (category === "쇼츠" && poomsae === "쇼츠") {
      setPoomsae("");
    }
  }

  const subcategories = courseCategoryTree.find((item) => item.name === category)?.items ?? [];

  return (
    <>
      <label className="field-label">
        교육과정 분류
        <select className="select-input" name="category" value={category} onChange={(event) => changeCategory(event.target.value)}>
          {courseCategoryTree.map((item) => (
            <option key={item.name} value={item.name}>{categoryLabel(item.name)}</option>
          ))}
        </select>
      </label>
      <label className="field-label">
        세부 주제
        <input
          className="form-input"
          name="poomsae"
          list={listId}
          placeholder="예: 품새의 정의, 고려, 지도법"
          value={poomsae}
          onChange={(event) => setPoomsae(event.target.value)}
          readOnly={category === "쇼츠"}
          required
        />
      </label>
      <datalist id={listId}>
        {subcategories.map((item) => (
          <option key={item} value={item} />
        ))}
      </datalist>
      <label className="field-label">
        영상 비율
        <select
          className="select-input"
          name="videoOrientation"
          value={orientation}
          onChange={(event) => setOrientation(event.target.value as "landscape" | "portrait")}
        >
          <option value="landscape">가로 영상</option>
          <option value="portrait">세로 영상</option>
        </select>
      </label>
    </>
  );
}
