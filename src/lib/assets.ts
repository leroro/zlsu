/**
 * public 폴더의 에셋 경로를 반환합니다.
 * 개발 서버와 빌드 환경 모두에서 동작합니다.
 *
 * @example
 * import { asset } from '../lib/assets';
 * <img src={asset('images/logo.svg')} />
 */
export const asset = (path: string): string => {
  return `${import.meta.env.BASE_URL}${path}`;
};
