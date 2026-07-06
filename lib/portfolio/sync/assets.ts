import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { architectureDataSchema } from "../schema";

export async function copyPreviewImage(
	sourcePath: string,
	outDir: string,
): Promise<string | undefined> {
	if (!fs.existsSync(sourcePath)) return undefined;
	const dest = path.join(outDir, "preview.png");
	fs.copyFileSync(sourcePath, dest);
	return "./preview.png";
}

/** Walk a TS expression AST into plain data — no module execution. */
function astToValue(node: ts.Expression): unknown {
	if (ts.isObjectLiteralExpression(node)) {
		const obj: Record<string, unknown> = {};
		for (const prop of node.properties) {
			if (!ts.isPropertyAssignment(prop)) {
				throw new Error("Only simple property assignments are supported in architecture.tsx");
			}
			const key = ts.isIdentifier(prop.name)
				? prop.name.text
				: ts.isStringLiteral(prop.name)
					? prop.name.text
					: null;
			if (!key) {
				throw new Error("Unsupported property key in architecture.tsx");
			}
			obj[key] = astToValue(prop.initializer);
		}
		return obj;
	}
	if (ts.isArrayLiteralExpression(node)) {
		return node.elements.map((e) => {
			if (ts.isSpreadElement(e)) {
				throw new Error("Spread elements are not supported in architecture.tsx");
			}
			return astToValue(e);
		});
	}
	if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
		return node.text;
	}
	if (ts.isNumericLiteral(node)) {
		return Number(node.text);
	}
	if (node.kind === ts.SyntaxKind.TrueKeyword) return true;
	if (node.kind === ts.SyntaxKind.FalseKeyword) return false;
	if (node.kind === ts.SyntaxKind.NullKeyword) return null;
	if (
		ts.isPrefixUnaryExpression(node) &&
		node.operator === ts.SyntaxKind.MinusToken &&
		ts.isNumericLiteral(node.operand)
	) {
		return -Number(node.operand.text);
	}
	throw new Error(`Unsupported syntax in architecture.tsx: ${node.getText()}`);
}

/**
 * Parse architectureData from architecture.tsx without executing the module.
 * Expects `export const architectureData = { nodes, edges, steps }` per ADR-0001.
 */
export function parseArchitectureDataFromTsx(source: string): unknown {
	const sourceFile = ts.createSourceFile(
		"architecture.tsx",
		source,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TSX,
	);

	for (const stmt of sourceFile.statements) {
		if (!ts.isVariableStatement(stmt)) continue;
		for (const decl of stmt.declarationList.declarations) {
			if (
				ts.isIdentifier(decl.name) &&
				decl.name.text === "architectureData" &&
				decl.initializer
			) {
				return astToValue(decl.initializer);
			}
		}
	}

	throw new Error("architecture.tsx must export const architectureData");
}

export async function syncArchitectureFromTsx(
	sourcePath: string,
	outDir: string,
): Promise<boolean> {
	if (!fs.existsSync(sourcePath)) return false;

	try {
		const source = fs.readFileSync(sourcePath, "utf8");
		const data = parseArchitectureDataFromTsx(source);
		const parsed = architectureDataSchema.parse(data);
		fs.writeFileSync(
			path.join(outDir, "architecture.json"),
			JSON.stringify(parsed, null, "\t"),
		);
		return true;
	} catch {
		return false;
	}
}

export async function syncProjectAssets(
	sourceDir: string | undefined,
	outDir: string,
): Promise<{ previewImage?: string; hasArchitecture: boolean }> {
	fs.mkdirSync(outDir, { recursive: true });

	let previewImage: string | undefined;
	let hasArchitecture = false;

	if (sourceDir && fs.existsSync(sourceDir)) {
		const previewPath = path.join(sourceDir, "preview.png");
		previewImage = await copyPreviewImage(previewPath, outDir);

		const archTsx = path.join(sourceDir, "architecture.tsx");
		if (await syncArchitectureFromTsx(archTsx, outDir)) {
			hasArchitecture = true;
		}
	}

	return { previewImage, hasArchitecture };
}
