import { useCallback, useState } from "react";
import {
	Background,
	Controls,
	ReactFlow,
	type Edge,
	type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

export interface ArchitectureStep {
	id: string;
	title: string;
	description: string;
}

export interface ArchitectureData {
	nodes: Node[];
	edges: Edge[];
	steps: ArchitectureStep[];
}

interface Props {
	data: ArchitectureData;
	activeStepId?: string;
	onStepChange?: (stepId: string) => void;
}

export default function ArchitectureDiagram({ data, activeStepId, onStepChange }: Props) {
	const [selected, setSelected] = useState<string | undefined>(activeStepId);

	const onNodeClick = useCallback(
		(_: React.MouseEvent, node: Node) => {
			setSelected(node.id);
			onStepChange?.(node.id);
		},
		[onStepChange],
	);

	const highlight = activeStepId ?? selected;

	const nodes = data.nodes.map((node) => ({
		...node,
		style: {
			...(node.style ?? {}),
			border: highlight === node.id ? "2px solid #22c55e" : "1px solid #334155",
			background: highlight === node.id ? "#14532d" : "#0f172a",
			color: "#e2e8f0",
			borderRadius: 8,
			padding: 8,
			fontSize: 12,
		},
	}));

	return (
		<div className="w-full h-[420px] rounded-lg border border-white/10 overflow-hidden bg-black/40">
			<ReactFlow
				nodes={nodes}
				edges={data.edges}
				onNodeClick={onNodeClick}
				fitView
				proOptions={{ hideAttribution: true }}
			>
				<Background color="#334155" gap={16} />
				<Controls />
			</ReactFlow>
		</div>
	);
}
