const CODE_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".java",
  ".go",
  ".rs",
];

export function isCodeFile(path: string) {
  return CODE_EXTENSIONS.some((ext) => path.endsWith(ext));
}
