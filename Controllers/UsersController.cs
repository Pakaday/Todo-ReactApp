using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.DTO;
using TodoApi.Models;

namespace TodoApi.Controllers
{
	[ApiController]
	[Route("api/[controller]")]
	public class UsersController : ControllerBase
	{
		private readonly TodoDbContext _context;

		public UsersController(TodoDbContext context)
		{
			_context = context;
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

			// Return User ID and Username
			return Ok(new { user.Id, user.Username });
		}

		// Get all users
		[HttpGet]
		public async Task<ActionResult<IEnumerable<User>>> GetUsers()
		{
			return await _context.Users.ToListAsync();
		}
	}
}
