import { useCallback, useState } from "react";
import ArchitectureDiagram, {
	type ArchitectureData,
	type ArchitectureStep,
} from "./ArchitectureDiagram";

interface Props {
	data: ArchitectureData;
}

export default function ArchitectureSection({ data }: Props) {
	const [activeStepId, setActiveStepId] = useState<string | undefined>(data.steps[0]?.id);

	const onStepClick = useCallback((stepId: string) => {
		setActiveStepId(stepId);
	}, []);

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
			<div className="lg:col-span-8">
				<ArchitectureDiagram
					data={data}
					activeStepId={activeStepId}
					onStepChange={setActiveStepId}
				/>
			</div>
			<div className="lg:col-span-4 space-y-3">
				{data.steps.map((step: ArchitectureStep) => (
					<button
						key={step.id}
						type="button"
						onClick={() => onStepClick(step.id)}
						className={`w-full text-left p-4 border rounded-lg transition-colors ${
							activeStepId === step.id
								? "border-green-500/50 bg-green-500/10"
								: "border-white/10 hover:border-white/20"
						}`}
					>
						<p className="text-xs uppercase tracking-widest opacity-40 mb-1">Step {step.id}</p>
						<p className="font-serif text-lg mb-2">{step.title}</p>
						<p className="text-sm opacity-60 leading-relaxed">{step.description}</p>
					</button>
				))}
			</div>
		</div>
	);
}
