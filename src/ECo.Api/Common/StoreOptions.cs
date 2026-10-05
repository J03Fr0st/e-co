using System.Globalization;
using System.Text.RegularExpressions;

namespace ECo.Api.Common;

/// <summary>Store-wide settings bound from the <c>Store</c> configuration section (PD-09).</summary>
public sealed partial class StoreOptions
{
    public const string Section = "Store";

    /// <summary>ISO 4217 code of the single currency this deployment sells in.</summary>
    public string Currency { get; set; } = "GBP";

    /// <summary>BCP 47 culture used for formatting prices, dates and addresses.</summary>
    public string Locale { get; set; } = "en-GB";

    public static bool IsValid(StoreOptions options) =>
        CurrencyPattern().IsMatch(options.Currency) && IsKnownCulture(options.Locale);

    private static bool IsKnownCulture(string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return false;
        }

        try
        {
            return CultureInfo.GetCultureInfo(name, predefinedOnly: true) is { IsNeutralCulture: false };
        }
        catch (CultureNotFoundException)
        {
            return false;
        }
    }

    [GeneratedRegex("^[A-Z]{3}$")]
    private static partial Regex CurrencyPattern();
}
