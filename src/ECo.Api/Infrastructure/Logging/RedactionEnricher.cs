using Serilog.Core;
using Serilog.Events;

namespace ECo.Api.Infrastructure.Logging;

/// <summary>
/// Applies <see cref="Redactor"/> to every property of every log event, recursively,
/// so the rendered message and structured output carry only redacted values.
/// </summary>
public sealed class RedactionEnricher : ILogEventEnricher
{
    private static readonly ScalarValue Masked = new(Redactor.Mask);

    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        foreach (var (name, value) in logEvent.Properties.ToArray())
        {
            var redacted = Redactor.IsSensitiveName(name) ? Masked : Redact(value);
            if (!ReferenceEquals(redacted, value))
            {
                logEvent.AddOrUpdateProperty(new LogEventProperty(name, redacted));
            }
        }
    }

    private static LogEventPropertyValue Redact(LogEventPropertyValue value) => value switch
    {
        ScalarValue { Value: string text } => Redactor.Redact(text) is var clean && clean != text
            ? new ScalarValue(clean)
            : value,
        StructureValue structure => new StructureValue(
            structure.Properties.Select(p => new LogEventProperty(
                p.Name,
                Redactor.IsSensitiveName(p.Name) ? Masked : Redact(p.Value))),
            structure.TypeTag),
        SequenceValue sequence => new SequenceValue(sequence.Elements.Select(Redact)),
        DictionaryValue dictionary => new DictionaryValue(dictionary.Elements.Select(e =>
            new KeyValuePair<ScalarValue, LogEventPropertyValue>(
                e.Key,
                e.Key.Value is string key && Redactor.IsSensitiveName(key) ? Masked : Redact(e.Value)))),
        _ => value,
    };
}
