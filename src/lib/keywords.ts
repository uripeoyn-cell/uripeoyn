const STOP = new Set([
  "그리고",
  "그러나",
  "하지만",
  "또는",
  "있는",
  "없는",
  "하는",
  "위한",
  "통해",
  "대한",
  "관련",
  "이번",
  "우리",
  "아이디어",
  "사용",
  "이용",
  "제공",
  "포함",
  "가능",
  "필요",
  "방법",
  "장치",
  "시스템",
  "서비스",
  "플랫폼",
  "사용자",
  "고객",
  "문제",
  "해결",
  "제품",
  "사업",
  "기술",
  "발명",
  "특허",
  "있는",
  "하는",
  "되는",
  "위한",
  "것으로",
  "있도록",
  "합니다",
  "입니다",
  "했다",
  "한다",
  "있다",
  "없다",
  "이것",
  "그것",
  "저것",
  "우리",
  "내가",
  "저는",
  "그리고",
  "또한",
  "및",
  "등",
  "더",
  "또",
  "그",
  "이",
  "저",
  "수",
  "것",
  "앱",
]);

function stem(word: string): string {
  return word.replace(
    /(으로부터|에서부터|으로부터|으로써|으로서|이라고|라고|처럼|까지|부터|에서|에게|으로|로써|로서|은|는|이|가|을|를|의|에|와|과|도|만|께|한|할|함|됨|된|다)$/u,
    "",
  );
}

export function extractKeywords(title: string, body: string): string[] {
  const score = new Map<string, number>();
  const add = (raw: string, weight: number) => {
    const word = stem(raw.trim());
    if (word.length < 2 || word.length > 16) return;
    if (STOP.has(word)) return;
    if (!/[가-힣a-zA-Z0-9]/.test(word)) return;
    score.set(word, (score.get(word) ?? 0) + weight * (word.length > 3 ? 2 : 1));
  };

  const consume = (text: string, weight: number) => {
    const bits = text
      .replace(/[^\uac00-\ud7a3a-zA-Z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
    for (const bit of bits) add(bit, weight);
  };

  consume(title, 4);
  consume(body, 1);

  return [...score.entries()]
    .sort((a, b) => b[1] - a[1] || b[0].length - a[0].length)
    .slice(0, 4)
    .map(([word]) => word);
}
