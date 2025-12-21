using Microsoft.EntityFrameworkCore;
using TODOAPI.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;

var builder = WebApplication.CreateBuilder(args);

var secretKey = "MySuperSecretLongKeyThatIsAtLeast32Chars!";
var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = false,
        ValidateAudience = false,
        RequireExpirationTime = true,
        ValidateLifetime = true
    };
});
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});
builder.Services.AddAuthorization();

builder.Services.AddDbContext<ToDoDbContext>(options =>
    options.UseMySql(builder.Configuration.GetConnectionString("DefaultConnection"),
        ServerVersion.AutoDetect(builder.Configuration.GetConnectionString("DefaultConnection"))));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors("AllowReact");

app.UseAuthentication(); 
app.UseAuthorization(); 





app.MapPost("/register", async (ToDoDbContext db, User user) =>
{
    if (await db.Users.AnyAsync(u => u.Username == user.Username))
        return Results.BadRequest("Username already exists");

    db.Users.Add(user);
    await db.SaveChangesAsync();
    return Results.Ok(new { message = "User registered successfully" });
});

app.MapPost("/login", async (ToDoDbContext db, User loginUser) =>
{
    var user = await db.Users.FirstOrDefaultAsync(u => 
        u.Username == loginUser.Username && u.Password == loginUser.Password);
    
    if (user == null) return Results.Unauthorized();

    var tokenHandler = new JwtSecurityTokenHandler();
    var tokenDescriptor = new SecurityTokenDescriptor
    {
        Subject = new ClaimsIdentity(new[] { 
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()) 
        }),
        Expires = DateTime.UtcNow.AddDays(7),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
    };
    
    var token = tokenHandler.CreateToken(tokenDescriptor);
    var tokenString = tokenHandler.WriteToken(token);

    return Results.Ok(new { token = tokenString });
});


app.MapGet("/items", async (ToDoDbContext db) => 
    await db.Items.ToListAsync()).RequireAuthorization();

app.MapPost("/items", async (ToDoDbContext db, Item item) =>
{
    db.Items.Add(item);
    await db.SaveChangesAsync();
    return Results.Created($"/items/{item.Id}", item);
}).RequireAuthorization();

app.MapPut("/items/{id}", async (ToDoDbContext db, int id, Item updatedItem) =>
{
    var item = await db.Items.FindAsync(id);
    if (item == null) return Results.NotFound();
    
    item.IsComplete = updatedItem.IsComplete;
    item.Name = updatedItem.Name; 
    
    await db.SaveChangesAsync();
    return Results.Ok(item);
}).RequireAuthorization();

app.MapDelete("/items/{id}", async (ToDoDbContext db, int id) =>
{
    var item = await db.Items.FindAsync(id);
    if (item == null) return Results.NotFound();
    
    db.Items.Remove(item);
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

app.Run();