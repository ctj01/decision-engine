using credit_bureau_new;
using credit_bureau_new.ProgramExtensions;

var builder = WebApplication.CreateBuilder(args)
    .ConfigureLogging()
    .AddCreditBureauAuthentication()
    .AddCreditBureauServices()
    .AddSwaggerDocumentation();

var app = builder.Build()
    .UseCreditBureauPipeline();

app.Run();