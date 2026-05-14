import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool, convertToModelMessages } from 'ai';
import { z } from 'zod';

const grok = createOpenAI({
  baseURL: 'https://api.x.ai/v1',
  apiKey: process.env.GROK_API_KEY ?? '',
});

const createChartTool = tool({
  description: 'Create a chart widget on the dashboard canvas with the specified data mappings.',
  inputSchema: z.object({
    type: z.enum(['bar', 'line', 'pie']).describe('The chart type to create'),
    xAxisSelected: z.string().describe('The column name for the X-axis (categories)'),
    yAxisSelected: z.string().describe('The column name for the Y-axis (values)'),
  }),
});

export async function POST(request: Request) {
  const body = await request.json();
  const messages = body.messages ?? [];
  const dataSchema: string[] = body.dataSchema ?? body.data?.dataSchema ?? [];

  const systemPrompt = [
    'You are a data visualization assistant embedded in a BI dashboard builder.',
    `The user has loaded a dataset with these exact columns: [${dataSchema.join(', ')}].`,
    '',
    'CRITICAL RULES — follow every single one:',
    '1. You MUST call the createChart tool IMMEDIATELY for any chart/visualization request.',
    '2. ONLY use column names from the list above — never invent column names.',
    '3. Do NOT write any explanation text. Only call the tool.',
    '4. If the user says "bar chart showing experience and salary", pick experience for xAxisSelected and salary for yAxisSelected.',
    '5. Match column names case-sensitively from the list provided.',
  ].join('\n');

  const modelMessages = await convertToModelMessages(messages);
  console.log('[chat API] modelMessages:', JSON.stringify(modelMessages, null, 2));

  let debugText = '';
  let debugToolCalls: any[] = [];
  let debugToolResults: any[] = [];

  const result = streamText({
    model: grok('grok-3-latest'),
    system: systemPrompt,
    messages: modelMessages,
    tools: { createChart: createChartTool },
    toolChoice: 'required',
    maxSteps: 5,
    async onFinish({ text, toolCalls, toolResults }) {
      debugText = text;
      debugToolCalls = toolCalls;
      debugToolResults = toolResults;
      console.log('[chat API] onFinish - text:', text?.substring(0, 200));
      console.log('[chat API] onFinish - toolCalls:', JSON.stringify(toolCalls, null, 2));
      console.log('[chat API] onFinish - toolResults:', JSON.stringify(toolResults, null, 2));
    },
  });

  console.log('[chat API] Returning stream response...');
  return result.toUIMessageStreamResponse();
}