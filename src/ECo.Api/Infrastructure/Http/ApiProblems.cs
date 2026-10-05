namespace ECo.Api.Infrastructure.Http;

/// <summary>
/// RFC 9457 problem conventions. Problem <c>type</c> values are relative URIs
/// of the form <c>/problems/{slug}</c>; field validation uses <c>Results.ValidationProblem</c>,
/// which adds an <c>errors</c> map keyed by field name.
/// </summary>
public static class ApiProblems
{
    public static string TypeUri(string slug) => $"/problems/{slug}";

    public static IResult NotFound() => Results.Problem(
        statusCode: StatusCodes.Status404NotFound,
        type: TypeUri("not-found"),
        title: "Not found");
}
