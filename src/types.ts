export type Video = {
  /** Stable id derived from the source mp4 filename (e.g. "phoenix-vs-am") */
  id: string;
  /** Display ordinal from the txt file (1, 2, 13a, etc.) */
  number: string;
  /** Header label after the number — e.g. "Phoenix vs Lina Mid" */
  name: string;
  /** Output mp4 filename — phoenix-vs-am.mp4 */
  filename: string;
  /** Editable fields */
  title: string;
  description: string;
  tags: string;
  /** Heuristics used for grouping/filtering */
  enemy: string | null;
};
