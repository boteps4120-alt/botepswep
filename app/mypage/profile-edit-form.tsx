"use client";

import { type FormEvent, useActionState, useState } from "react";
import { Save, X } from "lucide-react";
import { updateMyProfile } from "./actions";

type ProfileEditFormProps = {
  fullName: string;
  birthDate: string;
  formattedBirthDate: string;
  gender: string;
  genderLabel: string;
  phone: string;
  address: string;
  accountEmail: string;
};

const initialState = {
  message: ""
};

function toBirthDigits(value: string) {
  return value ? value.replace(/\D/g, "") : "";
}

function valueOrDash(value: string) {
  return value.trim() ? value : "-";
}

export function ProfileEditForm({
  fullName,
  birthDate,
  formattedBirthDate,
  gender,
  genderLabel,
  phone,
  address,
  accountEmail
}: ProfileEditFormProps) {
  const [state, action, pending] = useActionState(updateMyProfile, initialState);
  const [isEditing, setIsEditing] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const form = event.currentTarget;
    const formData = new FormData(form);
    const birthDateValue = String(formData.get("birthDate") ?? "").trim();
    const phoneValue = String(formData.get("phone") ?? "").trim();

    if (!/^\d{8}$/.test(birthDateValue)) {
      event.preventDefault();
      alert("생년월일은 8자리 숫자로 입력해주세요.");
      const input = form.elements.namedItem("birthDate");
      if (input instanceof HTMLElement) input.focus();
      return;
    }

    if (!/^\d+$/.test(phoneValue)) {
      event.preventDefault();
      alert("핸드폰 번호는 숫자로 입력해주세요.");
      const input = form.elements.namedItem("phone");
      if (input instanceof HTMLElement) input.focus();
    }
  }

  if (!isEditing) {
    return (
      <section className="player-panel">
        <div className="profile-section-heading">
          <h2>회원정보</h2>
          <button className="icon-button subtle" onClick={() => setIsEditing(true)} type="button">
            회원정보 변경
          </button>
        </div>
        <div className="profile-info-grid">
          <div className="profile-info-item">
            <span>이름</span>
            <strong>{valueOrDash(fullName)}</strong>
          </div>
          <div className="profile-info-item">
            <span>아이디</span>
            <strong>{accountEmail}</strong>
          </div>
          <div className="profile-info-item">
            <span>생년월일</span>
            <strong>{formattedBirthDate}</strong>
          </div>
          <div className="profile-info-item">
            <span>성별</span>
            <strong>{genderLabel}</strong>
          </div>
          <div className="profile-info-item">
            <span>전화번호</span>
            <strong>{valueOrDash(phone)}</strong>
          </div>
          <div className="profile-info-item wide">
            <span>주소</span>
            <strong>{valueOrDash(address)}</strong>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="player-panel">
      <div className="profile-section-heading">
        <h2>회원정보</h2>
        <button className="icon-button subtle" onClick={() => setIsEditing(false)} type="button">
          <X size={18} />
          <span>취소</span>
        </button>
      </div>
      <form action={action} className="form-grid profile-edit-form" onSubmit={handleSubmit}>
        <label className="field-label">
          이름
          <input className="form-input" name="fullName" defaultValue={fullName} placeholder="이름" autoComplete="name" required />
        </label>
        <label className="field-label">
          생년월일
          <input
            className="form-input"
            name="birthDate"
            defaultValue={toBirthDigits(birthDate)}
            placeholder="19950101"
            inputMode="numeric"
            maxLength={8}
            autoComplete="bday"
            required
          />
        </label>
        <label className="field-label">
          성별
          <select className="select-input" name="gender" defaultValue={gender} required>
            <option value="" disabled>
              성별 선택
            </option>
            <option value="male">남성</option>
            <option value="female">여성</option>
          </select>
        </label>
        <label className="field-label">
          전화번호
          <input className="form-input" name="phone" defaultValue={phone} placeholder="01012345678" inputMode="numeric" autoComplete="tel" required />
        </label>
        <label className="field-label form-span">
          주소
          <input className="form-input" name="address" defaultValue={address} placeholder="주소" autoComplete="street-address" required />
        </label>

        {state.message ? <p className="form-message form-span">{state.message}</p> : null}

        <div className="form-actions form-span">
          <button className="icon-button primary large" disabled={pending}>
            <Save size={20} />
            <span>{pending ? "저장 중" : "회원정보 저장"}</span>
          </button>
        </div>
      </form>
    </section>
  );
}
