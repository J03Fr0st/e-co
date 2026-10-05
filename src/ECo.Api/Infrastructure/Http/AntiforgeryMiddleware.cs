using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Http.Metadata;

namespace ECo.Api.Infrastructure.Http;

/// <summary>
/// Requires a valid <c>X-XSRF-TOKEN</c> header on every state-changing <c>/api/v1</c> request.
/// An endpoint opts out only through <c>.DisableAntiforgery()</c> metadata (the Stripe webhook).
/// </summary>
public sealed class AntiforgeryMiddleware(RequestDelegate next, IAntiforgery antiforgery)
{
    public const string HeaderName = "X-XSRF-TOKEN";
    public const string CookieName = "XSRF-TOKEN";

    public async Task InvokeAsync(HttpContext context, IProblemDetailsService problems)
    {
        if (RequiresValidation(context))
        {
            try
            {
                await antiforgery.ValidateRequestAsync(context);
            }
            catch (AntiforgeryValidationException)
            {
                context.Response.StatusCode = StatusCodes.Status400BadRequest;
                await problems.WriteAsync(new ProblemDetailsContext
                {
                    HttpContext = context,
                    ProblemDetails =
                    {
                        Status = StatusCodes.Status400BadRequest,
                        Type = ApiProblems.TypeUri("antiforgery"),
                        Title = "Missing or invalid antiforgery token",
                        Detail = $"Send the {CookieName} cookie value in the {HeaderName} header.",
                    },
                });
                return;
            }
        }

        await next(context);
    }

    private static bool RequiresValidation(HttpContext context)
    {
        if (HttpMethods.IsGet(context.Request.Method)
            || HttpMethods.IsHead(context.Request.Method)
            || HttpMethods.IsOptions(context.Request.Method)
            || HttpMethods.IsTrace(context.Request.Method))
        {
            return false;
        }

        if (!context.Request.Path.StartsWithSegments("/api/v1"))
        {
            return false;
        }

        return context.GetEndpoint()?.Metadata.GetMetadata<IAntiforgeryMetadata>() is not { RequiresValidation: false };
    }

    /// <summary>Issues the token pair: the antiforgery cookie plus the script-readable <c>XSRF-TOKEN</c> cookie.</summary>
    public static IResult IssueToken(HttpContext context, IAntiforgery antiforgery)
    {
        var tokens = antiforgery.GetAndStoreTokens(context);
        context.Response.Cookies.Append(CookieName, tokens.RequestToken!, new CookieOptions
        {
            HttpOnly = false,
            Secure = context.Request.IsHttps,
            SameSite = SameSiteMode.Strict,
            Path = "/",
        });
        return Results.NoContent();
    }
}
