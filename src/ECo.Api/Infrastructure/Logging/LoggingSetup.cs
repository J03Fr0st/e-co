using Serilog;
using Serilog.Core;
using Serilog.Events;
using Serilog.Formatting;
using Serilog.Formatting.Compact;
using Serilog.Parsing;

namespace ECo.Api.Infrastructure.Logging;

/// <summary>
/// The one place the log pipeline is assembled, so the app and its tests share it.
/// Redaction happens before JSON encoding: properties by name and pattern (the enricher),
/// then the literal template text and the exception text (the formatter). Trace and span
/// ids, timestamps and the encoding itself are never touched.
/// </summary>
/// <remarks>
/// Sinks must be added here, not through the <c>Serilog:WriteTo</c> configuration section,
/// which would bypass <see cref="RedactingFormatter"/>.
/// </remarks>
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
        private static readonly MessageTemplateParser Parser = new();

        public void Format(LogEvent logEvent, TextWriter output)
        {
            var template = Redactor.Redact(logEvent.MessageTemplate.Text) is var text && text != logEvent.MessageTemplate.Text
                ? Parser.Parse(text)
                : logEvent.MessageTemplate;
            var exception = logEvent.Exception is { } original ? new RedactedException(original) : null;

            inner.Format(
                new LogEvent(
                    logEvent.Timestamp,
                    logEvent.Level,
                    exception,
                    template,
                    logEvent.Properties.Select(p => new LogEventProperty(p.Key, p.Value)),
                    logEvent.TraceId ?? default,
                    logEvent.SpanId ?? default),
                output);
        }
    }

    /// <summary>Stands in for the original exception so its rendered text is redacted.</summary>
    private sealed class RedactedException(Exception original) : Exception(Redactor.Redact(original.Message))
    {
        public override string ToString() => Redactor.Redact(original.ToString());
    }
}
