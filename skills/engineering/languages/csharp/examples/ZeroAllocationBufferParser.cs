namespace Enterprise.Core.Parsing;

using System;
using System.Buffers;
using System.IO;

public sealed class ZeroAllocationBufferParser
{
    public static bool TryParseKeyValue(ReadOnlySpan<char> source, out ReadOnlySpan<char> key, out ReadOnlySpan<char> value)
    {
        int delimiterIndex = source.IndexOf(':');
        if (delimiterIndex < 0)
        {
            key = default;
            value = default;
            return false;
        }

        key = source[..delimiterIndex].Trim();
        value = source[(delimiterIndex + 1)..].Trim();
        return true;
    }

    public static long ComputeCheckSum(params ReadOnlySpan<long> segments)
    {
        long checksum = 0;
        for (int i = 0; i < segments.Length; i++)
        {
            checksum ^= segments[i];
        }
        return checksum;
    }

    public static byte[] ProcessStreamPayload(Stream stream, int expectedLength)
    {
        byte[] poolBuffer = ArrayPool<byte>.Shared.Rent(expectedLength);
        try
        {
            int totalRead = 0;
            while (totalRead < expectedLength)
            {
                int read = stream.Read(poolBuffer, totalRead, expectedLength - totalRead);
                if (read == 0)
                {
                    break;
                }
                totalRead += read;
            }

            byte[] result = new byte[totalRead];
            poolBuffer.AsSpan(0, totalRead).CopyTo(result);
            return result;
        }
        finally
        {
            ArrayPool<byte>.Shared.Return(poolBuffer, clearArray: true);
        }
    }
}
