using System.Text.RegularExpressions;

namespace ECo.Api.Infrastructure.Logging;

/// <summary>
/// The logging redaction policy: personal and payment data never reaches a log sink.
/// Values are redacted by property name and by content pattern.
/// </summary>
public static partial class Redactor
{
    public const string Mask = "[REDACTED]";

    private static readonly string[] SensitiveNameParts =
    [
        "password", "token", "secret", "email", "address", "postcode", "postal",
        "phone", "card", "cvc", "cvv", "iban",
    ];

    public static bool IsSensitiveName(string propertyName) =>
        SensitiveNameParts.Any(part => propertyName.Contains(part, StringComparison.OrdinalIgnoreCase));

    public static string Redact(string value)
    {
        var redacted = EmailPattern().Replace(value, "[REDACTED:email]");
        return CardPattern().Replace(redacted, "[REDACTED:card]");
    }

    [GeneratedRegex(@"[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}")]
    private static partial Regex EmailPattern();

    // 13-19 digits, optionally grouped by single spaces or hyphens: the shape of a payment card number.
    [GeneratedRegex(@"(?<!\d)\d(?:[ \-]?\d){12,18}(?!\d)")]
    private static partial Regex CardPattern();
}
