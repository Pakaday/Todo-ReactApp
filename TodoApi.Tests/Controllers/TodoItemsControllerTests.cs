using Xunit;
using TodoApi.Controllers;
using TodoApi.Models;
using TodoApi.Tests.Data;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using System.Collections.Generic;
using System.Linq;

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
				new TodoItem { Title = "Mine", DueDate = DateTime.Now, UserId = "user1", Description = "desc" },
				new TodoItem { Title = "Not mine", DueDate = DateTime.Now, UserId = "user2", Description = "desc" }
			);
			await db.SaveChangesAsync();

			var controller = new TodoItemsController(db)
			{
				ControllerContext = new ControllerContext
				{
					HttpContext = new DefaultHttpContext
					{
						User = GetMockUser("user1")
					}
				}
			};

			var result = await controller.GetTodoItems(null);

			Assert.Single(result.Value);
			Assert.Equal("Mine", result.Value.First().Title);
		}
	}
}
