using System.Reflection.Metadata.Ecma335;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TodoApi.Data;
using TodoApi.Models;

namespace TodoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TodoItemsController : ControllerBase
{
	// Controller methods
	private readonly TodoDbContext _context;

	public TodoItemsController(TodoDbContext context)
	{
		_context = context;
	}

	[HttpGet]
	public IEnumerable<TodoItem> Get()
	{
		return _context.TodoItems;
	}

	[HttpGet("{id}")]
	public ActionResult<TodoItem> Get(long id)
	{
		var todoItem = _context.TodoItems.Find(id);

		if (todoItem == null)
		{
			return NotFound();
		}

		return todoItem;
	}

	[HttpPost]
	public async Task<IActionResult> PostTodoItem(TodoItem todoItem)
	{
		_context.TodoItems.Add(todoItem);
		await _context.SaveChangesAsync();

		return CreatedAtAction(nameof(Get), new { id = todoItem.Id }, todoItem);
	}

	[HttpPut("{id}")]
	public async Task<IActionResult> PutTodoItem(long id, TodoItem todoItem)
	{
		_context.Entry(todoItem).State = EntityState.Modified;

		// Save changes to database
		await _context.SaveChangesAsync();

		// Return 204 No Content if successful
		return NoContent();
	}

	[HttpDelete("{id}")]
	public async Task<IActionResult> DeleteTodoItem(long id)
	{
		var todoItem = await _context.TodoItems.FindAsync(id);
		if (todoItem == null)
		{
			return NotFound();
		}

		_context.TodoItems.Remove(todoItem);
		await _context.SaveChangesAsync();

		return NoContent();
	}
}