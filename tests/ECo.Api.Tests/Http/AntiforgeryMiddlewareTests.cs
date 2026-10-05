using ECo.Api.Infrastructure.Http;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;

namespace ECo.Api.Tests.Http;

/// <summary>Unit tests for the branches the HTTP tests cannot reach without a dedicated endpoint.</summary>
public class AntiforgeryMiddlewareTests
{
    private sealed class AlwaysInvalidAntiforgery : IAntiforgery
    {
        public int Validations { get; private set; }
        public AntiforgeryTokenSet GetAndStoreTokens(HttpContext httpContext) => throw new NotSupportedException();
        public AntiforgeryTokenSet GetTokens(HttpContext httpContext) => throw new NotSupportedException();
        public Task<bool> IsRequestValidAsync(HttpContext httpContext) => Task.FromResult(false);
        public void SetCookieTokenAndHeader(HttpContext httpContext) => throw new NotSupportedException();

        public Task ValidateRequestAsync(HttpContext httpContext)
        {
            Validations++;
            throw new AntiforgeryValidationException("invalid");
        }
    }

    private static async Task<(int Status, bool NextCalled, int Validations)> Run(
        string method, string path, Endpoint? endpoint = null)
    {
        var antiforgery = new AlwaysInvalidAntiforgery();
        var services = new ServiceCollection().AddLogging().AddProblemDetails().BuildServiceProvider();
        var context = new DefaultHttpContext { RequestServices = services };
        context.Request.Method = method;
        context.Request.Path = path;
        context.Response.Body = new MemoryStream();
        context.SetEndpoint(endpoint);

        var nextCalled = false;
        var middleware = new AntiforgeryMiddleware(_ => { nextCalled = true; return Task.CompletedTask; }, antiforgery);
        await middleware.InvokeAsync(context, services.GetRequiredService<IProblemDetailsService>());

        return (context.Response.StatusCode, nextCalled, antiforgery.Validations);
    }

    private static Endpoint EndpointWith(params object[] metadata) =>
        new(_ => Task.CompletedTask, new EndpointMetadataCollection(metadata), "test");

    [Fact]
    public async Task An_endpoint_that_disables_antiforgery_skips_validation()
    {
        var webhook = EndpointWith(new RequireAntiforgeryTokenAttribute(required: false));

        var result = await Run("POST", "/api/v1/webhook", webhook);

        Assert.True(result.NextCalled);
        Assert.Equal(0, result.Validations);
    }

    [Theory]
    [InlineData("POST", "/API/V1/bag")]
    [InlineData("PATCH", "/api/v1/bag")]
    [InlineData("DELETE", "/api/v1/bag/lines/X")]
    public async Task State_changing_requests_are_validated_regardless_of_path_case(string method, string path)
    {
        var result = await Run(method, path);

        Assert.Equal(StatusCodes.Status400BadRequest, result.Status);
        Assert.False(result.NextCalled);
    }

    [Theory]
    [InlineData("GET", "/api/v1/bag")]
    [InlineData("HEAD", "/api/v1/health")]
    [InlineData("POST", "/not-the-api")]
    public async Task Safe_methods_and_non_api_paths_are_not_validated(string method, string path)
    {
        var result = await Run(method, path);

        Assert.True(result.NextCalled);
        Assert.Equal(0, result.Validations);
    }
}
