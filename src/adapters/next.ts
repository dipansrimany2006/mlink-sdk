import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import type { Action } from '../builders';
import { validateTransactionRequest } from '../validators';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Create Next.js App Router handlers
export function createNextHandler(action: Action) {
  // GET handler - returns action metadata
  async function GET() {
    try {
      const metadata = action.getMetadata();
      return NextResponse.json(metadata, { headers: corsHeaders });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: { message } },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // POST handler - returns transaction
  async function POST(request: NextRequest) {
    try {
      const body = await request.json();

      // Validate request
      const validation = validateTransactionRequest(body);
      if (!validation.success) {
        return NextResponse.json(
          { error: { message: validation.error } },
          { status: 400, headers: corsHeaders }
        );
      }

      // Handle request
      const response = await action.handleRequest(validation.data);

      return NextResponse.json(response, { headers: corsHeaders });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return NextResponse.json(
        { error: { message } },
        { status: 500, headers: corsHeaders }
      );
    }
  }

  // OPTIONS handler - CORS preflight
  async function OPTIONS() {
    return new NextResponse(null, { headers: corsHeaders });
  }

  return { GET, POST, OPTIONS };
}
