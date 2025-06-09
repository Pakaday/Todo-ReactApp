using System.Reflection.Metadata.Ecma335;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class TodoItemsController : BaseController
{
	// Inject TodoDbContext into controller
	private readonly TodoDbContext _context;

	public TodoItemsController(TodoDbContext context)
	{
		_context = context;
	}

	// Get Todo items
	[HttpGet]
	public async Task<ActionResult<IEnumerable<TodoItem>>> GetTodoItems([FromQuery] string? search)
	{
		var userId = User.Identity.Name;
		var query = _context.TodoItems.Where(t => t.UserId == userId);

		if (!string.IsNullOrWhiteSpace(search))
		{
			query = query.Where(t => t.Title.ToLower().Contains(search.ToLower()) || t.Description.ToLower().Contains(search.ToLower()));
		}

		return await query.ToListAsync();
	}

	// Get Todo items by ID
	[HttpGet("{id}")]
	public async Task<ActionResult<TodoItem>> Get(long id)
	{
		var userId = User.Identity.Name;
		var todoItem = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

		if (todoItem == null)
		{
			return NotFound();
		}

		return todoItem;
	}

	// Post new Todo item
	[HttpPost]
	public async Task<IActionResult> PostTodoItem(TodoItem todoItem)
	{
		if (!ModelState.IsValid)
		{
			foreach (var kvp in ModelState)
			{
				foreach (var error in kvp.Value.Errors)
				{
					Console.WriteLine($"{kvp.Key}: {error.ErrorMessage}");
				}
			}

			return BadRequest(ModelState);
		}
		todoItem.UserId = User.Identity.Name;
		_context.TodoItems.Add(todoItem);
		await _context.SaveChangesAsync();
		return CreatedAtAction(nameof(Get), new { id = todoItem.Id }, todoItem);
	}

	// Update an existing Todo item
	[HttpPut("{id}")]
	public async Task<IActionResult> PutTodoItem(long id, TodoItem updatedItem)
	{
		if (id != updatedItem.Id)
		{
			return BadRequest();
		}

		var userId = User.Identity.Name;
		var existingItem = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);
		//_context.Entry(todoItem).State = EntityState.Modified;
		if (existingItem == null)
		{
			return NotFound();
		}

		existingItem.Title = updatedItem.Title;
		existingItem.Description = updatedItem.Description;
		existingItem.IsCompleted = updatedItem.IsCompleted;
		existingItem.DueDate = updatedItem.DueDate;

		// Save changes to database
		await _context.SaveChangesAsync();
		return Ok(existingItem);
	}

	// Delete a Todo item
	[HttpDelete("{id}")]
	public async Task<IActionResult> DeleteTodoItem(long id)
	{
		var userId = User.Identity.Name;
		var todoItem = await _context.TodoItems.FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

		if (todoItem == null)
		{
			return NotFound();
		}

		_context.TodoItems.Remove(todoItem);
		await _context.SaveChangesAsync();

		return NoContent();
	}
}