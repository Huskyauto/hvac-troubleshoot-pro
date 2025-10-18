import { invokeLLM } from "../_core/llm";
import * as db from "../db";

export interface RankedCause {
  cause: string;
  probability: number;
  difficulty: "DIY" | "PRO" | "PARTS";
  parts: string[];
  notes?: string;
}

export interface DiagnosticStep {
  instructionMd: string;
  meterMode?: string;
  expectedRange?: string;
  safety: string[];
}

export interface DiagnosticResult {
  rankedCauses: RankedCause[];
  steps: DiagnosticStep[];
}

/**
 * AI-powered diagnostic engine using LLM with RAG
 */
export async function runDiagnostics(
  symptom: string,
  deviceModelId?: number,
  errorCodes?: string[]
): Promise<DiagnosticResult> {
  // Get device model information if provided
  let modelInfo = "";
  if (deviceModelId) {
    const model = await db.getDeviceModel(deviceModelId);
    if (model) {
      modelInfo = `Equipment: ${model.brand} ${model.modelNumber} (${model.equipmentType})`;
    }
  }

  // Get error code information if provided
  let errorCodeInfo = "";
  if (errorCodes && errorCodes.length > 0 && deviceModelId) {
    const codes = await db.searchErrorCodes(errorCodes[0], deviceModelId);
    if (codes.length > 0) {
      errorCodeInfo = codes
        .map(c => `Error Code ${c.code}: ${c.description}`)
        .join("\n");
    }
  }

  // Build the diagnostic prompt
  const systemPrompt = `You are an expert HVAC diagnostic assistant. Your role is to help technicians and homeowners troubleshoot HVAC equipment issues.

You have deep knowledge of:
- Furnaces, boilers, air conditioners, heat pumps, mini-split systems
- Common failure modes and diagnostic procedures
- Safety protocols for HVAC work
- Parts identification and replacement procedures

When diagnosing issues:
1. Consider the most likely causes first based on symptoms
2. Provide step-by-step diagnostic procedures
3. Include safety warnings for dangerous tasks (electrical, gas, refrigerant)
4. Specify required tools and expected readings
5. Recommend DIY vs professional intervention based on complexity`;

  const userPrompt = `Diagnose this HVAC issue:

${modelInfo ? `${modelInfo}\n` : ""}
Symptom: ${symptom}
${errorCodeInfo ? `\n${errorCodeInfo}\n` : ""}

Provide a structured diagnostic analysis with:
1. Ranked list of likely root causes (with probability and difficulty level)
2. Required parts for each cause
3. Step-by-step diagnostic procedure for the top cause

Format your response as JSON.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "hvac_diagnosis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              ranked_causes: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    cause: { type: "string" },
                    probability: { type: "number" },
                    difficulty: { type: "string", enum: ["DIY", "PRO", "PARTS"] },
                    parts: { type: "array", items: { type: "string" } },
                    notes: { type: "string" },
                  },
                  required: ["cause", "probability", "difficulty", "parts"],
                  additionalProperties: false,
                },
              },
              diagnostic_steps: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    instruction_md: { type: "string" },
                    meter_mode: { type: "string" },
                    expected_range: { type: "string" },
                    safety: { type: "array", items: { type: "string" } },
                  },
                  required: ["instruction_md", "safety"],
                  additionalProperties: false,
                },
              },
            },
            required: ["ranked_causes", "diagnostic_steps"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from LLM");
    }

    const contentText = typeof content === 'string' ? content : JSON.stringify(content);
    const result = JSON.parse(contentText);

    // Transform the response to match our interface
    const rankedCauses: RankedCause[] = result.ranked_causes.map((c: any) => ({
      cause: c.cause,
      probability: c.probability,
      difficulty: c.difficulty as "DIY" | "PRO" | "PARTS",
      parts: c.parts,
      notes: c.notes,
    }));

    const steps: DiagnosticStep[] = result.diagnostic_steps.map((s: any) => ({
      instructionMd: s.instruction_md,
      meterMode: s.meter_mode,
      expectedRange: s.expected_range,
      safety: s.safety,
    }));

    return {
      rankedCauses,
      steps,
    };
  } catch (error) {
    console.error("Diagnostic engine error:", error);
    
    // Return fallback diagnostic
    return {
      rankedCauses: [
        {
          cause: "Unable to generate AI diagnosis. Please consult a professional HVAC technician.",
          probability: 1.0,
          difficulty: "PRO",
          parts: [],
          notes: "AI diagnostic service is temporarily unavailable.",
        },
      ],
      steps: [
        {
          instructionMd: "Contact a licensed HVAC professional for diagnosis and repair.",
          safety: ["Do not attempt repairs without proper training and equipment"],
        },
      ],
    };
  }
}

/**
 * Generate a detailed repair report
 */
export async function generateRepairReport(
  sessionId: number,
  format: "markdown" | "pdf" = "markdown"
): Promise<string> {
  const session = await db.getDiagnosticSession(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  const steps = await db.getSessionSteps(sessionId);
  
  let report = `# HVAC Troubleshooting Report\n\n`;
  report += `**Session ID:** ${sessionId}\n`;
  report += `**Date:** ${session.startedAt?.toLocaleDateString()}\n`;
  report += `**Symptom:** ${session.symptom}\n\n`;

  if (session.resultRankedCauses && session.resultRankedCauses.length > 0) {
    report += `## Diagnostic Results\n\n`;
    session.resultRankedCauses.forEach((cause: any, idx: number) => {
      report += `### ${idx + 1}. ${cause.cause}\n`;
      report += `- **Probability:** ${(cause.probability * 100).toFixed(0)}%\n`;
      report += `- **Difficulty:** ${cause.difficulty}\n`;
      if (cause.parts && cause.parts.length > 0) {
        report += `- **Required Parts:** ${cause.parts.join(", ")}\n`;
      }
      if (cause.notes) {
        report += `- **Notes:** ${cause.notes}\n`;
      }
      report += `\n`;
    });
  }

  if (steps.length > 0) {
    report += `## Diagnostic Steps Performed\n\n`;
    steps.forEach((step, idx) => {
      report += `### Step ${idx + 1}\n`;
      report += `${step.instructionMd}\n\n`;
      if (step.outcome) {
        report += `**Outcome:** ${step.outcome}\n\n`;
      }
    });
  }

  report += `\n---\n`;
  report += `*Generated by HVAC Troubleshoot Pro*\n`;

  return report;
}

