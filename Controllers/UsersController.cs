using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTO;
using TodoApi.Models;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;

namespace TodoApi.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class UsersController : ControllerBase
	{
		private readonly TodoDbContext _context;
		private readonly IConfiguration _configuration;

		public UsersController(TodoDbContext context, IConfiguration configuration)
		{
			_context = context;
			_configuration = configuration;
		}

		// Register user
		[HttpPost("register")]
		public async Task<IActionResult> Register([FromBody] RegisterDTO registerDTO)
		{
			if (await _context.Users.AnyAsync(u => u.Username == registerDTO.Username))
			{
				return BadRequest("Username already exists");
			}

			string passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDTO.Password);

			var user = new User
			{
				Username = registerDTO.Username,
				PasswordHash = passwordHash
			};

			_context.Users.Add(user);
			await _context.SaveChangesAsync();

			return Ok(new {user.Id,  user.Username});
		}

		// User login
		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
		{
			var user = await _context.Users.SingleOrDefaultAsync(u => u.Username ==  loginDTO.Username);
			if (user == null)
			{
				return Unauthorized("Invalid username or password");
			}

			if (!BCrypt.Net.BCrypt.Verify(loginDTO.Password, user.PasswordHash))
			{
				return Unauthorized("Invalid username or password");
			}

			var token = GenerateJwtToken(user);
			return Ok(new { token });
		}

		// Get all users
		[HttpGet]
		public async Task<ActionResult<IEnumerable<User>>> GetUsers()
		{
			return await _context.Users.ToListAsync();
		}

		private string GenerateJwtToken(User user)
		{
			var tokenHandler = new JwtSecurityTokenHandler();
			var key = Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]);

			var tokenDescriptor = new SecurityTokenDescriptor
			{
				Subject = new ClaimsIdentity(new[]
				{
					new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
					new Claim(ClaimTypes.Name, user.Username)
				}),
				Expires = DateTime.UtcNow.AddHours(1),
				Issuer = _configuration["Jwt:Issuer"],
				Audience = _configuration["Jwt:Audience"],
				SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
			};

			var token = tokenHandler.CreateToken(tokenDescriptor);
			return tokenHandler.WriteToken(token);
		}
	}
}
