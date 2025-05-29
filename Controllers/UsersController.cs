using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
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
		public async Task<IActionResult> Register(User user)
		{
			_context.Users.Add(user);
			await _context.SaveChangesAsync();
			return Ok(user);
		}

		// Get all users
		[HttpGet]
		public async Task<ActionResult<IEnumerable<User>>> GetUsers()
		{
			return await _context.Users.ToListAsync();
		}
	}
}
