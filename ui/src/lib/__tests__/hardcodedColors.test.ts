// src/lib/__tests__/hardcodedColors.test.ts
// Test to detect hardcoded color values in component files
// This ensures we use design tokens consistently

import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// Simple recursive glob function using Node's fs
function globSync(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (pattern.test(entry.name)) {
        results.push(fullPath);
      }
    }
  }

  walk(dir);
  return results;
}

// Patterns that indicate hardcoded colors we want to catch
const HARDCODED_PATTERNS = [
  // Hex colors (but allow white/black references in rgba/opacity contexts)
  /bg-\[#[0-9A-Fa-f]{3,8}\]/g,
  /text-\[#[0-9A-Fa-f]{3,8}\]/g,
  /border-\[#[0-9A-Fa-f]{3,8}\]/g,
  /fill-\[#[0-9A-Fa-f]{3,8}\]/g,
  /stroke-\[#[0-9A-Fa-f]{3,8}\]/g,

  // Tailwind color scales that should use tokens instead
  // Lifecycle colors (emerald, orange, red for lifecycle states)
  /bg-emerald-\d+/g,
  /text-emerald-\d+/g,
  /bg-orange-\d+/g,
  /text-orange-\d+/g,
  /bg-red-\d+/g,
  /text-red-\d+/g,
  /bg-blue-\d+/g,
  /text-blue-\d+/g,
  /bg-gray-\d+/g,
  /text-gray-\d+/g,

  // Direct hex in style attributes or inline
  /stopColor=["']#[0-9A-Fa-f]{3,8}["']/g,
  /stroke=["']#[0-9A-Fa-f]{3,8}["']/g,
  /fill=["']#[0-9A-Fa-f]{3,8}["']/g,
];

// Files/patterns to exclude from checking
const EXCLUDE_PATTERNS = [
  /\.test\.ts$/,
  /\.test\.tsx$/,
  /fixtures\//,
  /contracts\//,
  /__tests__\//,
  /node_modules/,
  /\.d\.ts$/,
];

// Specific strings that are allowed (e.g., in comments, or third-party)
const ALLOWED_STRINGS = [
  "bg-black", // Sometimes needed for platform icons
  "text-white", // Common for contrast
  "bg-white", // Common for contrast
];

describe("Hardcoded color detection", () => {
  it("should not have hardcoded colors in component files", () => {
    const componentsDir = path.join(__dirname, "../../components");
    const allFiles = globSync(componentsDir, /\.(tsx|ts)$/);
    const files = allFiles.map(f => path.relative(componentsDir, f));

    const violations: Array<{ file: string; line: number; match: string; pattern: string }> = [];

    for (const file of files) {
      // Skip excluded files
      if (EXCLUDE_PATTERNS.some(pattern => pattern.test(file))) {
        continue;
      }

      const filePath = path.join(componentsDir, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split("\n");

      lines.forEach((line, lineIndex) => {
        // Skip comments
        if (line.trim().startsWith("//") || line.trim().startsWith("*")) {
          return;
        }

        // Skip allowed strings
        if (ALLOWED_STRINGS.some(allowed => line.includes(allowed))) {
          return;
        }

        for (const pattern of HARDCODED_PATTERNS) {
          // Reset regex state
          pattern.lastIndex = 0;
          const matches = line.match(pattern);

          if (matches) {
            for (const match of matches) {
              // Skip if it's in an allowed context
              if (ALLOWED_STRINGS.includes(match)) {
                continue;
              }

              violations.push({
                file,
                line: lineIndex + 1,
                match,
                pattern: pattern.source,
              });
            }
          }
        }
      });
    }

    if (violations.length > 0) {
      const report = violations
        .map(v => `  ${v.file}:${v.line} - "${v.match}"`)
        .join("\n");

      console.log(`\nFound ${violations.length} hardcoded color violations:\n${report}`);
    }

    // This test will fail if we find hardcoded colors
    // Set to a threshold of 0 for strict enforcement
    expect(violations.length).toBe(0);
  });

  it("should use CSS variables for chart colors in SVG elements", async () => {
    const sparklinePath = path.join(__dirname, "../../components/opportunities/Sparkline.tsx");
    const content = fs.readFileSync(sparklinePath, "utf-8");

    // Check that we're using CSS variables, not hex
    expect(content).toContain("var(--kairo-color-chart-positive)");
    expect(content).toContain("var(--kairo-color-chart-negative)");
    expect(content).not.toContain('"#10B981"');
    expect(content).not.toContain('"#EF4444"');
  });

  it("should use tokenized lifecycle colors", async () => {
    const cardPath = path.join(__dirname, "../../components/opportunities/OpportunityCardV2.tsx");
    const content = fs.readFileSync(cardPath, "utf-8");

    // Check lifecycle tokens are used
    expect(content).toContain("bg-kairo-lifecycle-seed-bg");
    expect(content).toContain("text-kairo-lifecycle-seed-fg");

    // Check old hardcoded colors are gone
    expect(content).not.toContain("bg-emerald-100");
    expect(content).not.toContain("text-emerald-700");
  });

  it("should use tokenized platform colors", async () => {
    const platformPath = path.join(__dirname, "../../components/opportunities/PlatformIcon.tsx");
    const content = fs.readFileSync(platformPath, "utf-8");

    // Check platform tokens are used
    expect(content).toContain("bg-kairo-platform-tiktok");
    expect(content).toContain("bg-kairo-platform-linkedin");
    expect(content).toContain("bg-kairo-platform-reddit");

    // Check old hardcoded colors are gone
    expect(content).not.toContain('bg-[#0A66C2]');
    expect(content).not.toContain('bg-[#FF4500]');
  });
});
