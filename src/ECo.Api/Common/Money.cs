namespace ECo.Api.Common;

/// <summary>
/// An amount in the currency's minor unit (pence for GBP). Serialises as
/// <c>{ "amountMinor": 3995, "currency": "GBP" }</c>.
/// </summary>
public readonly record struct Money(long AmountMinor, string Currency);
