"use client";

import { useRef } from "react";
import { KCard, KTag } from "@/components/ui";
import type {
  BrandBrainOverrides,
  StringFieldNode,
  StringArrayFieldNode,
} from "@/contracts";
import { diagnostics } from "@/lib/debug/diagnostics";
import { FieldNodeView } from "./FieldNodeView";

type AnyFieldNode = StringFieldNode | StringArrayFieldNode;

interface FieldConfig {
  path: string;
  label: string;
  node: AnyFieldNode;
}

interface BrandBrainSectionProps {
  title: string;
  fields: FieldConfig[];
  overrides: BrandBrainOverrides | null;
  selectedPath: string | null;
  onFieldClick: (path: string) => void;
}

export function BrandBrainSection({
  title,
  fields,
  overrides,
  selectedPath,
  onFieldClick,
}: BrandBrainSectionProps) {
  // Render tracking for diagnostics
  const renderCountRef = useRef(0);
  renderCountRef.current += 1;
  diagnostics.trackRender(`Snapshot:${title}`);

  return (
    <KCard className="p-5">
      <h3 className="text-[14px] font-semibold text-kairo-fg mb-4">{title}</h3>
      <div className="space-y-4">
        {fields.map((field) => {
          const isOverridden = overrides?.overrides_json[field.path] !== undefined;
          const isPinned = overrides?.pinned_paths.includes(field.path) ?? false;
          const isSelected = selectedPath === field.path;

          return (
            <FieldNodeView
              key={field.path}
              path={field.path}
              label={field.label}
              node={field.node}
              isOverridden={isOverridden}
              isPinned={isPinned}
              isSelected={isSelected}
              onClick={() => onFieldClick(field.path)}
            />
          );
        })}
      </div>
    </KCard>
  );
}

BrandBrainSection.displayName = "BrandBrainSection";
