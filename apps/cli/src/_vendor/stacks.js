// Dev-time re-export from the workspace package. At publish time, the
// prepack script OVERWRITES this file with a copy of the actual source
// so the tarball is self-contained. postpack restores this re-export.
export * from "@polystack/core/stacks";
