using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.PostgreSql;

namespace ECo.Api.Tests.Infrastructure;

/// <summary>
/// Hosts the API in memory against a database that is never reachable.
/// Use for HTTP behaviour that does not touch the database.
/// </summary>
public class ApiFactory : WebApplicationFactory<Program>
{
    protected virtual bool MigrateOnStartup => false;

    protected virtual string ConnectionString =>
        "Host=127.0.0.1;Port=1;Database=none;Username=none;Password=none;Timeout=2";

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("ConnectionStrings:Default", ConnectionString);
        builder.UseSetting("Database:MigrateOnStartup", MigrateOnStartup ? "true" : "false");
    }
}

/// <summary>
/// Hosts the API in memory against a real PostgreSQL 17 container.
/// Requires a running Docker daemon.
/// </summary>
public sealed class AppFactory : ApiFactory, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:17").Build();

    protected override bool MigrateOnStartup => true;

    protected override string ConnectionString => _postgres.GetConnectionString();

    public Task InitializeAsync() => _postgres.StartAsync();

    async Task IAsyncLifetime.DisposeAsync()
    {
        await base.DisposeAsync();
        await _postgres.DisposeAsync();
    }
}
