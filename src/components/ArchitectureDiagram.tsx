import { useEffect, useMemo } from "react";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  type Edge,
  Handle,
  MarkerType,
  type Node,
  type NodeProps,
  Position,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
} from "reactflow";
import "reactflow/dist/style.css";
import type { ProjectArchitecture } from "@/content/types";

function StepNode({ data }: NodeProps<{ label: string; index: number; active: boolean }>) {
  return (
    <div
      className={`min-w-[140px] cursor-pointer rounded-md border px-3 py-2 text-center text-xs transition-all ${
        data.active
          ? "border-primary bg-primary/10 text-foreground shadow-[0_0_0_2px_var(--color-primary)]"
          : "border-border bg-card text-foreground hover:border-foreground/40"
      }`}
    >
      <div className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
        step {data.index}
      </div>
      <div className="mt-0.5 font-medium">{data.label}</div>
      <Handle type="target" position={Position.Left} className="!bg-border" />
      <Handle type="source" position={Position.Right} className="!bg-border" />
    </div>
  );
}

const nodeTypes = { step: StepNode };

function ArchitectureFlow({
  architecture,
  selectedId,
  onSelect,
}: {
  architecture: ProjectArchitecture;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const builtNodes = useMemo<Node[]>(
    () =>
      architecture.nodes.map((n, i) => ({
        id: n.id,
        type: "step",
        position: { x: n.x, y: n.y },
        data: { label: n.label, index: i + 1, active: selectedId === n.id },
      })),
    [architecture.nodes, selectedId],
  );

  const builtEdges = useMemo<Edge[]>(
    () =>
      architecture.edges.map((e) => ({
        id: `${e.from}-${e.to}`,
        source: e.from,
        target: e.to,
        type: "smoothstep",
        animated: selectedId === e.from || selectedId === e.to,
        style: {
          stroke:
            selectedId === e.from || selectedId === e.to
              ? "var(--color-primary)"
              : "var(--color-border)",
          strokeWidth: 1.5,
        },
        markerEnd: { type: MarkerType.ArrowClosed, color: "var(--color-border)" },
      })),
    [architecture.edges, selectedId],
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(builtNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(builtEdges);

  useEffect(() => {
    setNodes(builtNodes);
  }, [builtNodes, setNodes]);

  useEffect(() => {
    setEdges(builtEdges);
  }, [builtEdges, setEdges]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      onNodeClick={(_, n) => onSelect(n.id)}
      fitView
      fitViewOptions={{ padding: 0.2 }}
      proOptions={{ hideAttribution: true }}
      nodesDraggable={false}
      panOnScroll={false}
    >
      <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="var(--color-border)" />
      <Controls showInteractive={false} className="!border-border !bg-card" />
    </ReactFlow>
  );
}

export function ArchitectureDiagram({
  architecture,
  selectedId,
  onSelect,
}: {
  architecture: ProjectArchitecture;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="h-[380px] w-full overflow-hidden rounded-lg border border-border bg-card">
      <ReactFlowProvider>
        <ArchitectureFlow architecture={architecture} selectedId={selectedId} onSelect={onSelect} />
      </ReactFlowProvider>
    </div>
  );
}
