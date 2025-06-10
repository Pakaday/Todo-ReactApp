using Xunit;
using TodoApi.Controllers;
using TodoApi.Models;
using TodoApi.Tests.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;
using Microsoft.EntityFrameworkCore;

namespace TodoApi.Tests.Controllers
{
	public class TodoItemsControllerTests
	{
		private static ClaimsPrincipal GetMockUser(string username)
		{
			return new ClaimsPrincipal(new ClaimsIdentity(new[]
			{
				new Claim(ClaimTypes.Name, username)
			}, "mock"));
		}

		[Fact]
		public async Task GetTodoItems_ReturnsUserSpecificItems()
		{
			var db = TestDbContextFactory.CreateInMemoryDbContext();
			db.TodoItems.AddRange(
				new TodoItem { Title = "Mine", DueDate = DateTime.Now, UserId = "user1", Description = "Test desc" },
				new TodoItem { Title = "Not mine", DueDate = DateTime.Now, UserId = "user2", Description = "Test desc" });
			await db.SaveChangesAsync();

			var controller = new TodoItemsController(db)
			{
				ControllerContext = new ControllerContext
				{
					HttpContext = new DefaultHttpContext { User = GetMockUser("user1") }
				}
			};

			var result = await controller.GetTodoItems(null);

			Assert.Single(result.Value);
			Assert.Equal("Mine", result.Value.First().Title);
		}

		[Fact]
		public async Task GetById_ReturnsCorrectItem()
		{
			var db = TestDbContextFactory.CreateInMemoryDbContext();
			var item = new TodoItem { Title = "Test", DueDate = DateTime.Now, UserId = "user1", Description = "Test desc" };
			db.TodoItems.Add(item);
			await db.SaveChangesAsync();

			var controller = new TodoItemsController(db)
			{
				ControllerContext = new ControllerContext
				{
					HttpContext = new DefaultHttpContext { User = GetMockUser("user1") }
				}
			};

			var result = await controller.Get(item.Id);
			var okResult = Assert.IsType<ActionResult<TodoItem>>(result);
			Assert.Equal(item.Id, okResult.Value.Id);
		}

		[Fact]
		public async Task GetById_ReturnsNotFound()
		{
			var db = TestDbContextFactory.CreateInMemoryDbContext();
			var controller = new TodoItemsController(db)
			{
				ControllerContext = new ControllerContext
				{
					HttpContext = new DefaultHttpContext { User = GetMockUser("user1") }
				}
			};

			var result = await controller.Get(999);
			Assert.IsType<NotFoundResult>(result.Result);
		}

		[Fact]
		public async Task PostTodoItem_CreatesItem()
		{
			var db = TestDbContextFactory.CreateInMemoryDbContext();
			var controller = new TodoItemsController(db)
			{
				ControllerContext = new ControllerContext
				{
					HttpContext = new DefaultHttpContext { User = GetMockUser("user1") }
				}
			};

			var newItem = new TodoItem { Title = "New Task", DueDate = DateTime.Now, Description = "Test desc" };
			var result = await controller.PostTodoItem(newItem);
			var created = Assert.IsType<CreatedAtActionResult>(result);
			var returnItem = Assert.IsType<TodoItem>(created.Value);
			Assert.Equal("New Task", returnItem.Title);
		}

		[Fact]
		public async Task PutTodoItem_UpdatesCorrectly()
		{
			var db = TestDbContextFactory.CreateInMemoryDbContext();
			var item = new TodoItem { Title = "Old Title", DueDate = DateTime.Now, UserId = "user1", Description = "Test desc" };
			db.TodoItems.Add(item);
			await db.SaveChangesAsync();

			var controller = new TodoItemsController(db)
			{
				ControllerContext = new ControllerContext
				{
					HttpContext = new DefaultHttpContext { User = GetMockUser("user1") }
				}
			};

			item.Title = "Updated Title";
			var result = await controller.PutTodoItem(item.Id, item);
			var ok = Assert.IsType<OkObjectResult>(result);
			var updatedItem = Assert.IsType<TodoItem>(ok.Value);
			Assert.Equal("Updated Title", updatedItem.Title);
		}

		[Fact]
		public async Task DeleteTodoItem_RemovesItem()
		{
			var db = TestDbContextFactory.CreateInMemoryDbContext();
			var item = new TodoItem { Title = "To Delete", DueDate = DateTime.Now, UserId = "user1", Description = "Test desc" };
			db.TodoItems.Add(item);
			await db.SaveChangesAsync();

			var controller = new TodoItemsController(db)
			{
				ControllerContext = new ControllerContext
				{
					HttpContext = new DefaultHttpContext { User = GetMockUser("user1") }
				}
			};

			var result = await controller.DeleteTodoItem(item.Id);
			Assert.IsType<NoContentResult>(result);
			Assert.Empty(db.TodoItems.Where(t => t.UserId == "user1"));
		}
	}
}
