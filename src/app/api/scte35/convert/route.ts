import { NextRequest, NextResponse } from "next/server";

interface ConvertRequest {
  data: string;
  inputFormat: 'base64' | 'hex' | 'binary';
  outputFormat: 'base64' | 'hex' | 'binary' | 'json';
}

export async function POST(request: NextRequest) {
  try {
    const body: ConvertRequest = await request.json();
    
    if (!body.data || !body.inputFormat || !body.outputFormat) {
      return NextResponse.json(
        { error: "Data, input format, and output format are required" },
        { status: 400 }
      );
    }

    // Convert input to buffer
    let buffer: Buffer;
    switch (body.inputFormat) {
      case 'base64':
        buffer = Buffer.from(body.data, 'base64');
        break;
      case 'hex':
        // Remove any spaces or 0x prefix
        const hexData = body.data.replace(/\s/g, '').replace(/^0x/i, '');
        if (!/^[0-9A-Fa-f]+$/.test(hexData)) {
          return NextResponse.json(
            { error: "Invalid hexadecimal data" },
            { status: 400 }
          );
        }
        buffer = Buffer.from(hexData, 'hex');
        break;
      case 'binary':
        // Binary data as string of 0s and 1s
        const binaryData = body.data.replace(/\s/g, '');
        if (!/^[01]+$/.test(binaryData)) {
          return NextResponse.json(
            { error: "Invalid binary data" },
            { status: 400 }
          );
        }
        buffer = Buffer.from(binaryData.match(/.{1,8}/g)?.map(bin => parseInt(bin, 2)) || []);
        break;
      default:
        return NextResponse.json(
          { error: "Unsupported input format" },
          { status: 400 }
        );
    }

    // Convert buffer to output format
    let result: string;
    switch (body.outputFormat) {
      case 'base64':
        result = buffer.toString('base64');
        break;
      case 'hex':
        result = buffer.toString('hex').toUpperCase();
        break;
      case 'binary':
        result = buffer.map(b => b.toString(2).padStart(8, '0')).join(' ');
        break;
      case 'json':
        // Create a JSON representation of the SCTE-35 data
        const jsonResult = {
          format: 'SCTE-35',
          length: buffer.length,
          data: buffer.toString('hex').toUpperCase(),
          base64: buffer.toString('base64'),
          timestamp: new Date().toISOString()
        };
        return NextResponse.json(jsonResult);
      default:
        return NextResponse.json(
          { error: "Unsupported output format" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
      inputFormat: body.inputFormat,
      outputFormat: body.outputFormat,
      length: buffer.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Error converting SCTE-35 data:", error);
    return NextResponse.json(
      { error: "Failed to convert SCTE-35 data" },
      { status: 500 }
    );
  }
}