export function CommentBlock({ text }: { text: string }) {
  return (
    <div className="text-[0.76em] text-ink-5 border-l-2 border-line-strong pl-3 my-3">{text}</div>
  );
}
