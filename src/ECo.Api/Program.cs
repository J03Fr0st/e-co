using ECo.Api.Common;
using ECo.Api.Infrastructure.Data;
using ECo.Api.Infrastructure.Http;
using ECo.Api.Infrastructure.Logging;
using ECo.Api.Modules.Health;
using Microsoft.AspNetCore.Antiforgery;
using Microsoft.EntityFrameworkCore;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSerilog((services, logger) => LoggingSetup.Apply(logger
    .ReadFrom.Configuration(builder.Configuration)
    .ReadFrom.Services(services)));

builder.Services.AddProblemDetails();

builder.Services.AddOptions<StoreOptions>()
    .BindConfiguration(StoreOptions.Section)
    .Validate(StoreOptions.IsValid, "Store:Currency must be an ISO 4217 code and Store:Locale a specific culture.")
    .ValidateOnStart();

builder.Services.AddDbContext<AppDbContext>((services, options) =>
    options.UseNpgsql(services.GetRequiredService<IConfiguration>().GetConnectionString("Default")));

builder.Services.AddAntiforgery(options =>
{
    options.HeaderName = AntiforgeryMiddleware.HeaderName;
    options.Cookie.Name = "ECo.Antiforgery";
    options.Cookie.SameSite = SameSiteMode.Strict;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

builder.Services.AddHealthModule();

var app = builder.Build();

if (args.Contains("--migrate"))
{
    await MigrateAsync(app);
    return;
}

if (app.Configuration.GetValue<bool>("Database:MigrateOnStartup"))
{
    await MigrateAsync(app);
}

app.UseSerilogRequestLogging();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseStaticFiles();
app.UseRouting();
app.UseMiddleware<AntiforgeryMiddleware>();

app.MapGet("/api/v1/antiforgery", (HttpContext context, IAntiforgery antiforgery) =>
    AntiforgeryMiddleware.IssueToken(context, antiforgery));
app.MapHealthModule();

// Unknown API routes get a problem response; everything else falls back to the SPA.
app.Map("/api/{**rest}", ApiProblems.NotFound);
app.MapFallbackToFile("index.html");

await app.RunAsync();

static async Task MigrateAsync(WebApplication app)
{
    await using var scope = app.Services.CreateAsyncScope();
    await scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.MigrateAsync();
}

public partial class Program;
