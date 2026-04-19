var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => Results.Json(new
{
    app = "{{PROJECT_NAME}}",
    framework = "aspnet",
    db = "{{DB}}",
    message = "Hello from Polystack!"
}));

app.MapGet("/health", () => Results.Json(new { status = "ok" }));

app.Run("http://0.0.0.0:5000");
