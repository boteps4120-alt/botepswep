"use client";

import { useId, useState } from "react";
import { courseCategoryTree } from "@/lib/data";

export function AdminCourseClassificationFields({
  initialCategory = "유단자 품새",
  initialPoomsae = "",
  initialOrientation = "landscape"
}: {
  initialCategory?: string;
  initialPoomsae?: string;
  initialOrientation?: "landscape" | "portrait";
}) {
  const listId = useId();
  const [category, setCategory] = useState(initialCategory);
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
        대분류
        <select className="select-input" name="category" value={category} onChange={(event) => changeCategory(event.target.value)}>
          {courseCategoryTree.map((item) => (
            <option key={item.name}>{item.name}</option>
          ))}
        </select>
      </label>
      <label className="field-label">
        하위 항목
        <input
          className="form-input"
          name="poomsae"
          list={listId}
          placeholder="예: 고려, 몸통막기, 앞굽이"
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
