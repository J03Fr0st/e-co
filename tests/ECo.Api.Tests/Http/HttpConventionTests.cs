using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using ECo.Api.Tests.Infrastructure;

namespace ECo.Api.Tests.Http;

public class AntiforgeryTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Antiforgery_endpoint_issues_a_readable_xsrf_cookie()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/antiforgery");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var xsrf = Assert.Single(response.Headers.GetValues("Set-Cookie"), c => c.StartsWith("XSRF-TOKEN="));
        Assert.DoesNotContain("httponly", xsrf, StringComparison.OrdinalIgnoreCase);
        Assert.Contains("samesite=strict", xsrf, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task State_changing_api_request_without_the_header_is_rejected_with_problem_details()
    {
        var client = factory.CreateClient();

        var response = await client.PostAsync("/api/v1/anything", JsonContent.Create(new { }));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("/problems/antiforgery", problem.GetProperty("type").GetString());
    }

    [Fact]
    public async Task State_changing_api_request_with_a_valid_token_passes_the_antiforgery_check()
    {
        var client = factory.CreateClient();
        var issued = await client.GetAsync("/api/v1/antiforgery");
        var token = ReadCookie(issued, "XSRF-TOKEN");

        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/anything");
        request.Headers.Add("X-XSRF-TOKEN", token);
        request.Content = JsonContent.Create(new { });
        var response = await client.SendAsync(request);

        // No endpoint exists yet, so passing the check lands on the API 404.
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task A_forged_token_is_rejected()
    {
        var client = factory.CreateClient();
        await client.GetAsync("/api/v1/antiforgery");

        using var request = new HttpRequestMessage(HttpMethod.Delete, "/api/v1/anything");
        request.Headers.Add("X-XSRF-TOKEN", "forged");
        var response = await client.SendAsync(request);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static string ReadCookie(HttpResponseMessage response, string name)
    {
        var header = response.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith(name + "="));
        return WebUtility.UrlDecode(header[(name.Length + 1)..header.IndexOf(';')]);
    }
}

public class ApiRoutingTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task Unknown_api_route_returns_problem_details_not_the_spa()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/does-not-exist");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Health_reports_unhealthy_when_the_database_is_unreachable()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/health");

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Unhealthy", body.GetProperty("status").GetString());
    }
}

[Trait("Category", "Integration")]
public class HealthTests(AppFactory factory) : IClassFixture<AppFactory>
{
    [Fact]
    public async Task Health_is_200_and_reports_the_database_check()
    {
        var client = factory.CreateClient();

        var response = await client.GetAsync("/api/v1/health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.Equal("Healthy", body.GetProperty("status").GetString());
        var database = body.GetProperty("checks").EnumerateArray().Single(c => c.GetProperty("name").GetString() == "database");
        Assert.Equal("Healthy", database.GetProperty("status").GetString());
    }
}
