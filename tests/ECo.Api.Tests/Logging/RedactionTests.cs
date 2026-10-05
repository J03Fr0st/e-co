using ECo.Api.Infrastructure.Logging;
using Serilog;
using ILogger = Serilog.ILogger;
using Serilog.Core;
using Serilog.Events;

namespace ECo.Api.Tests.Logging;

public class RedactorTests
{
    [Theory]
    [InlineData("contact joe@example.com now", "contact [REDACTED:email] now")]
    [InlineData("card 4242 4242 4242 4242 used", "card [REDACTED:card] used")]
    [InlineData("card 4000-0000-0000-0002", "card [REDACTED:card]")]
    [InlineData("card 4000002500003155", "card [REDACTED:card]")]
    public void Redacts_sensitive_patterns_in_text(string input, string expected)
    {
        Assert.Equal(expected, Redactor.Redact(input));
    }

    [Theory]
    [InlineData("order 1234 shipped")]
    [InlineData("listed 24 products in 120ms")]
    [InlineData("sku TOP-001-NAVY-M")]
    public void Leaves_ordinary_text_alone(string input)
    {
        Assert.Equal(input, Redactor.Redact(input));
    }

    [Theory]
    [InlineData("Email")]
    [InlineData("password")]
    [InlineData("ResetToken")]
    [InlineData("ShippingAddress")]
    [InlineData("Postcode")]
    [InlineData("CardNumber")]
    [InlineData("ClientSecret")]
    public void Treats_sensitive_property_names_as_secret(string name)
    {
        Assert.True(Redactor.IsSensitiveName(name));
    }

    [Theory]
    [InlineData("OrderId")]
    [InlineData("Sku")]
    [InlineData("ElapsedMs")]
    public void Treats_ordinary_property_names_as_loggable(string name)
    {
        Assert.False(Redactor.IsSensitiveName(name));
    }
}

public class RedactionEnricherTests
{
    private sealed class CaptureSink : ILogEventSink
    {
        public List<LogEvent> Events { get; } = [];
        public void Emit(LogEvent logEvent) => Events.Add(logEvent);
    }

    private static (Logger Logger, CaptureSink Sink) CreateLogger()
    {
        var sink = new CaptureSink();
        var logger = new LoggerConfiguration()
            .Enrich.With<RedactionEnricher>()
            .WriteTo.Sink(sink)
            .CreateLogger();
        return (logger, sink);
    }

    [Fact]
    public void Rendered_message_never_contains_an_email_passed_as_a_property()
    {
        var (logger, sink) = CreateLogger();

        logger.Information("Checkout started for {Customer}", "joe@example.com");

        var rendered = sink.Events.Single().RenderMessage();
        Assert.DoesNotContain("joe@example.com", rendered);
        Assert.Contains("[REDACTED:email]", rendered);
    }

    [Fact]
    public void Properties_with_sensitive_names_are_fully_redacted()
    {
        var (logger, sink) = CreateLogger();

        logger.Information("Reset requested {Token} for {OrderId}", "abc123", 42);

        var evt = sink.Events.Single();
        Assert.Equal("\"[REDACTED]\"", evt.Properties["Token"].ToString());
        Assert.Equal("42", evt.Properties["OrderId"].ToString());
    }

    [Fact]
    public void Destructured_objects_are_redacted_recursively()
    {
        var (logger, sink) = CreateLogger();

        logger.Information("Order {@Order}", new
        {
            Id = 7,
            Email = "a@b.co",
            Note = "paid with 4242424242424242",
            Lines = new[] { new { Sku = "TOP-1", Address = "1 High St" } }
        });

        var rendered = sink.Events.Single().RenderMessage();
        Assert.DoesNotContain("a@b.co", rendered);
        Assert.DoesNotContain("4242424242424242", rendered);
        Assert.DoesNotContain("1 High St", rendered);
        Assert.Contains("TOP-1", rendered);
        Assert.Contains("7", rendered);
    }
}

/// <summary>Exercises the pipeline exactly as the app assembles it (LoggingSetup.Apply).</summary>
public class LoggingPipelineTests
{
    private static string LogWithAppPipeline(Action<ILogger> write)
    {
        var output = new StringWriter();
        using (var logger = LoggingSetup.Apply(new LoggerConfiguration(), output).CreateLogger())
        {
            write(logger);
        }
        return output.ToString();
    }

    [Fact]
    public void Exception_details_are_redacted()
    {
        var output = LogWithAppPipeline(log =>
            log.Error(new InvalidOperationException("duplicate key for joe@example.com"), "Save failed"));

        Assert.Contains("Save failed", output);
        Assert.DoesNotContain("joe@example.com", output);
        Assert.Contains("[REDACTED:email]", output);
    }

    [Fact]
    public void Values_baked_into_the_template_text_are_redacted()
    {
        var email = "joe@example.com";
        var output = LogWithAppPipeline(log => log.Information($"Interpolated by mistake: {email} paid with ref-4242424242424242"));

        Assert.DoesNotContain(email, output);
        Assert.DoesNotContain("4242424242424242", output);
    }

    [Fact]
    public void Properties_with_sensitive_names_are_masked_in_the_output()
    {
        var output = LogWithAppPipeline(log => log.Information("Issued {ResetToken} for {OrderId}", "s3cr3t-value", 42));

        Assert.DoesNotContain("s3cr3t-value", output);
        Assert.Contains("42", output);
    }
}
