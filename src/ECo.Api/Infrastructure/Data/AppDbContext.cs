using Microsoft.EntityFrameworkCore;

namespace ECo.Api.Infrastructure.Data;

/// <summary>
/// The single EF Core context. Each module adds its own entity configuration
/// from its folder; S0 ships an empty model so migrations and health checks work.
/// </summary>
public sealed class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}
