using System.Text.Json;
using ECo.Api.Common;

namespace ECo.Api.Tests.Common;

public class MoneyTests
{
    [Fact]
    public void Serialises_to_the_api_money_shape()
    {
        var json = JsonSerializer.Serialize(new Money(3995, "GBP"), JsonSerializerOptions.Web);

        Assert.Equal("""{"amountMinor":3995,"currency":"GBP"}""", json);
    }
}

public class StoreOptionsTests
{
    [Theory]
    [InlineData("GBP", "en-GB")]
    [InlineData("EUR", "fr-FR")]
    [InlineData("USD", "en-US")]
    public void Accepts_iso_currency_and_known_locale(string currency, string locale)
    {
        Assert.True(StoreOptions.IsValid(new StoreOptions { Currency = currency, Locale = locale }));
    }

    [Theory]
    [InlineData("gbp", "en-GB")]
    [InlineData("POUND", "en-GB")]
    [InlineData("", "en-GB")]
    [InlineData("GBP", "not-a-locale-xx")]
    [InlineData("GBP", "")]
    public void Rejects_bad_currency_or_locale(string currency, string locale)
    {
        Assert.False(StoreOptions.IsValid(new StoreOptions { Currency = currency, Locale = locale }));
    }
}
