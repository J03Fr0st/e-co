using Serilog;
using Serilog.Core;
using Serilog.Events;
using Serilog.Formatting;
using Serilog.Formatting.Compact;

namespace ECo.Api.Infrastructure.Logging;

/// <summary>
/// The one place the log pipeline is assembled, so the app and its tests share it.
/// Redaction happens twice: per property (by name and pattern) and over the final
/// output text, which also covers exception details and literal template text.
/// </summary>
public static class LoggingSetup
{
    public static LoggerConfiguration Apply(LoggerConfiguration logger, TextWriter? output = null)
    {
        var formatter = new RedactingFormatter(new RenderedCompactJsonFormatter());
        logger = logger
            .Enrich.FromLogContext()
            .Enrich.With<RedactionEnricher>();

        return output is null
            ? logger.WriteTo.Console(formatter)
            : logger.WriteTo.Sink(new WriterSink(formatter, output));
    }

    private sealed class WriterSink(ITextFormatter formatter, TextWriter output) : ILogEventSink
    {
        public void Emit(LogEvent logEvent) => formatter.Format(logEvent, output);
    }

    private sealed class RedactingFormatter(ITextFormatter inner) : ITextFormatter
    {
        public void Format(LogEvent logEvent, TextWriter output)
        {
            using var buffer = new StringWriter();
            inner.Format(logEvent, buffer);
            output.Write(Redactor.Redact(buffer.ToString()));
        }
    }
}
