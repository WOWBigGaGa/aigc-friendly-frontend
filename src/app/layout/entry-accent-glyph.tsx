// src/app/layout/entry-accent-glyph.tsx

type EntryAccentGlyphProps = {
  inverse?: boolean;
};

export function EntryAccentGlyph({ inverse = false }: EntryAccentGlyphProps) {
  return (
    <span
      aria-hidden="true"
      className={`entry-accent-glyph${inverse ? ' entry-accent-glyph-inverse' : ''}`}
    >
      <span aria-hidden="true" role="img">
        ✨
      </span>
    </span>
  );
}
