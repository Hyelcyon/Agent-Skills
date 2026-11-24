import { Readable, Transform } from 'node:stream';
import { pipeline } from 'node:stream/promises';

interface LogEntry {
  level: string;
  message: string;
  timestamp: string;
}

class JsonLineTransform extends Transform {
  constructor() {
    super({ objectMode: true });
  }

  override _transform(chunk: LogEntry, _encoding: BufferEncoding, callback: (error?: Error | null, data?: unknown) => void): void {
    try {
      const formatted = JSON.stringify(chunk) + '\n';
      callback(null, formatted);
    } catch (err) {
      callback(err instanceof Error ? err : new Error(String(err)));
    }
  }
}

async function runStreamingPipeline(entries: LogEntry[]): Promise<string> {
  const source = Readable.from(entries);
  const transformer = new JsonLineTransform();
  let output = '';

  const collector = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      output += chunk.toString('utf8');
      callback();
    }
  });

  await pipeline(source, transformer, collector);
  return output;
}

export { runStreamingPipeline, JsonLineTransform, type LogEntry };
