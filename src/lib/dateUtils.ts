import KoreanLunarCalendar from 'korean-lunar-calendar';

/**
 * 음력 날짜를 해당 연도의 양력 날짜로 변환
 * @param lunarMonth 음력 월
 * @param lunarDay 음력 일
 * @param year 연도 (기본값: 현재 연도)
 * @returns { month: 양력 월, day: 양력 일 }
 */
export function lunarToSolar(lunarMonth: number, lunarDay: number, year?: number): { month: number; day: number } {
  const targetYear = year ?? new Date().getFullYear();
  const calendar = new KoreanLunarCalendar();

  // 음력 날짜 설정 (윤달 아님)
  calendar.setLunarDate(targetYear, lunarMonth, lunarDay, false);

  // getSolarCalendar()는 { year, month, day } 객체를 반환
  const solar = calendar.getSolarCalendar();

  return {
    month: solar.month,
    day: solar.day
  };
}

/**
 * 생년월일 문자열에서 월/일 추출
 * @param birthDate YYYY-MM-DD 형식의 생년월일
 * @returns { month: 월, day: 일 }
 */
export function extractMonthDay(birthDate: string): { month: number; day: number } {
  const parts = birthDate.split('-');
  return {
    month: parseInt(parts[1], 10),
    day: parseInt(parts[2], 10)
  };
}

/**
 * 음력 생일을 올해 양력 날짜로 변환하여 반환
 * @param birthDate YYYY-MM-DD 형식의 생년월일 (음력 기준)
 * @returns { month: 양력 월, day: 양력 일 }
 */
export function getLunarBirthdayAsSolar(birthDate: string): { month: number; day: number } {
  const { month, day } = extractMonthDay(birthDate);
  return lunarToSolar(month, day);
}
